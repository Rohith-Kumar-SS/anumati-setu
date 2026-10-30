// Public landing page: hero, live counters, how it works, automate vs officials decide, PS items, innovations, limits.
import { initPage } from './assets/js/layout.js';
import { api, getToken, homeFor, site } from './assets/js/api.js';
import { t, tl, extend, onLang } from './assets/js/i18n.js';
import { $, el, icon, kpi, mount, fmtNum, errorState, loading } from './assets/js/ui.js';
import { logoSvg } from './assets/js/icons.js';

extend({
  en: {
    'home.doc_title': 'Anumati Setu · Approval Workflow, Compliance & Alerts Portal',
    'home.eyebrow': 'SIH 2026 · Problem statement SIH26262 · AICTE Regulation Bureau',
    'home.line': 'Automate the routine, secure every step, officials decide.',
    'home.btn_demo': 'Judge demo',
    'home.btn_signin': 'Sign in',
    'home.btn_verify': 'Verify a letter',
    'home.btn_dash': 'Go to my dashboard',
    'home.stats_load_error': 'The live counters could not be loaded.',
    'home.meta_error': 'The server did not answer. Please try again in a moment.',
    'home.st.regions': 'Regional offices',
    'home.st.open_applications': 'Applications in process',
    'home.st.decided': 'Applications decided',
    'home.st.institutions': 'Institutions on record',
    'home.st.automated_actions_30d': 'Automated actions (30 days)',
    'home.st.letters': 'Signed letters issued',
    'home.st.undertakings_tracked': 'Undertakings tracked',
    'home.st.documents_tracked': 'Documents tracked',
    'home.st_sub': 'Live from the server',
    'home.how_title': 'How an application travels',
    'home.how_lead': 'The rulebook picks the route from the type of application. Blue steps are done by the portal on its own; saffron steps are done by an official.',
    'home.route_types': 'Used for: {types}',
    'home.n_submitted': 'Submitted',
    'home.n_routed': 'Routed and assigned',
    'home.n_letter': 'Signed letter',
    'home.auto_title': 'The portal automates',
    'home.auto_lead': 'Routine, repeatable work that needs no judgement.',
    'home.human_title': 'Officials decide',
    'home.human_lead': 'Every statutory call stays with an authorised person.',
    'home.auto.1': 'Routing of each application to its prescribed stages',
    'home.auto.2': 'Auto-advance to the next stage when a stage is completed',
    'home.auto.3': 'Assignment to the least-loaded officer of the region',
    'home.auto.4': 'Stage clocks that pause while the institution replies',
    'home.auto.5': 'Reminders before every due date',
    'home.auto.6': 'Escalation ladder: officer, Regional Director, Bureau',
    'home.auto.7': 'Standard letters with a signed QR code',
    'home.auto.8': 'One-page case summaries and an automatic pre-check',
    'home.auto.9': 'Dashboards for every role',
    'home.auto.10': 'Tracking of undertakings and document validity',
    'home.human.1': 'Scrutiny findings',
    'home.human.2': 'Returning an application, with reasons',
    'home.human.3': 'EVC visit and EVC report',
    'home.human.4': 'SAC/SHC recommendation',
    'home.human.5': 'The final decision',
    'home.human.6': 'Verifying evidence and renewed documents',
    'home.human.7': 'Changes to the rules',
    'home.ps_title': 'The eight demonstration items',
    'home.ps_lead': 'Each one can be run with one click on the Judge demo page, on fresh data.',
    'home.t1': 'Automated routing', 'home.t1d': 'Each new application is sent along its own stage path to the right officer.',
    'home.t2': 'Role-based dashboards', 'home.t2d': 'Every role sees its own queue, alerts and numbers.',
    'home.t3': 'Stage-wise pendency', 'home.t3d': 'A region by stage board with ageing and the reason for each bottleneck.',
    'home.t4': 'EVC alerts', 'home.t4d': 'Reminder before the schedule-by date, escalation after it.',
    'home.t5': 'Undertaking tracking', 'home.t5d': 'Conditions of an approval become dated, tracked undertakings.',
    'home.t6': 'Lease and document expiry', 'home.t6d': 'Advance alerts, then a compliance notice if nothing is renewed.',
    'home.t7': 'Compliance submission', 'home.t7d': 'Evidence and renewals are fingerprinted, then verified by an officer.',
    'home.t8': 'Escalation of overdue cases', 'home.t8d': 'Level 1 to the officer, level 2 to the Regional Director, level 3 to the Bureau.',
    'home.inn_title': 'Twelve things that are new',
    'home.inn_lead': 'All of them can be tried in this prototype.',
    'home.n1': 'Rulebook as data', 'home.n1d': 'Timelines and routes are editable and versioned, with a what-if preview before publishing.',
    'home.n2': '"Why is it stuck?"', 'home.n2d': 'Every case explains in plain words who has it, since when and what happens next.',
    'home.n3': 'Fair stage clock', 'home.n3d': 'The AICTE clock pauses while the institution is replying, so delay is never blamed on the wrong side.',
    'home.n4': 'Escalation ladder', 'home.n4d': 'Three levels with acknowledgement, raised automatically from the rulebook.',
    'home.n5': 'EVC scheduling assistant', 'home.n5d': 'Suggests a conflict-free panel and date and shows who was excluded and why.',
    'home.n6': 'One-page case summary', 'home.n6d': 'An electronic summary with an automatic pre-check of documents and undertakings.',
    'home.n7': 'Signed letters, public verify', 'home.n7d': 'Every letter carries a signed QR code that anyone can check.',
    'home.n8': 'SHA-256 document vault', 'home.n8d': 'A renewal that is the same file as an older copy is refused.',
    'home.n9': 'Workload balancer', 'home.n9d': 'Officer load is visible and rebalancing is suggested, never imposed.',
    'home.n10': 'Compliance calendar', 'home.n10d': 'Institutions see every due date and can download them as an .ics file.',
    'home.n11': 'Outcome tracker', 'home.n11d': 'The seven expected outcomes are measured, with a counter of automated actions.',
    'home.n12': 'Judge kit', 'home.n12d': 'Demo clock, one-click scenarios and a hash-chained audit trail with a tamper demo.',
    'home.limits_title': 'Honest limits of this prototype',
    'home.limits.1': 'Email and SMS are simulated: messages are written to an outbox and nothing leaves the prototype.',
    'home.limits.2': 'The link with the existing AICTE system is a mock feed, not a live integration.',
    'home.limits.3': 'Timelines are configurable placeholders, not quoted from the Approval Process Handbook.',
    'home.limits.4': 'There is no OCR: documents are stored and fingerprinted, and an officer reads them.',
    'home.limits.5': 'All institutions, people and applications are fictitious.',
    'home.cta': 'Start with the Judge demo',
  },
  hi: {
    'home.doc_title': 'अनुमति सेतु · अनुमोदन कार्यप्रवाह, अनुपालन व अलर्ट पोर्टल',
    'home.eyebrow': 'एसआईएच 2026 · समस्या कथन SIH26262 · एआईसीटीई विनियमन ब्यूरो',
    'home.line': 'नियमित काम स्वचालित, हर कदम सुरक्षित, निर्णय अधिकारियों के हाथ में।',
    'home.btn_demo': 'जज डेमो',
    'home.btn_signin': 'साइन इन',
    'home.btn_verify': 'पत्र सत्यापित करें',
    'home.btn_dash': 'मेरे डैशबोर्ड पर जाएँ',
    'home.stats_load_error': 'लाइव आँकड़े लोड नहीं हो सके।',
    'home.meta_error': 'सर्वर ने उत्तर नहीं दिया। कृपया थोड़ी देर बाद फिर प्रयास करें।',
    'home.st.regions': 'क्षेत्रीय कार्यालय',
    'home.st.open_applications': 'प्रक्रियाधीन आवेदन',
    'home.st.decided': 'निर्णीत आवेदन',
    'home.st.institutions': 'अभिलेख में संस्थान',
    'home.st.automated_actions_30d': 'स्वचालित कार्रवाइयाँ (30 दिन)',
    'home.st.letters': 'जारी हस्ताक्षरित पत्र',
    'home.st.undertakings_tracked': 'ट्रैक की जा रही वचनबद्धताएँ',
    'home.st.documents_tracked': 'ट्रैक किए जा रहे दस्तावेज़',
    'home.st_sub': 'सर्वर से सीधे',
    'home.how_title': 'आवेदन किस मार्ग से गुज़रता है',
    'home.how_lead': 'नियम-पुस्तिका आवेदन के प्रकार से मार्ग तय करती है। नीले चरण पोर्टल अपने-आप करता है; केसरिया चरण अधिकारी स्वयं करते हैं।',
    'home.route_types': 'इनके लिए: {types}',
    'home.n_submitted': 'जमा किया गया',
    'home.n_routed': 'मार्ग तय व सौंपा गया',
    'home.n_letter': 'हस्ताक्षरित पत्र',
    'home.auto_title': 'पोर्टल स्वचालित करता है',
    'home.auto_lead': 'नियमित, दोहराए जाने वाले काम जिनमें विवेक की ज़रूरत नहीं।',
    'home.human_title': 'अधिकारी निर्णय लेते हैं',
    'home.human_lead': 'हर वैधानिक निर्णय अधिकृत व्यक्ति के पास ही रहता है।',
    'home.auto.1': 'हर आवेदन को उसके निर्धारित चरणों पर भेजना',
    'home.auto.2': 'चरण पूरा होते ही अगले चरण पर स्वतः भेजना',
    'home.auto.3': 'क्षेत्र के सबसे कम कार्यभार वाले अधिकारी को सौंपना',
    'home.auto.4': 'संस्था के उत्तर देने तक रुकने वाली चरण-घड़ी',
    'home.auto.5': 'हर नियत तिथि से पहले अनुस्मारक',
    'home.auto.6': 'वृद्धि सीढ़ी: अधिकारी, क्षेत्रीय निदेशक, ब्यूरो',
    'home.auto.7': 'हस्ताक्षरित क्यूआर कोड वाले मानक पत्र',
    'home.auto.8': 'एक-पृष्ठ केस सारांश और स्वचालित प्री-चेक',
    'home.auto.9': 'हर भूमिका के लिए डैशबोर्ड',
    'home.auto.10': 'वचनबद्धताओं और दस्तावेज़ वैधता की निगरानी',
    'home.human.1': 'संवीक्षा के निष्कर्ष',
    'home.human.2': 'कारण सहित आवेदन लौटाना',
    'home.human.3': 'ईवीसी दौरा और ईवीसी रिपोर्ट',
    'home.human.4': 'एसएसी/एसएचसी की अनुशंसा',
    'home.human.5': 'अंतिम निर्णय',
    'home.human.6': 'साक्ष्य और नवीनीकृत दस्तावेज़ों का सत्यापन',
    'home.human.7': 'नियमों में बदलाव',
    'home.ps_title': 'आठ प्रदर्शन बिंदु',
    'home.ps_lead': 'हर बिंदु को जज डेमो पृष्ठ पर एक क्लिक से, नए डेटा पर चलाया जा सकता है।',
    'home.t1': 'स्वचालित मार्ग-निर्धारण', 'home.t1d': 'हर नया आवेदन अपने चरण-मार्ग पर सही अधिकारी तक पहुँचता है।',
    'home.t2': 'भूमिका-आधारित डैशबोर्ड', 'home.t2d': 'हर भूमिका अपनी कतार, अलर्ट और आँकड़े देखती है।',
    'home.t3': 'चरणवार लंबितता', 'home.t3d': 'क्षेत्र और चरण का बोर्ड, आयु-वर्ग और हर अवरोध का कारण सहित।',
    'home.t4': 'ईवीसी अलर्ट', 'home.t4d': 'निर्धारण-तिथि से पहले अनुस्मारक, उसके बाद वृद्धि।',
    'home.t5': 'वचनबद्धता ट्रैकिंग', 'home.t5d': 'अनुमोदन की शर्तें तिथियुक्त, ट्रैक की जाने वाली वचनबद्धताएँ बन जाती हैं।',
    'home.t6': 'पट्टा व दस्तावेज़ समाप्ति', 'home.t6d': 'अग्रिम अलर्ट, और नवीनीकरण न होने पर अनुपालन सूचना।',
    'home.t7': 'अनुपालन प्रस्तुति', 'home.t7d': 'साक्ष्य और नवीनीकरण की फ़िंगरप्रिंट जाँच के बाद अधिकारी सत्यापन करते हैं।',
    'home.t8': 'अतिदेय मामलों की वृद्धि', 'home.t8d': 'स्तर 1 अधिकारी को, स्तर 2 क्षेत्रीय निदेशक को, स्तर 3 ब्यूरो को।',
    'home.inn_title': 'बारह नई बातें',
    'home.inn_lead': 'इन सभी को इस प्रोटोटाइप में आज़माया जा सकता है।',
    'home.n1': 'डेटा के रूप में नियम-पुस्तिका', 'home.n1d': 'समय-सीमाएँ और मार्ग संपादन योग्य व संस्करणबद्ध हैं; प्रकाशन से पहले प्रभाव-पूर्वावलोकन।',
    'home.n2': '"यह कहाँ अटका है?"', 'home.n2d': 'हर मामला सरल शब्दों में बताता है कि वह किसके पास है, कब से, और आगे क्या होगा।',
    'home.n3': 'न्यायसंगत चरण-घड़ी', 'home.n3d': 'संस्था के उत्तर देते समय एआईसीटीई की घड़ी रुक जाती है, इसलिए विलंब का दोष गलत पक्ष पर नहीं जाता।',
    'home.n4': 'वृद्धि सीढ़ी', 'home.n4d': 'पावती सहित तीन स्तर, जो नियम-पुस्तिका के अनुसार अपने-आप उठते हैं।',
    'home.n5': 'ईवीसी निर्धारण सहायक', 'home.n5d': 'हितों के टकराव से मुक्त पैनल और तिथि सुझाता है और बताता है कि किसे क्यों हटाया गया।',
    'home.n6': 'एक-पृष्ठ केस सारांश', 'home.n6d': 'दस्तावेज़ों और वचनबद्धताओं की स्वचालित प्री-चेक के साथ इलेक्ट्रॉनिक सारांश।',
    'home.n7': 'हस्ताक्षरित पत्र, सार्वजनिक सत्यापन', 'home.n7d': 'हर पत्र पर हस्ताक्षरित क्यूआर कोड होता है जिसे कोई भी जाँच सकता है।',
    'home.n8': 'SHA-256 दस्तावेज़ तिजोरी', 'home.n8d': 'पुरानी प्रति वाली ही फ़ाइल का नवीनीकरण अस्वीकार कर दिया जाता है।',
    'home.n9': 'कार्यभार संतुलक', 'home.n9d': 'अधिकारियों का कार्यभार दिखता है और पुनर्संतुलन सुझाया जाता है, थोपा नहीं जाता।',
    'home.n10': 'अनुपालन कैलेंडर', 'home.n10d': 'संस्थाएँ हर नियत तिथि देखती हैं और उन्हें .ics फ़ाइल में ले सकती हैं।',
    'home.n11': 'परिणाम ट्रैकर', 'home.n11d': 'सातों अपेक्षित परिणाम मापे जाते हैं, साथ में स्वचालित कार्रवाइयों का काउंटर।',
    'home.n12': 'जज किट', 'home.n12d': 'डेमो घड़ी, एक-क्लिक परिदृश्य और छेड़छाड़ डेमो सहित हैश-श्रृंखला ऑडिट।',
    'home.limits_title': 'इस प्रोटोटाइप की ईमानदार सीमाएँ',
    'home.limits.1': 'ईमेल और एसएमएस नकली (सिम्युलेटेड) हैं: संदेश आउटबॉक्स में लिखे जाते हैं, प्रोटोटाइप से बाहर कुछ नहीं जाता।',
    'home.limits.2': 'मौजूदा एआईसीटीई प्रणाली से जुड़ाव एक नकली फ़ीड है, वास्तविक एकीकरण नहीं।',
    'home.limits.3': 'समय-सीमाएँ विन्यास योग्य उदाहरण हैं, अनुमोदन प्रक्रिया हैंडबुक से उद्धृत नहीं।',
    'home.limits.4': 'ओसीआर नहीं है: दस्तावेज़ सहेजे और फ़िंगरप्रिंट किए जाते हैं, उन्हें अधिकारी पढ़ते हैं।',
    'home.limits.5': 'सभी संस्थान, व्यक्ति और आवेदन काल्पनिक हैं।',
    'home.cta': 'जज डेमो से शुरू करें',
  },
});

const { user, meta, metaPromise } = await initPage({ roles: null, active: 'home' });

const STAT_KEYS = [
  ['regions', 'map', ''], ['open_applications', 'queue', 'saffron'], ['decided', 'check-circle', 'success'],
  ['institutions', 'building', ''], ['automated_actions_30d', 'zap', 'teal'], ['letters', 'stamp', 'violet'],
  ['undertakings_tracked', 'target', 'warning'], ['documents_tracked', 'file-check', 'info'],
];
const PS = [['t1', 'git-branch'], ['t2', 'dashboard'], ['t3', 'layers'], ['t4', 'calendar'], ['t5', 'target'], ['t6', 'file-check'], ['t7', 'upload'], ['t8', 'alert']];
const INNOV = [['n1', 'settings'], ['n2', 'help'], ['n3', 'hourglass'], ['n4', 'shield-alert'], ['n5', 'users'], ['n6', 'file-text'],
  ['n7', 'qr'], ['n8', 'fingerprint'], ['n9', 'chart'], ['n10', 'calendar'], ['n11', 'trend'], ['n12', 'sparkles']];

let stats = null;
let statsFailed = false;
let metaData = meta;
let metaFailed = false;

const section = (id, icn, title, lead, ...content) => el('section', { class: 'home-sec', id: id || null, 'aria-labelledby': `${id || title}-h` },
  el('h2', { id: `${id || title}-h`, html: `${icon(icn, 24)}<span>${t(title)}</span>` }),
  lead ? el('p', { class: 'lead' }, t(lead)) : null, ...content);

function heroActions() {
  const signedIn = !!(user && getToken());
  return [
    signedIn
      ? el('a', { class: 'btn lg', href: site(homeFor(user.role)), html: `${icon('dashboard', 18)}<span>${t('home.btn_dash')}</span>` })
      : el('a', { class: 'btn lg', href: site('login.html'), html: `${icon('login', 18)}<span>${t('home.btn_signin')}</span>` }),
    el('a', { class: 'btn lg saffron', href: site('demo.html'), html: `${icon('play', 18)}<span>${t('home.btn_demo')}</span>` }),
    el('a', { class: 'btn lg secondary', href: site('verify.html'), html: `${icon('qr', 18)}<span>${t('home.btn_verify')}</span>` }),
  ];
}

function renderStats() {
  const host = $('#stats');
  if (statsFailed) { mount(host, el('div', { class: 'alert warning span-2' }, t('home.stats_load_error'))); host.className = 'mt-4'; return; }
  host.className = 'grid g-4 mt-4';
  if (!stats) { loading(host); return; }
  mount(host, STAT_KEYS.map(([k, ic, color]) => kpi({ label: t(`home.st.${k}`), value: fmtNum(stats[k]), sub: t('home.st_sub'), color, iconName: ic })));
}

function routeCard(key, route) {
  const types = Object.values(metaData.app_types || {}).filter((a) => a.route === key).map((a) => tl(a.label));
  const nodes = [el('span', { class: 'node auto' }, t('home.n_submitted')), el('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'),
    el('span', { class: 'node auto' }, t('home.n_routed'))];
  for (const s of route.stages) {
    nodes.push(el('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'), el('span', { class: 'node human' }, tl(metaData.stages[s])));
  }
  nodes.push(el('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'), el('span', { class: 'node auto' }, t('home.n_letter')));
  return el('div', { class: 'card route-card' }, el('div', { class: 'card-body' },
    el('h3', {}, tl(route.label)),
    types.length ? el('p', { class: 'route-types' }, t('home.route_types', { types: types.join(' · ') })) : null,
    el('div', { class: 'flow', role: 'list', 'aria-label': tl(route.label) }, nodes)));
}

function checklist(prefix, count, iconName, cls) {
  return el('ul', { class: `list-plain ${cls}` }, Array.from({ length: count }, (_, i) => el('li', {},
    el('span', { class: 'icon', html: icon(iconName, 16) }), el('span', {}, t(`home.${prefix}.${i + 1}`)))));
}

function render() {
  document.title = t('home.doc_title');
  $('#hero-eyebrow').textContent = t('home.eyebrow');
  mount($('#hero-title'), el('span', {}, 'Anumati Setu'), el('span', { class: 'hi', lang: 'hi' }, 'अनुमति सेतु'));
  $('#hero-tagline').textContent = t('app.tagline');
  $('#hero-line').textContent = t('home.line');
  mount($('#hero-actions'), heroActions());
  $('#hero-logo').innerHTML = logoSvg(150);
  renderStats();

  const body = $('#home-body');
  if (!metaData) {
    if (metaFailed) errorState(body, new Error(t('home.meta_error')), () => location.reload());
    else loading(body);
    return;
  }
  mount(body,
    section('how', 'git-branch', 'home.how_title', 'home.how_lead',
      el('div', { class: 'grid g-2' }, Object.entries(metaData.routes).map(([k, r]) => routeCard(k, r)))),
    el('section', { class: 'home-sec', 'aria-label': `${t('home.auto_title')} / ${t('home.human_title')}` },
      el('div', { class: 'grid g-2' },
        el('div', { class: 'card accent-top' }, el('div', { class: 'card-head' }, el('h2', { html: `${icon('zap', 20)}<span>${t('home.auto_title')}</span>` })),
          el('div', { class: 'card-body' }, el('p', { class: 'text-2' }, t('home.auto_lead')), checklist('auto', 10, 'check-circle', 'auto-list'))),
        el('div', { class: 'card accent-saffron' }, el('div', { class: 'card-head' }, el('h2', { html: `${icon('stamp', 20)}<span>${t('home.human_title')}</span>` })),
          el('div', { class: 'card-body' }, el('p', { class: 'text-2' }, t('home.human_lead')), checklist('human', 7, 'user', 'human-list'))))),
    section('ps', 'target', 'home.ps_title', 'home.ps_lead',
      el('div', { class: 'grid g-4' }, PS.map(([k, ic], i) => el('a', { class: 'card hoverable', href: site(`demo.html#${k}`) },
        el('div', { class: 'ps-card' },
          el('span', { class: 'tcode' }, `T${i + 1}`),
          el('div', {}, el('h3', {}, t(`home.${k}`)), el('p', {}, t(`home.${k}d`)))))))),
    section('innovations', 'sparkles', 'home.inn_title', 'home.inn_lead',
      el('div', { class: 'grid g-3' }, INNOV.map(([k, ic], i) => el('div', { class: 'card' },
        el('div', { class: 'inn-card' },
          el('span', { class: `feature-icon ${['', 'saffron', 'green', 'violet', 'teal'][i % 5]}`, html: icon(ic, 22) }),
          el('div', {}, el('h3', {}, `N${i + 1} · ${t(`home.${k}`)}`), el('p', {}, t(`home.${k}d`)))))))),
    el('section', { class: 'home-sec', 'aria-labelledby': 'limits-h' },
      el('div', { class: 'alert saffron' }, el('span', { class: 'icon', html: icon('info', 20) }),
        el('div', {}, el('div', { class: 'a-title', id: 'limits-h' }, t('home.limits_title')),
          el('ul', { class: 'limits', style: { margin: '4px 0 0', paddingLeft: '18px' } }, [1, 2, 3, 4, 5].map((i) => el('li', {}, t(`home.limits.${i}`))))))),
    el('div', { class: 'row end mt-3', style: { justifyContent: 'center', marginBottom: '8px' } },
      el('a', { class: 'btn lg saffron', href: site('demo.html'), html: `${icon('play', 18)}<span>${t('home.cta')}</span>` })));
}

render();
onLang(render);
if (!metaData) metaPromise.then((m) => { metaData = m; metaFailed = !m; render(); });
api.get('/public/stats', null, { noRedirect: true }).then((s) => { stats = s; render(); }).catch(() => { statsFailed = true; renderStats(); });
