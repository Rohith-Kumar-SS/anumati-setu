// Staff dashboard: role-based KPIs, the officer's queue, escalations, stage / region / ageing charts.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, kpi, renderTable, mount, loading, emptyState, errorState, fmtDate, fmtDateTime, daysBetween, relDays,
  daysChip, stateBadge, flagChips, escBadge,
} from '../assets/js/ui.js';
import { barChart, COLORS } from '../assets/js/charts.js';
import { holderHtml, pick } from './casekit.js';

extend({
  en: {
    'dash.title': 'Dashboard',
    'dash.kpi_h': 'Key numbers',
    'dash.hello': 'Welcome, {name}',
    'dash.queue': 'Needs attention',
    'dash.queue_sub': 'Most urgent first, with the reason it is where it is',
    'dash.queue_sub_evc': 'Applications where you are on the expert panel',
    'dash.view_all': 'All applications',
    'dash.view_all_esc': 'View all',
    'dash.escalations': 'Escalations for me',
    'dash.no_queue': 'Nothing needs your attention',
    'dash.no_queue_text': 'New cases routed to you will appear here.',
    'dash.no_esc': 'No open escalations for you',
    'dash.days_overdue': '{n} days overdue',
    'dash.verify': 'Waiting for verification',
    'dash.verify_ut': 'Undertaking evidence to verify',
    'dash.verify_doc': 'Renewed documents to verify',
    'dash.col_app': 'Application',
    'dash.col_status': 'Status',
    'dash.col_with': 'With',
    'dash.col_due': 'Due',
    'dash.visits': 'My expert visits',
    'dash.visits_sub': 'Visits on your panel and when each report is due',
    'dash.convener': 'You are convener',
    'dash.member': 'Panel member',
    'dash.visit_on': 'Visit',
    'dash.report_by': 'Report by',
    'dash.chart_stage': 'Open applications by stage',
    'dash.chart_region': 'Open applications by region',
    'dash.chart_ageing': 'Age of open applications (days)',
    'dash.open': 'Open',
    'dash.overdue': 'Overdue',
    'dash.cases': 'Cases',
    'dash.job': 'Daily job last ran on {at}: {reminders} reminders sent, {escalations} escalations raised, {notices} notices issued.',
    'dash.job_none': 'The daily reminder job has not run yet.',
    'dash.job_h': 'Automation',
    'dash.chart_alt': 'Bar chart: {title}. {values}',
    'dash.sub.ro': 'Regional Officer, {region} region',
    'dash.sub.rd': 'Regional Director, {region} region',
    'dash.sub.all': '{role}, all regions',
    'dash.sub.evc': 'EVC expert',
  },
  hi: {
    'dash.title': 'डैशबोर्ड',
    'dash.kpi_h': 'प्रमुख आँकड़े',
    'dash.hello': 'स्वागत है, {name}',
    'dash.queue': 'ध्यान देने योग्य',
    'dash.queue_sub': 'सबसे आवश्यक पहले, साथ में कारण कि मामला यहाँ क्यों है',
    'dash.queue_sub_evc': 'वे आवेदन जिनमें आप विशेषज्ञ पैनल में हैं',
    'dash.view_all': 'सभी आवेदन',
    'dash.view_all_esc': 'सभी देखें',
    'dash.escalations': 'मेरे लिए वृद्धि',
    'dash.no_queue': 'आपके ध्यान के लिए कुछ नहीं',
    'dash.no_queue_text': 'आपको भेजे गए नए मामले यहाँ दिखाई देंगे।',
    'dash.no_esc': 'आपके लिए कोई खुली वृद्धि नहीं',
    'dash.days_overdue': '{n} दिन अतिदेय',
    'dash.verify': 'सत्यापन की प्रतीक्षा में',
    'dash.verify_ut': 'सत्यापन हेतु वचनबद्धता साक्ष्य',
    'dash.verify_doc': 'सत्यापन हेतु नवीनीकृत दस्तावेज़',
    'dash.col_app': 'आवेदन',
    'dash.col_status': 'स्थिति',
    'dash.col_with': 'किसके पास',
    'dash.col_due': 'नियत',
    'dash.visits': 'मेरे विशेषज्ञ दौरे',
    'dash.visits_sub': 'आपके पैनल के दौरे और प्रत्येक रिपोर्ट की नियत तिथि',
    'dash.convener': 'आप संयोजक हैं',
    'dash.member': 'पैनल सदस्य',
    'dash.visit_on': 'दौरा',
    'dash.report_by': 'रिपोर्ट तक',
    'dash.chart_stage': 'चरण के अनुसार खुले आवेदन',
    'dash.chart_region': 'क्षेत्र के अनुसार खुले आवेदन',
    'dash.chart_ageing': 'खुले आवेदनों की आयु (दिन)',
    'dash.open': 'खुले',
    'dash.overdue': 'अतिदेय',
    'dash.cases': 'मामले',
    'dash.job': 'दैनिक कार्य अंतिम बार {at} को चला: {reminders} अनुस्मारक भेजे, {escalations} वृद्धियाँ दर्ज, {notices} सूचनाएँ जारी।',
    'dash.job_none': 'दैनिक अनुस्मारक कार्य अभी तक नहीं चला है।',
    'dash.job_h': 'स्वचालन',
    'dash.chart_alt': 'स्तंभ आरेख: {title}। {values}',
    'dash.sub.ro': 'क्षेत्रीय अधिकारी, {region} क्षेत्र',
    'dash.sub.rd': 'क्षेत्रीय निदेशक, {region} क्षेत्र',
    'dash.sub.all': '{role}, सभी क्षेत्र',
    'dash.sub.evc': 'ईवीसी विशेषज्ञ',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'dashboard',
  title: 'dash.title',
});

const TONE = { primary: '', danger: 'danger', warning: 'warning', info: 'info', success: 'success', '': 'slate' };
const IS_EVC = user.role === 'evc';
const HQ = ['bureau', 'authority', 'committee', 'admin'].includes(user.role);
const href = (p) => site(`staff/${p}`);
let data = null;
let charts = [];

function subtitle() {
  const region = user.region;
  const out = {};
  for (const lang of ['en', 'hi']) {
    const role = (user.role_label && user.role_label[lang]) || user.role;
    const r = region ? (lang === 'hi' ? region.name_hi : region.name) : '';
    let line;
    if (user.role === 'ro' || user.role === 'rd') line = lang === 'hi' ? `${role}, ${r} क्षेत्र` : `${role}, ${r} region`;
    else if (user.role === 'evc') line = role;
    else line = lang === 'hi' ? `${role}, सभी क्षेत्र` : `${role}, all regions`;
    out[lang] = `${lang === 'hi' ? 'स्वागत है' : 'Welcome'}, ${user.name} · ${line}`;
  }
  return out;
}
setPageHead({ subtitle: subtitle() });

const go = (path) => { location.href = site(path); };

function renderKpis() {
  const box = $('#kpis');
  mount(box, data.kpis.map((k) => {
    const node = kpi({
      label: tl(k.label), value: k.value, color: TONE[k.tone] ?? '', onClick: () => go(k.link),
      title: tl(k.label),
    });
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(k.link); } });
    return node;
  }));
}

function renderVisits() {
  const slot = $('#visits-slot');
  const visits = (data.extra && data.extra.visits) || [];
  if (!IS_EVC) { mount(slot); return; }
  const card = el('section', { class: 'card', 'aria-labelledby': 'visits-h' },
    el('div', { class: 'card-head' }, el('div', {}, el('h2', { id: 'visits-h', class: 'mb-0' }, t('dash.visits')), el('div', { class: 'sub' }, t('dash.visits_sub')))),
    el('div', { id: 'visits' }));
  mount(slot, card);
  const box = $('#visits', card);
  renderTable(box, {
    columns: [
      { key: 'ref', label: t('dash.col_app'), render: (v) => `<a class="cell-main" href="${href(`application.html?id=${v.application.id}`)}">${esc(v.application.ref_no)}</a><div class="cell-sub">${esc(v.application.institution.name)}</div>` },
      { key: 'visit', label: t('dash.visit_on'), render: (v) => {
        const n = daysBetween(data.today, v.visit_date);
        return `<div>${esc(fmtDate(v.visit_date))}</div><div class="cell-sub">${esc(relDays(n, { past: 'ago' }))}</div>`;
      } },
      { key: 'role', label: t('f.officer'), render: (v) => `<span class="badge ${v.convener ? 'b-saffron' : 'b-slate'}">${esc(v.convener ? t('dash.convener') : t('dash.member'))}</span>` },
      { key: 'due', label: t('dash.report_by'), render: (v) => `<div>${esc(fmtDate(v.complete_by))}</div><div>${daysChip(daysBetween(data.today, v.complete_by))}</div>` },
      { key: 'go', label: '', render: (v) => `<a class="btn sm secondary" href="${href(`application.html?id=${v.application.id}`)}">${esc(t('common.open'))}</a>` },
    ],
    rows: visits,
    empty: { title: t('dash.no_queue'), text: t('dash.no_queue_text'), icon: 'calendar' },
    onRowClick: (v) => go(`staff/application.html?id=${v.application.id}`),
  });
}

function renderQueue() {
  $('#queue-sub').textContent = IS_EVC ? t('dash.queue_sub_evc') : t('dash.queue_sub');
  const box = $('#queue');
  renderTable(box, {
    columns: [
      {
        key: 'ref', label: t('dash.col_app'), render: (a) => `<a class="cell-main" href="${href(`application.html?id=${a.id}`)}">${esc(a.ref_no)}</a>`
          + `<div class="cell-sub">${esc(a.institution.name)} · ${esc(a.region.code)}</div>`
          + `<div class="dash-why" title="${esc(tl(a.why))}">${esc(tl(a.why))}</div>`,
      },
      { key: 'state', label: t('dash.col_status'), render: (a) => `<div>${stateBadge(a.state)}</div><div class="mt-0">${flagChips(a.flags)}</div>` },
      { key: 'holder', label: t('dash.col_with'), render: (a) => holderHtml(a) },
      { key: 'due', label: t('dash.col_due'), render: (a) => `${daysChip(a.days_left, { paused: a.paused })}<div class="cell-sub">${esc(fmtDate(a.due_date))}</div>` },
    ],
    rows: data.queue || [],
    rowClass: (a) => (a.overdue ? 'row-danger' : a.approaching ? 'row-warning' : ''),
    empty: { title: t('dash.no_queue'), text: t('dash.no_queue_text'), icon: 'inbox' },
    onRowClick: (a) => go(`staff/application.html?id=${a.id}`),
  });
}

function overdueDays(e) {
  const n = e.due_date ? daysBetween(e.due_date, data.today) : e.days_overdue;
  return n && n > 0 ? n : 0;
}

function renderEsc() {
  const box = $('#esc');
  const list = data.escalations || [];
  if (!list.length) { emptyState(box, { icon: 'shield-check', title: t('dash.no_esc') }); return; }
  mount(box, el('div', { class: 'list-divided' }, list.map((e) => el('div', { class: 'list-item' },
    el('div', { class: 'li-main' },
      el('div', { class: 'li-title', html: `${escBadge(e.level, e.status)} ${esc(tl(e.kind_label))}` }),
      el('div', { class: 'dash-esc-title' }, pick(e.title, e.title_hi)),
      el('div', { class: 'li-sub' }, overdueDays(e) ? t('dash.days_overdue', { n: overdueDays(e) }) : fmtDate(e.due_date))),
    el('a', { class: 'btn sm secondary', href: site(e.link), 'aria-label': `${t('common.open')}: ${pick(e.title, e.title_hi)}` }, t('common.open'))))));
}

function renderVerify() {
  const card = $('#verify-card');
  const vp = data.extra && data.extra.verify_pending;
  if (!vp) { card.hidden = true; return; }
  card.hidden = false;
  mount($('#verify'),
    el('a', { class: 'list-item', href: href('undertakings.html?status=SUBMITTED') },
      el('div', { class: 'li-icon', html: icon('file-text', 18) }),
      el('div', { class: 'li-main' }, el('div', { class: 'li-title' }, t('dash.verify_ut'))),
      el('span', { class: 'badge b-info' }, vp.undertakings)),
    el('a', { class: 'list-item', href: href('documents.html?verification=PENDING') },
      el('div', { class: 'li-icon', html: icon('file', 18) }),
      el('div', { class: 'li-main' }, el('div', { class: 'li-title' }, t('dash.verify_doc'))),
      el('span', { class: 'badge b-info' }, vp.documents)));
}

function chartCard(title, key, values, size = '') {
  const alt = t('dash.chart_alt', { title, values });
  return el('div', { class: 'card' },
    el('div', { class: 'card-head' }, el('h2', { class: 'mb-0' }, title)),
    el('div', { class: 'card-body' }, el('div', { class: `chart-box ${size}` }, el('canvas', { id: `chart-${key}`, role: 'img', 'aria-label': alt }))));
}

function renderCharts() {
  charts.forEach((c) => c.destroy());
  charts = [];
  const box = $('#charts');
  const ch = data.charts;
  if (!ch || IS_EVC) { mount(box); return; }
  const cards = [];
  const stageLabels = ch.by_stage.labels.map(tl);
  const stageKeys = Object.keys(meta?.stages || {});
  const sumOf = (labels, arrs) => labels.map((l, i) => `${l}: ${arrs.map((a) => a[i]).join('/')}`).join('; ');
  cards.push(chartCard(t('dash.chart_stage'), 'stage', sumOf(stageLabels, [ch.by_stage.open, ch.by_stage.overdue])));
  if (HQ) {
    const regLabels = ch.by_region.labels.map(tl);
    cards.push(chartCard(t('dash.chart_region'), 'region', sumOf(regLabels, [ch.by_region.open, ch.by_region.overdue])));
  }
  cards.push(chartCard(t('dash.chart_ageing'), 'ageing', sumOf(ch.ageing.labels, [ch.ageing.values])));
  box.className = `grid ${cards.length === 3 ? 'g-3' : 'g-2'}`;
  mount(box, cards);
  const stageCode = (i) => stageKeys.find((k) => meta.stages[k].en === ch.by_stage.labels[i].en);
  charts.push(barChart($('#chart-stage'), {
    labels: stageLabels,
    datasets: [{ label: t('dash.open'), data: ch.by_stage.open, color: COLORS.primary }, { label: t('dash.overdue'), data: ch.by_stage.overdue, color: COLORS.red }],
    onClick: (i) => { const s = stageCode(i); if (s) go(`staff/applications.html?stage=${s}&open=1`); },
  }));
  if (HQ) {
    charts.push(barChart($('#chart-region'), {
      labels: ch.by_region.labels.map(tl),
      datasets: [{ label: t('dash.open'), data: ch.by_region.open, color: COLORS.primary }, { label: t('dash.overdue'), data: ch.by_region.overdue, color: COLORS.red }],
      horizontal: true,
      onClick: (i) => { const c = ch.by_region.codes[i]; if (c) go(`staff/applications.html?region=${c}&open=1`); },
    }));
  }
  charts.push(barChart($('#chart-ageing'), {
    labels: ch.ageing.labels,
    datasets: [{ label: t('dash.cases'), data: ch.ageing.values, color: COLORS.saffron }],
  }));
}

function renderJob() {
  const j = data.last_daily_job;
  const box = $('#job');
  if (!j) { mount(box, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('dash.job_none')))); return; }
  const r = j.result || {};
  mount(box, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('refresh', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('dash.job_h')),
      t('dash.job', { at: fmtDateTime(j.at), reminders: r.reminders ?? 0, escalations: r.escalations ?? 0, notices: r.notices ?? 0 }))));
}

function render() {
  if (!data) return;
  renderKpis();
  renderVisits();
  renderQueue();
  renderEsc();
  renderVerify();
  renderCharts();
  renderJob();
  setPageHead({ subtitle: subtitle() });
}

async function load() {
  loading($('#queue'));
  try {
    data = await api.get('/dashboard');
    render();
  } catch (err) {
    errorState($('#queue'), err, load);
  }
}

onLang(render);
load();
