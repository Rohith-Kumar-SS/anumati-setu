// Institution compliance profile: facts, score and reasons, then tabs for everything the institution has on record.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, request, site } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, emptyState, errorState, renderTable, tabs, dl, toast, fmtDate, fmtDateTime, daysChip,
  stateBadge, flagChips, utBadge, escBadge, validityBadge, verifyBadge, monthName, parseISO, downloadBlob, getParam, setParams, icon,
} from '../assets/js/ui.js';
import {
  regionName, instTypeLabel, stateLabel, reasonText, scoreMeter, fileLink, docStatusLabel,
} from './c-common.js';

extend({
  en: {
    'insp.title': 'Institution profile',
    'insp.subtitle': 'Compliance record of one institution',
    'insp.facts': 'Institution',
    'insp.city': 'City and state',
    'insp.type': 'Institution type',
    'insp.trust': 'Trust / society',
    'insp.established': 'Established',
    'insp.email': 'E-mail',
    'insp.phone': 'Phone',
    'insp.accounts': 'Portal accounts',
    'insp.score_title': 'Compliance health',
    'insp.score_hint': 'Starts at 100 and loses points for expired or expiring documents, overdue undertakings and late fulfilment.',
    'insp.no_issues': 'No open compliance issues.',
    'insp.tab.apps': 'Applications',
    'insp.tab.ut': 'Undertakings',
    'insp.tab.docs': 'Documents',
    'insp.tab.letters': 'Letters',
    'insp.tab.esc': 'Escalations',
    'insp.tab.cal': 'Calendar',
    'insp.no_id': 'No institution selected',
    'insp.no_id_text': 'Open an institution from the institutions list.',
    'insp.col_type': 'Application',
    'insp.docs_note': 'Every version on record, newest first. The current copy is marked "Current".',
    'insp.col_valid': 'Validity period',
    'insp.col_file': 'File',
    'insp.col_issued': 'Issued',
    'insp.revoked': 'Revoked',
    'insp.col_raised': 'Raised',
    'insp.days_over': 'Days overdue',
    'insp.cal_download': 'Download .ics',
    'insp.cal_empty': 'No dates on the compliance calendar.',
    'insp.cal.SCHEDULED': 'Scheduled',
    'insp.empty_apps': 'No applications on record',
    'insp.empty_ut': 'No undertakings on record',
    'insp.empty_docs': 'No documents on record',
    'insp.empty_letters': 'No letters issued',
    'insp.empty_esc': 'No escalations',
    'insp.open_reg': 'Open in register',
  },
  hi: {
    'insp.title': 'संस्था प्रोफ़ाइल',
    'insp.subtitle': 'एक संस्था का अनुपालन रिकॉर्ड',
    'insp.facts': 'संस्था',
    'insp.city': 'शहर और राज्य',
    'insp.type': 'संस्था का प्रकार',
    'insp.trust': 'ट्रस्ट / सोसाइटी',
    'insp.established': 'स्थापना वर्ष',
    'insp.email': 'ईमेल',
    'insp.phone': 'फ़ोन',
    'insp.accounts': 'पोर्टल खाते',
    'insp.score_title': 'अनुपालन की स्थिति',
    'insp.score_hint': '100 से शुरू होकर समाप्त या शीघ्र समाप्त होने वाले दस्तावेज़ों, अतिदेय वचनबद्धताओं और देर से पूर्ति पर अंक घटते हैं।',
    'insp.no_issues': 'कोई खुला अनुपालन मुद्दा नहीं।',
    'insp.tab.apps': 'आवेदन',
    'insp.tab.ut': 'वचनबद्धताएँ',
    'insp.tab.docs': 'दस्तावेज़',
    'insp.tab.letters': 'पत्र',
    'insp.tab.esc': 'वृद्धियाँ',
    'insp.tab.cal': 'कैलेंडर',
    'insp.no_id': 'कोई संस्था चुनी नहीं गई',
    'insp.no_id_text': 'संस्थाओं की सूची से कोई संस्था खोलें।',
    'insp.col_type': 'आवेदन',
    'insp.docs_note': 'रिकॉर्ड में मौजूद हर संस्करण, नया पहले। वर्तमान प्रति "वर्तमान" चिह्नित है।',
    'insp.col_valid': 'वैधता अवधि',
    'insp.col_file': 'फ़ाइल',
    'insp.col_issued': 'जारी',
    'insp.revoked': 'निरस्त',
    'insp.col_raised': 'उठाई गई',
    'insp.days_over': 'अतिदेय दिन',
    'insp.cal_download': '.ics डाउनलोड',
    'insp.cal_empty': 'अनुपालन कैलेंडर में कोई तिथि नहीं।',
    'insp.cal.SCHEDULED': 'निर्धारित',
    'insp.empty_apps': 'कोई आवेदन दर्ज नहीं',
    'insp.empty_ut': 'कोई वचनबद्धता दर्ज नहीं',
    'insp.empty_docs': 'कोई दस्तावेज़ दर्ज नहीं',
    'insp.empty_letters': 'कोई पत्र जारी नहीं हुआ',
    'insp.empty_esc': 'कोई वृद्धि नहीं',
    'insp.open_reg': 'रजिस्टर में खोलें',
  },
});

const { meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'committee', 'authority'],
  active: 'institutions',
  title: 'insp.title',
  subtitle: 'insp.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.institutions', href: 'staff/institutions.html' }, { label: 'insp.title' }],
});

const id = Number(getParam('id')) || 0;
let inst = null;
let docs = null; // all versions (lazy)
let cal = null; // calendar (lazy)
let tabCtl = null;
let activeTab = getParam('tab') || 'apps';

function headInfo() {
  setPageHead({
    title: inst.name,
    subtitle: `${inst.pid} · ${inst.city}, ${stateLabel(inst.state)}`,
    breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.institutions', href: 'staff/institutions.html' }, { label: inst.name }],
  });
}

function renderHead() {
  const s = inst.score || { score: null, reasons: [] };
  const pairs = [
    [t('f.pid'), `<span class="mono">${esc(inst.pid)}</span>${inst.is_new ? ` <span class="badge b-violet">${esc(t('cc.new_inst'))}</span>` : ''}`],
    [t('f.region'), esc(regionName(meta, inst.region))],
    [t('insp.city'), esc(`${inst.city}, ${stateLabel(inst.state)}`)],
    [t('insp.type'), esc(instTypeLabel(inst.inst_type))],
    [t('insp.trust'), esc(inst.trust_name || '—')],
    [t('insp.established'), esc(inst.established || '—')],
    [t('insp.email'), esc(inst.email || '—')],
    [t('insp.phone'), esc(inst.phone || '—')],
  ];
  const accounts = (inst.users || []).length
    ? el('ul', { class: 'contact-list small' }, inst.users.map((u) => el('li', {}, `${u.name} · `, el('span', { class: 'mono' }, u.email))))
    : null;
  mount($('#head'), el('div', { class: 'grid g-2-1' },
    el('div', { class: 'card' },
      el('div', { class: 'card-head' }, el('h2', {}, t('insp.facts'))),
      el('div', { class: 'card-body' }, dl(pairs, { cols: 2 }), accounts ? el('div', { class: 'mt-2' }, el('div', { class: 'label', style: { marginBottom: '4px' } }, t('insp.accounts')), accounts) : null)),
    el('div', { class: `card accent-top ${s.score !== null && s.score < 60 ? 'accent-danger' : s.score !== null && s.score < 85 ? 'accent-saffron' : 'accent-green'}` },
      el('div', { class: 'card-head' }, el('h2', {}, t('insp.score_title'))),
      el('div', { class: 'card-body' },
        el('div', { class: 'score-big' }, s.score === null ? '—' : String(s.score), el('small', {}, ' / 100')),
        el('div', { class: 'mt-2' }, scoreMeter(s.score, { width: 220 })),
        (s.reasons || []).length
          ? el('ul', { class: 'why-list' }, s.reasons.map((r) => el('li', {}, reasonText(r, meta))))
          : el('p', { class: 'text-2 small mb-0 mt-2' }, t('insp.no_issues')),
        el('p', { class: 'muted small mb-0 mt-2' }, t('insp.score_hint'))))));
}

/* ---------------------------------------------------------------- tab bodies */
const wrap = (...nodes) => el('div', { class: 'tab-body' }, nodes);

function tabApps(panel) {
  const box = el('div');
  mount(panel, wrap(box));
  renderTable(box, {
    columns: [
      { key: 'ref_no', label: t('f.ref_no'), render: (a) => `<a class="cell-main mono" style="white-space:nowrap" href="${esc(site(`staff/application.html?id=${a.id}`))}">${esc(a.ref_no)}</a>` },
      { key: 'app_type', label: t('insp.col_type'), render: (a) => `<div>${esc(tl(a.app_type_label))}</div><div class="cell-sub">${esc(a.programme || '')}</div>` },
      { key: 'route', label: t('f.route'), render: (a) => esc(tl(a.route_label)) },
      { key: 'state', label: t('f.state'), render: (a) => stateBadge(a.state) },
      { key: 'holder', label: t('f.holder'), render: (a) => (a.holder ? esc(a.holder.name) : '—') },
      { key: 'days_left', label: t('f.due'), render: (a) => (a.closed_at ? '—' : daysChip(a.days_left, { paused: a.paused })) },
      { key: 'flags', label: '', render: (a) => flagChips((a.flags || []).filter((f) => f !== 'PAUSED')) },
    ],
    rows: inst.applications || [],
    onRowClick: (a) => { location.href = site(`staff/application.html?id=${a.id}`); },
    empty: { icon: 'file', title: t('insp.empty_apps') },
    compact: true,
  });
}

function tabUt(panel) {
  const box = el('div');
  mount(panel, wrap(box));
  renderTable(box, {
    columns: [
      { key: 'ref_no', label: t('f.ref_no'), render: (u) => `<a class="mono" style="white-space:nowrap" href="${esc(site(`staff/undertakings.html?id=${u.id}`))}">${esc(u.ref_no)}</a>` },
      { key: 'condition', label: t('f.condition'), render: (u) => `<div style="max-width:380px">${esc(u.condition)}</div>` },
      { key: 'category', label: t('f.category'), render: (u) => esc(tl(u.category_label)) },
      { key: 'due_date', label: t('f.due'), render: (u) => `<div style="white-space:nowrap">${esc(fmtDate(u.due_date))}</div>${u.status === 'PENDING' ? daysChip(u.days_left) : ''}` },
      { key: 'status', label: t('f.status'), render: (u) => utBadge(u.status, u.overdue) },
      { key: 'esc', label: t('f.escalation'), render: (u) => (u.status === 'VERIFIED' ? '—' : escBadge(u.escalation_level)) },
    ],
    rows: inst.undertakings || [],
    onRowClick: (u) => { location.href = site(`staff/undertakings.html?id=${u.id}`); },
    rowClass: (u) => (u.overdue ? 'row-danger' : ''),
    empty: { icon: 'file-check', title: t('insp.empty_ut') },
    compact: true,
  });
}

async function tabDocs(panel) {
  mount(panel, wrap(el('div', { class: 'loading' }, el('span', { class: 'spinner' }), t('common.loading'))));
  try {
    if (!docs) docs = (await api.get('/documents', { institution_id: id, include_history: 1, page_size: 200 })).items;
    const box = el('div');
    mount(panel, wrap(el('p', { class: 'muted small mt-0' }, t('insp.docs_note')), box));
    renderTable(box, {
      columns: [
        { key: 'doc_type', label: t('f.doc_type'), render: (d) => `<div class="cell-main">${esc(tl(d.doc_type_label))}</div><div class="cell-sub">${esc(d.title || '')}</div>` },
        { key: 'valid', label: t('insp.col_valid'), render: (d) => (d.valid_until ? `<span style="white-space:nowrap">${esc(fmtDate(d.valid_from))} → ${esc(fmtDate(d.valid_until))}</span>` : '—') },
        { key: 'validity', label: t('f.validity'), render: (d) => (['CURRENT', 'RENEWAL'].includes(d.status) ? validityBadge(d.validity) : '—') },
        { key: 'verification', label: t('f.verification'), render: (d) => `${verifyBadge(d.verification)}${d.verify_note ? `<div class="cell-sub">${esc(d.verify_note)}</div>` : ''}` },
        { key: 'status', label: t('f.status'), render: (d) => esc(docStatusLabel(d.status)) },
        { key: 'file', label: t('insp.col_file'), render: (d) => fileLink(d.file) },
      ],
      rows: docs,
      onRowClick: (d) => { location.href = site(`staff/documents.html?id=${d.id}`); },
      rowClass: (d) => (d.status === 'CURRENT' && d.validity === 'EXPIRED' ? 'row-danger' : ''),
      empty: { icon: 'file', title: t('insp.empty_docs') },
      compact: true,
    });
  } catch (err) {
    errorState(panel, err, () => tabDocs(panel));
  }
}

function tabLetters(panel) {
  const box = el('div');
  mount(panel, wrap(box));
  const hi = getLang() === 'hi';
  renderTable(box, {
    columns: [
      { key: 'ref_no', label: t('f.letter'), render: (l) => `<a class="mono" style="white-space:nowrap" href="${esc(site(`letter.html?id=${l.id}`))}">${esc(l.ref_no)}</a>` },
      { key: 'kind', label: t('f.type'), render: (l) => esc(tl(l.kind_label)) },
      { key: 'subject', label: t('f.subject'), render: (l) => `${esc(hi && l.subject_hi ? l.subject_hi : l.subject)}${l.revoked ? ` <span class="badge b-danger">${esc(t('insp.revoked'))}</span>` : ''}` },
      { key: 'issued_at', label: t('insp.col_issued'), render: (l) => esc(fmtDateTime(l.issued_at)) },
    ],
    rows: inst.letters || [],
    onRowClick: (l) => { location.href = site(`letter.html?id=${l.id}`); },
    empty: { icon: 'file-text', title: t('insp.empty_letters') },
    compact: true,
  });
}

function tabEsc(panel) {
  const box = el('div');
  mount(panel, wrap(box));
  const hi = getLang() === 'hi';
  renderTable(box, {
    columns: [
      { key: 'level', label: t('f.level'), render: (e) => escBadge(e.level, e.status) },
      { key: 'kind', label: t('f.type'), render: (e) => esc(tl(e.kind_label)) },
      { key: 'title', label: t('f.subject'), render: (e) => `<div style="max-width:420px">${esc(hi && e.title_hi ? e.title_hi : e.title)}</div>` },
      { key: 'raised_at', label: t('insp.col_raised'), render: (e) => esc(fmtDateTime(e.raised_at)) },
      { key: 'days_overdue', label: t('insp.days_over'), align: 'right', render: (e) => esc(e.days_overdue ?? '—') },
      { key: 'addressee', label: t('f.addressee'), render: (e) => esc(tl(e.addressee_role_label)) },
      { key: 'status', label: t('f.status'), render: (e) => esc(t(`esc.${e.status}`, { _default: e.status })) },
      { key: 'link', label: '', render: (e) => (e.link ? `<a class="btn sm secondary" href="${esc(site(e.link))}">${esc(t('insp.open_reg'))}</a>` : '') },
    ],
    rows: inst.escalations || [],
    empty: { icon: 'bell', title: t('insp.empty_esc') },
    compact: true,
  });
}

const CAL_STATUS = {
  OVERDUE: () => t('ut.OVERDUE'), EXPIRED: () => t('validity.EXPIRED'), VALID: () => t('validity.VALID'), PENDING: () => t('ut.PENDING'),
  SUBMITTED: () => t('ut.SUBMITTED'), OPEN: () => t('esc.OPEN'), SCHEDULED: () => t('insp.cal.SCHEDULED'),
};
const calLink = (e) => (e.link && e.link.startsWith('institution/application.html') ? site(e.link.replace('institution/', 'staff/')) : null);

async function tabCal(panel) {
  mount(panel, wrap(el('div', { class: 'loading' }, el('span', { class: 'spinner' }), t('common.loading'))));
  try {
    if (!cal) cal = await api.get('/calendar', { institution_id: id });
    const events = cal.events || [];
    const dl_ = el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('download', 15)} ${esc(t('insp.cal_download'))}`, onclick: downloadIcs });
    const body = [el('div', { class: 'row between', style: { marginBottom: '8px' } }, el('span', {}), dl_)];
    if (!events.length) {
      const box = el('div');
      body.push(box);
      mount(panel, wrap(body));
      emptyState(box, { icon: 'calendar', title: t('insp.cal_empty') });
      return;
    }
    let month = '';
    let ul = null;
    for (const e of events) {
      const p = parseISO(e.date);
      const key = `${p.y}-${p.mo}`;
      if (key !== month) {
        month = key;
        body.push(el('div', { class: 'month-title' }, `${monthName(p.mo)} ${p.y}`));
        ul = el('ul', { class: 'cal-list' });
        body.push(ul);
      }
      const bad = ['OVERDUE', 'EXPIRED'].includes(e.status);
      const href = calLink(e);
      ul.appendChild(el('li', {},
        el('div', { class: `cal-date ${bad ? 'bad' : ''}` }, el('span', { class: 'd' }, String(p.d)), el('span', { class: 'm' }, monthName(p.mo))),
        el('div', { class: 'grow' }, el('div', { class: 'cell-main' }, tl(e.title)),
          el('div', { class: 'cell-sub' }, (CAL_STATUS[e.status] ? CAL_STATUS[e.status]() : e.status))),
        href ? el('a', { class: 'btn sm secondary', href }, t('common.open')) : null));
    }
    mount(panel, wrap(body));
  } catch (err) {
    errorState(panel, err, () => tabCal(panel));
  }
}

async function downloadIcs() {
  try {
    const blob = await request('GET', '/calendar.ics', { params: { institution_id: id }, responseType: 'blob' });
    downloadBlob(blob, `anumati-setu-calendar-${inst.pid}.ics`);
  } catch (e) {
    toast(e.message, 'error');
  }
}

function buildTabs() {
  const defs = [
    { key: 'apps', label: t('insp.tab.apps'), count: (inst.applications || []).length, render: tabApps },
    { key: 'ut', label: t('insp.tab.ut'), count: (inst.undertakings || []).length, render: tabUt },
    { key: 'docs', label: t('insp.tab.docs'), render: tabDocs },
    { key: 'letters', label: t('insp.tab.letters'), count: (inst.letters || []).length, render: tabLetters },
    { key: 'esc', label: t('insp.tab.esc'), count: (inst.escalations || []).length, render: tabEsc },
    { key: 'cal', label: t('insp.tab.cal'), render: tabCal },
  ];
  if (!defs.some((d) => d.key === activeTab)) activeTab = 'apps';
  tabCtl = tabs($('#tabs'), defs, { active: activeTab, onChange: (k) => { activeTab = k; setParams({ tab: k === 'apps' ? null : k }); } });
}

function renderAll() {
  headInfo();
  renderHead();
  buildTabs();
}

async function load() {
  if (!id) {
    emptyState($('#head'), { icon: 'bank', title: t('insp.no_id'), text: t('insp.no_id_text'), action: el('a', { class: 'btn', href: site('staff/institutions.html') }, t('cc.back_inst')) });
    return;
  }
  loading($('#head'));
  try {
    inst = await api.get(`/institutions/${id}`);
    renderAll();
  } catch (err) {
    errorState($('#head'), err, load);
  }
}

onLang(() => { if (inst) renderAll(); });
load();
