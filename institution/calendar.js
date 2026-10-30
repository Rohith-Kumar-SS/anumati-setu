// Institution compliance calendar: events grouped by month, overdue first, .ics download.
import { initPage } from '../assets/js/layout.js';
import { api, request, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, mount, fmtDate, monthName, daysBetween, daysChip, utBadge, validityBadge, downloadBlob, withBusy, toast,
  loading, emptyState, errorState } from '../assets/js/ui.js';

extend({
  en: {
    'cal.title': 'Compliance calendar',
    'cal.subtitle': 'Every date that matters for your institution, in one place',
    'cal.show_past': 'Include dates already passed',
    'cal.ics': 'Download .ics',
    'cal.ics_busy': 'Preparing…',
    'cal.ics_hint': 'The .ics file opens in Google Calendar, Outlook and Apple Calendar. Each date carries a reminder seven days before.',
    'cal.ics_done': 'Calendar file downloaded.',
    'cal.attention': 'Overdue or expired',
    'cal.empty': 'No dates to show',
    'cal.empty_text': 'Undertakings, document expiries, replies due and expert visits will appear here.',
    'cal.sum_overdue': 'Overdue / expired',
    'cal.sum_30': 'Next 30 days',
    'cal.sum_all': 'Dates shown',
    'cal.open': 'Open',
    'cal.kind.UNDERTAKING': 'Undertaking',
    'cal.kind.DOCUMENT': 'Document',
    'cal.kind.REPLY': 'Reply to deficiency',
    'cal.kind.EVC_VISIT': 'Expert visit',
    'cal.st.OPEN': 'Awaiting your reply',
    'cal.st.OVERDUE': 'Overdue',
    'cal.st.SCHEDULED': 'Scheduled',
    'cal.today': 'today',
    'cal.months': 'January,February,March,April,May,June,July,August,September,October,November,December',
  },
  hi: {
    'cal.title': 'अनुपालन कैलेंडर',
    'cal.subtitle': 'आपकी संस्था के लिए महत्वपूर्ण हर तिथि, एक ही जगह',
    'cal.show_past': 'बीत चुकी तिथियाँ भी दिखाएँ',
    'cal.ics': '.ics डाउनलोड करें',
    'cal.ics_busy': 'तैयार हो रहा है…',
    'cal.ics_hint': '.ics फ़ाइल गूगल कैलेंडर, आउटलुक और ऐप्पल कैलेंडर में खुलती है। हर तिथि के साथ सात दिन पहले का अनुस्मारक जुड़ा है।',
    'cal.ics_done': 'कैलेंडर फ़ाइल डाउनलोड हो गई।',
    'cal.attention': 'अतिदेय या समाप्त',
    'cal.empty': 'दिखाने के लिए कोई तिथि नहीं',
    'cal.empty_text': 'वचनबद्धताएँ, दस्तावेज़ समाप्ति, उत्तर की तिथियाँ और विशेषज्ञ दौरे यहाँ दिखेंगे।',
    'cal.sum_overdue': 'अतिदेय / समाप्त',
    'cal.sum_30': 'अगले 30 दिन',
    'cal.sum_all': 'दिखाई गई तिथियाँ',
    'cal.open': 'खोलें',
    'cal.kind.UNDERTAKING': 'वचनबद्धता',
    'cal.kind.DOCUMENT': 'दस्तावेज़',
    'cal.kind.REPLY': 'कमी का उत्तर',
    'cal.kind.EVC_VISIT': 'विशेषज्ञ दौरा',
    'cal.st.OPEN': 'आपके उत्तर की प्रतीक्षा',
    'cal.st.OVERDUE': 'अतिदेय',
    'cal.st.SCHEDULED': 'निर्धारित',
    'cal.today': 'आज',
    'cal.months': 'जनवरी,फ़रवरी,मार्च,अप्रैल,मई,जून,जुलाई,अगस्त,सितंबर,अक्टूबर,नवंबर,दिसंबर',
  },
});

await initPage({ roles: ['institution'], active: 'calendar', title: 'cal.title', subtitle: 'cal.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'cal.title' }] });

const bodyEl = $('#cal-body');
const pastEl = $('#show-past');
let data = null;
let showPast = false;

const isBad = (e) => e.status === 'OVERDUE' || e.status === 'EXPIRED';
const fullMonth = (m) => t('cal.months').split(',')[m];

function statusBadge(e) {
  if (e.kind === 'UNDERTAKING') return utBadge(e.status === 'OVERDUE' ? 'PENDING' : e.status, e.status === 'OVERDUE');
  if (e.kind === 'DOCUMENT') return validityBadge(e.status);
  const cls = e.status === 'OVERDUE' ? 'b-danger' : e.status === 'SCHEDULED' ? 'b-teal' : 'b-info';
  return `<span class="badge ${cls}">${esc(t(`cal.st.${e.status}`, { _default: e.status }))}</span>`;
}

function eventRow(e) {
  const [, mo, d] = e.date.split('-').map(Number);
  const left = daysBetween(data.today, e.date);
  return el('li', {},
    el('div', { class: `cal-date ${isBad(e) ? 'bad' : ''}`, 'aria-hidden': 'true' }, el('span', { class: 'd' }, String(d)), el('span', { class: 'm' }, monthName(mo - 1))),
    el('div', { class: 'ev-main' },
      el('div', { class: 'ev-title' }, tl(e.title)),
      el('div', { class: 'ev-sub' },
        el('span', {}, fmtDate(e.date)), el('span', {}, t(`cal.kind.${e.kind}`, { _default: e.kind })),
        el('span', { html: statusBadge(e) }), left !== null ? el('span', { html: daysChip(left) }) : null)),
    el('div', { class: 'ev-act' }, el('a', { class: 'btn sm secondary', href: site(e.link) }, t('cal.open'))));
}

function render() {
  $('#lbl-past').textContent = t('cal.show_past');
  $('#btn-ics').innerHTML = `${icon('download', 16)}<span>${esc(t('cal.ics'))}</span>`;
  $('#ics-hint').textContent = t('cal.ics_hint');
  if (!data) return;
  const list = (showPast ? data.all : data.events).slice().sort((a, b) => a.date.localeCompare(b.date));
  const bad = list.filter(isBad);
  const rest = list.filter((e) => !isBad(e));
  const in30 = list.filter((e) => !isBad(e) && daysBetween(data.today, e.date) <= 30 && daysBetween(data.today, e.date) >= 0).length;
  mount($('#cal-summary'),
    el('span', { class: 'chip' }, t('cal.sum_overdue'), el('strong', {}, String(bad.length))),
    el('span', { class: 'chip' }, t('cal.sum_30'), el('strong', {}, String(in30))),
    el('span', { class: 'chip' }, t('cal.sum_all'), el('strong', {}, String(list.length))));
  if (!list.length) { emptyState(bodyEl, { icon: 'calendar', title: t('cal.empty'), text: t('cal.empty_text') }); return; }
  const groups = [];
  if (bad.length) groups.push([t('cal.attention'), bad, true]);
  const byMonth = new Map();
  for (const e of rest) {
    const key = e.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(e);
  }
  for (const [key, evs] of byMonth) {
    const [y, m] = key.split('-').map(Number);
    groups.push([`${fullMonth(m - 1)} ${y}`, evs, false]);
  }
  mount(bodyEl, groups.map(([title, evs, attention], i) => el('section', { 'aria-labelledby': `mh-${i}` },
    el('h2', { class: 'month-h', id: `mh-${i}`, html: `${icon(attention ? 'alert' : 'calendar', 18)}<span>${esc(title)}</span>` }),
    el('ul', { class: 'cal-list' }, evs.map(eventRow)))));
}

async function load() {
  loading(bodyEl);
  try {
    data = await api.get('/calendar');
    render();
  } catch (e) {
    errorState(bodyEl, e, load);
  }
}

$('#btn-ics').addEventListener('click', (ev) => withBusy(ev.currentTarget, async () => {
  try {
    const blob = await request('GET', '/calendar.ics', { responseType: 'blob' });
    downloadBlob(blob, 'anumati-setu-compliance.ics');
    toast(t('cal.ics_done'), 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}));
pastEl.addEventListener('change', () => { showPast = pastEl.checked; render(); });
onLang(render);
render();
load();
