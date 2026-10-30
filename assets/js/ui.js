// UI helpers shared by every page. Keep pages thin: build DOM with el(), format with fmt*, show state with
// loading()/emptyState()/errorState(), tables with renderTable(), feedback with toast()/modal()/confirmDialog().
import { icon } from './icons.js';
import { getLang, t, tl, extend } from './i18n.js';

/* ------------------------------------------------------------------ DOM */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** el('div', {class:'card', onclick: fn, html: '<b>raw</b>', dataset:{id:1}}, child1, 'text', [more]) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class' || k === 'className') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  appendChildren(node, children);
  return node;
}

function appendChildren(node, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** Element from an HTML string (single root). */
export function h(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html).trim();
  return tpl.content.firstElementChild;
}

export function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
export function mount(node, ...children) { clear(node); appendChildren(node, children); return node; }

/* ------------------------------------------------------------------ formatting */
const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
};
export function monthName(i, lang = getLang()) { return (MONTHS[lang] || MONTHS.en)[i]; }

/** Parse 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS' WITHOUT timezone shifts (server sends IST wall-clock time). */
export function parseISO(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  return { y: +m[1], mo: +m[2] - 1, d: +m[3], hh: m[4] ? +m[4] : null, mi: m[5] ? +m[5] : null };
}

export function fmtDate(s) {
  const p = parseISO(s);
  if (!p) return '—';
  return `${String(p.d).padStart(2, '0')} ${monthName(p.mo)} ${p.y}`;
}

export function fmtDateTime(s) {
  const p = parseISO(s);
  if (!p) return '—';
  if (p.hh === null) return fmtDate(s);
  const mm = String(p.mi).padStart(2, '0');
  if (getLang() === 'hi') return `${fmtDate(s)}, ${String(p.hh).padStart(2, '0')}:${mm}`;
  const ampm = p.hh >= 12 ? 'PM' : 'AM';
  const h12 = p.hh % 12 || 12;
  return `${fmtDate(s)}, ${h12}:${mm} ${ampm}`;
}

/** Days from a (to b), date-only. */
export function daysBetween(a, b) {
  const pa = parseISO(a), pb = parseISO(b);
  if (!pa || !pb) return null;
  return Math.round((Date.UTC(pb.y, pb.mo, pb.d) - Date.UTC(pa.y, pa.mo, pa.d)) / 86400000);
}

/** 23 -> 'in 23 days', 0 -> 'today', -5 -> '5 days overdue' (or '5 days ago' with {past:'ago'}). */
export function relDays(n, opts = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (n === 0) return t('rel.today');
  if (n === 1) return t('rel.tomorrow');
  if (n > 0) return t('rel.in_days', { n });
  if (n === -1) return opts.past === 'ago' ? t('rel.yesterday') : t('rel.overdue_1');
  return opts.past === 'ago' ? t('rel.days_ago', { n: -n }) : t('rel.overdue', { n: -n });
}

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const INR2 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** ₹50,00,000 (Indian grouping). */
export function fmtINR(n) {
  if (n === null || n === undefined || n === '') return '—';
  return `₹${INR.format(Math.round(Number(n)))}`;
}

/** ₹50 L / ₹1.25 Cr / ₹75,000 */
export function fmtINRShort(n) {
  if (n === null || n === undefined || n === '') return '—';
  const v = Number(n);
  const a = Math.abs(v);
  if (a >= 1e7) return `₹${INR2.format(+(v / 1e7).toFixed(2))} ${t('unit.crore')}`;
  if (a >= 1e5) return `₹${INR2.format(+(v / 1e5).toFixed(2))} ${t('unit.lakh')}`;
  return fmtINR(v);
}

export function fmtNum(n, digits = 0) {
  if (n === null || n === undefined || n === '') return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(Number(n));
}

export function fmtPct(n, digits = 0) {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toFixed(digits)}%`;
}

export function fmtBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
}

/* ------------------------------------------------------------------ badges (return HTML strings) */
extend({
  en: { 'sev.ok': 'Clear', 'sev.info': 'Info', 'sev.medium': 'Attention', 'sev.high': 'Serious', 'sev.low': 'Low' },
  hi: { 'sev.ok': 'ठीक', 'sev.info': 'सूचना', 'sev.medium': 'ध्यान दें', 'sev.high': 'गंभीर', 'sev.low': 'कम' },
});

const STATE_CLASS = {
  AT_SCRUTINY: 'b-info', RETURNED: 'b-orange', EVC_QUEUED: 'b-violet', EVC_SCHEDULED: 'b-teal',
  AT_COMMITTEE: 'b-primary', AT_DECISION: 'b-saffron', APPROVED: 'b-success', APPROVED_CONDITIONAL: 'b-success',
  REJECTED: 'b-danger',
};
/** Application state badge, e.g. stateBadge('AT_SCRUTINY'). */
export function stateBadge(state) {
  return `<span class="badge ${STATE_CLASS[state] || 'b-slate'}"><span class="dot"></span>${esc(t(`state.${state}`, { _default: state }))}</span>`;
}

export function stageBadge(stage) {
  return `<span class="badge b-slate">${esc(t(`stage.${stage}`, { _default: stage }))}</span>`;
}

const FLAG_CLASS = { OVERDUE: 'b-danger', APPROACHING: 'b-warning', PAUSED: 'b-orange', ESCALATED: 'b-danger',
  NEW_INST: 'b-violet', RESCRUTINY: 'b-info', INTEGRATION: 'b-slate' };
/** Small chips for AppSummary.flags (OVERDUE, APPROACHING, PAUSED, ESCALATED, NEW_INST, RESCRUTINY, INTEGRATION). */
export function flagChips(flags = []) {
  return (flags || []).map((f) => `<span class="badge ${FLAG_CLASS[f] || 'b-slate'}">${esc(t(`flag.${f}`, { _default: f }))}</span>`).join(' ');
}

/** Undertaking status; pass overdue=true to show "Overdue" for a PENDING one. */
export function utBadge(status, overdue = false) {
  if (status === 'PENDING' && overdue) return `<span class="badge b-danger">${icon('alert', 12)}${esc(t('ut.OVERDUE'))}</span>`;
  const cls = { PENDING: 'b-warning', SUBMITTED: 'b-info', VERIFIED: 'b-success' }[status] || 'b-slate';
  return `<span class="badge ${cls}">${esc(t(`ut.${status}`, { _default: status }))}</span>`;
}

export function validityBadge(v) {
  const cls = { VALID: 'b-success', EXPIRING: 'b-warning', EXPIRED: 'b-danger', NO_EXPIRY: 'b-slate' }[v] || 'b-slate';
  return `<span class="badge ${cls}">${esc(t(`validity.${v}`, { _default: v || '—' }))}</span>`;
}

export function verifyBadge(v) {
  const cls = { PENDING: 'b-info', VERIFIED: 'b-success', REJECTED: 'b-danger' }[v] || 'b-slate';
  return `<span class="badge ${cls}">${esc(t(`verify.${v}`, { _default: v || '—' }))}</span>`;
}

/** Escalation level badge: L1 amber, L2 orange, L3 red; resolved grey; acknowledged gets a tick. */
export function escBadge(level, status = 'OPEN') {
  if (!level) return '<span class="muted">—</span>';
  const cls = status === 'RESOLVED' ? 'b-slate' : ({ 1: 'b-warning', 2: 'b-orange', 3: 'b-danger' }[level] || 'b-danger');
  const tick = status === 'ACKNOWLEDGED' ? icon('check', 12) : '';
  return `<span class="badge as-esc ${cls}" title="${esc(t(`esc.${status}`, { _default: status }))}">${tick}L${esc(level)}</span>`;
}

/** Days-left chip: negative = overdue (red), 0-3 amber, 4-15 blue, else grey; {paused:true} shows "Clock paused". */
export function daysChip(days, opts = {}) {
  if (opts.paused) return `<span class="badge b-orange">${icon('clock', 12)}${esc(t('flag.PAUSED'))}</span>`;
  if (days === null || days === undefined) return '—';
  const cls = days < 0 ? 'b-danger' : days <= 3 ? 'b-warning' : days <= 15 ? 'b-info' : 'b-slate';
  return `<span class="badge ${cls}">${esc(relDays(days))}</span>`;
}

/** Severity of a pre-check finding: ok | info | medium | high. */
export function severityBadge(sev) {
  const cls = { ok: 'b-success', info: 'b-info', medium: 'b-warning', high: 'b-danger', low: 'b-slate' }[sev] || 'b-slate';
  return `<span class="badge ${cls}">${esc(t(`sev.${sev}`, { _default: sev }))}</span>`;
}

/** The plain-language "why is it here" line ({en, hi}) as a callout node. */
export function whyLine(why) {
  return el('div', { class: 'as-why', role: 'note' }, el('span', { class: 'as-why-icon', html: icon('help', 18) }),
    el('span', {}, tl(why)));
}

/** Route stepper from AppDetail.route_steps (states done | current | returned | todo | bad). */
export function routeSteps(container, steps = []) {
  return stepper(container, steps.map((s) => ({
    label: tl(s.label),
    meta: s.state === 'returned' ? t('flag.PAUSED')
      : s.days_used !== null && s.days_used !== undefined ? `${s.days_used}/${s.sla_days} d` : `${s.sla_days} d`,
    state: { done: 'done', current: 'current', returned: 'current', bad: 'bad' }[s.state] || '',
  })));
}

/* ------------------------------------------------------------------ feedback */
let toastHost;
export function toast(message, type = 'info', timeout = 4500) {
  if (!toastHost) {
    toastHost = el('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(toastHost);
  }
  const ic = { success: 'check-circle', error: 'x-circle', warning: 'alert', info: 'info' }[type] || 'info';
  const node = el('div', { class: `toast ${type}` },
    el('span', { html: icon(ic, 18) }),
    el('div', { class: 'grow' }, message),
    el('button', { class: 't-close', 'aria-label': t('common.close'), html: icon('x', 16), onclick: () => node.remove() }));
  toastHost.appendChild(node);
  if (timeout) setTimeout(() => node.remove(), timeout);
  return node;
}

/**
 * modal({title, body: Node|string(html), size:'wide'|'xwide', actions:[{label, variant, onClick(close)->bool|Promise}], onClose})
 * returns {close, root, body}. An action handler returning false keeps the modal open.
 */
export function modal({ title, body, size = '', actions = [], onClose, dismissible = true } = {}) {
  const prevFocus = document.activeElement;
  const bodyNode = typeof body === 'string' ? el('div', { html: body }) : body;
  const foot = el('div', { class: 'modal-foot' });
  const dialog = el('div', { class: `modal ${size}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title || '' },
    el('div', { class: 'modal-head' },
      el('h3', {}, title || ''),
      dismissible ? el('button', { class: 'modal-close', 'aria-label': t('common.close'), html: icon('x', 20), onclick: () => close() }) : null),
    el('div', { class: 'modal-body' }, bodyNode),
    actions.length ? foot : null);
  const backdrop = el('div', { class: 'modal-backdrop' }, dialog);
  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    if (onClose) onClose();
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape' && dismissible) close(); }
  for (const a of actions) {
    const btn = el('button', { class: `btn ${a.variant || 'secondary'}`, type: 'button' }, a.label);
    btn.addEventListener('click', async () => {
      if (!a.onClick) return close();
      btn.disabled = true;
      try {
        const keep = await a.onClick(close, btn);
        if (keep !== false) close();
      } catch (err) {
        toast(err.message || String(err), 'error');
      } finally {
        btn.disabled = false;
      }
    });
    foot.appendChild(btn);
  }
  if (dismissible) backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);
  const focusable = dialog.querySelector('input, select, textarea, button.btn');
  (focusable || dialog).focus?.();
  return { close, root: dialog, body: bodyNode };
}

export function confirmDialog(message, { title, confirmLabel, variant = 'primary' } = {}) {
  return new Promise((resolve) => {
    let done = false;
    modal({
      title: title || t('common.confirm'),
      body: el('p', { class: 'mb-0' }, message),
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => { done = true; resolve(false); } },
        { label: confirmLabel || t('common.confirm'), variant, onClick: () => { done = true; resolve(true); } },
      ],
      onClose: () => { if (!done) resolve(false); },
    });
  });
}

/** Ask for text. Resolves the string, or null when cancelled. */
export function promptDialog({ title, label, placeholder = '', required = true, multiline = true, confirmLabel, variant = 'primary', value = '' } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const id = `pd-${Math.random().toString(36).slice(2, 8)}`;
    const input = multiline
      ? el('textarea', { class: 'textarea', placeholder, rows: 4, id, 'aria-label': label || title }, value)
      : el('input', { class: 'input', placeholder, value, id, 'aria-label': label || title });
    const err = el('div', { class: 'error', hidden: true, role: 'alert' }, t('common.required'));
    modal({
      title,
      body: el('div', { class: 'field' }, label ? el('label', { for: id }, label) : null, input, err),
      actions: [
        { label: t('common.cancel'), onClick: () => { done = true; resolve(null); } },
        {
          label: confirmLabel || t('common.submit'), variant, onClick: () => {
            const v = input.value.trim();
            if (required && !v) { err.hidden = false; input.classList.add('invalid'); return false; }
            done = true; resolve(v); return true;
          },
        },
      ],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

/** Put a button into a busy state while `fn` runs. */
export async function withBusy(btn, fn) {
  if (!btn) return fn();
  const html = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>${esc(btn.textContent.trim())}`;
  try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = html; }
}

/* ------------------------------------------------------------------ states */
export function loading(container, text) {
  return mount(container, el('div', { class: 'loading' }, el('span', { class: 'spinner' }), text || t('common.loading')));
}

export function emptyState(container, { icon: ic = 'inbox', title, text, action } = {}) {
  return mount(container, el('div', { class: 'empty' },
    el('div', { class: 'e-icon', html: icon(ic, 26) }),
    el('div', { class: 'e-title' }, title || t('common.no_records')),
    text ? el('div', {}, text) : null,
    action ? el('div', { class: 'mt-2' }, action) : null));
}

export function errorState(container, err, retry) {
  return mount(container, el('div', { class: 'empty' },
    el('div', { class: 'e-icon', style: { background: 'var(--as-danger-50)', color: 'var(--as-danger)' }, html: icon('alert-circle', 26) }),
    el('div', { class: 'e-title' }, t('common.error')),
    el('div', {}, err?.message || String(err || '')),
    retry ? el('div', { class: 'mt-2' }, el('button', { class: 'btn secondary sm', onclick: retry, html: `${icon('refresh', 15)} ${esc(t('common.retry'))}` })) : null));
}

/* ------------------------------------------------------------------ table */
/**
 * renderTable(container, {
 *   columns: [{key, label, render(row)->html|Node, sortable, align:'right'|'center', width, className}],
 *   rows, onRowClick(row), rowClass(row)->string, empty:{title,text,icon}, sort:{key,dir}, onSort(key,dir), compact
 * })
 */
export function renderTable(container, opts) {
  const { columns, rows = [], onRowClick, rowClass, empty, sort, onSort, compact } = opts;
  if (!rows.length) return emptyState(container, empty || { text: t('common.no_records_hint') });
  const thead = el('thead', {}, el('tr', {}, columns.map((c) => {
    const th = el('th', { class: [c.align === 'right' ? 'num' : '', c.align === 'center' ? 'center' : '', c.sortable ? 'sortable' : ''].join(' ').trim(), style: c.width ? { width: c.width } : null, scope: 'col' });
    th.innerHTML = esc(c.label ?? '');
    if (c.sortable && onSort) {
      const active = sort && sort.key === c.key;
      th.innerHTML += `<span class="sort-ind">${active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>`;
      th.addEventListener('click', () => onSort(c.key, active && sort.dir === 'desc' ? 'asc' : 'desc'));
    }
    return th;
  })));
  const tbody = el('tbody');
  for (const row of rows) {
    const tr = el('tr', { class: [onRowClick ? 'clickable' : '', rowClass ? rowClass(row) : ''].join(' ').trim() });
    for (const c of columns) {
      const td = el('td', { class: [c.align === 'right' ? 'num' : '', c.align === 'center' ? 'center' : '', c.className || ''].join(' ').trim() });
      const v = c.render ? c.render(row) : row[c.key];
      if (v instanceof Node) td.appendChild(v);
      else td.innerHTML = c.render ? (v ?? '') : esc(v ?? '—');
      tr.appendChild(td);
    }
    if (onRowClick) {
      tr.tabIndex = 0;
      tr.addEventListener('click', (e) => { if (!e.target.closest('a,button,input,select,label')) onRowClick(row, e); });
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') onRowClick(row, e); });
    }
    tbody.appendChild(tr);
  }
  return mount(container, el('div', { class: 'table-wrap' }, el('table', { class: `table${compact ? ' compact' : ''}` }, thead, tbody)));
}

/** Pagination footer. onChange(page). */
export function pagination(container, { page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  const nav = el('div', { class: 'pagination' });
  const btn = (label, p, opts = {}) => el('button', { type: 'button', class: opts.active ? 'active' : '', disabled: opts.disabled, 'aria-label': opts.aria || String(label), onclick: () => onChange(p) }, label);
  nav.appendChild(btn('‹', page - 1, { disabled: page <= 1, aria: t('common.previous') }));
  const win = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) win.push(p);
  if (win[0] > 1) { nav.appendChild(btn(1, 1)); if (win[0] > 2) nav.appendChild(el('span', { class: 'muted' }, '…')); }
  win.forEach((p) => nav.appendChild(btn(p, p, { active: p === page })));
  if (win[win.length - 1] < pages) { if (win[win.length - 1] < pages - 1) nav.appendChild(el('span', { class: 'muted' }, '…')); nav.appendChild(btn(pages, pages)); }
  nav.appendChild(btn('›', page + 1, { disabled: page >= pages, aria: t('common.next') }));
  return mount(container, el('div', { class: 'table-footer' }, el('span', {}, t('common.showing', { from, to, total })), nav));
}

/* ------------------------------------------------------------------ tabs, timeline, stepper, dl */
/** tabs(container, [{key, label, count, render(panel)}], {active, onChange}) -> {select(key)} */
export function tabs(container, defs, { active, onChange } = {}) {
  const bar = el('div', { class: 'tabs', role: 'tablist' });
  const panel = el('div', { class: 'tab-panel', role: 'tabpanel' });
  let current = active || defs[0]?.key;
  function select(key) {
    current = key;
    $$('button', bar).forEach((b) => { const on = b.dataset.key === key; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    const def = defs.find((d) => d.key === key);
    clear(panel);
    if (def && def.render) def.render(panel);
    if (onChange) onChange(key);
  }
  for (const d of defs) {
    bar.appendChild(el('button', { type: 'button', role: 'tab', dataset: { key: d.key }, onclick: () => select(d.key) },
      d.icon ? el('span', { html: icon(d.icon, 16) }) : null,
      el('span', {}, d.label),
      d.count !== undefined && d.count !== null ? el('span', { class: 'count' }, d.count) : null));
  }
  mount(container, bar, panel);
  select(current);
  return { select, get active() { return current; } };
}

/** timeline(container, [{title, meta, body, tone:'success'|'danger'|'warning'|'muted'}]) */
export function timeline(container, items) {
  if (!items.length) return emptyState(container, { icon: 'history' });
  return mount(container, el('ul', { class: 'timeline' }, items.map((it) => el('li', {},
    el('span', { class: `t-dot ${it.tone || ''}` }),
    el('div', { class: 't-title' }, it.title),
    it.meta ? el('div', { class: 't-meta' }, it.meta) : null,
    it.body ? (it.body instanceof Node ? it.body : el('div', { class: 't-body' }, it.body)) : null))));
}

/** stepper(container, [{label, meta, state:'done'|'current'|'bad'|''}]) */
export function stepper(container, steps) {
  return mount(container, el('div', { class: 'stepper' }, steps.map((s, i) => el('div', { class: `step ${s.state || ''}` },
    el('div', { class: 's-circle', html: s.state === 'done' ? icon('check', 16) : s.state === 'bad' ? icon('x', 16) : String(i + 1) }),
    el('div', { class: 's-label' }, s.label),
    s.meta ? el('div', { class: 's-meta' }, s.meta) : null))));
}

/** Definition grid: dl([['Label', value(html|Node)], ...], {cols:3}) -> Node */
export function dl(pairs, { cols = 2 } = {}) {
  return el('dl', { class: `dl${cols === 3 ? ' cols-3' : cols === 1 ? ' cols-1' : ''}` }, pairs.filter(Boolean).map(([k, v]) => el('div', {},
    el('dt', {}, k),
    v instanceof Node ? el('dd', {}, v) : el('dd', { html: v === null || v === undefined || v === '' ? '—' : String(v) }))));
}

export function kpi({ label, value, sub, color = '', iconName, onClick, title }) {
  const onkeydown = onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : null;
  return el('div', { class: `kpi ${color ? 'c-' + color : ''} ${onClick ? 'clickable' : ''}`, onclick: onClick, onkeydown, title, role: onClick ? 'button' : null, tabindex: onClick ? 0 : null },
    el('div', { class: 'k-label', html: `${iconName ? icon(iconName, 14) : ''}<span>${esc(label)}</span>` }),
    el('div', { class: 'k-value' }, value),
    sub ? el('div', { class: 'k-sub', html: sub }) : null);
}

/* ------------------------------------------------------------------ misc */
export function getParam(name) { return new URLSearchParams(location.search).get(name); }

export function setParams(obj, replace = true) {
  const u = new URL(location.href);
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') u.searchParams.delete(k); else u.searchParams.set(k, v);
  }
  history[replace ? 'replaceState' : 'pushState']({}, '', u);
}

export function debounce(fn, ms = 300) {
  let tmr;
  return (...a) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...a), ms); };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

export function toCSV(columns, rows) {
  const cell = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map((c) => cell(c.label)).join(','), ...rows.map((r) => columns.map((c) => cell(c.csv ? c.csv(r) : r[c.key])).join(','))].join('\n');
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast(t('common.copied'), 'success', 1800); } catch (e) { toast(text, 'info'); }
}

/** Read a <form> into a plain object (checkboxes -> boolean, number inputs -> number). */
export function formData(form) {
  const out = {};
  for (const elx of form.elements) {
    if (!elx.name || elx.disabled) continue;
    if (elx.type === 'checkbox') out[elx.name] = elx.checked;
    else if (elx.type === 'number') out[elx.name] = elx.value === '' ? null : Number(elx.value);
    else if (elx.type === 'file') continue;
    else if (elx.type === 'radio') { if (elx.checked) out[elx.name] = elx.value; }
    else out[elx.name] = elx.value;
  }
  return out;
}

export { icon };
