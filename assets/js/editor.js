/* ============================================================
   Layout editor (dev only): open the site with ?edit through
   tools/edit-server.py, drag the drawings and screenshots, save.
   Each [data-ed] element keeps its offsets in four CSS variables
   (--ex, --ey, --es, --er) that site.css turns into translate,
   scale and rotate, so the saved page needs no JS to show them.
   ============================================================ */
const root = document.documentElement;
const items = [...document.querySelectorAll('[data-ed]')];
const dirty = new Set();
const deleted = new Set();
let selected = null;
const KEYS = { ex: '--ex', ey: '--ey', es: '--es', er: '--er' };
const DEFAULTS = { ex: 0, ey: 0, es: 1, er: 0 };

const read = (el) => {
  const v = (k) => parseFloat(el.style.getPropertyValue(KEYS[k]));
  return {
    ex: Number.isFinite(v('ex')) ? v('ex') : 0,
    ey: Number.isFinite(v('ey')) ? v('ey') : 0,
    es: Number.isFinite(v('es')) ? v('es') : 1,
    er: Number.isFinite(v('er')) ? v('er') : 0,
  };
};
const write = (el, s) => {
  el.style.setProperty('--ex', `${s.ex.toFixed(1)}px`);
  el.style.setProperty('--ey', `${s.ey.toFixed(1)}px`);
  el.style.setProperty('--es', s.es.toFixed(3));
  el.style.setProperty('--er', `${s.er.toFixed(1)}deg`);
  dirty.add(el);
  status(pending());
};
const pending = () => {
  const parts = [];
  if (dirty.size) parts.push(`${dirty.size} moved`);
  if (textEdits.size) parts.push(`${textEdits.size} texts`);
  if (deleted.size) parts.push(`${deleted.size} to delete`);
  return parts.length ? `${parts.join(' · ')} · unsaved` : 'No changes';
};

/* ---------- styles + toolbar ---------- */
const css = document.createElement('style');
css.textContent = `
.is-editing [data-ed] { pointer-events: auto !important; cursor: grab; outline: 1px dashed color-mix(in srgb, var(--red) 55%, transparent); outline-offset: 3px; touch-action: none; user-select: none; }
.is-editing [data-ed] * { pointer-events: none; }
.is-editing [data-ed].is-dragging { cursor: grabbing; outline: 2px solid var(--red); z-index: 60; }
.is-editing [data-ed]:hover { outline: 2px solid var(--red); }
.is-editing [data-ed].is-selected { outline: 2px solid var(--red); outline-offset: 5px; }
.is-editing [data-ed-text] { pointer-events: auto !important; cursor: text; outline: 0; box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--pen) 30%, transparent); }
.is-editing [data-ed-text]:hover { box-shadow: inset 0 -2px 0 var(--pen); outline: 1px dashed var(--pen); outline-offset: 2px; }
.is-editing [data-ed-text].is-picked { outline: 2px solid var(--pen); outline-offset: 2px; background: color-mix(in srgb, var(--pen) 8%, transparent); }
.is-editing [data-ed] [data-ed-text] { pointer-events: auto !important; }
.is-editing [data-ed].ed-gone { display: none !important; }
.ed-bar { position: fixed; z-index: 1000; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; max-width: 300px; padding: 12px 14px; background: var(--paper); color: var(--ink); border: 1.5px solid var(--ink); box-shadow: 4px 5px 0 var(--rule); font: 500 .8rem/1.4 var(--f-mono, monospace); }
.ed-bar b { color: var(--red); }
.ed-bar__row { display: flex; gap: 8px; }
.ed-bar button { font: inherit; padding: 4px 10px; border: 1.5px solid var(--ink); background: var(--sheet); color: var(--ink); cursor: pointer; }
.ed-bar button:disabled { opacity: .45; cursor: default; }
.ed-tip { position: fixed; z-index: 1001; pointer-events: none; padding: 2px 6px; background: var(--ink); color: var(--paper); font: 500 .7rem/1.3 var(--f-mono, monospace); }
.ed-text { position: fixed; z-index: 1002; right: 16px; bottom: 220px; width: 320px; display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; background: var(--paper); color: var(--ink); border: 1.5px solid var(--ink); box-shadow: 4px 5px 0 var(--rule); font: 500 .8rem/1.4 var(--f-mono, monospace); }
.ed-text__head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.ed-text__head b { color: var(--pen); }
.ed-text__head span { color: var(--ink-3); font-size: .7rem; }
.ed-text label { display: flex; flex-direction: column; gap: 4px; }
.ed-text label > span { color: var(--ink-3); font-size: .7rem; text-transform: uppercase; letter-spacing: .04em; }
.ed-text textarea { font: inherit; padding: 6px 8px; border: 1px solid var(--rule); background: var(--sheet); color: var(--ink); resize: vertical; }
.ed-text__row { display: flex; gap: 8px; }
.ed-text button { font: inherit; padding: 4px 10px; border: 1.5px solid var(--ink); background: var(--sheet); color: var(--ink); cursor: pointer; }
.ed-text button[data-ed-apply] { background: var(--pen); color: var(--paper); border-color: var(--pen); }
`;
document.head.appendChild(css);
root.classList.add('is-editing');
// lift every image above the content blocks that overlap it (margin doodles sit under the grids)
items.forEach((el) => {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.style.zIndex = '40';
});

const bar = document.createElement('div');
bar.className = 'ed-bar';
bar.innerHTML = `
  <div><b>Edit mode</b> · ${items.length} images · ${document.querySelectorAll('[data-ed-text]').length} texts</div>
  <div>Drag to move · wheel to resize · ⌥ Option + wheel to rotate · double-click to reset · click + Delete key to remove · click any text to rewrite it</div>
  <div class="ed-bar__row"><button type="button" data-save disabled>Save</button><button type="button" data-revert disabled>Discard</button><button type="button" data-delete disabled>Delete</button></div>
  <div data-ed-selected>Nothing selected</div>
  <div data-ed-status>No changes</div>`;
document.body.appendChild(bar);
const saveBtn = bar.querySelector('[data-save]');
const revertBtn = bar.querySelector('[data-revert]');
const deleteBtn = bar.querySelector('[data-delete]');
const selectedEl = bar.querySelector('[data-ed-selected]');
const statusEl = bar.querySelector('[data-ed-status]');
function status(msg) {
  statusEl.textContent = msg;
  saveBtn.disabled = revertBtn.disabled = dirty.size === 0 && deleted.size === 0;
}
function select(el) {
  selected?.classList.remove('is-selected');
  selected = el;
  selected?.classList.add('is-selected');
  selectedEl.textContent = el ? `Selected: ${el.dataset.ed}` : 'Nothing selected';
  deleteBtn.disabled = !el;
}
function remove(el) {
  if (!el) return;
  el.classList.add('ed-gone');
  deleted.add(el);
  dirty.delete(el);
  select(null);
  status(pending());
}

const tip = document.createElement('div');
tip.className = 'ed-tip';
tip.hidden = true;
document.body.appendChild(tip);
const showTip = (el, s, x, y) => {
  tip.hidden = false;
  tip.textContent = `${el.dataset.ed} · ${Math.round(s.ex)}, ${Math.round(s.ey)} · ×${s.es.toFixed(2)} · ${Math.round(s.er)}°`;
  tip.style.left = `${x + 14}px`;
  tip.style.top = `${y + 14}px`;
};

/* ---------- interaction ---------- */
const original = new Map(items.map((el) => [el, el.getAttribute('style')]));

items.forEach((el) => {
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-ed-text]')) return; // editing a caption, not moving the picture
    e.preventDefault(); e.stopPropagation();
    select(el);
    const start = read(el), x0 = e.clientX, y0 = e.clientY;
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    const move = (m) => {
      if (Math.abs(m.clientX - x0) + Math.abs(m.clientY - y0) < 3) return; // a plain click only selects
      const s = { ...start, ex: start.ex + (m.clientX - x0), ey: start.ey + (m.clientY - y0) };
      write(el, s); showTip(el, s, m.clientX, m.clientY);
    };
    const up = () => {
      el.classList.remove('is-dragging'); tip.hidden = true;
      el.removeEventListener('pointermove', move);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up, { once: true });
    el.addEventListener('pointercancel', up, { once: true });
  });
  el.addEventListener('wheel', (e) => {
    if (e.target.closest('[data-ed-text]') && !e.altKey) return; // let the text panel scroll
    e.preventDefault();
    const s = read(el);
    if (e.altKey) s.er += (e.deltaY || e.deltaX) * 0.1;
    else s.es = Math.min(4, Math.max(0.2, s.es * (1 - e.deltaY * 0.0015)));
    write(el, s); showTip(el, s, e.clientX, e.clientY);
  }, { passive: false });
  el.addEventListener('dblclick', (e) => {
    if (e.target.closest('[data-ed-text]')) return; // double-click in a caption is text selection
    e.preventDefault(); write(el, { ...DEFAULTS });
  });
  // links and buttons inside an editable image must not fire while arranging
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-ed-text]')) return; // let the caption open its panel
    e.preventDefault(); e.stopPropagation();
  }, true);
});
document.addEventListener('pointerleave', () => { tip.hidden = true; });
deleteBtn.addEventListener('click', () => remove(selected));
document.addEventListener('keydown', (e) => {
  if (!selected || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
  if (e.target.closest?.('input, textarea, [contenteditable]')) return;
  e.preventDefault();
  remove(selected);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') select(null); });

/* ---------- text editing: a panel with both languages at once ---------- */
const textEls = [...document.querySelectorAll('[data-ed-text]')];
const originalText = new Map(textEls.map((el) => [el, el.innerHTML]));
const textEdits = new Map();   // pairKey -> { es, en }
const viText = (el) => (el.innerText || el.textContent || '').replace(/\u00a0/g, ' ');
// a pair is txN-es + txN-en; a lone run is its own key
const pairKey = (id) => (id.match(/^(tx\d+)-(?:es|en)$/) || [null, id])[1];
const pairEls = (key) => textEls.filter((el) => pairKey(el.dataset.edText) === key);
const pairLangs = (key) => {
  const out = {};
  pairEls(key).forEach((el) => {
    const m = (el.dataset.edText.match(/-(es|en)$/) || [])[1];
    if (m) out[m] = el;
  });
  return out;
};

const panel = document.createElement('div');
panel.className = 'ed-text';
panel.hidden = true;
panel.innerHTML = `
  <div class="ed-text__head"><b>Text</b><span data-ed-text-id></span></div>
  <label><span>Español</span><textarea data-ed-es rows="3" spellcheck="false"></textarea></label>
  <label><span>English</span><textarea data-ed-en rows="3" spellcheck="false"></textarea></label>
  <div class="ed-text__row"><button type="button" data-ed-apply>Apply</button><button type="button" data-ed-close>Close</button></div>`;
document.body.appendChild(panel);
const esBox = panel.querySelector('[data-ed-es]');
const enBox = panel.querySelector('[data-ed-en]');
const idLabel = panel.querySelector('[data-ed-text-id]');
let pickedText = null;

function openPanel(el) {
  pickedText = el;
  textEls.forEach((t) => t.classList.remove('is-picked'));
  el.classList.add('is-picked');
  const key = pairKey(el.dataset.edText);
  const langs = pairLangs(key);
  idLabel.textContent = key;
  const single = !langs.es && !langs.en;
  if (single) {
    // a lone run: one box, and the label follows the language it belongs to
    const lang = el.getAttribute('lang');
    esBox.value = lang === 'en' ? '' : viText(el);
    enBox.value = lang === 'en' ? viText(el) : '';
    esBox.closest('label').hidden = lang === 'en';
    enBox.closest('label').hidden = lang !== 'en';
    esBox.closest('label').querySelector('span').textContent = lang === 'en' ? 'English' : 'Text';
  } else {
    esBox.value = langs.es ? viText(langs.es) : '';
    enBox.value = langs.en ? viText(langs.en) : '';
    esBox.closest('label').hidden = !langs.es;
    enBox.closest('label').hidden = !langs.en;
    esBox.closest('label').querySelector('span').textContent = 'Español';
  }
  panel.hidden = false;
  (esBox.closest('label').hidden ? enBox : esBox).focus();
}

function applyPanel() {
  if (!pickedText) return;
  const key = pairKey(pickedText.dataset.edText);
  const langs = pairLangs(key);
  const next = {};
  if (!esBox.closest('label').hidden) next.es = esBox.value;
  if (!enBox.closest('label').hidden) next.en = enBox.value;
  // update the page straight away so the result is visible before saving
  if (langs.es && next.es !== undefined) langs.es.textContent = next.es;
  if (langs.en && next.en !== undefined) langs.en.textContent = next.en;
  if (!langs.es && !langs.en) pickedText.textContent = next.es ?? next.en ?? '';
  textEdits.set(key, next);
  status(pending());
}

panel.querySelector('[data-ed-apply]').addEventListener('click', applyPanel);
panel.querySelector('[data-ed-close]').addEventListener('click', () => {
  panel.hidden = true;
  pickedText?.classList.remove('is-picked');
  pickedText = null;
});
textEls.forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    openPanel(el);
  }, true);
});

/* ---------- save / discard ---------- */
saveBtn.addEventListener('click', async () => {
  const payload = {};
  dirty.forEach((el) => { payload[el.dataset.ed] = read(el); });
  if (deleted.size) payload.__delete = [...deleted].map((el) => el.dataset.ed);
  if (textEdits.size) {
    payload.__text = {};
    textEdits.forEach((pair, key) => {
      const langs = pairLangs(key);
      // send each half under its own data-ed-text id, as the server expects
      if (langs.es) payload.__text[langs.es.dataset.edText] = { es: pair.es ?? viText(langs.es) };
      if (langs.en) payload.__text[langs.en.dataset.edText] = { en: pair.en ?? viText(langs.en) };
      if (!langs.es && !langs.en) {
        const only = textEls.find((e) => pairKey(e.dataset.edText) === key);
        if (only) payload.__text[only.dataset.edText] = pair;
      }    });
  }
  status('Saving…');
  try {
    const res = await fetch('/__save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || `HTTP ${res.status}`);
    dirty.forEach((el) => original.set(el, el.getAttribute('style')));
    dirty.clear();
    deleted.forEach((el) => el.remove());
    deleted.clear();
    textEdits.clear();
    textEls.forEach((el) => originalText.set(el, el.innerHTML));
    status(`Saved: ${out.updated} moved, ${out.texts || 0} texts, ${out.deleted} deleted · backup in tools/.edit-backups/`);
  } catch (err) {
    status(`Not saved: ${err.message}. Open the page through tools/edit-server.py.`);
    saveBtn.disabled = false;
  }
});
revertBtn.addEventListener('click', () => {
  dirty.forEach((el) => {
    const st = original.get(el);
    if (st === null) el.removeAttribute('style'); else el.setAttribute('style', st);
  });
  deleted.forEach((el) => el.classList.remove('ed-gone'));
  dirty.clear();
  deleted.clear();
  textEdits.forEach((edit, id) => {
    const els = textEls.filter((e) => e.dataset.edText === id);
    els.forEach((el) => { el.innerHTML = originalText.get(el); });
  });
  textEdits.clear();
  originalText.clear();
  status('Changes discarded');
});
window.addEventListener('beforeunload', (e) => { if (dirty.size || deleted.size || textEdits.size) e.preventDefault(); });
