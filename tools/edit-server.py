#!/usr/bin/env python3
"""Local server for the layout editor.

Serves the site like `python3 -m http.server` and accepts POST /__save
from assets/js/editor.js, writing each image's offsets (--ex, --ey, --es,
--er) into the style attribute of its [data-ed] tag in index.html, and
removing the images marked for deletion. Every save first copies
index.html to tools/.edit-backups/ (last 20 kept, ignored by git).

Usage:
    python3 tools/edit-server.py          # then open http://127.0.0.1:8124/?edit
    python3 tools/edit-server.py 9000     # another port
"""
import http.server
import json
import math
import os
import re
import shutil
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'index.html')
ID_RE = re.compile(r'^[A-Za-z0-9_-]{1,60}$')
VARS = ('--ex', '--ey', '--es', '--er')
LIMITS = {'ex': (-4000, 4000), 'ey': (-8000, 8000), 'es': (0.2, 4), 'er': (-360, 360)}


def clean_values(raw):
    """Validated numbers for one image, or None when anything is off."""
    if not isinstance(raw, dict):
        return None
    out = {}
    for key, (lo, hi) in LIMITS.items():
        v = raw.get(key)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
            return None
        out[key] = min(hi, max(lo, float(v)))
    return out


def declarations(v):
    """The CSS custom properties to store; defaults are left out."""
    decl = []
    if round(v['ex'], 1) or round(v['ey'], 1):
        decl += [f"--ex:{v['ex']:.1f}px", f"--ey:{v['ey']:.1f}px"]
    if round(v['es'], 3) != 1:
        decl.append(f"--es:{v['es']:.3f}")
    if round(v['er'], 1):
        decl.append(f"--er:{v['er']:.1f}deg")
    return decl


def apply(html, ed_id, values):
    """Rewrite the opening tag that carries data-ed="ed_id"."""
    tag_re = re.compile(r'<[a-z]+\b[^>]*\sdata-ed="' + re.escape(ed_id) + r'"[^>]*>')
    matches = tag_re.findall(html)
    if len(matches) != 1:
        raise ValueError(f'{ed_id}: expected one tag, found {len(matches)}')
    tag = matches[0]
    style_m = re.search(r'\sstyle="([^"]*)"', tag)
    kept = []
    if style_m:
        kept = [d.strip() for d in style_m.group(1).split(';')
                if d.strip() and d.split(':')[0].strip() not in VARS]
    style = ';'.join(kept + declarations(values))
    if style_m:
        new_tag = tag.replace(style_m.group(0), f' style="{style}"' if style else '')
    else:
        new_tag = tag[:-1] + (f' style="{style}"' if style else '') + '>'
    return html.replace(tag, new_tag, 1)


def delete(html, ed_id):
    """Cut the whole element that carries data-ed="ed_id", nested tags included."""
    tag_re = re.compile(r'<([a-z]+)\b[^>]*\sdata-ed="' + re.escape(ed_id) + r'"[^>]*>')
    matches = list(tag_re.finditer(html))
    if len(matches) != 1:
        raise ValueError(f'{ed_id}: expected one tag, found {len(matches)}')
    start, name = matches[0].start(), matches[0].group(1)
    depth = 0
    for m in re.finditer(r'<(/?)' + name + r'\b[^>]*>', html[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            end = start + m.end()
            break
    else:
        raise ValueError(f'{ed_id}: closing </{name}> not found')
    # take the line with it when the element sits alone on its line
    line_start = html.rfind('\n', 0, start) + 1
    if not html[line_start:start].strip() and html[end:end + 1] == '\n':
        start, end = line_start, end + 1
    return html[:start] + html[end:]


def backup():
    """Keep the last 20 versions of index.html before each save."""
    folder = os.path.join(ROOT, 'tools', '.edit-backups')
    os.makedirs(folder, exist_ok=True)
    ignore = os.path.join(folder, '.gitignore')
    if not os.path.exists(ignore):
        with open(ignore, 'w') as f:
            f.write('*\n')
    stamp = time.strftime('%Y%m%d-%H%M%S')
    shutil.copy2(PAGE, os.path.join(folder, f'index-{stamp}.html'))
    old = sorted(n for n in os.listdir(folder) if n.startswith('index-'))
    for name in old[:-20]:
        os.remove(os.path.join(folder, name))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def reply(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != '/__save':
            return self.reply(404, {'ok': False, 'error': 'not found'})
        length = int(self.headers.get('Content-Length') or 0)
        if not 0 < length <= 65536:
            return self.reply(400, {'ok': False, 'error': 'bad body size'})
        try:
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or not payload:
                raise ValueError('empty payload')
            to_delete = payload.pop('__delete', [])
            if not isinstance(to_delete, list) or not all(isinstance(i, str) and ID_RE.match(i) for i in to_delete):
                raise ValueError('invalid delete list')
            with open(PAGE, encoding='utf-8') as f:
                html = f.read()
            for ed_id, raw in payload.items():
                values = clean_values(raw)
                if not ID_RE.match(ed_id) or values is None:
                    raise ValueError(f'{ed_id}: invalid values')
                if ed_id not in to_delete:
                    html = apply(html, ed_id, values)
            for ed_id in to_delete:
                html = delete(html, ed_id)
        except (ValueError, json.JSONDecodeError) as err:
            return self.reply(400, {'ok': False, 'error': str(err)})
        backup()
        # write atomically so a crash never leaves a half-written page
        fd, tmp = tempfile.mkstemp(dir=ROOT, suffix='.tmp')
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(html)
        os.replace(tmp, PAGE)
        self.reply(200, {'ok': True, 'updated': len([k for k in payload if k not in to_delete]), 'deleted': len(to_delete)})


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
    print(f'Layout editor: http://127.0.0.1:{port}/?edit  (Ctrl+C to stop)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
