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
  if (deleted.size) parts.push(`${deleted.size} to delete`);
  return parts.length ? `${parts.join(' · ')} · unsaved` : 'No changes';
};

/* ---------- styles + toolbar ---------- */
const css = document.createElement('style');
css.textContent = `
.is-editing [data-ed] { pointer-events: auto !important; cursor: grab; outline: 1px dashed color-mix(in srgb, var(--red) 55%, transparent); outline-offset: 3px; touch-action: none; user-select: none; }
.is-editing [data-ed]:hover { outline: 2px solid var(--red); }
.is-editing [data-ed].is-dragging { cursor: grabbing; outline: 2px solid var(--red); z-index: 60; }
.is-editing [data-ed] * { pointer-events: none; }
.is-editing [data-ed].is-selected { outline: 2px solid var(--red); outline-offset: 5px; }
.is-editing [data-ed].ed-gone { display: none !important; }
.ed-bar { position: fixed; z-index: 1000; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; max-width: 300px; padding: 12px 14px; background: var(--paper); color: var(--ink); border: 1.5px solid var(--ink); box-shadow: 4px 5px 0 var(--rule); font: 500 .8rem/1.4 var(--f-mono, monospace); }
.ed-bar b { color: var(--red); }
.ed-bar__row { display: flex; gap: 8px; }
.ed-bar button { font: inherit; padding: 4px 10px; border: 1.5px solid var(--ink); background: var(--sheet); color: var(--ink); cursor: pointer; }
.ed-bar button:disabled { opacity: .45; cursor: default; }
.ed-tip { position: fixed; z-index: 1001; pointer-events: none; padding: 2px 6px; background: var(--ink); color: var(--paper); font: 500 .7rem/1.3 var(--f-mono, monospace); }
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
  <div><b>Edit mode</b> · ${items.length} images</div>
  <div>Drag to move · wheel to resize · ⌥ Option + wheel to rotate · double-click to reset · click + Delete key to remove</div>
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
    e.preventDefault();
    const s = read(el);
    if (e.altKey) s.er += (e.deltaY || e.deltaX) * 0.1;
    else s.es = Math.min(4, Math.max(0.2, s.es * (1 - e.deltaY * 0.0015)));
    write(el, s); showTip(el, s, e.clientX, e.clientY);
  }, { passive: false });
  el.addEventListener('dblclick', (e) => { e.preventDefault(); write(el, { ...DEFAULTS }); });
  // links and buttons inside an editable image must not fire while arranging
  el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
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

/* ---------- save / discard ---------- */
saveBtn.addEventListener('click', async () => {
  const payload = {};
  dirty.forEach((el) => { payload[el.dataset.ed] = read(el); });
  if (deleted.size) payload.__delete = [...deleted].map((el) => el.dataset.ed);
  status('Saving…');
  try {
    const res = await fetch('/__save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || `HTTP ${res.status}`);
    dirty.forEach((el) => original.set(el, el.getAttribute('style')));
    dirty.clear();
    deleted.forEach((el) => el.remove());
    deleted.clear();
    status(`Saved: ${out.updated} moved, ${out.deleted} deleted · backup in tools/.edit-backups/`);
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
  status('Changes discarded');
});
window.addEventListener('beforeunload', (e) => { if (dirty.size || deleted.size) e.preventDefault(); });
