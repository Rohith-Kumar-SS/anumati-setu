// One-page electronic case summary (printable). Staff and the owning institution.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site, homeFor } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, mount, dl, renderTable, fmtDate, fmtDateTime, fmtNum, getParam, loading, errorState, emptyState,
  stateBadge, severityBadge, whyLine, utBadge, validityBadge, verifyBadge } from '../assets/js/ui.js';
import { logoSvg } from '../assets/js/icons.js';

extend({
  en: {
    'sum.title': 'Case summary',
    'sum.subtitle': 'One-page electronic summary of the application',
    'sum.heading': 'Electronic case summary',
    'sum.portal': 'Anumati Setu · Approval Workflow, Compliance & Alerts Portal',
    'sum.specimen': 'Prototype summary – SIH 2026, not an official record',
    'sum.back': 'Back',
    'sum.print': 'Print',
    'sum.open_app': 'Open the application',
    'sum.none_title': 'No application selected',
    'sum.none_text': 'Open a case summary from an application, or add ?id= to the address.',
    'sum.none': 'Nothing recorded.',
    'sum.sec.facts': 'Application',
    'sum.sec.stages': 'Stages and time used',
    'sum.sec.precheck': 'Automatic pre-check',
    'sum.sec.def': 'Deficiencies and replies',
    'sum.sec.evc': 'Expert visit (EVC)',
    'sum.sec.committee': 'SAC/SHC committee',
    'sum.sec.decision': 'Decision',
    'sum.sec.docs': 'Documents on record',
    'sum.sec.ut': 'Undertakings',
    'sum.sec.letters': 'Letters issued',
    'sum.f.inst': 'Institution',
    'sum.f.where': 'City / state',
    'sum.f.ay': 'Academic year',
    'sum.f.age': 'Days since submission',
    'sum.f.remarks': 'Applicant remarks',
    'sum.f.cycle': 'Scrutiny cycle',
    'sum.f.closed': 'Closed on',
    'sum.stage': 'Stage',
    'sum.started': 'Started',
    'sum.ended': 'Ended',
    'sum.used': 'Days used / allowed',
    'sum.timing': 'Timing',
    'sum.late': 'Late',
    'sum.ontime': 'On time',
    'sum.running': 'Running',
    'sum.notreached': 'Not reached',
    'sum.paused': 'With institution',
    'sum.held': 'Held by',
    'sum.visits': 'Visits to stage',
    'sum.def.raised': 'Raised',
    'sum.def.by': 'by',
    'sum.def.items': 'Deficiencies',
    'sum.def.reason': 'Reason',
    'sum.def.due': 'Reply due',
    'sum.def.status': 'Status',
    'sum.def.OPEN': 'Awaiting reply',
    'sum.def.RESPONDED': 'Replied',
    'sum.def.reply': 'Reply',
    'sum.def.at_stage': 'at {stage}',
    'sum.evc.status': 'Status',
    'sum.evc.QUEUED': 'Waiting to be scheduled',
    'sum.evc.SCHEDULED': 'Scheduled',
    'sum.evc.COMPLETED': 'Report filed',
    'sum.evc.CANCELLED': 'Cancelled',
    'sum.evc.visit': 'Visit date',
    'sum.evc.sched_by': 'Schedule by',
    'sum.evc.complete_by': 'Complete by',
    'sum.evc.panel': 'Panel',
    'sum.evc.convener': 'convener',
    'sum.evc.rec': 'Recommendation',
    'sum.evc.findings': 'Findings',
    'sum.evc.conds': 'Conditions proposed',
    'sum.evc.due_days': 'due in {n} days',
    'sum.evc.report_at': 'Report filed on',
    'sum.com.committee': 'Committee',
    'sum.com.meeting': 'Meeting date',
    'sum.com.rec': 'Recommendation',
    'sum.com.remarks': 'Remarks',
    'sum.com.by': 'Recorded by',
    'sum.dec.outcome': 'Outcome',
    'sum.dec.remarks': 'Remarks',
    'sum.dec.at': 'Decided on',
    'sum.dec.by': 'Decided by',
    'sum.doc.title': 'Title',
    'sum.ut.ref': 'Reference',
    'sum.ut.rejections': 'Rejections',
    'sum.let.subject': 'Subject',
    'sum.let.withdrawn': 'Withdrawn',
    'sum.generated': 'Generated on {at} for {who}.',
    'sum.generated_note': 'Prepared from the live case record; it carries no signature.',
  },
  hi: {
    'sum.title': 'केस सारांश',
    'sum.subtitle': 'आवेदन का एक-पृष्ठ इलेक्ट्रॉनिक सारांश',
    'sum.heading': 'इलेक्ट्रॉनिक केस सारांश',
    'sum.portal': 'अनुमति सेतु · अनुमोदन कार्यप्रवाह, अनुपालन एवं अलर्ट पोर्टल',
    'sum.specimen': 'प्रोटोटाइप सारांश – एसआईएच 2026, आधिकारिक अभिलेख नहीं',
    'sum.back': 'वापस',
    'sum.print': 'प्रिंट करें',
    'sum.open_app': 'आवेदन खोलें',
    'sum.none_title': 'कोई आवेदन चुना नहीं गया',
    'sum.none_text': 'किसी आवेदन से केस सारांश खोलें, या पते में ?id= जोड़ें।',
    'sum.none': 'कुछ दर्ज नहीं।',
    'sum.sec.facts': 'आवेदन',
    'sum.sec.stages': 'चरण और लगा समय',
    'sum.sec.precheck': 'स्वचालित प्री-चेक',
    'sum.sec.def': 'कमियाँ और उत्तर',
    'sum.sec.evc': 'विशेषज्ञ दौरा (ईवीसी)',
    'sum.sec.committee': 'एसएसी/एसएचसी समिति',
    'sum.sec.decision': 'निर्णय',
    'sum.sec.docs': 'अभिलेख में दस्तावेज़',
    'sum.sec.ut': 'वचनबद्धताएँ',
    'sum.sec.letters': 'जारी पत्र',
    'sum.f.inst': 'संस्था',
    'sum.f.where': 'शहर / राज्य',
    'sum.f.ay': 'शैक्षणिक वर्ष',
    'sum.f.age': 'जमा करने के बाद के दिन',
    'sum.f.remarks': 'आवेदक की टिप्पणी',
    'sum.f.cycle': 'संवीक्षा चक्र',
    'sum.f.closed': 'बंद होने की तिथि',
    'sum.stage': 'चरण',
    'sum.started': 'आरंभ',
    'sum.ended': 'समाप्त',
    'sum.used': 'लगे / अनुमत दिन',
    'sum.timing': 'समय-पालन',
    'sum.late': 'विलंबित',
    'sum.ontime': 'समय पर',
    'sum.running': 'चालू',
    'sum.notreached': 'अभी नहीं पहुँचा',
    'sum.paused': 'संस्था के पास',
    'sum.held': 'किसके पास',
    'sum.visits': 'चरण में आगमन',
    'sum.def.raised': 'उठाई गई',
    'sum.def.by': 'द्वारा',
    'sum.def.items': 'कमियाँ',
    'sum.def.reason': 'कारण',
    'sum.def.due': 'उत्तर की नियत तिथि',
    'sum.def.status': 'स्थिति',
    'sum.def.OPEN': 'उत्तर की प्रतीक्षा',
    'sum.def.RESPONDED': 'उत्तर दिया गया',
    'sum.def.reply': 'उत्तर',
    'sum.def.at_stage': '{stage} पर',
    'sum.evc.status': 'स्थिति',
    'sum.evc.QUEUED': 'निर्धारण की प्रतीक्षा',
    'sum.evc.SCHEDULED': 'निर्धारित',
    'sum.evc.COMPLETED': 'रिपोर्ट दाखिल',
    'sum.evc.CANCELLED': 'रद्द',
    'sum.evc.visit': 'दौरे की तिथि',
    'sum.evc.sched_by': 'निर्धारण की अंतिम तिथि',
    'sum.evc.complete_by': 'पूर्णता की अंतिम तिथि',
    'sum.evc.panel': 'पैनल',
    'sum.evc.convener': 'संयोजक',
    'sum.evc.rec': 'अनुशंसा',
    'sum.evc.findings': 'निष्कर्ष',
    'sum.evc.conds': 'प्रस्तावित शर्तें',
    'sum.evc.due_days': '{n} दिन में',
    'sum.evc.report_at': 'रिपोर्ट दाखिल होने की तिथि',
    'sum.com.committee': 'समिति',
    'sum.com.meeting': 'बैठक की तिथि',
    'sum.com.rec': 'अनुशंसा',
    'sum.com.remarks': 'टिप्पणी',
    'sum.com.by': 'दर्ज करने वाले',
    'sum.dec.outcome': 'परिणाम',
    'sum.dec.remarks': 'टिप्पणी',
    'sum.dec.at': 'निर्णय की तिथि',
    'sum.dec.by': 'निर्णयकर्ता',
    'sum.doc.title': 'शीर्षक',
    'sum.ut.ref': 'संदर्भ',
    'sum.ut.rejections': 'अस्वीकृतियाँ',
    'sum.let.subject': 'विषय',
    'sum.let.withdrawn': 'वापस लिया गया',
    'sum.generated': '{at} को {who} के लिए तैयार किया गया।',
    'sum.generated_note': 'यह जीवित केस रिकॉर्ड से बनाया गया है; इस पर हस्ताक्षर नहीं हैं।',
  },
});

const { user, meta } = await initPage({
  roles: ['institution', 'ro', 'rd', 'bureau', 'evc', 'committee', 'authority'], active: '',
  title: 'sum.title', subtitle: 'sum.subtitle',
});
setPageHead({ breadcrumbs: [{ label: 'nav.dashboard', href: homeFor(user.role) }, { label: 'sum.title' }] });

const id = getParam('id');
const bodyEl = $('#sum-body');
let data = null;
const pick = (en, hi) => (getLang() === 'hi' && hi ? hi : en);
const metaLabel = (group, code) => { const d = meta && meta[group] && meta[group][code]; return d ? tl(d) : code; };

function actions() {
  const nodes = [el('button', { class: 'btn secondary', type: 'button', onclick: () => history.back(), html: `${icon('arrow-left', 16)}<span>${esc(t('sum.back'))}</span>` })];
  if (data) {
    const base = user.role === 'institution' ? 'institution/application.html' : 'staff/application.html';
    nodes.push(el('a', { class: 'btn secondary', href: site(`${base}?id=${data.application.id}`), html: `${icon('file-text', 16)}<span>${esc(t('sum.open_app'))}</span>` }));
    nodes.push(el('button', { class: 'btn', type: 'button', onclick: () => window.print(), html: `${icon('print', 16)}<span>${esc(t('sum.print'))}</span>` }));
  }
  mount($('#sum-actions'), nodes);
}

const section = (key, ic, ...content) => el('section', { class: 'sec', 'aria-labelledby': `h-${key}` },
  el('h3', { class: 'sec-h', id: `h-${key}`, html: `${icon(ic, 17)}<span>${esc(t(`sum.sec.${key}`))}</span>` }), ...content);
const none = () => el('p', { class: 'none' }, t('sum.none'));
const person = (u) => (u ? `${u.name}${u.designation ? `, ${u.designation}` : ''}` : '—');
const table = (opts) => { const host = el('div'); renderTable(host, { compact: true, ...opts }); return host; };

function timingCell(s) {
  if (s.state === 'todo') return `<span class="muted">${esc(t('sum.notreached'))}</span>`;
  if (s.late) return `<span class="badge b-danger">${esc(t('sum.late'))}</span>`;
  if (s.state === 'done') return `<span class="badge b-success">${esc(t('sum.ontime'))}</span>`;
  if (s.state === 'returned') return `<span class="badge b-orange">${esc(t('sum.paused'))}</span>`;
  if (s.state === 'bad') return `<span class="badge b-danger">${esc(t('state.REJECTED'))}</span>`;
  return `<span class="badge b-info">${esc(t('sum.running'))}</span>`;
}

function facts(a) {
  const inst = a.institution;
  return section('facts', 'file-text',
    dl([
      [t('f.ref_no'), `<span class="mono">${esc(a.ref_no)}</span>`],
      [t('f.state'), stateBadge(a.state)],
      [t('sum.f.inst'), `${esc(inst.name)} <span class="muted small">(${esc(inst.pid)})</span>`],
      [t('sum.f.where'), esc(`${inst.city}, ${inst.state}`)],
      [t('f.region'), esc(pick(a.region.name, a.region.name_hi))],
      [t('f.type'), esc(tl(a.app_type_label))],
      [t('f.route'), esc(tl(a.route_label))],
      [t('f.programme'), esc(a.programme || '—')],
      [t('f.intake'), a.intake ? fmtNum(a.intake) : '—'],
      [t('sum.f.ay'), esc(a.academic_year || '—')],
      [t('f.submitted'), fmtDateTime(a.submitted_at)],
      [t('sum.f.age'), String(a.age_days ?? '—')],
      [t('sum.f.cycle'), String(a.cycle ?? '—')],
      [t('f.holder'), a.holder ? `${esc(a.holder.name)} <span class="muted small">(${esc(a.holder.designation)})</span>` : '—'],
      a.closed_at ? [t('sum.f.closed'), fmtDate(a.closed_at)] : null,
      a.remarks ? [t('sum.f.remarks'), esc(a.remarks)] : null,
    ]),
    el('div', { style: { marginTop: '12px' } }, whyLine(a.why)));
}

function stages(list) {
  return section('stages', 'layers', table({
    columns: [
      { key: 'stage', label: t('sum.stage'), render: (s) => `<span class="cell-main">${esc(tl(s.label))}</span>` },
      { key: 'started_at', label: t('sum.started'), render: (s) => (s.started_at ? esc(fmtDate(s.started_at)) : '—') },
      { key: 'ended_at', label: t('sum.ended'), render: (s) => (s.ended_at ? esc(fmtDate(s.ended_at)) : '—') },
      { key: 'used', label: t('sum.used'), align: 'right', render: (s) => (s.days_used === null || s.days_used === undefined ? `— / ${s.sla_days}` : `${s.days_used} / ${s.sla_days}`) },
      { key: 'late', label: t('sum.timing'), render: timingCell },
      { key: 'holder', label: t('sum.held'), render: (s) => (s.holder ? esc(s.holder.name) : '—') },
    ],
    rows: list,
  }));
}

function precheck(list) {
  if (!list || !list.length) return null;
  return section('precheck', 'shield-check', el('ul', { class: 'list-plain' }, list.map((f) => el('li', { style: { display: 'flex', gap: '10px', padding: '4px 0', alignItems: 'baseline' } },
    el('span', { html: severityBadge(f.severity) }), el('span', {}, pick(f.en, f.hi))))));
}

function deficiencies(list) {
  return section('def', 'alert', list.length ? list.map((d) => el('div', { class: 'block' },
    el('div', { class: 'row between' },
      el('strong', {}, `${t('sum.def.raised')} ${fmtDate(d.raised_at)}${d.raised_by ? ` ${t('sum.def.by')} ${d.raised_by.name}` : ''} · ${t('sum.def.at_stage', { stage: metaLabel('stages', d.stage) })}`),
      el('span', { class: `badge ${d.status === 'OPEN' ? 'b-warning' : 'b-success'}` }, t(`sum.def.${d.status}`, { _default: d.status }))),
    el('ul', {}, (d.items || []).map((i) => { const lab = metaLabel('deficiency_codes', i.code); const txt = !i.text ? `[${i.code}] ${lab}` : (lab === i.code || i.text.toLowerCase().startsWith(lab.toLowerCase())) ? `[${i.code}] ${i.text}` : `[${i.code}] ${lab} – ${i.text}`; return el('li', {}, txt); })),
    d.reason ? el('div', { class: 'small', style: { marginTop: '6px' } }, el('strong', {}, `${t('sum.def.reason')}: `), d.reason) : null,
    el('div', { class: 'small', style: { marginTop: '4px' } }, el('strong', {}, `${t('sum.def.due')}: `), fmtDate(d.reply_due)),
    d.response_note ? el('div', { class: 'small', style: { marginTop: '4px' } }, el('strong', {}, `${t('sum.def.reply')} (${fmtDate(d.responded_at)}): `), d.response_note) : null)) : none());
}

function evcBlock(e) {
  if (!e) return section('evc', 'users', none());
  const pairs = [
    [t('sum.evc.status'), esc(t(`sum.evc.${e.status}`, { _default: e.status }))],
    [t('sum.evc.sched_by'), fmtDate(e.schedule_by)],
    [t('sum.evc.complete_by'), fmtDate(e.complete_by)],
    e.visit_date ? [t('sum.evc.visit'), fmtDate(e.visit_date)] : null,
    e.report_at ? [t('sum.evc.report_at'), fmtDateTime(e.report_at)] : null,
    e.recommendation ? [t('sum.evc.rec'), `<strong>${esc(metaLabel('evc_recommendations', e.recommendation))}</strong>`] : null,
  ];
  const panel = (e.panel || []).length ? (e.panel).map((p) => `${p.name}${e.convener && e.convener.id === p.id ? ` (${t('sum.evc.convener')})` : ''}`).join(', ') : null;
  return section('evc', 'users', dl(pairs),
    panel ? el('p', { style: { marginTop: '10px', marginBottom: '4px' } }, el('strong', {}, `${t('sum.evc.panel')}: `), panel) : null,
    e.findings ? el('p', { style: { marginBottom: '4px' } }, el('strong', {}, `${t('sum.evc.findings')}: `), e.findings) : null,
    (e.conditions || []).length ? el('div', {}, el('strong', {}, `${t('sum.evc.conds')}:`),
      el('ul', { style: { margin: '4px 0 0 18px', padding: 0 } }, e.conditions.map((c) => el('li', {}, `${c.text} (${metaLabel('ut_categories', c.category)}, ${t('sum.evc.due_days', { n: c.due_days })})`)))) : null);
}

function committee(list) {
  return section('committee', 'users', list.length ? list.map((c) => el('div', { class: 'block' },
    dl([
      [t('sum.com.committee'), esc(c.committee)],
      [t('sum.com.meeting'), fmtDate(c.meeting_date)],
      [t('sum.com.rec'), `<strong>${esc(metaLabel('evc_recommendations', c.recommendation))}</strong>`],
      [t('sum.com.by'), esc(person(c.recorded_by))],
    ]),
    c.remarks ? el('p', { class: 'small', style: { margin: '8px 0 0' } }, el('strong', {}, `${t('sum.com.remarks')}: `), c.remarks) : null)) : none());
}

function decision(d) {
  if (!d) return section('decision', 'stamp', none());
  return section('decision', 'stamp', dl([
    [t('sum.dec.outcome'), `<strong>${esc(metaLabel('decisions', d.outcome))}</strong>`],
    [t('sum.dec.at'), fmtDate(d.decided_at)],
    [t('sum.dec.by'), esc(person(d.decided_by))],
    d.remarks ? [t('sum.dec.remarks'), esc(d.remarks)] : null,
  ]));
}

function documents(list) {
  return section('docs', 'file-check', list.length ? table({
    columns: [
      { key: 'doc_type', label: t('f.doc_type'), render: (d) => `<span class="cell-main">${esc(tl(d.doc_type_label))}</span><div class="cell-sub">${esc(d.title || '')}</div>` },
      { key: 'valid_until', label: t('f.valid_until'), render: (d) => (d.valid_until ? esc(fmtDate(d.valid_until)) : '—') },
      { key: 'validity', label: t('f.validity'), render: (d) => validityBadge(d.validity) },
      { key: 'verification', label: t('f.verification'), render: (d) => verifyBadge(d.verification) },
    ],
    rows: list,
  }) : none());
}

function undertakings(list) {
  return section('ut', 'target', list.length ? table({
    columns: [
      { key: 'ref_no', label: t('sum.ut.ref'), render: (u) => `<span class="mono nowrap">${esc(u.ref_no)}</span>` },
      { key: 'condition', label: t('f.condition') },
      { key: 'category', label: t('f.category'), render: (u) => esc(tl(u.category_label)) },
      { key: 'due_date', label: t('f.due'), render: (u) => esc(fmtDate(u.due_date)) },
      { key: 'status', label: t('f.status'), render: (u) => utBadge(u.status, u.overdue) },
      { key: 'rejections', label: t('sum.ut.rejections'), align: 'right' },
    ],
    rows: list,
  }) : none());
}

function letters(list) {
  return section('letters', 'mail', list.length ? table({
    columns: [
      { key: 'ref_no', label: t('f.ref_no'), render: (l) => `<a class="mono" href="${esc(site(`letter.html?id=${l.id}`))}">${esc(l.ref_no)}</a>` },
      { key: 'kind', label: t('f.letter'), render: (l) => esc(tl(l.kind_label)) },
      { key: 'subject', label: t('sum.let.subject'), render: (l) => esc(pick(l.subject, l.subject_hi)) + (l.revoked ? ` <span class="badge b-danger">${esc(t('sum.let.withdrawn'))}</span>` : '') },
      { key: 'issued_at', label: t('f.date'), render: (l) => esc(fmtDate(l.issued_at)) },
    ],
    rows: list,
  }) : none());
}

function render() {
  actions();
  if (!data) return;
  const a = data.application;
  setPageHead({ title: `${t('sum.title')} · ${a.ref_no}`, subtitle: a.institution.name });
  mount(bodyEl, el('article', { class: 'sheet', 'aria-label': `${t('sum.heading')} ${a.ref_no}` },
    el('div', { class: 'sheet-head' },
      el('div', {},
        el('div', { class: 'sh-brand' }, el('span', { html: logoSvg(52), 'aria-hidden': 'true' }),
          el('div', {}, el('div', { class: 'sh-name' }, 'Anumati Setu · अनुमति सेतु'), el('div', { class: 'sh-org' }, t('sum.portal')))),
        el('div', { class: 'watermark', style: { marginTop: '10px' } }, t('sum.specimen'))),
      el('div', { class: 'sh-meta' },
        el('div', { style: { fontWeight: '700', fontSize: '1.05rem' } }, t('sum.heading')),
        el('div', { class: 'ref' }, a.ref_no),
        el('div', {}, a.institution.name))),
    facts(a), stages(data.stages), precheck(data.precheck), deficiencies(data.deficiencies), evcBlock(data.evc),
    data.committee.length || data.stages.some((s) => s.stage === 'COMMITTEE') ? committee(data.committee) : null,
    decision(data.decision), documents(data.documents), undertakings(data.undertakings), letters(data.letters),
    el('div', { class: 'foot-gen' }, t('sum.generated', { at: fmtDateTime(data.generated_at), who: data.generated_by }), ' ', t('sum.generated_note'))));
}

async function load() {
  if (!id) { emptyState(bodyEl, { icon: 'file-text', title: t('sum.none_title'), text: t('sum.none_text') }); actions(); return; }
  loading(bodyEl);
  try {
    data = await api.get(`/applications/${encodeURIComponent(id)}/summary`);
    render();
  } catch (e) {
    errorState(bodyEl, e, load);
  }
}

onLang(render);
load();
