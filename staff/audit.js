// Audit trail: filterable list of the hash-chained log, one-click chain verification, admin-only tamper demo.
import { initPage } from '../assets/js/layout.js';
import { api } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, pagination, modal, toast, withBusy, dl, fmtDateTime, getParam, setParams,
  debounce, icon, confirmDialog,
} from '../assets/js/ui.js';
import { field, selectEl, inputEl, checkEl, actionLabel, shortHash } from './c-common.js';

extend({
  en: {
    'aud.title': 'Audit trail',
    'aud.subtitle': 'Every action on the portal, in a chain where each entry is sealed with a hash of the one before it',
    'aud.chain_title': 'Integrity of the trail',
    'aud.chain_intro': 'Each entry stores a hash that includes the previous entry\'s hash. Changing any old entry breaks every hash after it, so tampering cannot go unnoticed.',
    'aud.verify': 'Verify chain',
    'aud.verifying': 'Checking…',
    'aud.ok_title': 'Audit chain intact',
    'aud.ok_text': '{n} entries checked on {at}; none has been altered.',
    'aud.head': 'Latest hash',
    'aud.bad_title': 'Audit chain broken',
    'aud.bad_text': 'Entry #{id} no longer matches its hash, so it (or an earlier entry) was altered after it was written.',
    'aud.bad_reason': 'Reason reported',
    'aud.show_entry': 'Show entry #{id}',
    'aud.demo_active': 'A tamper demonstration is active. Restore it to bring the chain back to normal.',
    'aud.tamper_title': 'Tamper demonstration (administrator)',
    'aud.tamper_text': 'Edits the text of one old audit entry without fixing its hash, exactly as a malicious change would. Verify the chain afterwards and the portal points to that very entry. "Restore" puts the original text back. Use only for the demo.',
    'aud.tamper': 'Tamper with one entry',
    'aud.restore': 'Restore original',
    'aud.tamper_confirm': 'This edits one old audit entry on purpose so the integrity check fails. Restore it straight after the demonstration. Continue?',
    'aud.tamper_done': 'Entry #{id} was edited. The chain check now fails.',
    'aud.restore_done': 'Entry #{id} restored. The chain is intact again.',
    'aud.was': 'Original text',
    'aud.now': 'Edited text',
    'aud.q': 'Search',
    'aud.q_ph': 'Summary, reference or person',
    'aud.action': 'Action',
    'aud.all_actions': 'All actions',
    'aud.system_only': 'System (automatic) actions only',
    'aud.date_from': 'From date',
    'aud.date_to': 'To date',
    'aud.col_at': 'When',
    'aud.col_actor': 'Who',
    'aud.col_action': 'Action',
    'aud.col_ref': 'Record',
    'aud.col_summary': 'What happened',
    'aud.col_hash': 'Hash',
    'aud.empty': 'No audit entries match these filters',
    'aud.entry': 'Audit entry #{id}',
    'aud.ip': 'IP address',
    'aud.entity': 'Record type',
    'aud.code': 'Action code',
    'aud.details': 'Details recorded',
    'aud.prev_hash': 'Previous hash',
    'aud.hash': 'Hash of this entry',
    'aud.altered': 'This entry fails the chain check',
  },
  hi: {
    'aud.title': 'ऑडिट ट्रेल',
    'aud.subtitle': 'पोर्टल पर हुआ हर कार्य, एक शृंखला में जहाँ हर प्रविष्टि पिछली प्रविष्टि के हैश से सील होती है',
    'aud.chain_title': 'ट्रेल की अखंडता',
    'aud.chain_intro': 'हर प्रविष्टि में एक हैश रहता है जिसमें पिछली प्रविष्टि का हैश शामिल है। कोई भी पुरानी प्रविष्टि बदलने पर उसके बाद के सभी हैश टूट जाते हैं, इसलिए छेड़छाड़ छिप नहीं सकती।',
    'aud.verify': 'शृंखला जाँचें',
    'aud.verifying': 'जाँच हो रही है…',
    'aud.ok_title': 'ऑडिट शृंखला अक्षुण्ण',
    'aud.ok_text': '{at} को {n} प्रविष्टियाँ जाँची गईं; किसी में कोई बदलाव नहीं मिला।',
    'aud.head': 'नवीनतम हैश',
    'aud.bad_title': 'ऑडिट शृंखला टूटी हुई',
    'aud.bad_text': 'प्रविष्टि #{id} अपने हैश से मेल नहीं खाती, अर्थात् लिखे जाने के बाद वह (या उससे पहले की कोई प्रविष्टि) बदली गई।',
    'aud.bad_reason': 'बताया गया कारण',
    'aud.show_entry': 'प्रविष्टि #{id} दिखाएँ',
    'aud.demo_active': 'छेड़छाड़ डेमो सक्रिय है। शृंखला को सामान्य करने के लिए इसे पुनर्स्थापित करें।',
    'aud.tamper_title': 'छेड़छाड़ डेमो (प्रशासक)',
    'aud.tamper_text': 'किसी एक पुरानी ऑडिट प्रविष्टि का पाठ बदलता है पर उसका हैश नहीं सुधारता, ठीक वैसे ही जैसे कोई दुर्भावनापूर्ण बदलाव करता। इसके बाद शृंखला जाँचने पर पोर्टल ठीक उसी प्रविष्टि की ओर संकेत करता है। "मूल पाठ लौटाएँ" असली पाठ वापस रख देता है। केवल डेमो के लिए उपयोग करें।',
    'aud.tamper': 'एक प्रविष्टि से छेड़छाड़ करें',
    'aud.restore': 'मूल पाठ लौटाएँ',
    'aud.tamper_confirm': 'यह जानबूझकर एक पुरानी ऑडिट प्रविष्टि बदलता है ताकि अखंडता जाँच विफल हो। प्रदर्शन के तुरंत बाद इसे लौटा दें। आगे बढ़ें?',
    'aud.tamper_done': 'प्रविष्टि #{id} बदली गई। अब शृंखला जाँच विफल होगी।',
    'aud.restore_done': 'प्रविष्टि #{id} पुनर्स्थापित। शृंखला फिर से अक्षुण्ण है।',
    'aud.was': 'मूल पाठ',
    'aud.now': 'बदला हुआ पाठ',
    'aud.q': 'खोजें',
    'aud.q_ph': 'सारांश, संदर्भ या व्यक्ति',
    'aud.action': 'कार्य',
    'aud.all_actions': 'सभी कार्य',
    'aud.system_only': 'केवल सिस्टम (स्वचालित) कार्य',
    'aud.date_from': 'आरंभ तिथि',
    'aud.date_to': 'अंतिम तिथि',
    'aud.col_at': 'कब',
    'aud.col_actor': 'किसने',
    'aud.col_action': 'कार्य',
    'aud.col_ref': 'रिकॉर्ड',
    'aud.col_summary': 'क्या हुआ',
    'aud.col_hash': 'हैश',
    'aud.empty': 'इन फ़िल्टरों से कोई ऑडिट प्रविष्टि नहीं मिली',
    'aud.entry': 'ऑडिट प्रविष्टि #{id}',
    'aud.ip': 'आईपी पता',
    'aud.entity': 'रिकॉर्ड का प्रकार',
    'aud.code': 'कार्य कोड',
    'aud.details': 'दर्ज विवरण',
    'aud.prev_hash': 'पिछला हैश',
    'aud.hash': 'इस प्रविष्टि का हैश',
    'aud.altered': 'यह प्रविष्टि शृंखला जाँच में विफल है',
  },
});

const { user } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'audit',
  title: 'aud.title',
  subtitle: 'aud.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.audit' }],
});

const isAdmin = user.role === 'admin';
const PAGE_SIZE = 25;
const f = {
  q: getParam('q') || '',
  action: getParam('action') || '',
  system: getParam('system') === '1',
  date_from: getParam('date_from') || '',
  date_to: getParam('date_to') || '',
  page: Number(getParam('page')) || 1,
};
let last = null;
let actions = [];
let chain = null; // last /audit/verify result
let tamperOut = null; // last tamper-demo / restore response

const reload = debounce(() => { f.page = 1; load(); }, 300);

function syncUrl() {
  setParams({
    q: f.q, action: f.action, system: f.system ? '1' : null, date_from: f.date_from, date_to: f.date_to,
    page: f.page > 1 ? String(f.page) : null,
  });
}

/* ---------------------------------------------------------------- chain card */
function renderChain() {
  $('#chain-title').textContent = t('aud.chain_title');
  $('#chain-intro').textContent = t('aud.chain_intro');
  const vb = $('#verify-btn');
  vb.innerHTML = `${icon('shield-check', 16)} ${esc(t('aud.verify'))}`;
  const box = $('#chain-result');
  if (!chain) { mount(box); return; }
  const parts = [];
  if (chain.ok) {
    parts.push(el('div', { class: 'alert success' }, el('span', { class: 'icon', html: icon('shield-check', 20) }),
      el('div', {}, el('div', { class: 'a-title' }, t('aud.ok_title')), t('aud.ok_text', { n: chain.checked, at: fmtDateTime(chain.verified_at) }),
        chain.head_hash ? el('div', { class: 'mt-1 small' }, `${t('aud.head')}: `, el('span', { class: 'hash', title: chain.head_hash }, shortHash(chain.head_hash, 24))) : null)));
  } else {
    parts.push(el('div', { class: 'alert danger' }, el('span', { class: 'icon', html: icon('shield-alert', 20) }),
      el('div', {}, el('div', { class: 'a-title' }, t('aud.bad_title')), t('aud.bad_text', { id: chain.broken_at }),
        chain.reason ? el('div', { class: 'small mt-1' }, `${t('aud.bad_reason')}: ${chain.reason}`) : null,
        el('div', { class: 'mt-1' }, el('button', { class: 'btn sm secondary', type: 'button', onclick: () => gotoEntry(chain.broken_at) }, t('aud.show_entry', { id: chain.broken_at }))))));
  }
  if (chain.tamper_demo) {
    parts.push(el('div', { class: 'alert warning mt-2' }, el('span', { class: 'icon', html: icon('alert', 20) }), el('div', {}, t('aud.demo_active'))));
  }
  mount(box, parts);
}

async function verifyChain(btn) {
  const go = async () => { chain = await api.get('/audit/verify'); renderChain(); renderTamper(); renderList(); };
  try {
    if (btn) await withBusy(btn, go); else await go();
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ---------------------------------------------------------------- tamper demo (admin) */
function renderTamper() {
  const card = $('#tamper-card');
  card.hidden = !isAdmin;
  if (!isAdmin) return;
  $('#tamper-title').textContent = t('aud.tamper_title');
  $('#tamper-text').textContent = t('aud.tamper_text');
  const tb = $('#tamper-btn');
  const rb = $('#restore-btn');
  tb.innerHTML = `${icon('alert', 16)} ${esc(t('aud.tamper'))}`;
  rb.innerHTML = `${icon('refresh', 16)} ${esc(t('aud.restore'))}`;
  const active = !!chain?.tamper_demo;
  tb.disabled = active;
  rb.disabled = !active;
  const out = $('#tamper-out');
  if (tamperOut && tamperOut.before !== undefined) {
    mount(out, el('div', { class: 'tamper-diff' },
      el('div', {}, el('strong', {}, `${t('aud.was')} (#${tamperOut.audit_id})`), el('code', { class: 'was' }, tamperOut.before)),
      el('div', {}, el('strong', {}, t('aud.now')), el('code', { class: 'now' }, tamperOut.after))));
  } else {
    mount(out);
  }
}

$('#tamper-btn').addEventListener('click', async (e) => {
  const ok = await confirmDialog(t('aud.tamper_confirm'), { title: t('aud.tamper_title'), confirmLabel: t('aud.tamper'), variant: 'danger' });
  if (!ok) return;
  try {
    tamperOut = await withBusy(e.currentTarget, () => api.post('/audit/tamper-demo'));
    chain = tamperOut.verify || chain;
    toast(t('aud.tamper_done', { id: tamperOut.audit_id }), 'warning');
    renderChain(); renderTamper(); await load();
  } catch (err) {
    toast(err.message, 'error');
  }
});

$('#restore-btn').addEventListener('click', async (e) => {
  try {
    const res = await withBusy(e.currentTarget, () => api.post('/audit/tamper-demo/restore'));
    tamperOut = null;
    chain = res.verify || chain;
    toast(t('aud.restore_done', { id: res.audit_id }), 'success');
    renderChain(); renderTamper(); await load();
  } catch (err) {
    toast(err.message, 'error');
  }
});

$('#verify-btn').addEventListener('click', (e) => verifyChain(e.currentTarget));

/* ---------------------------------------------------------------- filters and list */
function renderFilters() {
  mount($('#filters'),
    field('f-q', t('aud.q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('f-q', { type: 'search', value: f.q, placeholder: t('aud.q_ph'), onInput: (v) => { f.q = v; reload(); } }))),
    field('f-action', t('aud.action'), selectEl('f-action', [['', t('aud.all_actions')], ...actions.map((a) => [a, actionLabel(a)])], f.action, (v) => { f.action = v; f.page = 1; load(); })),
    field('f-from', t('aud.date_from'), inputEl('f-from', { type: 'date', value: f.date_from, onInput: (v) => { f.date_from = v; reload(); } })),
    field('f-to', t('aud.date_to'), inputEl('f-to', { type: 'date', value: f.date_to, onInput: (v) => { f.date_to = v; reload(); } })),
    el('div', { class: 'field' }, el('span', { class: 'label', 'aria-hidden': 'true', html: '&nbsp;' }),
      checkEl('f-system', t('aud.system_only'), f.system, (v) => { f.system = v; f.page = 1; load(); })));
}

function actorCell(a) {
  if (!a.actor_id) return `<span class="badge b-slate">${esc(t('common.system'))}</span>`;
  return `<div>${esc(a.actor_name)}</div><div class="cell-sub">${esc(t(`role.${a.actor_role}`, { _default: a.actor_role || '' }))}</div>`;
}

function renderList() {
  if (!last) return;
  renderTable($('#list'), {
    columns: [
      { key: 'at', label: t('aud.col_at'), render: (a) => `<span style="white-space:nowrap">${esc(fmtDateTime(a.at))}</span>` },
      { key: 'actor', label: t('aud.col_actor'), render: actorCell },
      { key: 'action', label: t('aud.col_action'), render: (a) => `<div class="cell-main">${esc(actionLabel(a.action))}</div><div class="cell-sub mono">${esc(a.action)}</div>` },
      { key: 'entity_ref', label: t('aud.col_ref'), render: (a) => `<span class="mono small">${esc(a.entity_ref || '—')}</span>` },
      { key: 'summary', label: t('aud.col_summary'), render: (a) => `<div style="max-width:440px">${esc(a.summary)}</div>` },
      { key: 'hash', label: t('aud.col_hash'), render: (a) => `<span class="hash" title="${esc(a.hash)}">${esc(shortHash(a.hash, 10))}</span>` },
    ],
    rows: last.items,
    onRowClick: openEntry,
    rowClass: (a) => (chain && !chain.ok && a.id === chain.broken_at ? 'row-danger' : ''),
    empty: { icon: 'history', title: t('aud.empty'), text: t('common.no_records_hint') },
  });
  pagination($('#pager'), { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; load(); } });
}

async function load() {
  syncUrl();
  loading($('#list'));
  mount($('#pager'));
  try {
    last = await api.get('/audit', {
      q: f.q || undefined, action: f.action || undefined, system: f.system ? 1 : undefined,
      date_from: f.date_from || undefined, date_to: f.date_to || undefined, page: f.page, page_size: PAGE_SIZE,
    });
    if (last.actions?.length && last.actions.join() !== actions.join()) { actions = last.actions; renderFilters(); }
    renderList();
  } catch (err) {
    errorState($('#list'), err, load);
  }
}

/** Jump to the page that holds audit entry `id` (ids are sequential, list is newest first). */
async function gotoEntry(id) {
  Object.assign(f, { q: '', action: '', system: false, date_from: '', date_to: '', page: 1 });
  try {
    const top = await api.get('/audit', { page: 1, page_size: PAGE_SIZE });
    const topId = top.items[0]?.id || id;
    f.page = Math.max(1, Math.floor((topId - id) / PAGE_SIZE) + 1);
    renderFilters();
    await load();
    $('#list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    toast(e.message, 'error');
  }
}

function openEntry(a) {
  const pairs = [
    [t('aud.col_at'), esc(fmtDateTime(a.at))],
    [t('aud.col_actor'), actorCell(a)],
    [t('aud.col_action'), `${esc(actionLabel(a.action))}<div class="cell-sub mono">${esc(a.action)}</div>`],
    [t('aud.entity'), esc(`${a.entity_type || '—'}${a.entity_id ? ` #${a.entity_id}` : ''}`)],
    [t('aud.col_ref'), `<span class="mono">${esc(a.entity_ref || '—')}</span>`],
    [t('aud.ip'), `<span class="mono">${esc(a.ip || '—')}</span>`],
  ];
  const body = el('div', {},
    chain && !chain.ok && chain.broken_at === a.id ? el('div', { class: 'alert danger', style: { marginBottom: '12px' } }, el('span', { class: 'icon', html: icon('shield-alert', 18) }), el('div', {}, t('aud.altered'))) : null,
    el('p', { class: 'mt-0' }, a.summary),
    dl(pairs, { cols: 2 }),
    el('h4', { style: { margin: '16px 0 6px' } }, t('aud.hash')), el('div', { class: 'code-box' }, a.hash),
    el('h4', { style: { margin: '12px 0 6px' } }, t('aud.prev_hash')), el('div', { class: 'code-box' }, a.prev_hash || '—'),
    a.details && Object.keys(a.details).length
      ? [el('h4', { style: { margin: '12px 0 6px' } }, t('aud.details')), el('div', { class: 'code-box' }, JSON.stringify(a.details, null, 2))] : null);
  modal({ title: t('aud.entry', { id: a.id }), body, size: 'wide' });
}

renderChain();
renderFilters();
renderTamper();
onLang(() => { renderChain(); renderFilters(); renderTamper(); renderList(); });
await load();
verifyChain(null);
