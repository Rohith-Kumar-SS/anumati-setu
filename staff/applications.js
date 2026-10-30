// Applications list: filters synced to the URL, table with deadline chips, pagination and CSV export.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, renderTable, pagination, mount, loading, emptyState, errorState, toast, withBusy, setParams, getParam,
  debounce, daysChip, stateBadge, flagChips, fmtDate, toCSV, downloadBlob,
} from '../assets/js/ui.js';
import { field, input, select, holderHtml, regionName, pick, roleLabel } from './casekit.js';

extend({
  en: {
    'apps.title': 'Applications',
    'apps.subtitle': 'Every application in your scope, most urgent first',
    'apps.filters': 'Filters',
    'apps.results': 'Applications',
    'apps.q': 'Search',
    'apps.q_ph': 'Reference, institution, programme or PID',
    'apps.state': 'Status',
    'apps.stage': 'Stage',
    'apps.region': 'Region',
    'apps.type': 'Application type',
    'apps.route': 'Route',
    'apps.sort': 'Sort by',
    'apps.sort_due': 'Deadline (earliest first)',
    'apps.sort_submitted': 'Submitted (newest first)',
    'apps.sort_ref': 'Reference number',
    'apps.open': 'Open (not closed)',
    'apps.overdue': 'Overdue',
    'apps.approaching': 'Due soon',
    'apps.mine': 'In my queue',
    'apps.clear': 'Clear filters',
    'apps.col_ref': 'Reference',
    'apps.col_inst': 'Institution',
    'apps.col_kind': 'Type and route',
    'apps.col_state': 'Status',
    'apps.col_with': 'With',
    'apps.col_due': 'Due',
    'apps.col_flags': 'Flags',
    'apps.empty': 'No applications match these filters',
    'apps.empty_text': 'Clear a filter or widen the search.',
    'apps.inst_only': 'Showing the applications of one institution only.',
    'apps.inst_all': 'Show all applications',
    'apps.export_done': 'Exported {n} applications',
    'apps.csv_flags': 'Flags',
    'apps.closed': 'Closed',
  },
  hi: {
    'apps.title': 'आवेदन',
    'apps.subtitle': 'आपके दायरे के सभी आवेदन, सबसे आवश्यक पहले',
    'apps.filters': 'फ़िल्टर',
    'apps.results': 'आवेदन',
    'apps.q': 'खोजें',
    'apps.q_ph': 'संदर्भ, संस्था, कार्यक्रम या पीआईडी',
    'apps.state': 'स्थिति',
    'apps.stage': 'चरण',
    'apps.region': 'क्षेत्र',
    'apps.type': 'आवेदन का प्रकार',
    'apps.route': 'मार्ग',
    'apps.sort': 'क्रम',
    'apps.sort_due': 'समय-सीमा (निकटतम पहले)',
    'apps.sort_submitted': 'प्रस्तुति (नवीनतम पहले)',
    'apps.sort_ref': 'संदर्भ संख्या',
    'apps.open': 'खुले (बंद नहीं)',
    'apps.overdue': 'अतिदेय',
    'apps.approaching': 'शीघ्र नियत',
    'apps.mine': 'मेरी कतार में',
    'apps.clear': 'फ़िल्टर हटाएँ',
    'apps.col_ref': 'संदर्भ',
    'apps.col_inst': 'संस्था',
    'apps.col_kind': 'प्रकार व मार्ग',
    'apps.col_state': 'स्थिति',
    'apps.col_with': 'किसके पास',
    'apps.col_due': 'नियत',
    'apps.col_flags': 'चिह्न',
    'apps.empty': 'इन फ़िल्टरों से कोई आवेदन नहीं मिला',
    'apps.empty_text': 'कोई फ़िल्टर हटाएँ या खोज का दायरा बढ़ाएँ।',
    'apps.inst_only': 'केवल एक संस्था के आवेदन दिखाए जा रहे हैं।',
    'apps.inst_all': 'सभी आवेदन दिखाएँ',
    'apps.export_done': '{n} आवेदन निर्यात किए गए',
    'apps.csv_flags': 'चिह्न',
    'apps.closed': 'बंद',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'applications',
  title: 'apps.title',
  subtitle: 'apps.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'apps.title' }],
});

const PAGE_SIZE = 25;
const SHOW_REGION = !['ro', 'rd'].includes(user.role);
const STAGES = ['SCRUTINY', 'EVC', 'COMMITTEE', 'DECISION', 'CLOSED'];
const TOGGLES = ['open', 'overdue', 'approaching', 'mine'];
const fromUrl = () => ({
  q: getParam('q') || '', state: getParam('state') || '', stage: getParam('stage') || '', region: getParam('region') || '',
  app_type: getParam('app_type') || '', route: getParam('route') || '', sort: getParam('sort') || 'due',
  open: getParam('open') === '1', overdue: getParam('overdue') === '1', approaching: getParam('approaching') === '1', mine: getParam('mine') === '1',
  institution_id: getParam('institution_id') || '', page: Number(getParam('page')) || 1,
});
const f = fromUrl();
let last = null;

const listEl = $('#list');
const pagerEl = $('#pager');
const formEl = $('#filters');
const exportBtn = $('#export');

function queryParams(page = f.page, size = PAGE_SIZE) {
  return {
    q: f.q || undefined, state: f.state || undefined, stage: f.stage || undefined,
    region: SHOW_REGION ? f.region || undefined : undefined, app_type: f.app_type || undefined, route: f.route || undefined,
    sort: f.sort !== 'due' ? f.sort : undefined, open: f.open ? 1 : undefined, overdue: f.overdue ? 1 : undefined,
    approaching: f.approaching ? 1 : undefined, mine: f.mine ? 1 : undefined, institution_id: f.institution_id || undefined,
    page, page_size: size,
  };
}

function syncUrl() {
  const q = queryParams();
  setParams({
    q: q.q, state: q.state, stage: q.stage, region: q.region, app_type: q.app_type, route: q.route, sort: q.sort,
    open: q.open, overdue: q.overdue, approaching: q.approaching, mine: q.mine, institution_id: q.institution_id,
    page: f.page > 1 ? f.page : undefined,
  });
}

const opt = (value, label, current) => ({ value, label, selected: value === current });

function buildForm() {
  const q = input({ type: 'search', name: 'q', placeholder: t('apps.q_ph'), value: f.q, autocomplete: 'off' });
  const state = select([opt('', t('common.all'), f.state), ...Object.keys(meta.states).map((k) => opt(k, tl(meta.states[k]), f.state))], { name: 'state' });
  const stage = select([opt('', t('common.all'), f.stage), ...STAGES.map((k) => opt(k, t(`stage.${k}`, { _default: k }), f.stage))], { name: 'stage' });
  const type = select([opt('', t('common.all'), f.app_type), ...Object.keys(meta.app_types).map((k) => opt(k, tl(meta.app_types[k].label), f.app_type))], { name: 'app_type' });
  const route = select([opt('', t('common.all'), f.route), ...Object.keys(meta.routes).map((k) => opt(k, tl(meta.routes[k].label), f.route))], { name: 'route' });
  const sort = select([opt('due', t('apps.sort_due'), f.sort), opt('submitted', t('apps.sort_submitted'), f.sort), opt('ref', t('apps.sort_ref'), f.sort)], { name: 'sort' });
  const region = SHOW_REGION
    ? select([opt('', t('common.all'), f.region), ...meta.regions.map((r) => opt(r.code, `${regionName(r)} (${r.code})`, f.region))], { name: 'region' })
    : null;
  const toggles = TOGGLES.map((k) => {
    const cb = el('input', { type: 'checkbox', name: k, checked: f[k] || null });
    return el('label', { class: 'check' }, cb, t(`apps.${k}`));
  });
  const qf = field({ label: t('apps.q'), control: q, id: 'f-q' });
  qf.classList.add('span-2');
  mount(formEl,
    qf,
    field({ label: t('apps.state'), control: state, id: 'f-state' }),
    field({ label: t('apps.stage'), control: stage, id: 'f-stage' }),
    field({ label: t('apps.type'), control: type, id: 'f-type' }),
    field({ label: t('apps.route'), control: route, id: 'f-route' }),
    region ? field({ label: t('apps.region'), control: region, id: 'f-region' }) : null,
    field({ label: t('apps.sort'), control: sort, id: 'f-sort' }),
    el('div', { class: 'apps-toggles', role: 'group', 'aria-label': t('apps.filters') }, toggles,
      el('button', { class: 'btn sm ghost', type: 'button', id: 'f-clear', html: `${icon('x', 14)} ${esc(t('apps.clear'))}` })));
}

function readForm() {
  const v = {};
  for (const el_ of formEl.elements) {
    if (!el_.name) continue;
    v[el_.name] = el_.type === 'checkbox' ? el_.checked : el_.value;
  }
  Object.assign(f, v, { page: 1 });
}

const apply = () => { syncUrl(); load(); };

formEl.addEventListener('submit', (e) => e.preventDefault());
formEl.addEventListener('change', (e) => { if (e.target.name === 'q') return; readForm(); apply(); });
formEl.addEventListener('input', debounce((e) => { if (e.target && e.target.name === 'q') { readForm(); apply(); } }, 350));
formEl.addEventListener('click', (e) => {
  if (!e.target.closest('#f-clear')) return;
  Object.assign(f, { q: '', state: '', stage: '', region: '', app_type: '', route: '', sort: 'due', open: false, overdue: false, approaching: false, mine: false, institution_id: '', page: 1 });
  buildForm();
  apply();
});

function renderNote() {
  const box = $('#inst-note');
  if (!f.institution_id) { mount(box); return; }
  mount(box, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('building', 18) }),
    el('div', { class: 'grow' }, t('apps.inst_only')),
    el('button', { class: 'btn sm secondary', type: 'button', onclick: () => { f.institution_id = ''; f.page = 1; apply(); } }, t('apps.inst_all'))));
}

function render() {
  exportBtn.innerHTML = `${icon('download', 15)} ${esc(t('common.export_csv'))}`;
  renderNote();
  if (!last) return;
  renderTable(listEl, {
    columns: [
      { key: 'ref', label: t('apps.col_ref'), render: (a) => `<a class="cell-main" href="${site(`staff/application.html?id=${a.id}`)}">${esc(a.ref_no)}</a><div class="cell-sub">${esc(a.programme)}</div>` },
      { key: 'inst', label: t('apps.col_inst'), render: (a) => `<div class="cell-main">${esc(a.institution.name)}</div><div class="cell-sub">${esc(a.region.code)} · ${esc(a.institution.city || '')}</div>` },
      { key: 'kind', label: t('apps.col_kind'), render: (a) => `<div>${esc(tl(a.app_type_label))}</div><div class="cell-sub">${esc(tl(a.route_label))}</div>` },
      { key: 'state', label: t('apps.col_state'), render: (a) => `${stateBadge(a.state)}<div class="cell-sub">${esc(t(`stage.${a.stage}`, { _default: a.stage }))}</div>` },
      { key: 'holder', label: t('apps.col_with'), render: (a) => holderHtml(a) },
      { key: 'due', label: t('apps.col_due'), render: (a) => (a.closed_at ? `<span class="muted">${esc(t('apps.closed'))} · ${esc(fmtDate(a.closed_at))}</span>` : `${daysChip(a.days_left, { paused: a.paused })}<div class="cell-sub">${esc(fmtDate(a.due_date))}</div>`) },
      { key: 'flags', label: t('apps.col_flags'), render: (a) => flagChips(a.flags) },
    ],
    rows: last.items,
    rowClass: (a) => (a.overdue ? 'row-danger' : a.approaching ? 'row-warning' : ''),
    onRowClick: (a) => { location.href = site(`staff/application.html?id=${a.id}`); },
    empty: {
      icon: 'search', title: t('apps.empty'), text: t('apps.empty_text'),
    },
  });
  pagination(pagerEl, { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; syncUrl(); load(); window.scrollTo({ top: 0 }); } });
}

async function load() {
  loading(listEl);
  try {
    last = await api.get('/applications', queryParams());
    render();
  } catch (err) {
    errorState(listEl, err, load);
    mount(pagerEl);
  }
}

exportBtn.addEventListener('click', () => withBusy(exportBtn, async () => {
  try {
    const rows = [];
    let page = 1;
    for (;;) {
      const res = await api.get('/applications', queryParams(page, 100));
      rows.push(...res.items);
      if (rows.length >= res.total || !res.items.length) break;
      page += 1;
    }
    const cols = [
      { label: t('apps.col_ref'), csv: (a) => a.ref_no },
      { label: t('apps.col_inst'), csv: (a) => a.institution.name },
      { label: t('apps.region'), csv: (a) => pick(a.region.name, a.region.name_hi) },
      { label: t('f.type'), csv: (a) => tl(a.app_type_label) },
      { label: t('f.route'), csv: (a) => tl(a.route_label) },
      { label: t('f.programme'), csv: (a) => a.programme },
      { label: t('f.state'), csv: (a) => t(`state.${a.state}`, { _default: a.state }) },
      { label: t('apps.col_with'), csv: (a) => (a.holder ? `${a.holder.name} (${roleLabel(a.holder.role)})` : '') },
      { label: t('f.due'), csv: (a) => a.due_date || '' },
      { label: t('f.days_left'), csv: (a) => (a.days_left ?? '') },
      { label: t('apps.csv_flags'), csv: (a) => a.flags.map((x) => t(`flag.${x}`, { _default: x })).join(' / ') },
    ];
    downloadBlob(new Blob([`﻿${toCSV(cols, rows)}`], { type: 'text/csv;charset=utf-8' }), `applications-${meta.today}.csv`);
    toast(t('apps.export_done', { n: rows.length }), 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}));

onLang(() => { buildForm(); render(); });
buildForm();
load();
