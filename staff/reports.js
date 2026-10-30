// Reports: six server reports (pendency, EVC, undertakings, documents, overdue, regions) + the simulated outbox.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, pagination, tabs, toast, fmtDate, fmtDateTime, toCSV, downloadBlob,
  getParam, setParams, debounce, icon,
} from '../assets/js/ui.js';
import {
  regionName, docTypeByEnglish, stageByEnglish, docStatusLabel, templateLabel, field, selectEl, inputEl,
} from './c-common.js';

extend({
  en: {
    'rep.title': 'Reports',
    'rep.subtitle': 'Printable summaries of pendency, EVC, undertakings, documents, overdue items and regional performance',
    'rep.tab.pendency': 'Pendency',
    'rep.tab.evc': 'EVC',
    'rep.tab.undertakings': 'Undertakings',
    'rep.tab.documents': 'Documents',
    'rep.tab.overdue': 'Overdue cases',
    'rep.tab.regions': 'Regions',
    'rep.tab.outbox': 'Outbox (email / SMS)',
    'rep.as_on': 'As on {date}',
    'rep.rows': '{n} rows',
    'rep.sum.open': 'Open cases',
    'rep.sum.overdue': 'Overdue',
    'rep.sum.paused': 'Clock paused',
    'rep.sum.total': 'Total',
    'rep.sum.fulfilled': 'Fulfilled',
    'rep.sum.regions': 'Regions',
    'rep.evcst.COMPLETED': 'Completed',
    'rep.evcst.SCHEDULED': 'Scheduled',
    'rep.evcst.QUEUED': 'Awaiting schedule',
    'rep.flag.SCHEDULE_DUE': 'Schedule due soon',
    'rep.flag.SCHEDULE_OVERDUE': 'Schedule overdue',
    'rep.flag.COMPLETE_OVERDUE': 'Completion overdue',
    'rep.empty': 'This report has no rows',
    'rep.exported': 'CSV downloaded',
    'rep.ob_note_title': 'Simulated: nothing leaves the prototype',
    'rep.ob_note': 'This log shows the e-mails and SMS messages the portal would have sent. No message is actually delivered.',
    'rep.ob_q': 'Search',
    'rep.ob_q_ph': 'Subject or recipient',
    'rep.ob_channel': 'Channel',
    'rep.ob_all_channels': 'E-mail and SMS',
    'rep.ob_email': 'E-mail',
    'rep.ob_sms': 'SMS',
    'rep.ob_template': 'Template',
    'rep.ob_all_templates': 'All templates',
    'rep.ob_when': 'Sent (simulated)',
    'rep.ob_to': 'Recipient',
    'rep.ob_subject': 'Subject',
    'rep.ob_message': 'Message',
    'rep.ob_empty': 'No messages match these filters',
  },
  hi: {
    'rep.title': 'रिपोर्ट',
    'rep.subtitle': 'लंबितता, ईवीसी, वचनबद्धता, दस्तावेज़, अतिदेय मामलों और क्षेत्रीय प्रदर्शन के प्रिंट योग्य सार',
    'rep.tab.pendency': 'लंबितता',
    'rep.tab.evc': 'ईवीसी',
    'rep.tab.undertakings': 'वचनबद्धताएँ',
    'rep.tab.documents': 'दस्तावेज़',
    'rep.tab.overdue': 'अतिदेय मामले',
    'rep.tab.regions': 'क्षेत्र',
    'rep.tab.outbox': 'आउटबॉक्स (ईमेल / एसएमएस)',
    'rep.as_on': '{date} की स्थिति',
    'rep.rows': '{n} पंक्तियाँ',
    'rep.sum.open': 'खुले मामले',
    'rep.sum.overdue': 'अतिदेय',
    'rep.sum.paused': 'समय-सीमा रुकी',
    'rep.sum.total': 'कुल',
    'rep.sum.fulfilled': 'पूर्ण',
    'rep.sum.regions': 'क्षेत्र',
    'rep.evcst.COMPLETED': 'पूर्ण',
    'rep.evcst.SCHEDULED': 'निर्धारित',
    'rep.evcst.QUEUED': 'निर्धारण प्रतीक्षित',
    'rep.flag.SCHEDULE_DUE': 'निर्धारण शीघ्र देय',
    'rep.flag.SCHEDULE_OVERDUE': 'निर्धारण अतिदेय',
    'rep.flag.COMPLETE_OVERDUE': 'पूर्णता अतिदेय',
    'rep.empty': 'इस रिपोर्ट में कोई पंक्ति नहीं है',
    'rep.exported': 'CSV डाउनलोड हो गई',
    'rep.ob_note_title': 'अनुकरित: प्रोटोटाइप से कुछ भी बाहर नहीं जाता',
    'rep.ob_note': 'यह लॉग वे ईमेल और एसएमएस दिखाता है जो पोर्टल भेजता। कोई संदेश वास्तव में नहीं भेजा जाता।',
    'rep.ob_q': 'खोजें',
    'rep.ob_q_ph': 'विषय या प्राप्तकर्ता',
    'rep.ob_channel': 'माध्यम',
    'rep.ob_all_channels': 'ईमेल और एसएमएस',
    'rep.ob_email': 'ईमेल',
    'rep.ob_sms': 'एसएमएस',
    'rep.ob_template': 'टेम्पलेट',
    'rep.ob_all_templates': 'सभी टेम्पलेट',
    'rep.ob_when': 'भेजा गया (अनुकरित)',
    'rep.ob_to': 'प्राप्तकर्ता',
    'rep.ob_subject': 'विषय',
    'rep.ob_message': 'संदेश',
    'rep.ob_empty': 'इन फ़िल्टरों से कोई संदेश नहीं मिला',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'reports',
  title: 'rep.title',
  subtitle: 'rep.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.reports' }],
});

const KINDS = ['pendency', 'evc', 'undertakings', 'documents', 'overdue', 'regions'];
const TABS = [...KINDS, 'outbox'];
let activeTab = TABS.includes(getParam('tab')) ? getParam('tab') : 'pendency';
let tabCtl = null;
const store = {}; // kind -> last loaded report (kept for language switches and CSV)

/* ---------------------------------------------------------------- cell localisation */
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function statusText(kind, v) {
  if (kind === 'evc') return t(`rep.evcst.${v}`, { _default: v });
  if (kind === 'undertakings') return t(`ut.${v}`, { _default: v });
  if (kind === 'documents') return docStatusLabel(v);
  return t(`esc.${v}`, { _default: v });
}

/** Plain text of one report cell in the current language (used for the table and the CSV). */
function cellText(kind, key, v) {
  if (v === null || v === undefined || v === '') return '';
  if (isDate(v)) return fmtDate(v);
  switch (key) {
    case 'region': return regionName(meta, v);
    case 'stage': return stageByEnglish(meta, v);
    case 'doc_type': return docTypeByEnglish(meta, v);
    case 'category': return tl(meta?.ut_categories?.[v]) || v;
    case 'kind': return tl(meta?.esc_kinds?.[v]) || v;
    case 'addressee': return t(`role.${v}`, { _default: v });
    case 'validity': return t(`validity.${v}`, { _default: v });
    case 'verification': return t(`verify.${v}`, { _default: v });
    case 'status': return statusText(kind, v);
    case 'level': return v ? `L${v}` : '';
    case 'flags': return String(v).split(/[\s,]+/).filter(Boolean).map((x) => t(`rep.flag.${x}`, { _default: x })).join(', ');
    default: return key.endsWith('_pct') && typeof v === 'number' ? `${v}%` : String(v);
  }
}

function summaryLabel(kind, key) {
  if (kind === 'evc') return t(`rep.evcst.${key}`, { _default: key });
  if (kind === 'documents') return t(`validity.${key}`, { _default: key });
  if (kind === 'overdue') return tl(meta?.esc_kinds?.[key]) || key;
  return t(`rep.sum.${key}`, { _default: key });
}

/* ---------------------------------------------------------------- report tabs */
function exportCsv(kind, report) {
  const cols = report.columns.map((c) => ({ key: c.key, label: tl(c.label), csv: (r) => cellText(kind, c.key, r[c.key]) }));
  const blob = new Blob([`﻿${toCSV(cols, report.rows)}`], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `anumati-setu-${kind}-${meta?.today || 'report'}.csv`);
  toast(t('rep.exported'), 'success', 2200);
}

function drawReport(panel, kind, report) {
  const chips = Object.entries(report.summary || {}).map(([k, v]) =>
    el('span', { class: 'chip' }, el('b', {}, String(v)), ` ${summaryLabel(kind, k)}`));
  const numeric = {};
  for (const c of report.columns) numeric[c.key] = typeof report.rows[0]?.[c.key] === 'number';
  const body = el('div', { class: 'rep-body' },
    el('div', { class: 'rep-head' },
      el('div', {}, el('h2', {}, tl(report.title)), el('div', { class: 'muted small' }, `${t('rep.as_on', { date: fmtDate(meta?.today) })} · ${t('rep.rows', { n: report.rows.length })}`)),
      el('div', { class: 'row no-print' },
        el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('download', 15)} ${esc(t('common.export_csv'))}`, onclick: () => exportCsv(kind, report) }),
        el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('print', 15)} ${esc(t('common.print'))}`, onclick: () => window.print() }))),
    chips.length ? el('div', { class: 'rep-chips' }, chips) : null);
  const tableBox = el('div');
  body.appendChild(tableBox);
  mount(panel, body);
  renderTable(tableBox, {
    columns: report.columns.map((c) => ({
      key: c.key, label: tl(c.label), align: numeric[c.key] ? 'right' : undefined,
      render: (r) => esc(cellText(kind, c.key, r[c.key])),
    })),
    rows: report.rows,
    empty: { title: t('rep.empty') },
    compact: true,
  });
}

let langRedraw = false; // true while the tabs are rebuilt for a language switch (reuse loaded data)

async function renderReport(panel, kind) {
  if (langRedraw && store[kind]) { drawReport(panel, kind, store[kind]); return; }
  loading(panel);
  try {
    store[kind] = await api.get(`/reports/${kind}`);
    drawReport(panel, kind, store[kind]);
  } catch (err) {
    errorState(panel, err, () => renderReport(panel, kind));
  }
}

/* ---------------------------------------------------------------- outbox */
const ob = { q: '', channel: '', template: '', page: 1, templates: [], last: null };
const obReload = debounce(() => { ob.page = 1; loadOutbox(); }, 300);
let obPanel = null;

function drawOutbox() {
  if (!obPanel) return;
  const panel = obPanel;
  const filters = el('div', { class: 'filters no-print' },
    field('ob-q', t('rep.ob_q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('ob-q', { type: 'search', value: ob.q, placeholder: t('rep.ob_q_ph'), onInput: (v) => { ob.q = v; obReload(); } }))),
    field('ob-channel', t('rep.ob_channel'), selectEl('ob-channel', [['', t('rep.ob_all_channels')], ['email', t('rep.ob_email')], ['sms', t('rep.ob_sms')]], ob.channel,
      (v) => { ob.channel = v; ob.page = 1; loadOutbox(); })),
    field('ob-template', t('rep.ob_template'), selectEl('ob-template', [['', t('rep.ob_all_templates')], ...ob.templates.map((x) => [x, templateLabel(x)])], ob.template,
      (v) => { ob.template = v; ob.page = 1; loadOutbox(); })));
  const listBox = el('div');
  const pager = el('div');
  mount(panel, el('div', { class: 'rep-body' },
    el('div', { class: 'alert saffron', style: { marginBottom: '14px' } }, el('span', { class: 'icon', html: icon('info', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('rep.ob_note_title')), t('rep.ob_note'))),
    el('div', { class: 'rep-head' }, el('div', {}, el('h2', {}, t('rep.tab.outbox'))),
      el('div', { class: 'row no-print' },
        el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('download', 15)} ${esc(t('common.export_csv'))}`, onclick: exportOutboxCsv }),
        el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('print', 15)} ${esc(t('common.print'))}`, onclick: () => window.print() }))),
    filters, el('div', { class: 'mt-2' }, listBox, pager)));
  if (!ob.last) { loading(listBox); return; }
  const hi = getLang() === 'hi';
  renderTable(listBox, {
    columns: [
      { key: 'created_at', label: t('rep.ob_when'), render: (m) => `<span style="white-space:nowrap">${esc(fmtDateTime(m.created_at))}</span>` },
      { key: 'channel', label: t('rep.ob_channel'), render: (m) => `<span class="badge ${m.channel === 'sms' ? 'b-violet' : 'b-info'}">${esc(t(`rep.ob_${m.channel}`, { _default: m.channel }))}</span>` },
      { key: 'template', label: t('rep.ob_template'), render: (m) => esc(templateLabel(m.template)) },
      { key: 'recipient', label: t('rep.ob_to'), render: (m) => `<div class="mono small">${esc(m.recipient)}</div><div class="cell-sub">${esc(t(`role.${m.recipient_role}`, { _default: m.recipient_role || '' }))}</div>` },
      { key: 'subject', label: t('rep.ob_subject'), render: (m) => `<div class="cell-main">${esc(hi && m.subject_hi ? m.subject_hi : m.subject)}</div>` },
      { key: 'body', label: t('rep.ob_message'), render: (m) => `<div class="ob-body small text-2">${esc(hi && m.body_hi ? m.body_hi : m.body)}</div>` },
    ],
    rows: ob.last.items,
    empty: { icon: 'mail', title: t('rep.ob_empty'), text: t('common.no_records_hint') },
    compact: true,
  });
  pagination(pager, { page: ob.last.page, pageSize: ob.last.page_size, total: ob.last.total, onChange: (p) => { ob.page = p; loadOutbox(); } });
}

function exportOutboxCsv() {
  if (!ob.last) return;
  const hi = getLang() === 'hi';
  const cols = [
    { label: t('rep.ob_when'), csv: (m) => m.created_at },
    { label: t('rep.ob_channel'), csv: (m) => m.channel },
    { label: t('rep.ob_template'), csv: (m) => templateLabel(m.template) },
    { label: t('rep.ob_to'), csv: (m) => m.recipient },
    { label: t('rep.ob_subject'), csv: (m) => (hi && m.subject_hi ? m.subject_hi : m.subject) },
    { label: t('rep.ob_message'), csv: (m) => (hi && m.body_hi ? m.body_hi : m.body) },
  ];
  downloadBlob(new Blob([`﻿${toCSV(cols, ob.last.items)}`], { type: 'text/csv;charset=utf-8' }), `anumati-setu-outbox-${meta?.today || 'page'}.csv`);
  toast(t('rep.exported'), 'success', 2200);
}

async function loadOutbox() {
  try {
    ob.last = await api.get('/notifications/outbox', {
      q: ob.q || undefined, channel: ob.channel || undefined, template: ob.template || undefined, page: ob.page, page_size: 25,
    });
    if (!ob.templates.length) ob.templates = ob.last.templates || [];
    drawOutbox();
  } catch (err) {
    errorState(obPanel, err, loadOutbox);
  }
}

function renderOutbox(panel) {
  obPanel = panel;
  if (!langRedraw) ob.last = null;
  drawOutbox();
  if (!ob.last) loadOutbox();
}

/* ---------------------------------------------------------------- tabs */
function buildTabs() {
  const defs = TABS.map((key) => ({
    key,
    label: t(`rep.tab.${key}`),
    render: (panel) => (key === 'outbox' ? renderOutbox(panel) : renderReport(panel, key)),
  }));
  tabCtl = tabs($('#tabs'), defs, { active: activeTab, onChange: (k) => { activeTab = k; setParams({ tab: k === 'pendency' ? null : k }); } });
}

buildTabs();
onLang(() => {
  langRedraw = true;
  try { buildTabs(); } finally { langRedraw = false; }
});
