#!/usr/bin/env python3
"""Local server for the layout editor.

Serves the site like `python3 -m http.server` and accepts POST /__save
from assets/js/editor.js, writing each image's offsets (--ex, --ey, --es,
--er) into the style attribute of its [data-ed] tag, and removing the
images marked for deletion. Every save first copies the page to
tools/.edit-backups/ (last 20 kept, ignored by git).

The page edited is index.html. Override it with NR_EDIT_PAGE=some.html
or --page some.html.

Usage:
    python3 tools/edit-server.py               # then open the printed URL + ?edit
    python3 tools/edit-server.py 9000          # another port
    python3 tools/edit-server.py --page other.html
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
CANDIDATES = ('index.html',)


def pick_page(explicit=None):
    """The page to rewrite: explicit choice, env var, or the first that exists."""
    wanted = explicit or os.environ.get('NR_EDIT_PAGE')
    if wanted:
        path = os.path.join(ROOT, wanted)
        if not os.path.isfile(path):
            raise SystemExit(f'edit-server: {wanted} does not exist in {ROOT}')
        return path
    for name in CANDIDATES:
        path = os.path.join(ROOT, name)
        if os.path.isfile(path):
            return path
    raise SystemExit('edit-server: no page to edit (looked for ' + ', '.join(CANDIDATES) + ')')


PAGE = pick_page()
PAGE_NAME = os.path.basename(PAGE)
ID_RE = re.compile(r'^[A-Za-z0-9_-]{1,60}$')
VARS = ('--ex', '--ey', '--es', '--er')
TEXT_LIMIT = 4000  # characters accepted for one text run


def escape_text(value):
    """Escape a plain-text edit so it can sit in HTML without breaking markup."""
    return (value.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def set_text(html, ed_id, es, en):
    """Replace the text of one [data-ed-text] element.

    An element whose id ends in -es / -en is one half of a bilingual pair: only
    that half is touched. Any other id is a single run, and it keeps whatever
    markup it had around it (nested <span>s, icons) by replacing only the
    element's leading text node.
    """
    if es is None and en is None:
        raise ValueError(f'{ed_id}: nothing to write')
    for value in (es, en):
        if value is not None and len(value) > TEXT_LIMIT:
            raise ValueError(f'{ed_id}: text too long (max {TEXT_LIMIT})')

    tag_re = re.compile(r'<([a-z]+)\b[^>]*\sdata-ed-text="' + re.escape(ed_id) + r'"[^>]*>')
    matches = list(tag_re.finditer(html))
    if len(matches) != 1:
        raise ValueError(f'{ed_id}: expected one text run, found {len(matches)}')
    start, name, open_end = matches[0].start(), matches[0].group(1), matches[0].end()
    close = html.find(f'</{name}>', open_end)
    if close == -1:
        raise ValueError(f'{ed_id}: closing </{name}> not found')
    inner = html[open_end:close]
    new_text = es if es is not None else en
    if '<' in inner:
        # the element wraps nested markup (an icon, a highlight, a <cite>):
        # only its leading text run is rewritten, the markup stays untouched
        keep_from = inner.find('<')
        new_inner = escape_text(new_text) + inner[keep_from:]
    else:
        new_inner = escape_text(new_text)
    return html[:open_end] + new_inner + html[close:]


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
    """Keep the last 20 versions of the edited page before each save."""
    folder = os.path.join(ROOT, 'tools', '.edit-backups')
    os.makedirs(folder, exist_ok=True)
    ignore = os.path.join(folder, '.gitignore')
    if not os.path.exists(ignore):
        with open(ignore, 'w') as f:
            f.write('*\n')
    stem = os.path.splitext(PAGE_NAME)[0]
    stamp = time.strftime('%Y%m%d-%H%M%S')
    shutil.copy2(PAGE, os.path.join(folder, f'{stem}-{stamp}.html'))
    old = sorted(n for n in os.listdir(folder) if n.startswith(stem + '-'))
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
            to_text = payload.pop('__text', {})
            if not isinstance(to_text, dict):
                raise ValueError('invalid text payload')
            for ed_id, pair in to_text.items():
                if not ID_RE.match(ed_id) or not isinstance(pair, dict):
                    raise ValueError(f'{ed_id}: invalid text entry')
                if set(pair) - {'es', 'en'}:
                    raise ValueError(f'{ed_id}: unknown text field')
            with open(PAGE, encoding='utf-8') as f:
                html = f.read()
            for ed_id, raw in payload.items():
                values = clean_values(raw)
                if not ID_RE.match(ed_id) or values is None:
                    raise ValueError(f'{ed_id}: invalid values')
                if ed_id not in to_delete:
                    html = apply(html, ed_id, values)
            for ed_id, pair in to_text.items():
                html = set_text(html, ed_id, pair.get('es'), pair.get('en'))
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
        self.reply(200, {
            'ok': True,
            'updated': len([k for k in payload if k not in to_delete]),
            'texts': len(to_text),
            'deleted': len(to_delete),
        })


if __name__ == '__main__':
    args = [a for a in sys.argv[1:]]
    port = 8124
    page = None
    while args:
        a = args.pop(0)
        if a == '--page':
            if not args:
                raise SystemExit('edit-server: --page needs a file name')
            page = args.pop(0)
        elif a.isdigit():
            port = int(a)
        else:
            raise SystemExit(f'edit-server: unknown argument {a!r}')
    if page:
        PAGE = pick_page(page)
        PAGE_NAME = os.path.basename(PAGE)
    print(f'Layout editor: http://127.0.0.1:{port}/{PAGE_NAME}?edit  (Ctrl+C to stop)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
