// EVC board: visits to schedule / scheduled / completed, plus the expert pool (not for the experts themselves).
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, errorState, renderTable, pagination, tabs, fmtDate, daysBetween, relDays, daysChip, escBadge,
  setParams, getParam,
} from '../assets/js/ui.js';
import { field, select, regionName, discLabel, stateName } from './casekit.js';

const FLAGS = {
  SCHEDULE_DUE: ['Schedule due soon', 'निर्धारण शीघ्र नियत', 'b-warning'],
  SCHEDULE_OVERDUE: ['Scheduling overdue', 'निर्धारण अतिदेय', 'b-danger'],
  COMPLETE_OVERDUE: ['Visit or report overdue', 'दौरा या रिपोर्ट अतिदेय', 'b-danger'],
};
const flagDict = (i) => Object.fromEntries(Object.entries(FLAGS).map(([k, v]) => [`evcb.flag.${k}`, v[i]]));

extend({
  en: Object.assign({
    'evcb.title': 'EVC board',
    'evcb.title_evc': 'My visits',
    'evcb.subtitle': 'Expert visits waiting to be scheduled, scheduled and completed, and the expert pool',
    'evcb.subtitle_evc': 'The expert visits you are on the panel for and the reports you must file',
    'evcb.tab.queued': 'To schedule',
    'evcb.tab.scheduled': 'Scheduled',
    'evcb.tab.scheduled_evc': 'My visits',
    'evcb.tab.completed': 'Completed',
    'evcb.tab.experts': 'Experts',
    'evcb.region': 'Region',
    'evcb.alert': 'Alerts',
    'evcb.alert_all': 'All visits',
    'evcb.alert_due': 'Scheduling due soon',
    'evcb.alert_overdue': 'Overdue',
    'evcb.col_app': 'Application',
    'evcb.col_region': 'Region',
    'evcb.col_sched_by': 'Schedule by',
    'evcb.col_complete_by': 'Complete by',
    'evcb.col_visit': 'Visit date',
    'evcb.col_convener': 'Convener',
    'evcb.col_panel': 'Panel',
    'evcb.col_alerts': 'Alerts',
    'evcb.col_filed': 'Report filed',
    'evcb.col_rec': 'Recommendation',
    'evcb.col_expert': 'Expert',
    'evcb.col_disc': 'Discipline',
    'evcb.col_state': 'Home state',
    'evcb.col_senior': 'Senior',
    'evcb.col_visits': 'Visits (60 days)',
    'evcb.col_next': 'Next visit',
    'evcb.col_unavail': 'Unavailable',
    'evcb.col_links': 'Linked institutions',
    'evcb.senior': 'Senior',
    'evcb.empty_queued': 'No visits waiting to be scheduled',
    'evcb.empty_scheduled': 'No scheduled visits',
    'evcb.empty_completed': 'No completed visits',
    'evcb.empty_text': 'Visits appear here automatically when an application reaches the EVC stage.',
    'evcb.note_queued': 'The scheduling assistant on each case proposes a panel and date and excludes experts with a conflict of interest.',
    'evcb.note_experts': 'The assistant ranks experts by discipline match, then by fewest visits in the last 60 days. Experts from the institution\'s home state or linked to it are excluded automatically.',
    'evcb.you_convener': 'You are convener',
    'evcb.none': '—',
    'evcb.n_exp': '{n} experts',
  }, flagDict(0)),
  hi: Object.assign({
    'evcb.title': 'ईवीसी बोर्ड',
    'evcb.title_evc': 'मेरे दौरे',
    'evcb.subtitle': 'निर्धारण हेतु प्रतीक्षित, निर्धारित और पूर्ण विशेषज्ञ दौरे तथा विशेषज्ञ सूची',
    'evcb.subtitle_evc': 'वे विशेषज्ञ दौरे जिनके पैनल में आप हैं और जो रिपोर्ट आपको दाखिल करनी हैं',
    'evcb.tab.queued': 'निर्धारण हेतु',
    'evcb.tab.scheduled': 'निर्धारित',
    'evcb.tab.scheduled_evc': 'मेरे दौरे',
    'evcb.tab.completed': 'पूर्ण',
    'evcb.tab.experts': 'विशेषज्ञ',
    'evcb.region': 'क्षेत्र',
    'evcb.alert': 'चेतावनियाँ',
    'evcb.alert_all': 'सभी दौरे',
    'evcb.alert_due': 'निर्धारण शीघ्र नियत',
    'evcb.alert_overdue': 'अतिदेय',
    'evcb.col_app': 'आवेदन',
    'evcb.col_region': 'क्षेत्र',
    'evcb.col_sched_by': 'निर्धारण तक',
    'evcb.col_complete_by': 'पूर्ण होने तक',
    'evcb.col_visit': 'दौरे की तिथि',
    'evcb.col_convener': 'संयोजक',
    'evcb.col_panel': 'पैनल',
    'evcb.col_alerts': 'चेतावनियाँ',
    'evcb.col_filed': 'रिपोर्ट दाखिल',
    'evcb.col_rec': 'अनुशंसा',
    'evcb.col_expert': 'विशेषज्ञ',
    'evcb.col_disc': 'विषय-क्षेत्र',
    'evcb.col_state': 'गृह राज्य',
    'evcb.col_senior': 'वरिष्ठ',
    'evcb.col_visits': 'दौरे (60 दिन)',
    'evcb.col_next': 'अगला दौरा',
    'evcb.col_unavail': 'अनुपलब्ध',
    'evcb.col_links': 'संबद्ध संस्थाएँ',
    'evcb.senior': 'वरिष्ठ',
    'evcb.empty_queued': 'निर्धारण हेतु कोई दौरा प्रतीक्षित नहीं',
    'evcb.empty_scheduled': 'कोई निर्धारित दौरा नहीं',
    'evcb.empty_completed': 'कोई पूर्ण दौरा नहीं',
    'evcb.empty_text': 'आवेदन के ईवीसी चरण में पहुँचते ही दौरे यहाँ स्वतः दिखते हैं।',
    'evcb.note_queued': 'प्रत्येक मामले में निर्धारण सहायक पैनल और तिथि सुझाता है तथा हितों के टकराव वाले विशेषज्ञों को बाहर रखता है।',
    'evcb.note_experts': 'सहायक विशेषज्ञों को पहले विषय-क्षेत्र के मेल, फिर पिछले 60 दिनों में सबसे कम दौरों के आधार पर क्रम देता है। संस्था के गृह राज्य के या उससे संबद्ध विशेषज्ञ स्वतः बाहर रखे जाते हैं।',
    'evcb.you_convener': 'आप संयोजक हैं',
    'evcb.none': '—',
    'evcb.n_exp': '{n} विशेषज्ञ',
  }, flagDict(1)),
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'authority'],
  active: 'evc',
  title: 'evcb.title',
  subtitle: 'evcb.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'evcb.title' }],
});

const IS_EVC = user.role === 'evc';
const CAN_EXPERTS = ['ro', 'rd', 'bureau', 'admin'].includes(user.role);
const SHOW_REGION = !['ro', 'rd', 'evc'].includes(user.role);
const PAGE_SIZE = 25;
if (IS_EVC) setPageHead({ title: 'evcb.title_evc', subtitle: 'evcb.subtitle_evc', breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'evcb.title_evc' }] });

const KEYS = ['queued', 'scheduled', 'completed', 'experts'].filter((k) => (k !== 'queued' || !IS_EVC) && (k !== 'experts' || CAN_EXPERTS));
const paramStatus = (getParam('status') || '').toLowerCase();
const f = {
  status: KEYS.includes(paramStatus) ? paramStatus : (IS_EVC ? 'scheduled' : 'queued'),
  region: getParam('region') || '',
  alert: getParam('alert') || '',
  page: 1,
};
let counts = {};
let ctl = null;
const board = $('#board');
const formEl = $('#filters');
const today = () => meta.today;

function buildFilters() {
  const nodes = [];
  if (SHOW_REGION) {
    nodes.push(field({
      label: t('evcb.region'), id: 'f-region',
      control: select([{ value: '', label: t('common.all'), selected: !f.region }, ...meta.regions.map((r) => ({ value: r.code, label: `${regionName(r)} (${r.code})`, selected: f.region === r.code }))], { name: 'region' }),
    }));
  }
  if (f.status !== 'experts') {
    nodes.push(field({
      label: t('evcb.alert'), id: 'f-alert',
      control: select([
        { value: '', label: t('evcb.alert_all'), selected: !f.alert },
        { value: 'due', label: t('evcb.alert_due'), selected: f.alert === 'due' },
        { value: 'overdue', label: t('evcb.alert_overdue'), selected: f.alert === 'overdue' },
      ], { name: 'alert' }),
    }));
  }
  mount(formEl, nodes);
  $('#filters-card').hidden = !nodes.length;
}

formEl.addEventListener('submit', (e) => e.preventDefault());
formEl.addEventListener('change', () => {
  const region = formEl.elements.region;
  const alert = formEl.elements.alert;
  const regionChanged = region && region.value !== f.region;
  if (region) f.region = region.value;
  if (alert) f.alert = alert.value;
  f.page = 1;
  syncUrl();
  if (regionChanged) boot(); else showTab(f.status);
});

function syncUrl() { setParams({ status: f.status, region: f.region || null, alert: f.alert || null }); }

/* ------------------------------------------------------------------ list helpers */
const appCell = (v) => `<a class="cell-main" href="${site(`staff/application.html?id=${v.application.id}`)}">${esc(v.application.ref_no)}</a><div class="cell-sub">${esc(v.application.institution.name)}</div>`;
const regionCell = (v) => esc(regionName(v.application.region));
const flagBadges = (v) => [
  ...(v.flags || []).map((x) => `<span class="badge ${FLAGS[x] ? FLAGS[x][2] : 'b-slate'}">${esc(t(`evcb.flag.${x}`, { _default: x }))}</span>`),
  v.schedule_esc_level ? escBadge(v.schedule_esc_level) : '',
].join(' ') || '<span class="muted">—</span>';
const dateWithChip = (d, chip = true) => (d ? `<div>${esc(fmtDate(d))}</div>${chip ? `<div>${daysChip(daysBetween(today(), d))}</div>` : ''}` : '—');
const visitCell = (d) => (d ? `<div>${esc(fmtDate(d))}</div><div class="cell-sub">${esc(relDays(daysBetween(today(), d), { past: 'ago' }))}</div>` : '—');
const openBtn = (v) => `<a class="btn sm secondary" href="${site(`staff/application.html?id=${v.application.id}`)}">${esc(t('common.open'))}</a>`;
const rowClass = (v) => ((v.flags || []).some((x) => x.endsWith('OVERDUE')) ? 'row-danger' : (v.flags || []).includes('SCHEDULE_DUE') ? 'row-warning' : '');
const goApp = (v) => { location.href = site(`staff/application.html?id=${v.application.id}`); };
const recBadge = (r) => (r ? `<span class="badge ${{ RECOMMEND: 'b-success', RECOMMEND_WITH_CONDITIONS: 'b-warning', NOT_RECOMMEND: 'b-danger' }[r] || 'b-slate'}">${esc(tl(meta.evc_recommendations[r]) || r)}</span>` : '—');
const panelNames = (v) => `<div class="evc-names">${(v.panel || []).map((u) => esc(u.name)).join(', ') || '—'}</div>`;
const convenerCell = (v) => (v.convener ? `<div class="cell-main">${esc(v.convener.name)}</div>${v.convener.id === user.id ? `<div class="cell-sub">${esc(t('evcb.you_convener'))}</div>` : ''}` : '—');

const COLS = {
  queued: () => [
    { key: 'app', label: t('evcb.col_app'), render: appCell },
    { key: 'region', label: t('evcb.col_region'), render: regionCell },
    { key: 'sched', label: t('evcb.col_sched_by'), render: (v) => dateWithChip(v.schedule_by) },
    { key: 'comp', label: t('evcb.col_complete_by'), render: (v) => dateWithChip(v.complete_by) },
    { key: 'alerts', label: t('evcb.col_alerts'), render: flagBadges },
    { key: 'go', label: '', render: openBtn },
  ],
  scheduled: () => [
    { key: 'app', label: t('evcb.col_app'), render: appCell },
    { key: 'region', label: t('evcb.col_region'), render: regionCell },
    { key: 'visit', label: t('evcb.col_visit'), render: (v) => visitCell(v.visit_date) },
    { key: 'comp', label: t('evcb.col_complete_by'), render: (v) => dateWithChip(v.complete_by) },
    { key: 'conv', label: t('evcb.col_convener'), render: convenerCell },
    { key: 'panel', label: t('evcb.col_panel'), render: panelNames },
    { key: 'alerts', label: t('evcb.col_alerts'), render: flagBadges },
    { key: 'go', label: '', render: openBtn },
  ],
  completed: () => [
    { key: 'app', label: t('evcb.col_app'), render: appCell },
    { key: 'region', label: t('evcb.col_region'), render: regionCell },
    { key: 'visit', label: t('evcb.col_visit'), render: (v) => (v.visit_date ? esc(fmtDate(v.visit_date)) : '—') },
    { key: 'filed', label: t('evcb.col_filed'), render: (v) => (v.report_at ? esc(fmtDate(v.report_at)) : '—') },
    { key: 'rec', label: t('evcb.col_rec'), render: (v) => recBadge(v.recommendation) },
    { key: 'conv', label: t('evcb.col_convener'), render: convenerCell },
    { key: 'go', label: '', render: openBtn },
  ],
};
const SORT = {
  queued: (a, b) => (a.schedule_by || '').localeCompare(b.schedule_by || ''),
  scheduled: (a, b) => (a.visit_date || '9999').localeCompare(b.visit_date || '9999'),
  completed: (a, b) => (b.report_at || '').localeCompare(a.report_at || ''),
};

async function renderList(panel, kind) {
  loading(panel);
  try {
    const res = await api.get('/evc', { status: kind.toUpperCase(), region: SHOW_REGION ? f.region || undefined : undefined, alert: f.alert || undefined });
    counts = res.counts || counts;
    const rows = [...res.items].sort(SORT[kind]);
    const slice = rows.slice((f.page - 1) * PAGE_SIZE, f.page * PAGE_SIZE);
    const host = el('div'); const pager = el('div');
    mount(panel,
      kind === 'queued' ? el('p', { class: 'evc-note' }, t('evcb.note_queued')) : null,
      host, pager);
    renderTable(host, {
      columns: COLS[kind](), rows: slice, rowClass, onRowClick: goApp,
      empty: { icon: 'calendar', title: t(`evcb.empty_${kind}`), text: t('evcb.empty_text') },
    });
    if (rows.length > PAGE_SIZE) {
      pagination(pager, { page: f.page, pageSize: PAGE_SIZE, total: rows.length, onChange: (p) => { f.page = p; renderList(panel, kind); } });
    }
  } catch (err) {
    errorState(panel, err, () => renderList(panel, kind));
  }
}

async function renderExperts(panel) {
  loading(panel);
  try {
    const res = await api.get('/evc/experts');
    const rows = res.items.filter((e) => e.active);
    const host = el('div');
    mount(panel, el('p', { class: 'evc-note' }, t('evcb.note_experts')), host);
    renderTable(host, {
      columns: [
        { key: 'name', label: t('evcb.col_expert'), render: (e) => `<div class="cell-main">${esc(e.user.name)}</div><div class="cell-sub">${esc(e.user.designation)}</div>` },
        { key: 'disc', label: t('evcb.col_disc'), render: (e) => esc(discLabel(e.discipline)) },
        { key: 'state', label: t('evcb.col_state'), render: (e) => esc(stateName(e.home_state)) },
        { key: 'senior', label: t('evcb.col_senior'), render: (e) => (e.senior ? `<span class="badge b-saffron">${esc(t('evcb.senior'))}</span>` : '<span class="muted">—</span>') },
        { key: 'visits', label: t('evcb.col_visits'), align: 'right', render: (e) => esc(String(e.visits_60d)) },
        { key: 'next', label: t('evcb.col_next'), render: (e) => (e.next_visit ? `<div>${esc(fmtDate(e.next_visit))}</div><div class="cell-sub">${esc(relDays(daysBetween(today(), e.next_visit), { past: 'ago' }))}</div>` : '—') },
        {
          key: 'un', label: t('evcb.col_unavail'),
          render: (e) => (e.unavailable && e.unavailable.length ? `<div class="evc-ranges">${e.unavailable.map(([a, b]) => `<span class="badge b-warning">${esc(fmtDate(a))} – ${esc(fmtDate(b))}</span>`).join('')}</div>` : '<span class="muted">—</span>'),
        },
        { key: 'links', label: t('evcb.col_links'), align: 'right', render: (e) => esc(String(e.linked_institutions || 0)) },
      ],
      rows,
    });
  } catch (err) {
    errorState(panel, err, () => renderExperts(panel));
  }
}

function showTab(key) {
  f.status = key;
  buildFilters();
  if (ctl) ctl.select(key);
}

function labelFor(k) {
  if (k === 'scheduled' && IS_EVC) return t('evcb.tab.scheduled_evc');
  return t(`evcb.tab.${k}`);
}

async function boot() {
  loading(board);
  try {
    const first = await api.get('/evc', { region: SHOW_REGION ? f.region || undefined : undefined });
    counts = first.counts || {};
  } catch (err) {
    errorState(board, err, boot);
    return;
  }
  const defs = KEYS.map((k) => ({
    key: k,
    label: labelFor(k),
    count: k === 'experts' ? null : (counts[k.toUpperCase()] ?? 0),
    render: (panel) => { if (k === 'experts') renderExperts(panel); else renderList(panel, k); },
  }));
  buildFilters();
  ctl = tabs(board, defs, {
    active: f.status,
    onChange: (k) => {
      const changed = k !== f.status;
      f.status = k;
      if (changed) { f.page = 1; buildFilters(); }
      syncUrl();
    },
  });
}

onLang(() => { buildFilters(); boot(); });
boot();
