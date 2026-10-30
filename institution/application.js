// Institution view of one application: progress, why line, reply to a deficiency letter, EVC visit, decision, undertakings, letters, timeline.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, apiUrl, getToken, site } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, mount, dl, renderTable, timeline, routeSteps, whyLine, stateBadge, flagChips, daysChip, utBadge,
  fmtDate, fmtDateTime, fmtBytes, daysBetween, getParam, loading, errorState, emptyState, withBusy, toast } from '../assets/js/ui.js';

extend({
  en: {
    'iapp.title': 'Application',
    'iapp.subtitle': 'Where your application stands and what is expected from you',
    'iapp.none_title': 'No application selected',
    'iapp.none_text': 'Open an application from your dashboard.',
    'iapp.summary': 'Case summary',
    'iapp.dash': 'Back to dashboard',
    'iapp.progress': 'Progress along the route',
    'iapp.reply_title': 'Reply to the deficiency letter',
    'iapp.reply_due': 'Reply due',
    'iapp.reply_reason': 'Reason given',
    'iapp.reply_items': 'Deficiencies noted',
    'iapp.reply_clock': 'The AICTE clock is paused until you reply.',
    'iapp.reply_note': 'Your reply',
    'iapp.reply_note_hint': 'Explain what you are sending for each deficiency (at least 5 characters).',
    'iapp.reply_files': 'Supporting documents',
    'iapp.reply_files_hint': 'You can attach several files. They are fingerprinted (SHA-256) when stored.',
    'iapp.reply_selected': '{n} file(s) selected',
    'iapp.reply_clear': 'Clear files',
    'iapp.reply_send': 'Send reply',
    'iapp.reply_err_note': 'Please write your reply (at least 5 characters).',
    'iapp.reply_sent': 'Your reply was sent. The application is back with the officer.',
    'iapp.def_title': 'Deficiency letters and replies',
    'iapp.def_none': 'No deficiency has been raised on this application.',
    'iapp.def_raised': 'Raised {date} at {stage}',
    'iapp.def_open': 'Awaiting your reply',
    'iapp.def_done': 'Replied {date}',
    'iapp.def_letter': 'Open the letter',
    'iapp.def_files': 'Files you sent',
    'iapp.evc_title': 'Expert visit (EVC)',
    'iapp.evc_none': 'No expert visit is part of this application yet.',
    'iapp.evc_queued': 'The regional office is fixing a date for the expert visit. It is expected to be scheduled by {date}.',
    'iapp.evc_sched': 'Visit date',
    'iapp.evc_panel': 'Panel',
    'iapp.evc_convener': 'convener',
    'iapp.evc_done': 'The visit has been held and the report filed.',
    'iapp.evc_cancelled': 'The earlier visit plan was cancelled.',
    'iapp.dec_title': 'Decision',
    'iapp.dec_outcome': 'Outcome',
    'iapp.dec_remarks': 'Remarks',
    'iapp.dec_at': 'Decided on',
    'iapp.dec_by': 'Decided by',
    'iapp.ut_title': 'Undertakings',
    'iapp.ut_none': 'This application carries no undertakings.',
    'iapp.ut_open': 'Open compliance',
    'iapp.ut_ref': 'Reference',
    'iapp.let_title': 'Letters',
    'iapp.let_none': 'No letters have been issued yet.',
    'iapp.let_subject': 'Subject',
    'iapp.tl_title': 'Timeline',
    'iapp.facts': 'Application',
    'iapp.who': 'Who has it',
    'iapp.who_none': 'Nobody: the application is closed.',
    'iapp.who_inst': 'You (the institution)',
    'iapp.links': 'Quick links',
    'iapp.new_app': 'New application',
    'iapp.cycle': 'Scrutiny cycle',
    'iapp.remarks': 'Your remarks',
    'iapp.closed_on': 'Closed on',
    'iapp.act.APP_SUBMITTED': 'Application submitted',
    'iapp.act.AUTO_ROUTED': 'Routed automatically',
    'iapp.act.AUTO_ASSIGNED': 'Assigned automatically',
    'iapp.act.APP_RETURNED': 'Returned with deficiencies',
    'iapp.act.APP_RESPONDED': 'Reply sent',
    'iapp.act.AUTO_RESUMED': 'Stage clock resumed',
    'iapp.act.SCRUTINY_COMPLETED': 'Scrutiny completed',
    'iapp.act.AUTO_ADVANCED': 'Moved to the next stage',
    'iapp.act.EVC_SCHEDULED': 'Expert visit scheduled',
    'iapp.act.EVC_REPORTED': 'Expert visit report filed',
    'iapp.act.COMMITTEE_RECORDED': 'SAC/SHC recommendation recorded',
    'iapp.act.APP_DECIDED': 'Decision taken',
    'iapp.act.APP_REVERTED': 'Sent back to an earlier stage',
    'iapp.act.ESCALATED': 'Escalated',
    'iapp.act.REMINDER_SENT': 'Reminder sent',
    'iapp.act.LETTER_ISSUED': 'Letter issued',
    'iapp.log_note': 'Detail lines come from the audit trail and are shown in English.',
  },
  hi: {
    'iapp.title': 'आवेदन',
    'iapp.subtitle': 'आपका आवेदन कहाँ है और आपसे क्या अपेक्षित है',
    'iapp.none_title': 'कोई आवेदन चुना नहीं गया',
    'iapp.none_text': 'अपने डैशबोर्ड से कोई आवेदन खोलें।',
    'iapp.summary': 'केस सारांश',
    'iapp.dash': 'डैशबोर्ड पर लौटें',
    'iapp.progress': 'मार्ग पर प्रगति',
    'iapp.reply_title': 'कमी पत्र का उत्तर दें',
    'iapp.reply_due': 'उत्तर की नियत तिथि',
    'iapp.reply_reason': 'बताया गया कारण',
    'iapp.reply_items': 'पाई गई कमियाँ',
    'iapp.reply_clock': 'आपके उत्तर देने तक एआईसीटीई की घड़ी रुकी रहती है।',
    'iapp.reply_note': 'आपका उत्तर',
    'iapp.reply_note_hint': 'हर कमी के लिए बताएँ कि आप क्या भेज रहे हैं (कम से कम 5 अक्षर)।',
    'iapp.reply_files': 'सहायक दस्तावेज़',
    'iapp.reply_files_hint': 'आप कई फ़ाइलें जोड़ सकते हैं। सहेजते समय उनका फ़िंगरप्रिंट (SHA-256) लिया जाता है।',
    'iapp.reply_selected': '{n} फ़ाइल चुनी गई',
    'iapp.reply_clear': 'फ़ाइलें हटाएँ',
    'iapp.reply_send': 'उत्तर भेजें',
    'iapp.reply_err_note': 'कृपया अपना उत्तर लिखें (कम से कम 5 अक्षर)।',
    'iapp.reply_sent': 'आपका उत्तर भेज दिया गया। आवेदन फिर अधिकारी के पास है।',
    'iapp.def_title': 'कमी पत्र और उत्तर',
    'iapp.def_none': 'इस आवेदन पर कोई कमी नहीं उठाई गई है।',
    'iapp.def_raised': '{date} को {stage} पर उठाई गई',
    'iapp.def_open': 'आपके उत्तर की प्रतीक्षा',
    'iapp.def_done': '{date} को उत्तर दिया गया',
    'iapp.def_letter': 'पत्र खोलें',
    'iapp.def_files': 'आपकी भेजी गई फ़ाइलें',
    'iapp.evc_title': 'विशेषज्ञ दौरा (ईवीसी)',
    'iapp.evc_none': 'इस आवेदन में अभी विशेषज्ञ दौरा शामिल नहीं है।',
    'iapp.evc_queued': 'क्षेत्रीय कार्यालय विशेषज्ञ दौरे की तिथि तय कर रहा है। इसके {date} तक निर्धारित होने की अपेक्षा है।',
    'iapp.evc_sched': 'दौरे की तिथि',
    'iapp.evc_panel': 'पैनल',
    'iapp.evc_convener': 'संयोजक',
    'iapp.evc_done': 'दौरा हो चुका है और रिपोर्ट दाखिल हो गई है।',
    'iapp.evc_cancelled': 'पहले की दौरा योजना रद्द कर दी गई थी।',
    'iapp.dec_title': 'निर्णय',
    'iapp.dec_outcome': 'परिणाम',
    'iapp.dec_remarks': 'टिप्पणी',
    'iapp.dec_at': 'निर्णय की तिथि',
    'iapp.dec_by': 'निर्णयकर्ता',
    'iapp.ut_title': 'वचनबद्धताएँ',
    'iapp.ut_none': 'इस आवेदन के साथ कोई वचनबद्धता नहीं है।',
    'iapp.ut_open': 'अनुपालन खोलें',
    'iapp.ut_ref': 'संदर्भ',
    'iapp.let_title': 'पत्र',
    'iapp.let_none': 'अभी तक कोई पत्र जारी नहीं हुआ।',
    'iapp.let_subject': 'विषय',
    'iapp.tl_title': 'समयरेखा',
    'iapp.facts': 'आवेदन',
    'iapp.who': 'किसके पास है',
    'iapp.who_none': 'किसी के पास नहीं: आवेदन बंद है।',
    'iapp.who_inst': 'आप (संस्था)',
    'iapp.links': 'त्वरित लिंक',
    'iapp.new_app': 'नया आवेदन',
    'iapp.cycle': 'संवीक्षा चक्र',
    'iapp.remarks': 'आपकी टिप्पणी',
    'iapp.closed_on': 'बंद होने की तिथि',
    'iapp.act.APP_SUBMITTED': 'आवेदन जमा किया गया',
    'iapp.act.AUTO_ROUTED': 'स्वतः मार्ग तय हुआ',
    'iapp.act.AUTO_ASSIGNED': 'स्वतः सौंपा गया',
    'iapp.act.APP_RETURNED': 'कमियों सहित लौटाया गया',
    'iapp.act.APP_RESPONDED': 'उत्तर भेजा गया',
    'iapp.act.AUTO_RESUMED': 'चरण-घड़ी पुनः चालू',
    'iapp.act.SCRUTINY_COMPLETED': 'संवीक्षा पूर्ण',
    'iapp.act.AUTO_ADVANCED': 'अगले चरण पर भेजा गया',
    'iapp.act.EVC_SCHEDULED': 'विशेषज्ञ दौरा निर्धारित',
    'iapp.act.EVC_REPORTED': 'विशेषज्ञ दौरे की रिपोर्ट दाखिल',
    'iapp.act.COMMITTEE_RECORDED': 'एसएसी/एसएचसी की अनुशंसा दर्ज',
    'iapp.act.APP_DECIDED': 'निर्णय लिया गया',
    'iapp.act.APP_REVERTED': 'पिछले चरण पर वापस भेजा गया',
    'iapp.act.ESCALATED': 'वृद्धि की गई',
    'iapp.act.REMINDER_SENT': 'अनुस्मारक भेजा गया',
    'iapp.act.LETTER_ISSUED': 'पत्र जारी किया गया',
    'iapp.log_note': 'विवरण की पंक्तियाँ ऑडिट रिकॉर्ड से आती हैं और अंग्रेज़ी में दिखाई जाती हैं।',
  },
});

const { meta } = await initPage({ roles: ['institution'], active: 'dashboard', title: 'iapp.title', subtitle: 'iapp.subtitle' });
setPageHead({ breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'iapp.title' }] });

const id = getParam('id');
const body = $('#app-body');
let app = null;
const form = { note: '', files: [], noteError: false };

const pick = (en, hi) => (getLang() === 'hi' && hi ? hi : en);
const metaLabel = (group, code) => { const d = meta && meta[group] && meta[group][code]; return d ? tl(d) : code; };
const card = (titleKey, ic, ...children) => el('section', { class: 'card', 'aria-label': t(titleKey) },
  el('div', { class: 'card-head' }, el('h2', { html: `${icon(ic, 19)}<span>${esc(t(titleKey))}</span>` })), ...children);
const fileUrl = (f) => apiUrl(`/files/${f.id}`, { token: getToken() });
const tableIn = (opts) => { const host = el('div'); renderTable(host, { compact: true, ...opts }); return host; };

function itemText(i) {
  const lab = metaLabel('deficiency_codes', i.code);
  if (!i.text) return `[${i.code}] ${lab}`;
  if (lab === i.code || i.text.toLowerCase().startsWith(lab.toLowerCase())) return `[${i.code}] ${i.text}`;
  return `[${i.code}] ${lab} – ${i.text}`;
}

/* ------------------------------------------------------------------ reply */
function openDeficiency() { return (app.deficiencies || []).find((d) => d.status === 'OPEN') || null; }

function replyCard() {
  const d = openDeficiency();
  const left = d && meta ? daysBetween(meta.today, d.reply_due) : null;
  const note = el('textarea', { class: `textarea${form.noteError ? ' invalid' : ''}`, id: 'reply-note', rows: 5, 'aria-describedby': 'reply-note-hint' }, form.note);
  note.addEventListener('input', () => { form.note = note.value; if (form.noteError) { form.noteError = false; note.classList.remove('invalid'); $('#reply-note-err').hidden = true; } });
  const files = el('input', { class: 'input', id: 'reply-files', type: 'file', multiple: true });
  const selected = el('ul', { class: 'reply-files', id: 'reply-selected', 'aria-live': 'polite' });
  const paint = () => {
    mount(selected, form.files.map((f) => el('li', {}, el('span', {}, f.name), el('span', { class: 'muted' }, fmtBytes(f.size)))));
    $('#reply-clear').hidden = !form.files.length;
  };
  files.addEventListener('change', () => { form.files = Array.from(files.files); paint(); });
  if (form.files.length) { try { const dt = new DataTransfer(); form.files.forEach((f) => dt.items.add(f)); files.files = dt.files; } catch (e) { form.files = []; } }
  const send = el('button', { class: 'btn', type: 'button', html: `${icon('send', 16)}<span>${esc(t('iapp.reply_send'))}</span>` });
  send.addEventListener('click', () => submitReply(send));
  const wrap = el('section', { class: 'card accent-saffron', 'aria-label': t('iapp.reply_title') },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('mail', 19)}<span>${esc(t('iapp.reply_title'))}</span>` }),
      d ? el('span', { html: `${esc(t('iapp.reply_due'))}: ${esc(fmtDate(d.reply_due))} ${daysChip(left)}` }) : null),
    el('div', { class: 'card-body stack' },
      d ? el('div', {},
        el('div', { class: 'small', style: { fontWeight: '700' } }, t('iapp.reply_items')),
        el('ul', { class: 'def-items' }, (d.items || []).map((i) => el('li', {}, itemText(i)))),
        d.reason ? el('p', { class: 'small', style: { margin: '8px 0 0' } }, el('strong', {}, `${t('iapp.reply_reason')}: `), d.reason) : null,
        d.letter_id ? el('p', { class: 'small', style: { margin: '6px 0 0' } }, el('a', { href: site(`letter.html?id=${d.letter_id}`) }, t('iapp.def_letter'))) : null) : null,
      el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('clock', 18) }), el('div', {}, t('iapp.reply_clock'))),
      el('div', { class: 'field' },
        el('label', { for: 'reply-note' }, t('iapp.reply_note'), el('span', { class: 'req', 'aria-hidden': 'true' }, '*')), note,
        el('div', { class: 'hint', id: 'reply-note-hint' }, t('iapp.reply_note_hint')),
        el('div', { class: 'error', id: 'reply-note-err', hidden: !form.noteError }, t('iapp.reply_err_note'))),
      el('div', { class: 'field' },
        el('label', { for: 'reply-files' }, t('iapp.reply_files')), files,
        el('div', { class: 'hint' }, t('iapp.reply_files_hint')), selected,
        el('div', {}, el('button', { class: 'btn sm ghost', id: 'reply-clear', type: 'button', hidden: true, onclick: () => { form.files = []; files.value = ''; paint(); } }, t('iapp.reply_clear')))),
      el('div', { class: 'row end' }, send)));
  setTimeout(paint, 0);
  return wrap;
}

async function submitReply(btn) {
  if ((form.note || '').trim().length < 5) {
    form.noteError = true;
    $('#reply-note').classList.add('invalid'); $('#reply-note-err').hidden = false; $('#reply-note').focus();
    return;
  }
  const fd = new FormData();
  fd.append('note', form.note.trim());
  form.files.forEach((f) => fd.append('files', f, f.name));
  try {
    await withBusy(btn, async () => { app = await api.upload(`/applications/${encodeURIComponent(id)}/respond`, fd); });
    form.note = ''; form.files = []; form.noteError = false;
    toast(t('iapp.reply_sent'), 'success');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ------------------------------------------------------------------ sections */
function deficiencyHistory() {
  const list = app.deficiencies || [];
  const files = app.responses || [];
  return card('iapp.def_title', 'alert',
    el('div', { class: 'card-body' }, list.length ? [...list].reverse().map((d) => el('div', { class: 'def-block' },
      el('div', { class: 'row between' },
        el('strong', {}, t('iapp.def_raised', { date: fmtDate(d.raised_at), stage: metaLabel('stages', d.stage) })),
        d.status === 'OPEN' ? el('span', { class: 'badge b-warning' }, t('iapp.def_open')) : el('span', { class: 'badge b-success' }, t('iapp.def_done', { date: fmtDate(d.responded_at) }))),
      el('ul', { class: 'def-items' }, (d.items || []).map((i) => el('li', {}, itemText(i)))),
      d.reason ? el('p', { class: 'small', style: { margin: '6px 0 0' } }, el('strong', {}, `${t('iapp.reply_reason')}: `), d.reason) : null,
      el('p', { class: 'small', style: { margin: '4px 0 0' } }, el('strong', {}, `${t('iapp.reply_due')}: `), fmtDate(d.reply_due)),
      d.response_note ? el('p', { class: 'small', style: { margin: '4px 0 0' } }, el('strong', {}, `${t('iapp.reply_note')}: `), d.response_note) : null,
      d.letter_id ? el('p', { class: 'small', style: { margin: '6px 0 0' } }, el('a', { href: site(`letter.html?id=${d.letter_id}`) }, t('iapp.def_letter'))) : null))
      : el('p', { class: 'text-2 mb-0' }, t('iapp.def_none')),
    list.length && files.length ? el('div', { style: { marginTop: '6px' } }, el('div', { class: 'small', style: { fontWeight: '700' } }, t('iapp.def_files')),
      el('ul', { class: 'list-plain' }, files.map((f) => el('li', { class: 'file-line' }, el('span', { html: icon('file', 15) }),
        f.file ? el('a', { href: fileUrl(f.file), target: '_blank', rel: 'noopener' }, f.file.filename) : f.title,
        el('span', { class: 'muted small' }, `${fmtDateTime(f.uploaded_at)}${f.file ? ` · ${fmtBytes(f.file.size)}` : ''}`))))) : null));
}

function evcCard() {
  const e = app.evc;
  let content;
  if (!e || e.status === 'CANCELLED') {
    content = el('p', { class: 'text-2 mb-0' }, e ? t('iapp.evc_cancelled') : t('iapp.evc_none'));
  } else if (e.status === 'QUEUED' || !e.visit_date) {
    content = el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('hourglass', 18) }), el('div', {}, t('iapp.evc_queued', { date: fmtDate(e.schedule_by) })));
  } else {
    content = el('div', { class: 'stack' },
      dl([[t('iapp.evc_sched'), `<strong>${esc(fmtDate(e.visit_date))}</strong>`],
        [t('iapp.evc_panel'), esc((e.panel || []).map((p) => `${p.name}${e.convener && e.convener.id === p.id ? ` (${t('iapp.evc_convener')})` : ''}`).join(', ') || '—')]]),
      e.status === 'COMPLETED' ? el('p', { class: 'text-2 mb-0' }, t('iapp.evc_done')) : null);
  }
  return card('iapp.evc_title', 'users', el('div', { class: 'card-body' }, content));
}

function decisionCard() {
  const d = app.decision;
  if (!d) return null;
  return card('iapp.dec_title', 'stamp', el('div', { class: 'card-body' }, dl([
    [t('iapp.dec_outcome'), `<strong>${esc(metaLabel('decisions', d.outcome))}</strong>`],
    [t('iapp.dec_at'), esc(fmtDate(d.decided_at))],
    [t('iapp.dec_by'), esc(d.decided_by ? `${d.decided_by.name}, ${d.decided_by.designation}` : '—')],
    d.remarks ? [t('iapp.dec_remarks'), esc(d.remarks)] : null,
  ])));
}

function undertakingsCard() {
  const list = app.undertakings || [];
  return card('iapp.ut_title', 'target',
    el('div', { class: 'card-body flush' }, list.length ? tableIn({
      columns: [
        { key: 'ref_no', label: t('iapp.ut_ref'), render: (u) => `<span class="mono nowrap">${esc(u.ref_no)}</span>` },
        { key: 'condition', label: t('f.condition') },
        { key: 'due_date', label: t('f.due'), render: (u) => `${esc(fmtDate(u.due_date))} ${u.status === 'VERIFIED' ? '' : daysChip(u.days_left)}` },
        { key: 'status', label: t('f.status'), render: (u) => utBadge(u.status, u.overdue) },
      ],
      rows: list,
    }) : el('p', { class: 'text-2', style: { margin: '16px 18px' } }, t('iapp.ut_none'))),
    list.length ? el('div', { class: 'card-foot' }, el('a', { class: 'btn sm secondary', href: site('institution/compliance.html') }, t('iapp.ut_open'))) : null);
}

function lettersCard() {
  const list = app.letters || [];
  return card('iapp.let_title', 'mail',
    el('div', { class: 'card-body flush' }, list.length ? tableIn({
      columns: [
        { key: 'ref_no', label: t('f.ref_no'), render: (l) => `<a class="mono nowrap" href="${esc(site(`letter.html?id=${l.id}`))}">${esc(l.ref_no)}</a>` },
        { key: 'kind', label: t('f.letter'), render: (l) => esc(tl(l.kind_label)) },
        { key: 'subject', label: t('iapp.let_subject'), render: (l) => esc(pick(l.subject, l.subject_hi)) },
        { key: 'issued_at', label: t('f.date'), render: (l) => esc(fmtDate(l.issued_at)) },
      ],
      rows: list,
    }) : el('p', { class: 'text-2', style: { margin: '16px 18px' } }, t('iapp.let_none'))));
}

function timelineCard() {
  const host = el('div');
  const tone = { ESCALATED: 'danger', APP_RETURNED: 'warning', APP_DECIDED: 'success', APP_RESPONDED: 'success', LETTER_ISSUED: 'muted' };
  timeline(host, [...(app.timeline || [])].reverse().map((x) => ({
    title: t(`iapp.act.${x.action}`, { _default: x.action }), meta: `${fmtDateTime(x.at)} · ${x.actor_name}`, body: x.summary, tone: tone[x.action] || '',
  })));
  return card('iapp.tl_title', 'history', el('div', { class: 'card-body' }, host, el('p', { class: 'small muted', style: { margin: '10px 0 0' } }, t('iapp.log_note'))));
}

function sideCards() {
  const a = app;
  const closed = a.stage === 'CLOSED';
  const holder = a.state === 'RETURNED' ? t('iapp.who_inst') : a.holder ? `${a.holder.name} (${a.holder.designation})` : null;
  return [
    card('iapp.facts', 'file-text', el('div', { class: 'card-body' }, dl([
      [t('f.type'), esc(tl(a.app_type_label))],
      [t('f.route'), esc(tl(a.route_label))],
      [t('f.programme'), esc(a.programme || '—')],
      [t('f.intake'), a.intake ? String(a.intake) : '—'],
      [t('f.submitted'), esc(fmtDate(a.submitted_at))],
      [t('iapp.cycle'), String(a.cycle)],
      closed && a.closed_at ? [t('iapp.closed_on'), esc(fmtDate(a.closed_at))] : null,
      a.remarks ? [t('iapp.remarks'), esc(a.remarks)] : null,
    ], { cols: 1 }))),
    card('iapp.who', 'user', el('div', { class: 'card-body stack' },
      holder ? el('div', {}, el('strong', {}, holder)) : el('p', { class: 'text-2 mb-0' }, t('iapp.who_none')),
      !closed && a.due_date ? el('div', {}, `${t('f.due')}: ${fmtDate(a.due_date)} `, el('span', { html: daysChip(a.days_left, { paused: a.paused }) })) : null)),
    card('iapp.links', 'link', el('div', { class: 'card-body stack' },
      el('a', { class: 'btn secondary block', href: site(`staff/case-summary.html?id=${a.id}`), html: `${icon('file-text', 16)}<span>${esc(t('iapp.summary'))}</span>` }),
      el('a', { class: 'btn secondary block', href: site('institution/compliance.html'), html: `${icon('shield-check', 16)}<span>${esc(t('nav.compliance'))}</span>` }),
      el('a', { class: 'btn secondary block', href: site('institution/apply.html'), html: `${icon('plus', 16)}<span>${esc(t('iapp.new_app'))}</span>` }),
      el('a', { class: 'btn ghost block', href: site('institution/dashboard.html') }, t('iapp.dash')))),
  ];
}

function render() {
  if (!app) return;
  const a = app;
  setPageHead({ title: `${t('iapp.title')} · ${a.ref_no}`, subtitle: `${tl(a.app_type_label)} · ${a.programme || ''}` });
  const steps = el('div');
  routeSteps(steps, a.route_steps || []);
  mount(body,
    el('div', { class: 'card accent-top section' }, el('div', { class: 'card-body stack' },
      el('div', { class: 'app-head' }, el('span', { class: 'ref' }, a.ref_no), el('span', { html: stateBadge(a.state) }), el('span', { html: flagChips((a.flags || []).filter((f) => f !== 'INTEGRATION')) })),
      whyLine(a.why),
      el('div', {}, el('div', { class: 'small muted', style: { fontWeight: '600', marginBottom: '2px' } }, t('iapp.progress')), steps))),
    el('div', { class: 'as-split' },
      el('div', { class: 'stack lg' },
        (a.allowed_actions || []).includes('respond') ? replyCard() : null,
        deficiencyHistory(), evcCard(), decisionCard(), undertakingsCard(), lettersCard(), timelineCard()),
      el('div', { class: 'stack lg' }, ...sideCards())));
}

async function load() {
  if (!id) { emptyState(body, { icon: 'file', title: t('iapp.none_title'), text: t('iapp.none_text') }); return; }
  loading(body);
  try {
    app = await api.get(`/applications/${encodeURIComponent(id)}`);
    render();
  } catch (e) {
    errorState(body, e, load);
  }
}

onLang(render);
load();
