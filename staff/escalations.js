// Escalations: overdue items on the three-rung ladder (holder, supervisor, Approval Bureau) with acknowledgement.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, emptyState, errorState, pagination, toast, setParams, getParam, fmtDate, fmtDateTime, daysBetween, escBadge,
} from '../assets/js/ui.js';
import { field, select, askText, pick, regionName, roleLabel } from './casekit.js';

extend({
  en: {
    'escp.title': 'Escalations',
    'escp.subtitle': 'Overdue items climb a ladder: the holder first, then the supervisor, then the Approval Bureau. Acknowledge with the action you are taking.',
    'escp.status': 'Status',
    'escp.level': 'Level',
    'escp.kind': 'Kind of item',
    'escp.region': 'Region',
    'escp.mine': 'Addressed to me',
    'escp.s_open': 'Open',
    'escp.s_ack': 'Acknowledged',
    'escp.s_res': 'Resolved',
    'escp.s_all': 'All',
    'escp.l1': 'Level 1',
    'escp.l2': 'Level 2',
    'escp.l3': 'Level 3',
    'escp.clear': 'Clear filters',
    'escp.counts': 'Counts',
    'escp.raised': 'Raised {date}',
    'escp.due': 'Due {date}',
    'escp.overdue': '{n} days overdue',
    'escp.addressed': 'Addressed to: {who}',
    'escp.ladder': 'Escalation ladder',
    'escp.rung1': 'L1 · holder',
    'escp.rung2': 'L2 · supervisor',
    'escp.rung3': 'L3 · Approval Bureau (HQ)',
    'escp.here': 'Now with: {who}',
    'escp.ack_by': 'Acknowledged by {name} on {date}',
    'escp.resolved': 'Resolved on {date}: the underlying item was dealt with.',
    'escp.ack': 'Acknowledge',
    'escp.ack_title': 'Acknowledge a level {n} escalation',
    'escp.ack_label': 'What action are you taking?',
    'escp.ack_hint': 'Required. It is recorded against the escalation and in the audit trail.',
    'escp.ack_done': 'Escalation acknowledged',
    'escp.open_item': 'Open the item',
    'escp.empty': 'No escalations match these filters',
    'escp.empty_text': 'Nothing is overdue here, or try a different status.',
    'escp.list_label': 'Escalations',
  },
  hi: {
    'escp.title': 'वृद्धि (एस्केलेशन)',
    'escp.subtitle': 'अतिदेय मदें सीढ़ी चढ़ती हैं: पहले धारक, फिर पर्यवेक्षक, फिर अनुमोदन ब्यूरो। अपनी कार्रवाई लिखकर पावती दें।',
    'escp.status': 'स्थिति',
    'escp.level': 'स्तर',
    'escp.kind': 'मद का प्रकार',
    'escp.region': 'क्षेत्र',
    'escp.mine': 'मुझे संबोधित',
    'escp.s_open': 'खुली',
    'escp.s_ack': 'पावती दी गई',
    'escp.s_res': 'समाधान',
    'escp.s_all': 'सभी',
    'escp.l1': 'स्तर 1',
    'escp.l2': 'स्तर 2',
    'escp.l3': 'स्तर 3',
    'escp.clear': 'फ़िल्टर हटाएँ',
    'escp.counts': 'संख्या',
    'escp.raised': 'दर्ज {date}',
    'escp.due': 'नियत {date}',
    'escp.overdue': '{n} दिन अतिदेय',
    'escp.addressed': 'संबोधित: {who}',
    'escp.ladder': 'वृद्धि की सीढ़ी',
    'escp.rung1': 'स्तर 1 · धारक',
    'escp.rung2': 'स्तर 2 · पर्यवेक्षक',
    'escp.rung3': 'स्तर 3 · अनुमोदन ब्यूरो (मुख्यालय)',
    'escp.here': 'अब किसके पास: {who}',
    'escp.ack_by': '{name} ने {date} को पावती दी',
    'escp.resolved': '{date} को समाधान: संबंधित मद निपटा दी गई।',
    'escp.ack': 'पावती दें',
    'escp.ack_title': 'स्तर {n} वृद्धि की पावती दें',
    'escp.ack_label': 'आप क्या कार्रवाई कर रहे हैं?',
    'escp.ack_hint': 'आवश्यक। यह वृद्धि और ऑडिट ट्रेल में दर्ज होगा।',
    'escp.ack_done': 'वृद्धि की पावती दी गई',
    'escp.open_item': 'मद खोलें',
    'escp.empty': 'इन फ़िल्टरों से कोई वृद्धि नहीं मिली',
    'escp.empty_text': 'यहाँ कुछ भी अतिदेय नहीं है, या कोई अन्य स्थिति चुनें।',
    'escp.list_label': 'वृद्धियाँ',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'escalations',
  title: 'escp.title',
  subtitle: 'escp.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'escp.title' }],
});

const PAGE_SIZE = 20;
const SHOW_REGION = !['ro', 'rd'].includes(user.role);
const STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'ALL'];
const f = {
  status: STATUSES.includes((getParam('status') || '').toUpperCase()) ? getParam('status').toUpperCase() : 'OPEN',
  level: getParam('level') || '',
  kind: getParam('kind') || '',
  region: getParam('region') || '',
  mine: getParam('mine') === '1',
  page: Number(getParam('page')) || 1,
};
let last = null;
const listEl = $('#list');
const pagerEl = $('#pager');
const formEl = $('#filters');
const countsEl = $('#counts');
const today = () => meta.today;

const syncUrl = () => setParams({
  status: f.status !== 'OPEN' ? f.status : null, level: f.level || null, kind: f.kind || null, region: SHOW_REGION ? f.region || null : null,
  mine: f.mine ? 1 : null, page: f.page > 1 ? f.page : null,
});

const STATUS_KEY = { OPEN: 'escp.s_open', ACKNOWLEDGED: 'escp.s_ack', RESOLVED: 'escp.s_res', ALL: 'escp.s_all' };

function buildForm() {
  const nodes = [
    field({
      label: t('escp.status'), id: 'f-status',
      control: select(STATUSES.map((k) => ({ value: k, label: t(STATUS_KEY[k]), selected: f.status === k })), { name: 'status' }),
    }),
    field({
      label: t('escp.level'), id: 'f-level',
      control: select([{ value: '', label: t('common.all'), selected: !f.level }, ...[1, 2, 3].map((n) => ({ value: String(n), label: t(`escp.l${n}`), selected: f.level === String(n) }))], { name: 'level' }),
    }),
    field({
      label: t('escp.kind'), id: 'f-kind',
      control: select([{ value: '', label: t('common.all'), selected: !f.kind }, ...Object.keys(meta.esc_kinds).map((k) => ({ value: k, label: tl(meta.esc_kinds[k]), selected: f.kind === k }))], { name: 'kind' }),
    }),
    SHOW_REGION ? field({
      label: t('escp.region'), id: 'f-region',
      control: select([{ value: '', label: t('common.all'), selected: !f.region }, ...meta.regions.map((r) => ({ value: r.code, label: `${regionName(r)} (${r.code})`, selected: f.region === r.code }))], { name: 'region' }),
    }) : null,
    el('div', { class: 'esc-wide' },
      el('label', { class: 'check' }, el('input', { type: 'checkbox', name: 'mine', checked: f.mine || null }), t('escp.mine')),
      el('button', { class: 'btn sm ghost', type: 'button', id: 'f-clear', html: `${icon('x', 14)} ${esc(t('escp.clear'))}` })),
  ];
  mount(formEl, nodes);
}

formEl.addEventListener('submit', (e) => e.preventDefault());
formEl.addEventListener('change', () => {
  for (const c of formEl.elements) {
    if (!c.name) continue;
    f[c.name] = c.type === 'checkbox' ? c.checked : c.value;
  }
  f.page = 1;
  syncUrl();
  load();
});
formEl.addEventListener('click', (e) => {
  if (!e.target.closest('#f-clear')) return;
  Object.assign(f, { status: 'OPEN', level: '', kind: '', region: '', mine: false, page: 1 });
  buildForm(); syncUrl(); load();
});

function renderCounts() {
  const c = (last && last.counts) || {};
  const chip = (label, n, active, onClick, tone) => el('button', {
    class: `btn sm ${active ? '' : 'secondary'} ${tone || ''}`.trim(), type: 'button', 'aria-pressed': active ? 'true' : 'false', onclick: onClick,
    html: `${esc(label)} <span class="badge b-slate">${esc(String(n ?? 0))}</span>`,
  });
  const setF = (patch) => () => { Object.assign(f, patch, { page: 1 }); buildForm(); syncUrl(); load(); };
  mount(countsEl,
    chip(t('escp.s_open'), c.OPEN, f.status === 'OPEN' && !f.level, setF({ status: 'OPEN', level: '' })),
    ...[1, 2, 3].map((n) => chip(t(`escp.l${n}`), c[`L${n}`], f.status === 'OPEN' && f.level === String(n), setF({ status: 'OPEN', level: String(n) }))),
    chip(t('escp.s_ack'), c.ACKNOWLEDGED, f.status === 'ACKNOWLEDGED', setF({ status: 'ACKNOWLEDGED', level: '' })),
    chip(t('escp.s_res'), c.RESOLVED, f.status === 'RESOLVED', setF({ status: 'RESOLVED', level: '' })));
}

function daysOver(e) {
  if (e.status === 'RESOLVED') return 0;
  const n = e.due_date ? daysBetween(e.due_date, today()) : e.days_overdue;
  return n && n > 0 ? n : 0;
}

function ladder(e) {
  const addressee = e.addressee ? `${e.addressee.name} (${roleLabel(e.addressee.role)})` : tl(e.addressee_role_label);
  const rungs = [1, 2, 3].map((n) => {
    const on = n <= e.level;
    const rungLabel = meta.esc_levels && meta.esc_levels[n] ? tl(meta.esc_levels[n]) : t(`escp.rung${n}`);
    return el('div', { class: `rung ${on ? `on l${n}` : ''}` },
      el('div', { class: 'r-title' }, rungLabel),
      n === e.level && e.status !== 'RESOLVED' ? el('div', { class: 'esc-rung-note' }, t('escp.here', { who: addressee })) : null);
  });
  return el('div', { class: 'ladder', role: 'group', 'aria-label': t('escp.ladder') }, rungs);
}

async function acknowledge(e) {
  const note = await askText({
    title: t('escp.ack_title', { n: e.level }),
    intro: pick(e.title, e.title_hi),
    label: t('escp.ack_label'),
    hint: t('escp.ack_hint'),
    confirmLabel: t('escp.ack'),
  });
  if (note === null) return;
  try {
    await api.post(`/escalations/${e.id}/ack`, { note });
    toast(t('escp.ack_done'), 'success');
    load();
  } catch (err) {
    toast(err.message, 'error');
  }
}

function card(e) {
  const over = daysOver(e);
  const meta1 = [
    e.institution ? `${icon('building', 14)} ${esc(e.institution.name)}` : '',
    e.region ? esc(e.region) : '',
    esc(t('escp.raised', { date: fmtDate(e.raised_at) })),
    e.due_date ? esc(t('escp.due', { date: fmtDate(e.due_date) })) : '',
    over ? `<b>${esc(t('escp.overdue', { n: over }))}</b>` : '',
    esc(t('escp.addressed', { who: tl(e.addressee_role_label) })),
  ].filter(Boolean);
  return el('article', { class: 'card', 'aria-label': pick(e.title, e.title_hi) },
    el('div', { class: 'card-body esc-card' },
      el('div', { class: 'esc-head', html: `${escBadge(e.level, e.status)} <span class="badge b-slate">${esc(tl(e.kind_label))}</span> <span class="badge ${e.status === 'OPEN' ? 'b-warning' : e.status === 'ACKNOWLEDGED' ? 'b-info' : 'b-slate'}">${esc(t(`esc.${e.status}`, { _default: e.status }))}</span>` }),
      el('h3', {}, pick(e.title, e.title_hi)),
      el('div', { class: 'esc-meta' }, meta1.map((m) => el('span', { html: m }))),
      ladder(e),
      e.status === 'ACKNOWLEDGED' ? el('div', { class: 'esc-ack' },
        el('div', {}, el('b', {}, t('escp.ack_by', { name: e.ack_by ? e.ack_by.name : '—', date: fmtDateTime(e.ack_at) }))),
        e.ack_note ? el('div', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, e.ack_note) : null) : null,
      e.status === 'RESOLVED' ? el('div', { class: 'small muted' }, t('escp.resolved', { date: fmtDateTime(e.resolved_at) })) : null,
      el('div', { class: 'esc-actions' },
        e.can_ack ? el('button', { class: 'btn warning', type: 'button', html: `${icon('check-circle', 16)} ${esc(t('escp.ack'))}`, onclick: () => acknowledge(e) }) : null,
        e.link ? el('a', { class: 'btn secondary', href: site(e.link), html: `${icon('arrow-right', 16)} ${esc(t('escp.open_item'))}` }) : null)));
}

function render() {
  renderCounts();
  if (!last) return;
  if (!last.items.length) { emptyState(listEl, { icon: 'shield-check', title: t('escp.empty'), text: t('escp.empty_text') }); mount(pagerEl); return; }
  mount(listEl, el('div', { class: 'grid g-2', role: 'list', 'aria-label': t('escp.list_label') }, last.items.map((e) => el('div', { role: 'listitem' }, card(e)))));
  pagination(pagerEl, { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; syncUrl(); load(); window.scrollTo({ top: 0 }); } });
}

async function load() {
  loading(listEl);
  try {
    last = await api.get('/escalations', {
      status: f.status === 'ALL' ? 'OPEN,ACKNOWLEDGED,RESOLVED' : f.status,
      level: f.level || undefined, kind: f.kind || undefined, region: SHOW_REGION ? f.region || undefined : undefined,
      mine: f.mine ? 1 : undefined, page: f.page, page_size: PAGE_SIZE,
    });
    render();
  } catch (err) {
    errorState(listEl, err, load);
  }
}

onLang(() => { buildForm(); render(); });
buildForm();
load();
