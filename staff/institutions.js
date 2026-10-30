// Institutions: directory with open applications, overdue undertakings and the compliance score.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import { $, el, esc, mount, loading, errorState, renderTable, pagination, getParam, setParams, debounce, icon } from '../assets/js/ui.js';
import {
  isHQ, regionOptions, regionName, field, selectEl, inputEl, checkEl, scoreMeter, reasonText, instTypeLabel, stateLabel,
} from './c-common.js';

extend({
  en: {
    'insl.title': 'Institutions',
    'insl.subtitle': 'Every institution with its open applications, overdue undertakings and compliance health',
    'insl.f_type': 'Institution type',
    'insl.q': 'Search',
    'insl.q_ph': 'Name, permanent ID or city',
    'insl.all_types': 'All types',
    'insl.issues': 'Show only institutions with issues',
    'insl.col_inst': 'Institution',
    'insl.col_place': 'City and state',
    'insl.col_apps': 'Open applications',
    'insl.col_ut': 'Overdue undertakings',
    'insl.col_score': 'Compliance score',
    'insl.no_issues': 'No issues',
    'insl.empty': 'No institutions match these filters',
    'insl.hint': 'Lowest compliance score first. 100 means every document is valid and no undertaking is overdue.',
  },
  hi: {
    'insl.title': 'संस्थान',
    'insl.subtitle': 'प्रत्येक संस्था के खुले आवेदन, अतिदेय वचनबद्धताएँ और अनुपालन की स्थिति',
    'insl.f_type': 'संस्था का प्रकार',
    'insl.q': 'खोजें',
    'insl.q_ph': 'नाम, स्थायी आईडी या शहर',
    'insl.all_types': 'सभी प्रकार',
    'insl.issues': 'केवल समस्या वाली संस्थाएँ दिखाएँ',
    'insl.col_inst': 'संस्था',
    'insl.col_place': 'शहर और राज्य',
    'insl.col_apps': 'खुले आवेदन',
    'insl.col_ut': 'अतिदेय वचनबद्धताएँ',
    'insl.col_score': 'अनुपालन अंक',
    'insl.no_issues': 'कोई समस्या नहीं',
    'insl.empty': 'इन फ़िल्टरों से कोई संस्था नहीं मिली',
    'insl.hint': 'सबसे कम अनुपालन अंक वाली संस्थाएँ पहले। 100 का अर्थ है कि सभी दस्तावेज़ वैध हैं और कोई वचनबद्धता अतिदेय नहीं।',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'committee', 'authority'],
  active: 'institutions',
  title: 'insl.title',
  subtitle: 'insl.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.institutions' }],
});

const HQ = isHQ(user);
const PAGE_SIZE = 25;
const f = {
  q: getParam('q') || '',
  region: HQ ? (getParam('region') || '') : '',
  inst_type: getParam('inst_type') || '',
  issues: getParam('issues') === '1',
  page: Number(getParam('page')) || 1,
};
let last = null;

const reload = debounce(() => { f.page = 1; load(); }, 300);

function syncUrl() {
  setParams({ q: f.q, region: f.region, inst_type: f.inst_type, issues: f.issues ? '1' : null, page: f.page > 1 ? String(f.page) : null });
}

function renderFilters() {
  $('#hint').textContent = t('insl.hint');
  mount($('#filters'),
    field('f-q', t('insl.q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('f-q', { type: 'search', value: f.q, placeholder: t('insl.q_ph'), onInput: (v) => { f.q = v; reload(); } }))),
    HQ ? field('f-region', t('f.region'), selectEl('f-region', [['', t('cc.all_regions')], ...regionOptions(meta)], f.region, (v) => { f.region = v; f.page = 1; load(); })) : null,
    field('f-type', t('insl.f_type'), selectEl('f-type', [['', t('insl.all_types')], ...(meta?.institution_types || []).map((x) => [x, instTypeLabel(x)])], f.inst_type, (v) => { f.inst_type = v; f.page = 1; load(); })),
    el('div', { class: 'field' }, el('span', { class: 'label', 'aria-hidden': 'true', html: '&nbsp;' }),
      checkEl('f-issues', t('insl.issues'), f.issues, (v) => { f.issues = v; f.page = 1; load(); })));
}

function renderList() {
  if (!last) return;
  renderTable($('#list'), {
    columns: [
      { key: 'name', label: t('insl.col_inst'), render: (i) => `<a class="cell-main" href="${esc(site(`staff/institution.html?id=${i.id}`))}">${esc(i.name)}</a><div class="cell-sub mono">${esc(i.pid)}</div>${i.is_new ? `<span class="badge b-violet">${esc(t('cc.new_inst'))}</span>` : ''}` },
      { key: 'city', label: t('insl.col_place'), render: (i) => `${esc(i.city)}<div class="cell-sub">${esc(stateLabel(i.state))}</div>` },
      { key: 'region', label: t('f.region'), render: (i) => esc(regionName(meta, i.region)) },
      { key: 'inst_type', label: t('insl.f_type'), render: (i) => esc(instTypeLabel(i.inst_type)) },
      { key: 'open_applications', label: t('insl.col_apps'), align: 'right', render: (i) => `<strong>${esc(i.open_applications)}</strong>` },
      { key: 'overdue_undertakings', label: t('insl.col_ut'), align: 'right', render: (i) => (i.overdue_undertakings ? `<span class="badge b-danger">${esc(i.overdue_undertakings)}</span>` : '0') },
      {
        key: 'score', label: t('insl.col_score'), render: (i) => {
          const box = el('div', {}, scoreMeter(i.score));
          if ((i.reasons || []).length) box.appendChild(el('ul', { class: 'why-list' }, i.reasons.map((r) => el('li', {}, reasonText(r, meta)))));
          else box.appendChild(el('div', { class: 'cell-sub' }, t('insl.no_issues')));
          return box;
        },
      },
    ],
    rows: last.items,
    onRowClick: (i) => { location.href = site(`staff/institution.html?id=${i.id}`); },
    empty: { icon: 'bank', title: t('insl.empty'), text: t('common.no_records_hint') },
  });
  pagination($('#pager'), { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; load(); } });
}

async function load() {
  syncUrl();
  loading($('#list'));
  mount($('#pager'));
  try {
    last = await api.get('/institutions', {
      q: f.q || undefined, region: f.region || undefined, inst_type: f.inst_type || undefined,
      issues: f.issues ? 1 : undefined, page: f.page, page_size: PAGE_SIZE,
    });
    renderList();
  } catch (err) {
    errorState($('#list'), err, load);
  }
}

renderFilters();
onLang(() => { renderFilters(); renderList(); });
load();
