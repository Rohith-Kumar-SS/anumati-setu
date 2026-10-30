// Printable signed letter: sheet with header, body (Hindi in hi), QR code and the signed code.
import { initPage, setPageHead } from './assets/js/layout.js';
import { api, apiUrl, getToken, site, homeFor } from './assets/js/api.js';
import { t, tl, extend, onLang, getLang } from './assets/js/i18n.js';
import { $, el, esc, icon, mount, fmtDateTime, getParam, loading, errorState, emptyState, copyText } from './assets/js/ui.js';
import { logoSvg } from './assets/js/icons.js';

extend({
  en: {
    'letter.title': 'Letter',
    'letter.subtitle': 'A signed letter issued by the portal',
    'letter.specimen': 'Specimen – SIH 2026 prototype, not an official letter',
    'letter.portal': 'Anumati Setu · Approval Workflow, Compliance & Alerts Portal',
    'letter.ref': 'Reference',
    'letter.issued': 'Issued',
    'letter.kind': 'Kind of letter',
    'letter.issued_by': 'Issued by',
    'letter.application': 'Application',
    'letter.revoked': 'Withdrawn',
    'letter.revoked_note': 'This letter has been withdrawn by the portal and no longer verifies.',
    'letter.signed_code': 'Signed code',
    'letter.qr_alt': 'QR code containing the signed code of this letter',
    'letter.qr_note': 'Anyone can scan this QR code, or paste the signed code on the Verify a letter page, to check that the letter is genuine.',
    'letter.fingerprint': 'Text fingerprint (SHA-256, first 16 characters)',
    'letter.copy': 'Copy code',
    'letter.verify': 'Verify this letter',
    'letter.print': 'Print',
    'letter.open_app': 'Open the application',
    'letter.back': 'Back',
    'letter.none_title': 'No letter selected',
    'letter.none_text': 'Open a letter from an application, or add ?id= to the address.',
    'letter.system': 'Portal (automatic)',
  },
  hi: {
    'letter.title': 'पत्र',
    'letter.subtitle': 'पोर्टल द्वारा जारी हस्ताक्षरित पत्र',
    'letter.specimen': 'नमूना – एसआईएच 2026 प्रोटोटाइप, यह आधिकारिक पत्र नहीं है',
    'letter.portal': 'अनुमति सेतु · अनुमोदन कार्यप्रवाह, अनुपालन एवं अलर्ट पोर्टल',
    'letter.ref': 'संदर्भ',
    'letter.issued': 'जारी',
    'letter.kind': 'पत्र का प्रकार',
    'letter.issued_by': 'जारीकर्ता',
    'letter.application': 'आवेदन',
    'letter.revoked': 'वापस लिया गया',
    'letter.revoked_note': 'यह पत्र पोर्टल द्वारा वापस ले लिया गया है और अब सत्यापित नहीं होगा।',
    'letter.signed_code': 'हस्ताक्षरित कोड',
    'letter.qr_alt': 'इस पत्र के हस्ताक्षरित कोड वाला क्यूआर कोड',
    'letter.qr_note': 'कोई भी इस क्यूआर कोड को स्कैन करके, या "पत्र सत्यापित करें" पृष्ठ पर हस्ताक्षरित कोड चिपकाकर जाँच सकता है कि पत्र असली है।',
    'letter.fingerprint': 'पाठ फ़िंगरप्रिंट (SHA-256, पहले 16 अक्षर)',
    'letter.copy': 'कोड कॉपी करें',
    'letter.verify': 'इस पत्र को सत्यापित करें',
    'letter.print': 'प्रिंट करें',
    'letter.open_app': 'आवेदन खोलें',
    'letter.back': 'वापस',
    'letter.none_title': 'कोई पत्र चुना नहीं गया',
    'letter.none_text': 'किसी आवेदन से पत्र खोलें, या पते में ?id= जोड़ें।',
    'letter.system': 'पोर्टल (स्वचालित)',
  },
});

const { user } = await initPage({
  roles: ['institution', 'ro', 'rd', 'bureau', 'evc', 'committee', 'authority'], active: '',
  title: 'letter.title', subtitle: 'letter.subtitle',
});
setPageHead({ breadcrumbs: [{ label: 'nav.dashboard', href: homeFor(user.role) }, { label: 'letter.title' }] });

const id = getParam('id');
let letter = null;
const bodyEl = $('#letter-body');

function actions() {
  const nodes = [el('button', { class: 'btn secondary', type: 'button', onclick: () => history.back(), html: `${icon('arrow-left', 16)}<span>${esc(t('letter.back'))}</span>` })];
  if (letter && letter.application) {
    const base = user.role === 'institution' ? 'institution/application.html' : 'staff/application.html';
    nodes.push(el('a', { class: 'btn secondary', href: site(`${base}?id=${letter.application.id}`), html: `${icon('file-text', 16)}<span>${esc(t('letter.open_app'))} (${esc(letter.application.ref_no)})</span>` }));
  }
  if (letter) {
    nodes.push(el('button', { class: 'btn', type: 'button', onclick: () => window.print(), html: `${icon('print', 16)}<span>${esc(t('letter.print'))}</span>` }));
  }
  mount($('#letter-actions'), nodes);
}

function render() {
  actions();
  if (!letter) return;
  const hi = getLang() === 'hi';
  const subject = hi && letter.subject_hi ? letter.subject_hi : letter.subject;
  const text = hi && letter.body_hi ? letter.body_hi : letter.body;
  setPageHead({ title: subject, subtitle: `${tl(letter.kind_label)} · ${letter.ref_no}` });
  const issuer = letter.issued_by ? `${letter.issued_by.name}, ${letter.issued_by.designation}` : t('letter.system');
  const qr = apiUrl(`/letters/${letter.id}/qr.png`, { token: getToken() });
  mount(bodyEl, el('article', { class: 'sheet', 'aria-label': subject },
    el('div', { class: 'sheet-head' },
      el('div', {},
        el('div', { class: 'sh-brand' }, el('span', { html: logoSvg(52), 'aria-hidden': 'true' }),
          el('div', {}, el('div', { class: 'sh-name' }, 'Anumati Setu · अनुमति सेतु'), el('div', { class: 'sh-org' }, t('letter.portal')))),
        el('div', { class: 'watermark', style: { marginTop: '10px' } }, t('letter.specimen'))),
      el('div', { class: 'sh-meta' },
        el('div', {}, t('letter.ref'), ': ', el('span', { class: 'ref' }, letter.ref_no)),
        el('div', {}, t('letter.issued'), ': ', fmtDateTime(letter.issued_at)),
        el('div', {}, t('letter.kind'), ': ', el('strong', {}, tl(letter.kind_label))),
        letter.application ? el('div', {}, t('letter.application'), ': ', el('span', { class: 'mono' }, letter.application.ref_no)) : null,
        el('div', { class: 'small', style: { color: '#555' } }, t('letter.issued_by'), ': ', issuer),
        letter.revoked ? el('div', { style: { marginTop: '6px' } }, el('span', { class: 'badge b-danger' }, t('letter.revoked'))) : null)),
    letter.revoked ? el('div', { class: 'alert danger', style: { marginBottom: '14px' } }, el('span', { class: 'icon', html: icon('alert-circle', 18) }), el('div', {}, t('letter.revoked_note'))) : null,
    el('h2', { class: 'subject' }, subject),
    el('pre', { class: 'letter-body', lang: hi ? 'hi' : 'en' }, text),
    el('div', { class: 'verify-block' },
      el('img', { src: qr, alt: t('letter.qr_alt'), width: 150, height: 150 }),
      el('div', { class: 'grow', style: { minWidth: '0' } },
        el('div', { style: { fontWeight: '700', marginBottom: '4px' } }, t('letter.signed_code')),
        el('div', { class: 'code-small', tabindex: '0' }, letter.code),
        el('p', { class: 'small', style: { color: '#444', margin: '8px 0 4px' } }, t('letter.qr_note')),
        el('div', { class: 'small', style: { color: '#444' } }, `${t('letter.fingerprint')}: `, el('span', { class: 'mono' }, (letter.body_hash || '').slice(0, 16))),
        el('div', { class: 'row no-print', style: { marginTop: '10px' } },
          el('button', { class: 'btn sm secondary', type: 'button', onclick: () => copyText(letter.code), html: `${icon('copy', 15)}<span>${esc(t('letter.copy'))}</span>` }),
          el('a', { class: 'btn sm', href: site(`verify.html?code=${encodeURIComponent(letter.code)}`), html: `${icon('shield-check', 15)}<span>${esc(t('letter.verify'))}</span>` }))))));
}

async function load() {
  if (!id) { emptyState(bodyEl, { icon: 'file-text', title: t('letter.none_title'), text: t('letter.none_text') }); actions(); return; }
  loading(bodyEl);
  try {
    letter = await api.get(`/letters/${encodeURIComponent(id)}`);
    render();
  } catch (e) {
    errorState(bodyEl, e, load);
  }
}

onLang(render);
load();
