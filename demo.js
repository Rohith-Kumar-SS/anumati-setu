// Judge guide: scenarios T1-T8 (+ extras) with run buttons, result links, demo clock, demo accounts.
import { initPage } from './assets/js/layout.js';
import { api, site, homeFor } from './assets/js/api.js';
import { t, tl, extend, onLang, getLang } from './assets/js/i18n.js';
import { $, el, esc, icon, mount, fmtDate, renderTable, loading, withBusy, toast, confirmDialog } from './assets/js/ui.js';

extend({
  en: {
    'demo.title': 'Judge demo',
    'demo.subtitle': 'Run each demonstration on fresh data, move the demo clock and sign in as any role with one click',
    'demo.intro_title': 'How to use this page',
    'demo.intro': 'Every scenario below runs through the real services of the portal and creates fresh records, so what you open afterwards is live data, not a mock-up. Run one, then follow the links it returns: each link signs you in as the right role.',
    'demo.who_anon': 'You are not signed in. Scenarios need a staff account because they act on real cases.',
    'demo.who_anon_btn': 'Sign in as Bureau to run',
    'demo.who_ok': 'Signed in as {name} ({role}). You can run every scenario.',
    'demo.who_noroles': 'You are signed in as {name} ({role}). Scenarios can be run by regional, Bureau, committee and authority roles.',
    'demo.who_switch': 'Switch to Bureau',
    'demo.map_title': 'Problem statement items and the scenario that shows them',
    'demo.map_item': 'Item',
    'demo.map_asks': 'What the problem statement asks',
    'demo.map_scen': 'Scenario',
    'demo.ps.t1': 'Automated routing of an application to the right stages and officer',
    'demo.ps.t2': 'Role-based views of the same data',
    'demo.ps.t3': 'Stage-wise pendency and ageing, by region',
    'demo.ps.t4': 'Alerts for expert visit (EVC) scheduling and completion',
    'demo.ps.t5': 'Time-bound undertakings after a conditional approval',
    'demo.ps.t6': 'Alerts before lease and document expiry',
    'demo.ps.t7': 'Submission of compliance evidence and renewals, and their verification',
    'demo.ps.t8': 'Escalation of overdue items up the hierarchy',
    'demo.item_a': 'Section A',
    'demo.item_rules': 'Rulebook',
    'demo.scen_title': 'Scenarios',
    'demo.scen_load_error': 'The scenarios could not be loaded.',
    'demo.demo_off': 'Demo scenarios are switched off on this server.',
    'demo.run': 'Run scenario',
    'demo.running': 'Running…',
    'demo.days': 'Days to move the clock',
    'demo.run_signin': 'Sign in as Bureau to run',
    'demo.steps': 'What to look at',
    'demo.done': 'Scenario ran',
    'demo.log': 'What was created',
    'demo.open': 'Open',
    'demo.open_as': 'as {who}',
    'demo.links': 'Go and see it',
    'demo.clock_moved': 'The demo clock now reads {date}. Use the clock section below to reset it.',
    'demo.clock_title': 'Demo clock',
    'demo.clock_lead': 'Move the portal\'s date forward to watch reminders and escalations fire on the days they should. The daily job is replayed for every day moved.',
    'demo.clock_date': 'Demo date',
    'demo.clock_real': 'Real date (not simulated)',
    'demo.clock_sim': 'Simulated, {n} day(s) ahead of the real date',
    'demo.clock_plus': '+{n} day(s)',
    'demo.clock_plus1': '+1 day',
    'demo.clock_plus7': '+7 days',
    'demo.clock_plus30': '+30 days',
    'demo.clock_reset': 'Reset to today',
    'demo.clock_denied': 'Sign in as a regional, Bureau, authority or administrator account to move the clock.',
    'demo.clock_done': 'The clock moved. Days replayed: {days_run}. Reminders sent: {reminders}. Escalations raised: {escalations}. Compliance notices issued: {notices}.',
    'demo.clock_confirm': 'Move the demo clock by {n} day(s)? Reminders and escalations for those days will be created.',
    'demo.acct_title': 'Demo accounts',
    'demo.acct_lead': 'One-click sign-in for every seat. All accounts use the password {pw}.',
    'demo.acct_name': 'Name',
    'demo.acct_role': 'Role',
    'demo.acct_desig': 'Designation',
    'demo.acct_region': 'Region',
    'demo.acct_email': 'Email',
    'demo.acct_signin': 'Sign in',
    'demo.acct_load_error': 'The demo accounts could not be loaded.',
    'demo.acct_off': 'Demo accounts are not enabled on this server.',
    'demo.escalation_note': 'This scenario moves the demo clock.',
  },
  hi: {
    'demo.title': 'जज डेमो',
    'demo.subtitle': 'हर प्रदर्शन नए डेटा पर चलाएँ, डेमो घड़ी आगे बढ़ाएँ और एक क्लिक में किसी भी भूमिका से साइन इन करें',
    'demo.intro_title': 'इस पृष्ठ का उपयोग कैसे करें',
    'demo.intro': 'नीचे का हर परिदृश्य पोर्टल की वास्तविक सेवाओं से चलता है और नए रिकॉर्ड बनाता है, इसलिए बाद में आप जो खोलते हैं वह असली डेटा है, नकली नमूना नहीं। एक परिदृश्य चलाएँ, फिर उसके दिए लिंक खोलें: हर लिंक आपको सही भूमिका से साइन इन कर देता है।',
    'demo.who_anon': 'आप साइन इन नहीं हैं। परिदृश्य असली मामलों पर काम करते हैं, इसलिए इनके लिए स्टाफ़ खाता चाहिए।',
    'demo.who_anon_btn': 'चलाने के लिए ब्यूरो के रूप में साइन इन करें',
    'demo.who_ok': 'आप {name} ({role}) के रूप में साइन इन हैं। आप हर परिदृश्य चला सकते हैं।',
    'demo.who_noroles': 'आप {name} ({role}) के रूप में साइन इन हैं। परिदृश्य क्षेत्रीय, ब्यूरो, समिति और प्राधिकारी भूमिकाएँ चला सकती हैं।',
    'demo.who_switch': 'ब्यूरो पर जाएँ',
    'demo.map_title': 'समस्या कथन के बिंदु और उन्हें दिखाने वाले परिदृश्य',
    'demo.map_item': 'बिंदु',
    'demo.map_asks': 'समस्या कथन क्या माँगता है',
    'demo.map_scen': 'परिदृश्य',
    'demo.ps.t1': 'आवेदन का सही चरणों और अधिकारी तक स्वचालित मार्ग-निर्धारण',
    'demo.ps.t2': 'एक ही डेटा के भूमिका-आधारित दृश्य',
    'demo.ps.t3': 'क्षेत्रवार चरणवार लंबितता और आयु-वर्ग',
    'demo.ps.t4': 'विशेषज्ञ दौरे (ईवीसी) के निर्धारण और पूर्णता के अलर्ट',
    'demo.ps.t5': 'सशर्त अनुमोदन के बाद समयबद्ध वचनबद्धताएँ',
    'demo.ps.t6': 'पट्टा और दस्तावेज़ समाप्त होने से पहले अलर्ट',
    'demo.ps.t7': 'अनुपालन साक्ष्य और नवीनीकरण की प्रस्तुति तथा उनका सत्यापन',
    'demo.ps.t8': 'अतिदेय मामलों को ऊपर के स्तर तक बढ़ाना',
    'demo.item_a': 'खंड A',
    'demo.item_rules': 'नियम-पुस्तिका',
    'demo.scen_title': 'परिदृश्य',
    'demo.scen_load_error': 'परिदृश्य लोड नहीं हो सके।',
    'demo.demo_off': 'इस सर्वर पर डेमो परिदृश्य बंद हैं।',
    'demo.run': 'परिदृश्य चलाएँ',
    'demo.running': 'चल रहा है…',
    'demo.days': 'घड़ी कितने दिन आगे बढ़ाएँ',
    'demo.run_signin': 'चलाने के लिए ब्यूरो के रूप में साइन इन करें',
    'demo.steps': 'क्या देखना है',
    'demo.done': 'परिदृश्य चल गया',
    'demo.log': 'क्या बनाया गया',
    'demo.open': 'खोलें',
    'demo.open_as': '{who} के रूप में',
    'demo.links': 'जाकर देखें',
    'demo.clock_moved': 'डेमो घड़ी अब {date} दिखा रही है। उसे रीसेट करने के लिए नीचे घड़ी वाला भाग देखें।',
    'demo.clock_title': 'डेमो घड़ी',
    'demo.clock_lead': 'पोर्टल की तारीख़ आगे बढ़ाकर देखें कि अनुस्मारक और वृद्धियाँ ठीक उन्हीं दिनों कैसे उठती हैं। हर बढ़ाए गए दिन के लिए दैनिक कार्य फिर से चलाया जाता है।',
    'demo.clock_date': 'डेमो तिथि',
    'demo.clock_real': 'वास्तविक तिथि (सिम्युलेटेड नहीं)',
    'demo.clock_sim': 'सिम्युलेटेड, वास्तविक तिथि से {n} दिन आगे',
    'demo.clock_plus': '+{n} दिन',
    'demo.clock_plus1': '+1 दिन',
    'demo.clock_plus7': '+7 दिन',
    'demo.clock_plus30': '+30 दिन',
    'demo.clock_reset': 'आज की तारीख़ पर लौटें',
    'demo.clock_denied': 'घड़ी बदलने के लिए क्षेत्रीय, ब्यूरो, प्राधिकारी या प्रशासक खाते से साइन इन करें।',
    'demo.clock_done': 'घड़ी बदल गई। दोहराए गए दिन: {days_run}। भेजे गए अनुस्मारक: {reminders}। उठाई गई वृद्धियाँ: {escalations}। जारी अनुपालन सूचनाएँ: {notices}।',
    'demo.clock_confirm': 'डेमो घड़ी {n} दिन आगे बढ़ाएँ? उन दिनों के अनुस्मारक और वृद्धियाँ बन जाएँगी।',
    'demo.acct_title': 'डेमो खाते',
    'demo.acct_lead': 'हर भूमिका के लिए एक-क्लिक साइन इन। सभी खातों का पासवर्ड {pw} है।',
    'demo.acct_name': 'नाम',
    'demo.acct_role': 'भूमिका',
    'demo.acct_desig': 'पदनाम',
    'demo.acct_region': 'क्षेत्र',
    'demo.acct_email': 'ईमेल',
    'demo.acct_signin': 'साइन इन',
    'demo.acct_load_error': 'डेमो खाते लोड नहीं हो सके।',
    'demo.acct_off': 'इस सर्वर पर डेमो खाते चालू नहीं हैं।',
    'demo.escalation_note': 'यह परिदृश्य डेमो घड़ी आगे बढ़ाता है।',
  },
});

// Hindi for the "what to look at" steps (the API sends English only). Used only when the count matches.
const STEPS_HI = {
  routing: [
    'हर आवेदन खोलें: मार्ग-चरण पट्टी उसके चरण दिखाती है (केवल संवीक्षा, संवीक्षा + ईवीसी, केवल ईवीसी, ईवीसी + एसएसी/एसएचसी, संवीक्षा + ईवीसी + एसएसी/एसएचसी)।',
    'समयरेखा में सिस्टम द्वारा किए गए AUTO_ROUTED और AUTO_ASSIGNED प्रविष्टियाँ दिखती हैं।',
    '"यह कहाँ अटका है?" पंक्ति में आवेदन रखने वाले अधिकारी का नाम और नियत तिथि होती है।',
  ],
  dashboards: [
    'क्षेत्रीय अधिकारी: अपनी कतार और अलर्ट।',
    'क्षेत्रीय निदेशक: क्षेत्र की लंबितता, स्तर 2 वृद्धियाँ, कार्यभार।',
    'ब्यूरो: राष्ट्रीय चरण × क्षेत्र दृश्य।',
    'ईवीसी विशेषज्ञ, एसएसी/एसएचसी, सक्षम प्राधिकारी, संस्था: अपना-अपना कार्य।',
  ],
  pendency: [
    'लंबितता बोर्ड: पश्चिमी × संवीक्षा खाना आयु-वर्गों सहित लाल हो जाता है।',
    'अवरोध सूची कारण बताती है।',
    'कार्यभार (पश्चिमी क्षेत्रीय निदेशक के रूप में): पुनर्संतुलन का सुझाव आता है; क्षेत्रीय निदेशक उसे स्वीकृत करते हैं।',
  ],
  evc_alerts: [
    'ईवीसी बोर्ड: "नियत" और "अतिदेय" संकेत।',
    'वृद्धियाँ: स्तर 1 क्षेत्रीय अधिकारी को, स्तर 2 क्षेत्रीय निदेशक को।',
    'मामला खोलें और निर्धारण सहायक से हितों के टकराव से मुक्त पैनल चुनें।',
  ],
  undertaking: [
    'वचनबद्धता पंजी में दोनों नियत तिथियों सहित दिखती हैं।',
    'संस्था के अनुपालन पृष्ठ पर वे अपलोड बटन सहित सूचीबद्ध हैं।',
    'सशर्त अनुमोदन पत्र पर हस्ताक्षरित क्यूआर कोड होता है।',
  ],
  doc_expiry: [
    'दस्तावेज़ निगरानी: "शीघ्र समाप्त" और "समाप्त" पंक्तियाँ।',
    'आउटबॉक्स: 30 दिन पहले का अनुस्मारक ईमेल।',
    'पत्र: हस्ताक्षरित कोड सहित अनुपालन सूचना।',
  ],
  compliance_submission: [
    'वचनबद्धताएँ: स्थिति "साक्ष्य प्रस्तुत" - सत्यापित करें या कारण सहित अस्वीकार करें।',
    'दस्तावेज़: नवीनीकरण लंबित - सत्यापित करें; पुराना संस्करण प्रतिस्थापित हो जाता है।',
    'परिणाम में दोहराए गए अपलोड के अस्वीकार होने का संदेश दिखता है।',
  ],
  escalation: [
    'वृद्धियाँ: एक ही मामले के तीन स्तर, तिथियों सहित।',
    'टिप्पणी के साथ एक की पावती दें।',
    'बाद में नीचे दी गई डेमो घड़ी से घड़ी रीसेट करें।',
  ],
  return_revert: [
    'मामला 1: कमी पत्र, रुकी हुई घड़ी, उत्तर, चक्र 2।',
    'मामला 2: कारण सहित प्रत्यावर्तन दर्ज।',
  ],
  rule_change: [
    'नियम-पुस्तिका पृष्ठ प्रस्तावित बदलाव और उसके प्रभाव के साथ खुलता है।',
    'केवल प्रशासक नया संस्करण प्रकाशित कर सकता है।',
  ],
};

const { user } = await initPage({ roles: null, active: 'demo', title: 'demo.title', subtitle: 'demo.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'demo.title' }] });

const RUN_ROLES = ['ro', 'rd', 'bureau', 'authority', 'committee', 'admin'];
const CLOCK_ROLES = ['ro', 'rd', 'bureau', 'authority', 'admin'];
const PENDING_KEY = 'as_demo_pending';
const BUREAU = 'bureau@anumatisetu.demo';

const state = { scen: null, scenError: null, accts: null, acctError: null, results: {}, clockResult: null, days: 9 };
const canRun = !!(user && RUN_ROLES.includes(user.role));
const canClock = !!(user && CLOCK_ROLES.includes(user.role));

// A run that moved the clock reloads the page (so the header date is right); show its result again after the reload.
try {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (raw) {
    sessionStorage.removeItem(PENDING_KEY);
    const p = JSON.parse(raw);
    if (p.kind === 'scenario') state.results[p.key] = p.result;
    if (p.kind === 'clock') state.clockResult = p.result;
  }
} catch (e) { /* storage blocked */ }

const loginAs = (email, next) => site(`login.html?as=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
const pick = (en, hi) => (getLang() === 'hi' && hi ? hi : en);
const tcode = (s) => (/^T\d$/i.test(s.test_case) ? s.test_case.toUpperCase() : s.test_case === 'A' ? t('demo.item_a') : s.test_case === 'Rules' ? t('demo.item_rules') : s.test_case);
const anchorOf = (s) => (/^T\d$/i.test(s.test_case) ? s.test_case.toLowerCase() : `sc-${s.key}`);

function accountFor(email) {
  return state.accts && state.accts.accounts ? state.accts.accounts.find((a) => a.email === email) : null;
}

function stepsFor(s) {
  const hi = STEPS_HI[s.key];
  return getLang() === 'hi' && hi && hi.length === s.steps.length ? hi : s.steps;
}

/* ------------------------------------------------------------------ pieces */
function whoStrip() {
  if (!user) {
    return el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('info', 18) }),
      el('div', { class: 'row between grow' }, el('span', {}, t('demo.who_anon')),
        el('a', { class: 'btn sm', href: loginAs(BUREAU, 'demo.html') }, t('demo.who_anon_btn'))));
  }
  if (canRun) {
    return el('div', { class: 'alert success' }, el('span', { class: 'icon', html: icon('check-circle', 18) }),
      el('div', {}, t('demo.who_ok', { name: user.name, role: t(`role.${user.role}`, { _default: user.role }) })));
  }
  return el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }),
    el('div', { class: 'row between grow' }, el('span', {}, t('demo.who_noroles', { name: user.name, role: t(`role.${user.role}`, { _default: user.role }) })),
      el('a', { class: 'btn sm', href: loginAs(BUREAU, 'demo.html') }, t('demo.who_switch'))));
}

function mapTable() {
  const host = el('div');
  const byCode = {};
  (state.scen ? state.scen.items : []).forEach((s) => { byCode[s.test_case.toUpperCase()] = s; });
  const rows = [];
  for (let i = 1; i <= 8; i++) {
    const s = byCode[`T${i}`];
    rows.push({ code: `T${i}`, asks: t(`demo.ps.t${i}`), s });
  }
  renderTable(host, {
    compact: true,
    columns: [
      { key: 'code', label: t('demo.map_item'), width: '70px', render: (r) => `<strong>${esc(r.code)}</strong>` },
      { key: 'asks', label: t('demo.map_asks') },
      { key: 's', label: t('demo.map_scen'), render: (r) => (r.s ? el('a', { href: `#${anchorOf(r.s)}`, onclick: () => setTimeout(() => focusCard(anchorOf(r.s)), 0) }, tl(r.s.title)) : '—') },
    ],
    rows,
  });
  return el('section', { class: 'section', id: 'map', 'aria-labelledby': 'map-h' },
    el('div', { class: 'card' }, el('div', { class: 'card-head' }, el('h2', { id: 'map-h', html: `${icon('target', 20)}<span>${esc(t('demo.map_title'))}</span>` })), host));
}

function focusCard(id) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  node.style.boxShadow = '0 0 0 3px var(--as-saffron)';
  setTimeout(() => { node.style.boxShadow = ''; }, 1800);
}

function linkNode(l) {
  if (l.as) {
    const a = accountFor(l.as);
    const who = a ? t(`role.${a.role}`, { _default: a.role }) : l.as.split('@')[0];
    return el('a', { class: 'btn sm secondary', href: loginAs(l.as, l.href) },
      el('span', { html: icon('arrow-up-right', 14) }), el('span', {}, `${pick(l.label.en, l.label.hi)} · ${t('demo.open_as', { who })}`));
  }
  return el('a', { class: 'btn sm secondary', href: site(l.href) }, el('span', { html: icon('arrow-up-right', 14) }), el('span', {}, tl(l.label)));
}

function resultNode(res) {
  return el('div', { class: 'sc-result', role: 'status' },
    el('div', { class: 'alert success' }, el('span', { class: 'icon', html: icon('check-circle', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('demo.done')), el('div', {}, res.message),
        res.steps_done && res.steps_done.length ? el('details', { open: true },
          el('summary', { class: 'small', style: { cursor: 'pointer', marginTop: '6px' } }, t('demo.log')),
          el('ul', {}, res.steps_done.map((x) => el('li', {}, x)))) : null)),
    res.links && res.links.length ? el('div', { class: 'links', 'aria-label': t('demo.links') }, res.links.map(linkNode)) : null);
}

function showResult(key) {
  const host = document.getElementById(`res-${key}`);
  if (host) mount(host, state.results[key] ? resultNode(state.results[key]) : null);
}

async function runScenario(s, btn) {
  const body = s.options && s.options.includes('days') ? { days: Math.max(1, Math.min(60, Number(state.days) || 9)) } : {};
  await withBusy(btn, async () => {
    let res;
    try {
      res = await api.post(`/demo/scenarios/${s.key}/run`, body);
    } catch (e) {
      toast(e.message, 'error');
      return;
    }
    state.results[s.key] = res;
    if (state.scen && res.today && res.today !== state.scen.today) {
      try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ kind: 'scenario', key: s.key, result: res })); } catch (e) { /* ignore */ }
      toast(t('demo.clock_moved', { date: fmtDate(res.today) }), 'info');
      setTimeout(() => location.reload(), 600);
      return;
    }
    showResult(s.key);
    const node = document.getElementById(`res-${s.key}`);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function scenarioCard(s) {
  const runBtn = canRun
    ? el('button', { class: 'btn', type: 'button', html: `${icon('play', 16)}<span>${esc(t('demo.run'))}</span>` })
    : el('a', { class: 'btn', href: loginAs(BUREAU, 'demo.html'), html: `${icon('login', 16)}<span>${esc(t('demo.run_signin'))}</span>` });
  if (canRun) runBtn.addEventListener('click', () => runScenario(s, runBtn));
  const hasDays = s.options && s.options.includes('days');
  const daysField = hasDays && canRun ? el('div', { class: 'field' },
    el('label', { for: `days-${s.key}` }, t('demo.days')),
    el('input', { class: 'input', id: `days-${s.key}`, type: 'number', min: 1, max: 60, value: state.days, oninput: (e) => { state.days = e.target.value; } })) : null;
  const card = el('article', { class: 'card sc-card', id: anchorOf(s), 'aria-labelledby': `h-${s.key}` },
    el('div', { class: 'card-body' },
      el('div', { class: 'sc-title' }, el('span', { class: 'badge b-saffron lg' }, tcode(s)), el('h3', { id: `h-${s.key}` }, tl(s.title))),
      el('p', { class: 'text-2', style: { marginTop: '8px' } }, tl(s.summary)),
      el('div', { class: 'small', style: { fontWeight: '600', marginBottom: '4px' } }, t('demo.steps')),
      el('ol', {}, stepsFor(s).map((x) => el('li', {}, x))),
      hasDays ? el('p', { class: 'small muted', style: { marginTop: '8px' } }, t('demo.escalation_note')) : null),
    el('div', { class: 'card-foot' },
      el('div', { class: 'sc-run' }, daysField, runBtn),
      el('div', { id: `res-${s.key}` })));
  return card;
}

function scenariosSection() {
  let body;
  if (state.scenError) {
    body = el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }),
      el('div', {}, state.scenError.status === 403 ? t('demo.demo_off') : `${t('demo.scen_load_error')} ${state.scenError.message || ''}`));
  } else if (!state.scen) {
    body = el('div', {}); loading(body);
  } else {
    body = el('div', { class: 'grid g-2' }, state.scen.items.map(scenarioCard));
  }
  return el('section', { class: 'section', id: 'scenarios', 'aria-labelledby': 'scen-h' },
    el('div', { class: 'section-title' }, el('h2', { id: 'scen-h', html: `${icon('play', 22)}<span>${esc(t('demo.scen_title'))}</span>` })), body);
}

/* ------------------------------------------------------------------ clock */
async function moveClock(payload, btn) {
  if (payload.days && !(await confirmMove(payload.days))) return;
  await withBusy(btn, async () => {
    let res;
    try { res = await api.post('/admin/clock', payload); } catch (e) { toast(e.message, 'error'); return; }
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ kind: 'clock', result: res })); } catch (e) { /* ignore */ }
    toast(t('demo.clock_done', res.result || {}), 'success');
    setTimeout(() => { location.hash = '#clock'; location.reload(); }, 500);
  });
}

function confirmMove(n) {
  return confirmDialog(t('demo.clock_confirm', { n }), { title: t('demo.clock_title') });
}

function clockSection() {
  const c = state.scen;
  const sim = c && c.simulated;
  const info = c ? el('div', { class: 'row' },
    el('span', { class: 'clock-big' }, fmtDate(c.today)),
    sim ? el('span', { class: 'badge b-orange lg' }, t('demo.clock_sim', { n: c.offset_days })) : el('span', { class: 'badge b-slate lg' }, t('demo.clock_real'))) : el('span', { class: 'muted' }, '—');
  const mk = (label, payload, variant = '') => {
    const b = el('button', { class: `btn ${variant || 'secondary'}`, type: 'button', disabled: !canClock || !c }, label);
    b.addEventListener('click', () => moveClock(payload, b));
    return b;
  };
  const r = state.clockResult && state.clockResult.result;
  return el('section', { class: 'section', id: 'clock', 'aria-labelledby': 'clock-h' },
    el('div', { class: 'card accent-saffron' },
      el('div', { class: 'card-head' }, el('h2', { id: 'clock-h', html: `${icon('clock', 20)}<span>${esc(t('demo.clock_title'))}</span>` })),
      el('div', { class: 'card-body stack' },
        el('p', { class: 'text-2 mb-0' }, t('demo.clock_lead')),
        el('div', {}, el('div', { class: 'small muted', style: { fontWeight: '600' } }, t('demo.clock_date')), info),
        el('div', { class: 'row', role: 'group', 'aria-label': t('demo.clock_title') },
          mk(t('demo.clock_plus1'), { days: 1 }), mk(t('demo.clock_plus7'), { days: 7 }), mk(t('demo.clock_plus30'), { days: 30 }),
          mk(t('demo.clock_reset'), { reset: true }, 'outline-danger')),
        !canClock ? el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('lock', 18) }),
          el('div', { class: 'row between grow' }, el('span', {}, t('demo.clock_denied')), el('a', { class: 'btn sm', href: loginAs(BUREAU, 'demo.html#clock') }, t('demo.run_signin')))) : null,
        r ? el('div', { class: 'alert success', role: 'status' }, el('span', { class: 'icon', html: icon('check-circle', 18) }),
          el('div', {}, t('demo.clock_done', r))) : null)));
}

/* ------------------------------------------------------------------ accounts */
function accountsSection() {
  const host = el('div');
  if (state.acctError) {
    mount(host, el('div', { class: 'card-body' }, el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }), el('div', {}, t('demo.acct_load_error')))));
  } else if (!state.accts) {
    loading(host);
  } else if (!state.accts.enabled) {
    mount(host, el('div', { class: 'card-body' }, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('demo.acct_off')))));
  } else {
    renderTable(host, {
      compact: true,
      columns: [
        { key: 'name', label: t('demo.acct_name'), render: (a) => `<span class="cell-main">${esc(a.name)}</span>` },
        { key: 'role', label: t('demo.acct_role'), render: (a) => esc(t(`role.${a.role}`, { _default: a.role })) },
        { key: 'designation', label: t('demo.acct_desig') },
        { key: 'region', label: t('demo.acct_region'), render: (a) => esc(a.region || '—') },
        { key: 'email', label: t('demo.acct_email'), render: (a) => `<span class="mono">${esc(a.email)}</span>` },
        { key: 'go', label: '', render: (a) => el('a', { class: 'btn sm acct-link', href: loginAs(a.email, homeFor(a.role)), 'aria-label': `${t('demo.acct_signin')}: ${a.name}` }, t('demo.acct_signin')) },
      ],
      rows: state.accts.accounts,
    });
  }
  return el('section', { class: 'section', id: 'accounts', 'aria-labelledby': 'acct-h' },
    el('div', { class: 'card' },
      el('div', { class: 'card-head' }, el('h2', { id: 'acct-h', html: `${icon('users', 20)}<span>${esc(t('demo.acct_title'))}</span>` }),
        state.accts && state.accts.enabled ? el('span', { class: 'sub' }, t('demo.acct_lead', { pw: state.accts.password })) : null),
      host));
}

/* ------------------------------------------------------------------ page */
function render() {
  mount($('#demo-body'),
    el('div', { class: 'card accent-top section' }, el('div', { class: 'card-body' },
      el('h2', { style: { fontSize: '1.05rem' } }, t('demo.intro_title')), el('p', { class: 'text-2' }, t('demo.intro')), whoStrip())),
    mapTable(), scenariosSection(), clockSection(), accountsSection());
  Object.keys(state.results).forEach(showResult);
}

render();
onLang(render);

async function load() {
  await Promise.all([
    api.get('/demo/scenarios', null, { noRedirect: true }).then((d) => { state.scen = d; }).catch((e) => { state.scenError = e; }),
    api.get('/auth/demo-accounts', null, { noRedirect: true }).then((d) => { state.accts = d; }).catch((e) => { state.acctError = e; }),
  ]);
  render();
  const hash = decodeURIComponent(location.hash.replace('#', ''));
  if (hash) focusCard(hash);
  else if (Object.keys(state.results).length) {
    const k = Object.keys(state.results)[0];
    const node = document.getElementById(`res-${k}`);
    if (node) node.scrollIntoView({ block: 'center' });
  }
}
load();
