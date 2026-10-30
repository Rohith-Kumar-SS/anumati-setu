// Case workspace: one application with its route, pre-check, deficiencies, EVC, committee, decision, documents,
// letters, notes and timeline, plus every workflow action the signed-in officer is allowed (allowed_actions).
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site, apiUrl, getToken } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, mount, loading, emptyState, errorState, toast, withBusy, getParam, setParams, tabs, dl, timeline,
  renderTable, stateBadge, stageBadge, flagChips, escBadge, daysChip, daysBetween, severityBadge, utBadge, validityBadge,
  verifyBadge, whyLine, routeSteps, fmtDate, fmtDateTime, fmtBytes, initials,
} from '../assets/js/ui.js';
import { field, textarea, errorLine, pick, regionName, roleLabel } from './casekit.js';
import { openAction, ACTION_LABEL } from './application-actions.js';

/* ------------------------------------------------------------------ strings */
const ACTIONS = {
  APP_SUBMITTED: ['Application submitted', 'आवेदन प्रस्तुत'],
  AUTO_ROUTED: ['Routed automatically', 'स्वतः मार्ग निर्धारित'],
  AUTO_ASSIGNED: ['Assigned automatically', 'स्वतः नियत'],
  AUTO_ADVANCED: ['Moved to the next stage automatically', 'स्वतः अगले चरण में गया'],
  AUTO_RESUMED: ['Stage clock resumed', 'चरण-घड़ी पुनः आरंभ'],
  SCRUTINY_COMPLETED: ['Scrutiny completed', 'संवीक्षा पूर्ण'],
  APP_RETURNED: ['Returned to the institution', 'संस्था को लौटाया गया'],
  APP_RESPONDED: ['Institution replied', 'संस्था का उत्तर प्राप्त'],
  APP_REVERTED: ['Sent back to an earlier stage', 'पिछले चरण में वापस भेजा गया'],
  EVC_SCHEDULED: ['Expert visit scheduled', 'विशेषज्ञ दौरा निर्धारित'],
  EVC_RESCHEDULED: ['Expert visit rescheduled', 'विशेषज्ञ दौरा पुनः निर्धारित'],
  EVC_REPORTED: ['EVC report filed', 'ईवीसी रिपोर्ट दाखिल'],
  COMMITTEE_RECORDED: ['Committee recommendation recorded', 'समिति की अनुशंसा दर्ज'],
  APP_DECIDED: ['Decision recorded', 'निर्णय दर्ज'],
  APP_REASSIGNED: ['Reassigned to another officer', 'अन्य अधिकारी को पुनः नियत'],
  NOTE_ADDED: ['Note added', 'टिप्पणी जोड़ी गई'],
  LETTER_ISSUED: ['Letter issued', 'पत्र जारी'],
  ESCALATED: ['Escalated', 'वृद्धि हुई'],
  ESCALATION_ACK: ['Escalation acknowledged', 'वृद्धि स्वीकार की गई'],
  REMINDER_SENT: ['Reminder sent', 'अनुस्मारक भेजा गया'],
  UNDERTAKING_CREATED: ['Undertaking created', 'वचनबद्धता बनाई गई'],
  INTEGRATION_IMPORT: ['Imported from the AICTE feed (mock)', 'एआईसीटीई फ़ीड से आयातित (मॉक)'],
};
const OUTCOMES = {
  COMPLETED: ['Completed', 'पूर्ण'], RESPONDED: ['Institution replied', 'संस्था ने उत्तर दिया'], DECIDED: ['Decided', 'निर्णय हुआ'],
  REVERTED: ['Sent back', 'वापस भेजा गया'], '': ['Open', 'चालू'],
};
const EVC_STATUS = { QUEUED: ['Awaiting schedule', 'निर्धारण प्रतीक्षित'], SCHEDULED: ['Scheduled', 'निर्धारित'], COMPLETED: ['Completed', 'पूर्ण'], CANCELLED: ['Cancelled', 'रद्द'] };
const EVC_FLAGS = { SCHEDULE_DUE: ['Schedule due soon', 'निर्धारण शीघ्र नियत'], SCHEDULE_OVERDUE: ['Scheduling overdue', 'निर्धारण अतिदेय'], COMPLETE_OVERDUE: ['Visit or report overdue', 'दौरा या रिपोर्ट अतिदेय'] };
const NOTE_KINDS = { NOTE: ['Note', 'टिप्पणी'], OBSERVATION: ['Observation', 'अवलोकन'], REVERT: ['Sent back', 'वापस भेजा गया'] };
const DEF_STATUS = { OPEN: ['Awaiting reply', 'उत्तर प्रतीक्षित'], RESPONDED: ['Replied', 'उत्तर प्राप्त'] };
const DOC_STATUS = { CURRENT: ['Current', 'वर्तमान'], SUPERSEDED: ['Superseded', 'प्रतिस्थापित'] };

const gen = (prefix, map) => {
  const en = {}; const hi = {};
  for (const [k, [e, h]] of Object.entries(map)) { en[`${prefix}.${k}`] = e; hi[`${prefix}.${k}`] = h; }
  return [en, hi];
};
const dicts = [['case.act', ACTIONS], ['case.out', OUTCOMES], ['case.evs', EVC_STATUS], ['case.evf', EVC_FLAGS], ['case.nk', NOTE_KINDS], ['case.ds', DEF_STATUS], ['case.docs', DOC_STATUS]].map(([p, m]) => gen(p, m));

extend({
  en: Object.assign({
    'case.title': 'Case workspace',
    'case.subtitle': 'Everything about this application in one place',
    'case.route': 'Route and progress',
    'case.no_id': 'No application selected',
    'case.no_id_text': 'Open a case from the applications list.',
    'case.t.overview': 'Overview',
    'case.t.precheck': 'Pre-check',
    'case.t.deficiencies': 'Deficiencies',
    'case.t.evc': 'Expert visit',
    'case.t.committee': 'Committee',
    'case.t.decision': 'Decision',
    'case.t.documents': 'Documents',
    'case.t.letters': 'Letters',
    'case.t.notes': 'Notes',
    'case.t.timeline': 'Timeline',
    'case.note_btn': 'Add note',
    'case.ov.facts': 'Application',
    'case.ov.clock': 'Stage clock',
    'case.ov.clock_hint': 'AICTE days exclude the days the case waited with the institution.',
    'case.clock.stage': 'Stage',
    'case.clock.started': 'Started',
    'case.clock.due': 'Due',
    'case.clock.sla': 'Allowed (days)',
    'case.clock.paused': 'Paused (days)',
    'case.clock.used': 'Days used',
    'case.clock.ended': 'Ended',
    'case.clock.outcome': 'Outcome',
    'case.f.institution': 'Institution',
    'case.f.programme': 'Programme',
    'case.f.intake': 'Intake',
    'case.f.year': 'Academic year',
    'case.f.cycle': 'Scrutiny cycle',
    'case.f.submitted': 'Submitted',
    'case.f.age': 'Age of application',
    'case.f.held': 'Days held at this stage',
    'case.f.rules': 'Rulebook version',
    'case.f.remarks': 'Institution remarks',
    'case.f.closed': 'Closed',
    'case.days': '{n} days',
    'case.pre.intro': 'System findings for the scrutiny officer. They are not decisions: the officer checks and decides.',
    'case.pre.now': 'On record today',
    'case.pre.at_submission': 'When the application was submitted',
    'case.pre.empty': 'No pre-check findings',
    'case.def.empty': 'No deficiencies raised',
    'case.def.empty_text': 'If scrutiny finds something missing, the case is returned with reasons and appears here.',
    'case.def.raised': 'Raised {date} by {name}',
    'case.def.items': 'Deficiencies',
    'case.def.reason': 'Reason given',
    'case.def.reply_due': 'Reply due',
    'case.def.response': 'Institution reply',
    'case.def.responded': 'Replied on {date}',
    'case.def.letter': 'Deficiency letter',
    'case.def.stage': 'Raised at stage: {stage}',
    'case.evc.none': 'No expert visit for this application yet',
    'case.evc.none_text': 'The visit is queued once scrutiny is complete.',
    'case.evc.schedule_by': 'Schedule by',
    'case.evc.complete_by': 'Complete by',
    'case.evc.visit': 'Visit date',
    'case.evc.convener': 'Convener',
    'case.evc.scheduled': 'Scheduled by',
    'case.evc.resched': 'Reschedules',
    'case.evc.override': 'Override reason',
    'case.evc.panel': 'Panel',
    'case.evc.report': 'EVC report',
    'case.evc.report_at': 'Filed {date}',
    'case.evc.report_none': 'Report not filed yet',
    'case.evc.rec': 'Recommendation',
    'case.evc.findings': 'Findings',
    'case.evc.conditions': 'Proposed conditions',
    'case.evc.cond_text': 'Condition',
    'case.evc.cond_cat': 'Category',
    'case.evc.cond_days': 'Due in (days)',
    'case.evc.status': 'Visit status',
    'case.evc.open_assistant': 'Open scheduling assistant',
    'case.com.empty': 'No committee recommendation recorded',
    'case.com.empty_text': 'The SAC/SHC records its recommendation after the expert visit.',
    'case.com.meeting': 'Meeting {date}',
    'case.com.by': 'Recorded by {name} on {date}',
    'case.dec.pending': 'Decision pending',
    'case.dec.pending_text': 'The competent authority decides after scrutiny, the expert visit and the committee, as the route requires.',
    'case.dec.by': 'Decided by {name} on {date}',
    'case.dec.remarks': 'Remarks',
    'case.dec.uts': 'Undertakings from this decision',
    'case.dec.uts_none': 'No undertakings: the approval carries no conditions.',
    'case.ut.ref': 'Undertaking',
    'case.ut.condition': 'Condition',
    'case.ut.cat': 'Category',
    'case.ut.due': 'Due',
    'case.ut.status': 'Status',
    'case.doc.on_record': 'Documents on record for this institution',
    'case.doc.replies': 'Replies uploaded by the institution',
    'case.doc.none': 'No documents',
    'case.doc.none_text': 'Prescribed documents appear here once the institution uploads them.',
    'case.doc.type': 'Document',
    'case.doc.valid_until': 'Valid until',
    'case.doc.validity': 'Validity',
    'case.doc.verification': 'Verification',
    'case.doc.file': 'File',
    'case.doc.uploaded': 'Uploaded',
    'case.doc.renewal': 'Renewal pending',
    'case.let.none': 'No letters issued yet',
    'case.let.none_text': 'Deficiency, intimation, decision and compliance letters appear here.',
    'case.let.ref': 'Letter no.',
    'case.let.kind': 'Kind',
    'case.let.subject': 'Subject',
    'case.let.issued': 'Issued',
    'case.let.by': 'Issued by',
    'case.let.revoked': 'Revoked',
    'case.let.open': 'Open letter',
    'case.note.label': 'Add a note to this case',
    'case.note.hint': 'Notes are visible to officers of this case, not to the institution.',
    'case.note.ph': 'Write an observation or a reminder for the next officer',
    'case.note.empty': 'No notes yet',
    'case.note.added': 'Note added',
    'case.note.short': 'Please write at least 2 characters.',
    'case.tl.newest': 'Newest first. Every step is recorded in the tamper-evident audit trail.',
    'case.side.who': 'Who has it',
    'case.side.with_inst': 'With the institution',
    'case.side.with_inst_text': 'The AICTE stage clock is paused until the institution replies.',
    'case.side.closed': 'Closed',
    'case.side.stage': 'Stage',
    'case.side.due': 'Due',
    'case.side.held': 'Days held',
    'case.side.escalation': 'Escalation',
    'case.side.esc_open': 'See escalations',
    'case.side.reply_due': 'Reply due',
    'case.side.links': 'Related',
    'case.side.summary': 'One-page case summary',
    'case.side.institution': 'Institution profile',
    'case.side.inst_apps': 'All applications of this institution',
    'case.side.letters': 'Letters for this case',
    'case.badge.cycle': 'Cycle {n}',
    'case.file_new': 'opens in a new tab',
    'case.acts': 'Actions',
  }, ...dicts.map((d) => d[0])),
  hi: Object.assign({
    'case.title': 'मामला कार्यक्षेत्र',
    'case.subtitle': 'इस आवेदन की पूरी जानकारी एक स्थान पर',
    'case.route': 'मार्ग और प्रगति',
    'case.no_id': 'कोई आवेदन चुना नहीं गया',
    'case.no_id_text': 'आवेदन सूची से कोई मामला खोलें।',
    'case.t.overview': 'अवलोकन',
    'case.t.precheck': 'पूर्व-जाँच',
    'case.t.deficiencies': 'कमियाँ',
    'case.t.evc': 'विशेषज्ञ दौरा',
    'case.t.committee': 'समिति',
    'case.t.decision': 'निर्णय',
    'case.t.documents': 'दस्तावेज़',
    'case.t.letters': 'पत्र',
    'case.t.notes': 'टिप्पणियाँ',
    'case.t.timeline': 'समयरेखा',
    'case.note_btn': 'टिप्पणी जोड़ें',
    'case.ov.facts': 'आवेदन',
    'case.ov.clock': 'चरण-घड़ी',
    'case.ov.clock_hint': 'एआईसीटीई के दिनों में वे दिन शामिल नहीं हैं जब मामला संस्था के पास प्रतीक्षारत था।',
    'case.clock.stage': 'चरण',
    'case.clock.started': 'आरंभ',
    'case.clock.due': 'नियत',
    'case.clock.sla': 'अनुमत (दिन)',
    'case.clock.paused': 'रुके हुए (दिन)',
    'case.clock.used': 'प्रयुक्त दिन',
    'case.clock.ended': 'समाप्त',
    'case.clock.outcome': 'परिणाम',
    'case.f.institution': 'संस्था',
    'case.f.programme': 'कार्यक्रम',
    'case.f.intake': 'प्रवेश क्षमता',
    'case.f.year': 'शैक्षणिक वर्ष',
    'case.f.cycle': 'संवीक्षा चक्र',
    'case.f.submitted': 'प्रस्तुत',
    'case.f.age': 'आवेदन की आयु',
    'case.f.held': 'इस चरण में दिन',
    'case.f.rules': 'नियम-पुस्तिका संस्करण',
    'case.f.remarks': 'संस्था की टिप्पणी',
    'case.f.closed': 'बंद हुआ',
    'case.days': '{n} दिन',
    'case.pre.intro': 'संवीक्षा अधिकारी के लिए प्रणाली के निष्कर्ष। ये निर्णय नहीं हैं: जाँच और निर्णय अधिकारी करता है।',
    'case.pre.now': 'आज अभिलेख में',
    'case.pre.at_submission': 'आवेदन प्रस्तुत करते समय',
    'case.pre.empty': 'कोई पूर्व-जाँच निष्कर्ष नहीं',
    'case.def.empty': 'कोई कमी दर्ज नहीं',
    'case.def.empty_text': 'यदि संवीक्षा में कुछ अनुपलब्ध मिलता है तो मामला कारण सहित लौटाया जाता है और यहाँ दिखता है।',
    'case.def.raised': '{date} को {name} द्वारा दर्ज',
    'case.def.items': 'कमियाँ',
    'case.def.reason': 'बताया गया कारण',
    'case.def.reply_due': 'उत्तर की नियत तिथि',
    'case.def.response': 'संस्था का उत्तर',
    'case.def.responded': '{date} को उत्तर दिया',
    'case.def.letter': 'कमी पत्र',
    'case.def.stage': 'दर्ज करते समय चरण: {stage}',
    'case.evc.none': 'इस आवेदन के लिए अभी कोई विशेषज्ञ दौरा नहीं',
    'case.evc.none_text': 'संवीक्षा पूर्ण होने पर दौरा कतार में लगता है।',
    'case.evc.schedule_by': 'निर्धारण तक',
    'case.evc.complete_by': 'पूर्ण होने तक',
    'case.evc.visit': 'दौरे की तिथि',
    'case.evc.convener': 'संयोजक',
    'case.evc.scheduled': 'निर्धारित करने वाले',
    'case.evc.resched': 'पुनर्निर्धारण',
    'case.evc.override': 'अधिभावी का कारण',
    'case.evc.panel': 'पैनल',
    'case.evc.report': 'ईवीसी रिपोर्ट',
    'case.evc.report_at': '{date} को दाखिल',
    'case.evc.report_none': 'रिपोर्ट अभी दाखिल नहीं हुई',
    'case.evc.rec': 'अनुशंसा',
    'case.evc.findings': 'निष्कर्ष',
    'case.evc.conditions': 'प्रस्तावित शर्तें',
    'case.evc.cond_text': 'शर्त',
    'case.evc.cond_cat': 'श्रेणी',
    'case.evc.cond_days': 'नियत (दिनों में)',
    'case.evc.status': 'दौरे की स्थिति',
    'case.evc.open_assistant': 'निर्धारण सहायक खोलें',
    'case.com.empty': 'समिति की कोई अनुशंसा दर्ज नहीं',
    'case.com.empty_text': 'एसएसी/एसएचसी विशेषज्ञ दौरे के बाद अपनी अनुशंसा दर्ज करती है।',
    'case.com.meeting': 'बैठक {date}',
    'case.com.by': '{name} द्वारा {date} को दर्ज',
    'case.dec.pending': 'निर्णय लंबित',
    'case.dec.pending_text': 'मार्ग की आवश्यकता के अनुसार संवीक्षा, विशेषज्ञ दौरे और समिति के बाद सक्षम प्राधिकारी निर्णय लेता है।',
    'case.dec.by': '{name} द्वारा {date} को निर्णय',
    'case.dec.remarks': 'टिप्पणी',
    'case.dec.uts': 'इस निर्णय की वचनबद्धताएँ',
    'case.dec.uts_none': 'कोई वचनबद्धता नहीं: अनुमोदन के साथ कोई शर्त नहीं है।',
    'case.ut.ref': 'वचनबद्धता',
    'case.ut.condition': 'शर्त',
    'case.ut.cat': 'श्रेणी',
    'case.ut.due': 'नियत',
    'case.ut.status': 'स्थिति',
    'case.doc.on_record': 'इस संस्था के अभिलेख में दस्तावेज़',
    'case.doc.replies': 'संस्था द्वारा अपलोड किए गए उत्तर',
    'case.doc.none': 'कोई दस्तावेज़ नहीं',
    'case.doc.none_text': 'संस्था द्वारा अपलोड करने पर निर्धारित दस्तावेज़ यहाँ दिखेंगे।',
    'case.doc.type': 'दस्तावेज़',
    'case.doc.valid_until': 'वैध तिथि तक',
    'case.doc.validity': 'वैधता',
    'case.doc.verification': 'सत्यापन',
    'case.doc.file': 'फ़ाइल',
    'case.doc.uploaded': 'अपलोड',
    'case.doc.renewal': 'नवीनीकरण लंबित',
    'case.let.none': 'अभी कोई पत्र जारी नहीं',
    'case.let.none_text': 'कमी, सूचना, निर्णय और अनुपालन पत्र यहाँ दिखेंगे।',
    'case.let.ref': 'पत्र सं.',
    'case.let.kind': 'प्रकार',
    'case.let.subject': 'विषय',
    'case.let.issued': 'जारी',
    'case.let.by': 'जारीकर्ता',
    'case.let.revoked': 'निरस्त',
    'case.let.open': 'पत्र खोलें',
    'case.note.label': 'इस मामले में टिप्पणी जोड़ें',
    'case.note.hint': 'टिप्पणियाँ इस मामले के अधिकारियों को दिखती हैं, संस्था को नहीं।',
    'case.note.ph': 'अगले अधिकारी के लिए कोई अवलोकन या अनुस्मारक लिखें',
    'case.note.empty': 'अभी कोई टिप्पणी नहीं',
    'case.note.added': 'टिप्पणी जोड़ी गई',
    'case.note.short': 'कृपया कम से कम 2 अक्षर लिखें।',
    'case.tl.newest': 'नवीनतम पहले। हर चरण छेड़छाड़-प्रमाणित ऑडिट ट्रेल में दर्ज है।',
    'case.side.who': 'किसके पास है',
    'case.side.with_inst': 'संस्था के पास',
    'case.side.with_inst_text': 'संस्था के उत्तर तक एआईसीटीई की चरण-घड़ी रुकी है।',
    'case.side.closed': 'बंद',
    'case.side.stage': 'चरण',
    'case.side.due': 'नियत',
    'case.side.held': 'रखे गए दिन',
    'case.side.escalation': 'वृद्धि',
    'case.side.esc_open': 'वृद्धियाँ देखें',
    'case.side.reply_due': 'उत्तर की नियत तिथि',
    'case.side.links': 'संबंधित',
    'case.side.summary': 'एक-पृष्ठ मामला सारांश',
    'case.side.institution': 'संस्था का प्रोफ़ाइल',
    'case.side.inst_apps': 'इस संस्था के सभी आवेदन',
    'case.side.letters': 'इस मामले के पत्र',
    'case.badge.cycle': 'चक्र {n}',
    'case.file_new': 'नए टैब में खुलता है',
    'case.acts': 'कार्रवाइयाँ',
  }, ...dicts.map((d) => d[1])),
});

/* ------------------------------------------------------------------ page */
const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'applications',
  title: 'case.title',
  subtitle: 'case.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.applications', href: 'staff/applications.html' }, { label: 'case.title' }],
});

const appId = Number(getParam('id'));
let app = null;
let activeTab = getParam('tab') || 'overview';

const stateEl = $('#case-state');
const headCard = $('#case-head-card');
const headEl = $('#case-head');
const whyEl = $('#case-why');
const routeCard = $('#case-route-card');
const routeEl = $('#case-route');
const splitEl = $('#case-split');
const mainEl = $('#case-main');
const sideEl = $('#case-side');

const today = () => meta.today;
const tt = (prefix, key, def) => t(`${prefix}.${key}`, { _default: def ?? key });
const fileLink = (f) => (f ? `<span class="case-file"><a href="${esc(apiUrl(f.url, { token: getToken() }))}" target="_blank" rel="noopener">${esc(f.filename)}<span class="sr-only"> (${esc(t('case.file_new'))})</span></a> <span class="muted small">${esc(fmtBytes(f.size))}</span></span>` : '—');
const userLine = (u) => (u ? `${esc(u.name)} <span class="muted small">(${esc(roleLabel(u.role))})</span>` : '—');
const section = (title, ...children) => el('div', { class: 'case-section' }, title ? el('h3', {}, title) : null, ...children);
const badge = (cls, text) => `<span class="badge ${cls}">${esc(text)}</span>`;
const hasStage = (s) => (meta.routes[app.route] || { stages: [] }).stages.includes(s);

/* ------------------------------------------------------------------ head, why, route, side */
const TOOLBAR = [
  ['complete_scrutiny', 'success', 'check-circle'], ['schedule_evc', '', 'calendar'], ['evc_report', '', 'file-check'], ['committee', '', 'users'],
  ['decide', 'saffron', 'stamp'], ['return', 'warning', 'arrow-left'], ['revert', 'secondary', 'history'], ['reassign', 'secondary', 'users'],
];

function openNotesTab() {
  activeTab = 'notes';
  renderMain();
  const area = $('#note-text');
  if (area) { area.scrollIntoView({ block: 'center' }); area.focus(); }
}

function renderHead() {
  headCard.hidden = false;
  const allowed = app.allowed_actions || [];
  const buttons = TOOLBAR.filter(([k]) => allowed.includes(k)).map(([k, variant, ic]) => {
    const label = k === 'schedule_evc' && app.state === 'EVC_SCHEDULED' ? t('act.evc.resched') : t(ACTION_LABEL[k]);
    return el('button', { class: `btn ${variant}`.trim(), type: 'button', html: `${icon(ic, 16)} ${esc(label)}`, onclick: () => openAction(k, ctx()) });
  });
  if (allowed.includes('note')) buttons.push(el('button', { class: 'btn ghost', type: 'button', html: `${icon('edit', 16)} ${esc(t('case.note_btn'))}`, onclick: openNotesTab }));
  mount(headEl, el('div', { class: 'case-head' },
    el('div', {},
      el('h2', { id: 'case-inst' }, el('a', { href: site(`staff/institution.html?id=${app.institution.id}`) }, app.institution.name)),
      el('div', { class: 'case-sub' }, `${app.institution.pid} · ${app.institution.city}, ${app.institution.state} · ${regionName(app.institution.region)}`),
      el('div', { class: 'case-badges', html: `${stateBadge(app.state)} ${flagChips(app.flags)} ${app.cycle > 1 ? badge('b-info', t('case.badge.cycle', { n: app.cycle })) : ''}` })),
    buttons.length ? el('div', { class: 'case-toolbar', role: 'group', 'aria-label': t('case.acts') }, buttons) : null));
  setPageHead({
    title: app.ref_no,
    subtitle: { en: `${app.app_type_label.en} · ${app.institution.name}`, hi: `${app.app_type_label.hi} · ${app.institution.name}` },
    breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.applications', href: 'staff/applications.html' }, { label: app.ref_no }],
  });
}

function renderRoute() {
  routeCard.hidden = false;
  $('#route-badge').textContent = tl(app.route_label);
  routeSteps(routeEl, app.route_steps);
}

function renderSide() {
  const open = (app.deficiencies || []).find((d) => d.status === 'OPEN');
  const closed = !!app.closed_at;
  const holder = app.holder;
  const step = app.route_steps.find((s) => s.state === 'current' || s.state === 'returned');
  const who = closed
    ? el('div', { class: 'stack sm' },
      el('div', { html: `${stateBadge(app.state)}` }),
      el('div', { class: 'case-sub' }, `${t('case.f.closed')}: ${fmtDateTime(app.closed_at)}`),
      app.decision && app.decision.decided_by ? el('div', { class: 'small' }, t('case.dec.by', { name: app.decision.decided_by.name, date: fmtDate(app.decision.decided_at) })) : null)
    : holder
      ? el('div', { class: 'case-who' }, el('span', { class: 'avatar lg', 'aria-hidden': 'true' }, initials(holder.name)),
        el('div', {}, el('b', {}, holder.name), el('div', { class: 'case-sub' }, roleLabel(holder.role)), el('div', { class: 'case-sub' }, holder.designation)))
      : el('div', { class: 'stack sm' }, el('b', {}, t('case.side.with_inst')), el('div', { class: 'case-sub' }, t('case.side.with_inst_text')));
  const pairs = [];
  if (!closed) {
    pairs.push([t('case.side.stage'), stageBadge(app.stage)]);
    if (app.state === 'RETURNED' && open) pairs.push([t('case.side.reply_due'), `${esc(fmtDate(open.reply_due))} ${daysChip(daysBetween(today(), open.reply_due))}`]);
    else pairs.push([t('case.side.due'), `${esc(fmtDate(app.due_date))} ${daysChip(app.days_left, { paused: app.paused })}`]);
    if (step && step.sla_days) pairs.push([t('case.side.held'), `${esc(String(step.days_used ?? 0))} / ${esc(String(step.sla_days))}`]);
    if (app.escalation_level) pairs.push([t('case.side.escalation'), `${escBadge(app.escalation_level)} <a href="${esc(site('staff/escalations.html'))}">${esc(t('case.side.esc_open'))}</a>`]);
  }
  mount(sideEl,
    el('section', { class: 'card', 'aria-labelledby': 'side-who' },
      el('div', { class: 'card-head' }, el('h2', { id: 'side-who', class: 'mb-0' }, t('case.side.who'))),
      el('div', { class: 'card-body stack' }, who, pairs.length ? dl(pairs, { cols: 1 }) : null)),
    el('section', { class: 'card', 'aria-labelledby': 'side-links' },
      el('div', { class: 'card-head' }, el('h2', { id: 'side-links', class: 'mb-0' }, t('case.side.links'))),
      el('div', { class: 'card-body stack sm' },
        el('a', { class: 'btn secondary', href: site(`staff/case-summary.html?id=${app.id}`), html: `${icon('file-text', 16)} ${esc(t('case.side.summary'))}` }),
        el('a', { class: 'btn secondary', href: site(`staff/institution.html?id=${app.institution.id}`), html: `${icon('building', 16)} ${esc(t('case.side.institution'))}` }),
        el('a', { class: 'btn secondary', href: site(`staff/applications.html?institution_id=${app.institution.id}`), html: `${icon('list', 16)} ${esc(t('case.side.inst_apps'))}` }))));
}

/* ------------------------------------------------------------------ tab panes */
function overviewPane(panel) {
  const a = app;
  const step = a.route_steps.find((s) => s.state === 'current' || s.state === 'returned');
  const pairs = [
    [t('f.ref_no'), `<b>${esc(a.ref_no)}</b>`],
    [t('case.f.institution'), `<a href="${esc(site(`staff/institution.html?id=${a.institution.id}`))}">${esc(a.institution.name)}</a> <span class="muted small">${esc(a.institution.pid)}</span>`],
    [t('f.region'), esc(regionName(a.institution.region))],
    [t('f.type'), esc(tl(a.app_type_label))],
    [t('f.route'), esc(tl(a.route_label))],
    [t('case.f.programme'), esc(a.programme)],
    a.intake ? [t('case.f.intake'), esc(String(a.intake))] : null,
    [t('case.f.year'), esc(a.academic_year || '—')],
    [t('f.state'), stateBadge(a.state)],
    [t('f.stage'), stageBadge(a.stage)],
    [t('case.f.cycle'), esc(String(a.cycle))],
    [t('case.f.submitted'), esc(fmtDateTime(a.submitted_at))],
    [t('case.f.age'), esc(t('case.days', { n: a.age_days }))],
    a.closed_at ? [t('case.f.closed'), esc(fmtDateTime(a.closed_at))] : [t('case.f.held'), esc(step ? `${step.days_used ?? 0} / ${step.sla_days}` : '—')],
    a.closed_at ? null : [t('f.due'), `${esc(fmtDate(a.due_date))} ${daysChip(a.days_left, { paused: a.paused })}`],
    [t('case.f.rules'), esc(`v${a.rule_version}`)],
    a.remarks ? [t('case.f.remarks'), `<span class="case-pre">${esc(a.remarks)}</span>`] : null,
  ];
  const clockBox = el('div');
  mount(panel, el('div', { class: 'case-tabpane' },
    section(t('case.ov.facts'), dl(pairs, { cols: 2 })),
    section(t('case.ov.clock'), el('p', { class: 'case-sub mb-0' }, t('case.ov.clock_hint')), clockBox)));
  renderTable(clockBox, {
    compact: true,
    columns: [
      { key: 'stage', label: t('case.clock.stage'), render: (r) => `<b>${esc(tl(r.stage_label))}</b><div class="cell-sub">${r.holder ? esc(r.holder.name) : esc(t('case.side.with_inst'))}</div>` },
      { key: 'start', label: t('case.clock.started'), render: (r) => esc(fmtDate(r.started_at)) },
      { key: 'due', label: t('case.clock.due'), render: (r) => `${esc(fmtDate(r.due_date))}${r.late ? ` ${badge('b-danger', t('flag.OVERDUE'))}` : ''}` },
      { key: 'sla', label: t('case.clock.sla'), align: 'right', render: (r) => esc(String(r.sla_days)) },
      { key: 'paused', label: t('case.clock.paused'), align: 'right', render: (r) => esc(String(r.paused_days || 0)) },
      { key: 'used', label: t('case.clock.used'), align: 'right', render: (r) => esc(String(r.days_used)) },
      { key: 'end', label: t('case.clock.ended'), render: (r) => (r.ended_at ? esc(fmtDate(r.ended_at)) : '—') },
      { key: 'outcome', label: t('case.clock.outcome'), render: (r) => esc(tt('case.out', r.outcome || '', r.outcome)) },
    ],
    rows: app.runs || [],
  });
}

function precheckPane(panel) {
  const list = (items) => (items && items.length
    ? el('div', { class: 'list-divided' }, items.map((p) => el('div', { class: 'list-item' }, el('div', { class: 'li-main', html: `${severityBadge(p.severity)} <span>${esc(pick(p.en, p.hi))}</span>` }))))
    : el('div', { class: 'small muted' }, t('case.pre.empty')));
  mount(panel, el('div', { class: 'case-tabpane' },
    el('p', { class: 'case-sub' }, t('case.pre.intro')),
    section(t('case.pre.now'), list(app.precheck)),
    section(t('case.pre.at_submission'), list(app.precheck_at_submission))));
}

function deficienciesPane(panel) {
  const defs = app.deficiencies || [];
  if (!defs.length) { emptyState(panel, { icon: 'check-circle', title: t('case.def.empty'), text: t('case.def.empty_text') }); return; }
  mount(panel, el('div', { class: 'case-tabpane' }, [...defs].reverse().map((d) => {
    const open = d.status === 'OPEN';
    return el('div', { class: 'case-item' },
      el('div', { class: 'row between' },
        el('h3', {}, t('case.def.raised', { date: fmtDate(d.raised_at), name: d.raised_by ? d.raised_by.name : '—' })),
        el('span', { html: badge(open ? 'b-warning' : 'b-success', tt('case.ds', d.status)) })),
      el('div', { class: 'case-sub' }, t('case.def.stage', { stage: t(`stage.${d.stage}`, { _default: d.stage }) })),
      el('ul', { class: 'list-plain mt-0' }, d.items.map((it) => {
        const std = meta.deficiency_codes[it.code];
        const stdEn = std ? std.en : '';
        return el('li', { html: `<span class="badge b-slate">${esc(it.code)}</span> <b>${esc(std ? tl(std) : it.text)}</b>${it.text && it.text !== stdEn ? `<div class="case-sub">${esc(it.text)}</div>` : ''}` });
      })),
      dl([
        [t('case.def.reason'), `<span class="case-pre">${esc(d.reason)}</span>`],
        [t('case.def.reply_due'), `${esc(fmtDate(d.reply_due))}${open ? ` ${daysChip(daysBetween(today(), d.reply_due))}` : ''}`],
        d.responded_at ? [t('case.def.response'), `<div class="case-sub">${esc(t('case.def.responded', { date: fmtDateTime(d.responded_at) }))}</div><span class="case-pre">${esc(d.response_note || '—')}</span>`] : null,
        d.letter_id ? [t('case.def.letter'), `<a href="${esc(site(`letter.html?id=${d.letter_id}`))}">${esc(t('case.let.open'))}</a>`] : null,
      ], { cols: 1 }));
  })));
}

function evcPane(panel) {
  const v = app.evc;
  const canSchedule = (app.allowed_actions || []).includes('schedule_evc');
  if (!v) { emptyState(panel, { icon: 'calendar', title: t('case.evc.none'), text: t('case.evc.none_text') }); return; }
  const recBadge = (r) => badge({ RECOMMEND: 'b-success', RECOMMEND_WITH_CONDITIONS: 'b-warning', NOT_RECOMMEND: 'b-danger' }[r] || 'b-slate', tl(meta.evc_recommendations[r]) || r);
  const pairs = [
    [t('case.evc.status'), `${badge({ QUEUED: 'b-violet', SCHEDULED: 'b-teal', COMPLETED: 'b-success', CANCELLED: 'b-slate' }[v.status] || 'b-slate', tt('case.evs', v.status))} ${(v.flags || []).map((f) => badge('b-danger', tt('case.evf', f))).join(' ')}`],
    [t('case.evc.schedule_by'), `${esc(fmtDate(v.schedule_by))}${v.status === 'QUEUED' ? ` ${daysChip(daysBetween(today(), v.schedule_by))}` : ''}`],
    [t('case.evc.complete_by'), `${esc(fmtDate(v.complete_by))}${['QUEUED', 'SCHEDULED'].includes(v.status) ? ` ${daysChip(daysBetween(today(), v.complete_by))}` : ''}`],
    v.visit_date ? [t('case.evc.visit'), esc(fmtDate(v.visit_date))] : null,
    v.convener ? [t('case.evc.convener'), userLine(v.convener)] : null,
    v.scheduled_by ? [t('case.evc.scheduled'), `${userLine(v.scheduled_by)} <span class="muted small">${esc(fmtDate(v.scheduled_at))}</span>`] : null,
    v.reschedules ? [t('case.evc.resched'), esc(String(v.reschedules))] : null,
    v.override_reason ? [t('case.evc.override'), `<span class="case-pre">${esc(v.override_reason)}</span>`] : null,
  ];
  const rows = [section(null, dl(pairs, { cols: 2 }))];
  if (canSchedule) rows.push(section(null, el('button', { class: 'btn secondary', type: 'button', html: `${icon('sparkles', 16)} ${esc(app.state === 'EVC_SCHEDULED' ? t('act.evc.resched') : t('case.evc.open_assistant'))}`, onclick: () => openAction('schedule_evc', ctx()) })));
  if (v.panel && v.panel.length) {
    rows.push(section(t('case.evc.panel'), el('ul', { class: 'list-plain mb-0' }, v.panel.map((u) => el('li', { html: `<b>${esc(u.name)}</b>${v.convener && v.convener.id === u.id ? ` ${badge('b-saffron', t('case.evc.convener'))}` : ''}<div class="case-sub">${esc(u.designation)}</div>` })))));
  }
  const reportBox = el('div');
  if (v.report_at) {
    reportBox.append(
      dl([
        [t('case.evc.rec'), recBadge(v.recommendation)],
        [t('case.evc.report'), esc(t('case.evc.report_at', { date: fmtDateTime(v.report_at) }))],
        [t('case.evc.findings'), `<span class="case-pre">${esc(v.findings)}</span>`],
      ], { cols: 1 }));
    if (v.conditions && v.conditions.length) {
      const holder = el('div', { class: 'mt-0' });
      reportBox.append(el('div', { class: 'label' }, t('case.evc.conditions')), holder);
      renderTable(holder, {
        compact: true,
        columns: [
          { key: 'text', label: t('case.evc.cond_text'), render: (c) => esc(c.text) },
          { key: 'cat', label: t('case.evc.cond_cat'), render: (c) => esc(tl(meta.ut_categories[c.category]) || c.category) },
          { key: 'days', label: t('case.evc.cond_days'), align: 'right', render: (c) => esc(String(c.due_days)) },
        ],
        rows: v.conditions,
      });
    }
  } else if (v.status !== 'CANCELLED') {
    reportBox.append(el('div', { class: 'small muted' }, t('case.evc.report_none')));
  }
  rows.push(section(t('case.evc.report'), reportBox));
  mount(panel, el('div', { class: 'case-tabpane' }, rows));
}

function committeePane(panel) {
  const list = app.committee || [];
  if (!list.length) { emptyState(panel, { icon: 'users', title: t('case.com.empty'), text: t('case.com.empty_text') }); return; }
  mount(panel, el('div', { class: 'case-tabpane' }, [...list].reverse().map((c) => el('div', { class: 'case-item' },
    el('div', { class: 'row between' },
      el('h3', { html: `${badge('b-primary', c.committee)} ${esc(t('case.com.meeting', { date: fmtDate(c.meeting_date) }))}` }),
      el('span', { html: badge({ RECOMMEND: 'b-success', RECOMMEND_WITH_CONDITIONS: 'b-warning', NOT_RECOMMEND: 'b-danger' }[c.recommendation] || 'b-slate', tl(meta.evc_recommendations[c.recommendation]) || c.recommendation) })),
    el('p', { class: 'case-pre mt-0' }, c.remarks || '—'),
    el('div', { class: 'case-sub' }, t('case.com.by', { name: c.recorded_by ? c.recorded_by.name : '—', date: fmtDateTime(c.recorded_at) }))))));
}

function decisionPane(panel) {
  const d = app.decision;
  const uts = app.undertakings || [];
  const body = [];
  if (!d) {
    body.push(el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('hourglass', 18) }), el('div', {}, el('div', { class: 'a-title' }, t('case.dec.pending')), t('case.dec.pending_text'))));
  } else {
    const cls = { APPROVE: 'b-success', APPROVE_CONDITIONAL: 'b-success', REJECT: 'b-danger' }[d.outcome] || 'b-slate';
    body.push(el('div', { class: 'case-item' },
      el('div', { class: 'row between' }, el('h3', { html: badge(cls, tl(meta.decisions[d.outcome]) || d.outcome) }), el('span', { class: 'case-sub' }, fmtDateTime(d.decided_at))),
      d.decided_by ? el('div', { class: 'case-sub mt-0' }, t('case.dec.by', { name: d.decided_by.name, date: fmtDate(d.decided_at) })) : null,
      d.remarks ? dl([[t('case.dec.remarks'), `<span class="case-pre">${esc(d.remarks)}</span>`]], { cols: 1 }) : null));
  }
  const utBox = el('div');
  if (uts.length) {
    renderTable(utBox, {
      compact: true,
      columns: [
        { key: 'ref', label: t('case.ut.ref'), render: (u) => `<a class="cell-main" href="${esc(site(`staff/undertakings.html?id=${u.id}`))}">${esc(u.ref_no)}</a>` },
        { key: 'cond', label: t('case.ut.condition'), render: (u) => esc(u.condition) },
        { key: 'cat', label: t('case.ut.cat'), render: (u) => esc(tl(u.category_label)) },
        { key: 'due', label: t('case.ut.due'), render: (u) => `${esc(fmtDate(u.due_date))}<div>${daysChip(u.days_left)}</div>` },
        { key: 'st', label: t('case.ut.status'), render: (u) => utBadge(u.status, u.overdue) },
      ],
      rows: uts,
    });
  } else if (d) {
    utBox.append(el('div', { class: 'small muted' }, t('case.dec.uts_none')));
  }
  mount(panel, el('div', { class: 'case-tabpane' }, ...body, uts.length || d ? section(t('case.dec.uts'), utBox) : null));
}

function documentsPane(panel) {
  const docs = app.documents || [];
  const resp = app.responses || [];
  if (!docs.length && !resp.length) { emptyState(panel, { icon: 'file', title: t('case.doc.none'), text: t('case.doc.none_text') }); return; }
  const a = el('div'); const b = el('div');
  mount(panel, el('div', { class: 'case-tabpane' },
    docs.length ? section(t('case.doc.on_record'), a) : null,
    resp.length ? section(t('case.doc.replies'), b) : null));
  if (docs.length) {
    renderTable(a, {
      compact: true,
      columns: [
        { key: 'type', label: t('case.doc.type'), render: (d) => `<div class="cell-main">${esc(tl(d.doc_type_label))}</div><div class="cell-sub">${esc(d.title)} · ${esc(tt('case.docs', d.status))}</div>` },
        { key: 'until', label: t('case.doc.valid_until'), render: (d) => (d.valid_until ? `${esc(fmtDate(d.valid_until))}<div>${daysChip(d.days_left)}</div>` : '—') },
        { key: 'val', label: t('case.doc.validity'), render: (d) => validityBadge(d.validity) },
        { key: 'ver', label: t('case.doc.verification'), render: (d) => verifyBadge(d.verification) },
        { key: 'file', label: t('case.doc.file'), render: (d) => fileLink(d.file) },
      ],
      rows: docs,
    });
  }
  if (resp.length) {
    renderTable(b, {
      compact: true,
      columns: [
        { key: 'title', label: t('case.doc.file'), render: (d) => fileLink(d.file) },
        { key: 'up', label: t('case.doc.uploaded'), render: (d) => esc(fmtDateTime(d.uploaded_at)) },
        { key: 'sha', label: 'SHA-256', render: (d) => `<code class="code">${esc((d.file && d.file.sha256 ? d.file.sha256 : '').slice(0, 12))}</code>` },
      ],
      rows: resp,
    });
  }
}

function lettersPane(panel) {
  const list = app.letters || [];
  if (!list.length) { emptyState(panel, { icon: 'mail', title: t('case.let.none'), text: t('case.let.none_text') }); return; }
  renderTable(panel, {
    columns: [
      { key: 'ref', label: t('case.let.ref'), render: (l) => `<a class="cell-main" href="${esc(site(`letter.html?id=${l.id}`))}">${esc(l.ref_no)}</a>` },
      { key: 'kind', label: t('case.let.kind'), render: (l) => `${esc(tl(l.kind_label))}${l.revoked ? ` ${badge('b-danger', t('case.let.revoked'))}` : ''}` },
      { key: 'subj', label: t('case.let.subject'), render: (l) => esc(pick(l.subject, l.subject_hi)) },
      { key: 'on', label: t('case.let.issued'), render: (l) => `${esc(fmtDateTime(l.issued_at))}<div class="cell-sub">${esc(l.issued_by ? l.issued_by.name : '—')}</div>` },
      { key: 'go', label: '', render: (l) => `<a class="btn sm secondary" href="${esc(site(`letter.html?id=${l.id}`))}">${esc(t('case.let.open'))}</a>` },
    ],
    rows: list,
  });
}

function notesPane(panel) {
  const notes = app.notes || [];
  const canAdd = (app.allowed_actions || []).includes('note');
  const area = textarea({ rows: 3, placeholder: t('case.note.ph'), maxlength: 2000 });
  const err = errorLine();
  const btn = el('button', { class: 'btn', type: 'button', html: `${icon('plus', 15)} ${esc(t('case.note_btn'))}` });
  btn.addEventListener('click', () => withBusy(btn, async () => {
    err.hide();
    if (area.value.trim().length < 2) { err.show(t('case.note.short')); area.focus(); return; }
    try {
      const res = await api.post(`/applications/${app.id}/notes`, { text: area.value.trim() });
      app = res;
      activeTab = 'notes';
      render();
      toast(t('case.note.added'), 'success');
    } catch (e) { toast(e.message, 'error'); }
  }));
  const form = canAdd
    ? el('div', { class: 'stack sm' }, field({ label: t('case.note.label'), control: area, hint: t('case.note.hint'), id: 'note-text' }), err, el('div', {}, btn))
    : null;
  mount(panel, el('div', { class: 'case-tabpane' },
    form,
    section(null, notes.length
      ? el('div', {}, [...notes].reverse().map((n) => el('div', { class: 'case-note' },
        el('div', { class: 'row' }, el('b', {}, n.author ? n.author.name : '—'), el('span', { class: 'case-sub' }, `${n.author ? roleLabel(n.author.role) : ''} · ${fmtDateTime(n.at)}`),
          n.kind !== 'NOTE' ? el('span', { html: badge('b-slate', tt('case.nk', n.kind)) }) : null),
        el('div', { class: 'case-pre' }, n.text))))
      : el('div', { class: 'small muted' }, t('case.note.empty')))));
}

function timelinePane(panel) {
  const items = [...(app.timeline || [])].reverse().map((e) => ({
    title: tt('case.act', e.action, e.action),
    meta: `${e.actor_name || '—'}${e.actor_role ? ` · ${roleLabel(e.actor_role)}` : ''} · ${fmtDateTime(e.at)}`,
    body: e.summary,
    tone: { APP_DECIDED: 'success', EVC_REPORTED: 'success', COMMITTEE_RECORDED: 'success', APP_RETURNED: 'warning', APP_REVERTED: 'warning', ESCALATED: 'danger' }[e.action] || '',
  }));
  const box = el('div');
  mount(panel, el('div', { class: 'case-tabpane' }, el('p', { class: 'case-sub' }, t('case.tl.newest')), box));
  timeline(box, items);
}

/* ------------------------------------------------------------------ tabs */
function tabDefs() {
  const defs = [
    { key: 'overview', label: t('case.t.overview'), render: overviewPane },
    { key: 'precheck', label: t('case.t.precheck'), count: (app.precheck || []).filter((p) => p.severity !== 'ok').length || null, render: precheckPane },
    { key: 'deficiencies', label: t('case.t.deficiencies'), count: (app.deficiencies || []).length || null, render: deficienciesPane },
  ];
  if (hasStage('EVC') || app.evc) defs.push({ key: 'evc', label: t('case.t.evc'), render: evcPane });
  if (hasStage('COMMITTEE') || (app.committee || []).length) defs.push({ key: 'committee', label: t('case.t.committee'), count: (app.committee || []).length || null, render: committeePane });
  defs.push(
    { key: 'decision', label: t('case.t.decision'), render: decisionPane },
    { key: 'documents', label: t('case.t.documents'), count: (app.documents || []).length + (app.responses || []).length || null, render: documentsPane },
    { key: 'letters', label: t('case.t.letters'), count: (app.letters || []).length || null, render: lettersPane },
    { key: 'notes', label: t('case.t.notes'), count: (app.notes || []).length || null, render: notesPane },
    { key: 'timeline', label: t('case.t.timeline'), count: (app.timeline || []).length || null, render: timelinePane },
  );
  return defs;
}

function renderMain() {
  const defs = tabDefs();
  if (!defs.some((d) => d.key === activeTab)) activeTab = 'overview';
  tabs(mainEl, defs, { active: activeTab, onChange: (k) => { activeTab = k; setParams({ tab: k === 'overview' ? null : k }); } });
}

function render() {
  if (!app) return;
  splitEl.hidden = false;
  renderHead();
  mount(whyEl, whyLine(app.why));
  renderRoute();
  renderMain();
  renderSide();
}

const ctx = () => ({
  app, meta, user,
  onDone(res, tab, message) {
    app = res;
    if (tab) activeTab = tab;
    render();
    toast(message, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
});

async function load() {
  if (!appId) { emptyState(stateEl, { icon: 'search', title: t('case.no_id'), text: t('case.no_id_text'), action: el('a', { class: 'btn', href: site('staff/applications.html') }, t('nav.applications')) }); return; }
  loading(stateEl);
  try {
    app = await api.get(`/applications/${appId}`);
    mount(stateEl);
    render();
  } catch (err) {
    errorState(stateEl, err, load);
  }
}

onLang(() => { if (app) render(); });
load();
