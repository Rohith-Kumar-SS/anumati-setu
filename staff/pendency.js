// Pendency monitor: stage x region heat matrix, ageing buckets, bottlenecks and the oldest open cases.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, errorState, renderTable, kpi, daysChip, flagChips, fmtNum, getParam, setParams,
} from '../assets/js/ui.js';
import { isHQ, regionName, regionOptions, selectEl, field } from './c-common.js';

extend({
  en: {
    'pend.title': 'Pendency',
    'pend.subtitle': 'Where open cases are sitting, by region and stage, and how long they have been held',
    'pend.your_region': 'Your region',
    'pend.k_open': 'Open cases',
    'pend.k_overdue': 'Overdue',
    'pend.k_paused': 'Clock paused (with institution)',
    'pend.k_open_sub': 'across all stages',
    'pend.k_overdue_sub': 'past the stage timeline',
    'pend.k_paused_sub': 'waiting for the institution, not counted against AICTE',
    'pend.matrix': 'Stage by region',
    'pend.matrix_hint': 'Select a cell (click or press Enter) to see how long its cases have been held.',
    'pend.legend.h0': 'No cases',
    'pend.legend.h1': 'On time',
    'pend.legend.h2': 'Ageing or some overdue',
    'pend.legend.h3': 'Many overdue',
    'pend.legend.h4': 'Mostly overdue',
    'pend.total': 'Total',
    'pend.n_overdue': '{n} overdue',
    'pend.n_paused': '{n} paused',
    'pend.cell_aria': '{region}, {stage}: {count} cases, {overdue} overdue, {paused} with clock paused',
    'pend.detail_title': '{region} · {stage}',
    'pend.detail_sub': '{count} open cases · {overdue} overdue · {paused} with clock paused',
    'pend.ageing': 'Days held by AICTE at this stage',
    'pend.bucket.0-7': '0–7 days',
    'pend.bucket.8-15': '8–15 days',
    'pend.bucket.16-30': '16–30 days',
    'pend.bucket.30+': 'More than 30 days',
    'pend.view_cases': 'View these cases',
    'pend.view_overdue': 'Overdue only',
    'pend.detail_empty': 'This cell has no open cases.',
    'pend.bottlenecks': 'Bottlenecks',
    'pend.bn_empty': 'No bottlenecks right now.',
    'pend.bn_stats': '{count} cases · {overdue} overdue · median {median} days held',
    'pend.oldest': 'Oldest open cases',
    'pend.col_held': 'Days at stage',
    'pend.empty': 'No pendency data for this view.',
  },
  hi: {
    'pend.title': 'लंबितता',
    'pend.subtitle': 'खुले मामले किस क्षेत्र और चरण में अटके हैं और कितने दिनों से लंबित हैं',
    'pend.your_region': 'आपका क्षेत्र',
    'pend.k_open': 'खुले मामले',
    'pend.k_overdue': 'अतिदेय',
    'pend.k_paused': 'समय-सीमा रुकी (संस्था के पास)',
    'pend.k_open_sub': 'सभी चरणों में',
    'pend.k_overdue_sub': 'चरण की समय-सीमा से आगे',
    'pend.k_paused_sub': 'संस्था के उत्तर की प्रतीक्षा में, एआईसीटीई के विरुद्ध नहीं गिना जाता',
    'pend.matrix': 'चरण और क्षेत्र के अनुसार',
    'pend.matrix_hint': 'किसी खाने पर क्लिक करें (या Enter दबाएँ) और देखें कि उसके मामले कितने दिनों से लंबित हैं।',
    'pend.legend.h0': 'कोई मामला नहीं',
    'pend.legend.h1': 'समय पर',
    'pend.legend.h2': 'पुराने या कुछ अतिदेय',
    'pend.legend.h3': 'कई अतिदेय',
    'pend.legend.h4': 'अधिकांश अतिदेय',
    'pend.total': 'कुल',
    'pend.n_overdue': '{n} अतिदेय',
    'pend.n_paused': '{n} रुके हुए',
    'pend.cell_aria': '{region}, {stage}: {count} मामले, {overdue} अतिदेय, {paused} की समय-सीमा रुकी',
    'pend.detail_title': '{region} · {stage}',
    'pend.detail_sub': '{count} खुले मामले · {overdue} अतिदेय · {paused} की समय-सीमा रुकी',
    'pend.ageing': 'इस चरण पर एआईसीटीई के पास बिताए दिन',
    'pend.bucket.0-7': '0–7 दिन',
    'pend.bucket.8-15': '8–15 दिन',
    'pend.bucket.16-30': '16–30 दिन',
    'pend.bucket.30+': '30 दिन से अधिक',
    'pend.view_cases': 'ये मामले देखें',
    'pend.view_overdue': 'केवल अतिदेय',
    'pend.detail_empty': 'इस खाने में कोई खुला मामला नहीं है।',
    'pend.bottlenecks': 'अवरोध बिंदु',
    'pend.bn_empty': 'अभी कोई अवरोध नहीं है।',
    'pend.bn_stats': '{count} मामले · {overdue} अतिदेय · औसत {median} दिन लंबित',
    'pend.oldest': 'सबसे पुराने खुले मामले',
    'pend.col_held': 'चरण पर दिन',
    'pend.empty': 'इस दृश्य के लिए लंबितता का डेटा नहीं है।',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'committee', 'authority'],
  active: 'pendency',
  title: 'pend.title',
  subtitle: 'pend.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.pendency' }],
});

const HQ = isHQ(user);
let region = HQ ? (getParam('region') || '') : '';
let selected = getParam('cell') || ''; // "CR:EVC"
let data = null;

const stageLabel = (code) => {
  const s = (data?.stages || []).find((x) => x.code === code);
  return s ? tl(s.label) : code;
};
const regionLabel = (code) => {
  const r = (data?.regions || []).find((x) => x.code === code);
  return regionName(meta, r || code);
};

function heatClass(c) {
  if (!c || !c.count) return 'h0';
  const share = c.overdue / c.count;
  if (share >= 0.5) return 'h4';
  if ((c.overdue && share >= 0.25) || (c.buckets && c.buckets['30+'])) return 'h3';
  if (c.overdue || (c.buckets && c.buckets['16-30'])) return 'h2';
  return 'h1';
}

function appsLink(code, stage, overdueOnly) {
  const q = new URLSearchParams({ region: code, stage, open: '1' });
  if (overdueOnly) q.set('overdue', '1');
  return site(`staff/applications.html?${q}`);
}

function renderFilters() {
  const box = $('#filters');
  if (HQ) {
    const sel = selectEl('f-region', [['', t('cc.all_regions')], ...regionOptions(meta)], region, (v) => {
      region = v; selected = ''; setParams({ region: v || null, cell: null }); load();
    });
    mount(box, el('div', { class: 'filters' }, field('f-region', t('f.region'), sel)));
  } else {
    const name = regionName(meta, user.region);
    mount(box, el('div', { class: 'chips' }, el('span', { class: 'chip' }, `${t('pend.your_region')}: ${name}`)));
  }
}

function renderKpis() {
  const tt = data.totals || {};
  const q = region ? `&region=${encodeURIComponent(region)}` : '';
  mount($('#kpis'),
    kpi({ label: t('pend.k_open'), value: fmtNum(tt.open), sub: esc(t('pend.k_open_sub')), color: '', iconName: 'layers',
      onClick: () => { location.href = site(`staff/applications.html?open=1${q}`); } }),
    kpi({ label: t('pend.k_overdue'), value: fmtNum(tt.overdue), sub: esc(t('pend.k_overdue_sub')), color: tt.overdue ? 'danger' : 'success', iconName: 'alert',
      onClick: () => { location.href = site(`staff/applications.html?overdue=1${q}`); } }),
    kpi({ label: t('pend.k_paused'), value: fmtNum(tt.paused), sub: esc(t('pend.k_paused_sub')), color: 'orange', iconName: 'hourglass' }));
}

function renderMatrix() {
  $('#matrix-title').textContent = t('pend.matrix');
  $('#matrix-hint').textContent = t('pend.matrix_hint');
  mount($('#legend'), ['h0', 'h1', 'h2', 'h3', 'h4'].map((h) => el('span', {}, el('span', { class: `sw ${h}`, 'aria-hidden': 'true' }), t(`pend.legend.${h}`))));
  const stages = data.stages || [];
  const regions = data.regions || [];
  if (!regions.length) { mount($('#matrix'), el('div', { class: 'empty' }, t('pend.empty'))); return; }
  const thead = el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('f.region')),
    stages.map((s) => el('th', { scope: 'col' }, tl(s.label))), el('th', { scope: 'col' }, t('pend.total'))));
  const tbody = el('tbody');
  for (const r of regions) {
    const tr = el('tr', {}, el('th', { scope: 'row' }, regionName(meta, r)));
    let rowTotal = 0;
    for (const s of stages) {
      const c = data.matrix?.[r.code]?.[s.code] || { count: 0, overdue: 0, paused: 0, buckets: {} };
      rowTotal += c.count;
      const key = `${r.code}:${s.code}`;
      const td = el('td', {
        class: `${heatClass(c)}${selected === key ? ' sel' : ''}`, tabindex: '0', role: 'button', 'aria-pressed': selected === key ? 'true' : 'false',
        'aria-label': t('pend.cell_aria', { region: regionName(meta, r), stage: tl(s.label), count: c.count, overdue: c.overdue, paused: c.paused }),
        dataset: { key },
      },
      el('span', { class: 'hc-n' }, c.count ? String(c.count) : '—'),
      c.overdue ? el('span', { class: 'hc-s', style: { color: 'var(--as-danger)', fontWeight: '600' } }, t('pend.n_overdue', { n: c.overdue })) : null,
      c.paused ? el('span', { class: 'hc-s' }, t('pend.n_paused', { n: c.paused })) : null);
      const pick = () => { selected = key; setParams({ cell: key }); renderMatrix(); renderDetail(); };
      td.addEventListener('click', pick);
      td.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      tr.appendChild(td);
    }
    tr.appendChild(el('td', { class: 'tot' }, el('span', { class: 'hc-n' }, String(rowTotal))));
    tbody.appendChild(tr);
  }
  mount($('#matrix'), el('table', { class: 'heat' }, thead, tbody));
}

function renderDetail() {
  const box = $('#detail');
  if (!selected) { mount(box); return; }
  const [code, stage] = selected.split(':');
  const c = data.matrix?.[code]?.[stage];
  if (!c) { mount(box); return; }
  const title = t('pend.detail_title', { region: regionLabel(code), stage: stageLabel(stage) });
  const max = Math.max(1, ...Object.values(c.buckets || {}));
  const rows = (data.buckets || Object.keys(c.buckets || {})).map((b) => {
    const n = c.buckets?.[b] || 0;
    const tone = b === '30+' ? 'danger' : b === '16-30' ? 'warning' : '';
    return el('div', { class: 'bucket-row' },
      el('span', {}, t(`pend.bucket.${b}`, { _default: b })),
      el('div', { class: `meter lg ${tone}`, role: 'img', 'aria-label': `${t(`pend.bucket.${b}`, { _default: b })}: ${n}` }, el('span', { style: { width: `${n ? Math.max(4, (n / max) * 100) : 0}%` } })),
      el('span', { class: 'num' }, String(n)));
  });
  mount(box, el('div', { class: 'card accent-top' },
    el('div', { class: 'card-head' },
      el('div', {}, el('h2', {}, title), el('div', { class: 'sub' }, t('pend.detail_sub', { count: c.count, overdue: c.overdue, paused: c.paused }))),
      c.count ? el('div', { class: 'row' },
        el('a', { class: 'btn sm', href: appsLink(code, stage, false), html: `${icon('arrow-right', 14)} ${esc(t('pend.view_cases'))}` }),
        c.overdue ? el('a', { class: 'btn sm outline-danger', href: appsLink(code, stage, true) }, t('pend.view_overdue')) : null) : null),
    el('div', { class: 'card-body' },
      c.count ? el('div', {}, el('div', { class: 'label mb-0', style: { marginBottom: '4px' } }, t('pend.ageing')), rows)
        : el('div', { class: 'muted' }, t('pend.detail_empty')))));
}

function renderBottlenecks() {
  $('#bn-title').textContent = t('pend.bottlenecks');
  const list = data.bottlenecks || [];
  if (!list.length) { mount($('#bottlenecks'), el('div', { class: 'empty' }, t('pend.bn_empty'))); return; }
  mount($('#bottlenecks'), list.map((b) => el('div', { class: 'bn-item' },
    el('div', { class: 'bn-main' },
      el('div', { class: 'li-title' }, `${tl(b.region_name) || regionLabel(b.region)} · ${tl(b.stage_label)}`),
      el('div', { class: 'text-2 small' }, tl(b.reason)),
      el('div', { class: 'li-sub' }, t('pend.bn_stats', { count: b.count, overdue: b.overdue, median: b.median_age }))),
    el('a', { class: 'btn sm secondary', href: appsLink(b.region, b.stage, false) }, t('pend.view_cases')))));
}

function renderOldest() {
  $('#old-title').textContent = t('pend.oldest');
  renderTable($('#oldest'), {
    columns: [
      { key: 'ref_no', label: t('f.ref_no'), render: (a) => `<a class="cell-main mono" style="white-space:nowrap" href="${esc(site(`staff/application.html?id=${a.id}`))}">${esc(a.ref_no)}</a>` },
      { key: 'institution', label: t('f.institution'), render: (a) => `<div class="cell-main">${esc(a.institution?.name)}</div><div class="cell-sub">${esc(regionName(meta, a.region))}</div>` },
      { key: 'stage', label: t('f.stage'), render: (a) => esc(tl(a.stage_label)) },
      { key: 'holder', label: t('f.holder'), render: (a) => (a.holder ? `<div>${esc(a.holder.name)}</div><div class="cell-sub">${esc(a.holder.designation || '')}</div>` : '—') },
      { key: 'stage_age_days', label: t('pend.col_held'), align: 'right', render: (a) => `<strong>${esc(a.stage_age_days)}</strong>` },
      { key: 'days_left', label: t('f.due'), render: (a) => daysChip(a.days_left, { paused: a.paused }) },
      { key: 'flags', label: '', render: (a) => flagChips((a.flags || []).filter((f) => f !== 'PAUSED')) },
    ],
    rows: data.oldest || [],
    onRowClick: (a) => { location.href = site(`staff/application.html?id=${a.id}`); },
    empty: { text: t('pend.empty') },
    compact: true,
  });
}

function renderAll() {
  if (!data) return;
  renderFilters();
  renderKpis();
  renderMatrix();
  renderDetail();
  renderBottlenecks();
  renderOldest();
}

async function load() {
  loading($('#matrix'));
  try {
    data = await api.get('/pendency', { region: region || undefined });
    renderAll();
  } catch (err) {
    errorState($('#matrix'), err, load);
  }
}

renderFilters();
onLang(renderAll);
load();
