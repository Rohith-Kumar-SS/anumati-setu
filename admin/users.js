// Users (administrator): list, create, edit (name, designation, phone, region, active, password).
import { initPage } from '../assets/js/layout.js';
import { api } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, pagination, modal, toast, fmtDateTime, getParam, setParams, debounce, icon,
} from '../assets/js/ui.js';
import { field, selectEl, inputEl, checkEl, regionOptions, regionName } from '../staff/c-common.js';

extend({
  en: {
    'usr.title': 'Users',
    'usr.subtitle': 'Create and manage portal accounts for officers, experts, committee members and institutions',
    'usr.q': 'Search',
    'usr.q_ph': 'Name, e-mail or designation',
    'usr.role': 'Role',
    'usr.all_roles': 'All roles',
    'usr.new': 'New user',
    'usr.chip_all': 'All',
    'usr.col_user': 'User',
    'usr.col_email': 'E-mail (login)',
    'usr.col_scope': 'Region / institution',
    'usr.col_active': 'Account',
    'usr.col_login': 'Last sign-in',
    'usr.active': 'Active',
    'usr.inactive': 'Deactivated',
    'usr.never': 'Never',
    'usr.empty': 'No users match these filters',
    'usr.edit': 'Edit',
    'usr.create_title': 'Create a user',
    'usr.edit_title': 'Edit {name}',
    'usr.f_email': 'E-mail address (used to sign in)',
    'usr.f_name': 'Full name',
    'usr.f_role': 'Role',
    'usr.f_password': 'Password',
    'usr.f_password_new': 'New password (leave empty to keep the current one)',
    'usr.password_hint': 'At least 8 characters, with letters and digits.',
    'usr.f_designation': 'Designation',
    'usr.f_region': 'Region',
    'usr.f_region_hint': 'Required for Regional Officers and Regional Directors.',
    'usr.f_institution': 'Institution',
    'usr.f_institution_hint': 'The institution this account belongs to.',
    'usr.choose': 'Choose…',
    'usr.f_phone': 'Phone',
    'usr.f_active': 'Account is active (can sign in)',
    'usr.create': 'Create user',
    'usr.save': 'Save changes',
    'usr.created': 'User created.',
    'usr.updated': 'User updated.',
    'usr.role_fixed': 'The role cannot be changed after creation.',
    'usr.need': 'Fill in the e-mail address, name, role and password.',
    'usr.need_region': 'Choose a region for this role.',
    'usr.need_inst': 'Choose the institution for this account.',
  },
  hi: {
    'usr.title': 'उपयोगकर्ता',
    'usr.subtitle': 'अधिकारियों, विशेषज्ञों, समिति सदस्यों और संस्थाओं के पोर्टल खाते बनाएँ और प्रबंधित करें',
    'usr.q': 'खोजें',
    'usr.q_ph': 'नाम, ईमेल या पदनाम',
    'usr.role': 'भूमिका',
    'usr.all_roles': 'सभी भूमिकाएँ',
    'usr.new': 'नया उपयोगकर्ता',
    'usr.chip_all': 'सभी',
    'usr.col_user': 'उपयोगकर्ता',
    'usr.col_email': 'ईमेल (लॉगिन)',
    'usr.col_scope': 'क्षेत्र / संस्था',
    'usr.col_active': 'खाता',
    'usr.col_login': 'अंतिम साइन-इन',
    'usr.active': 'सक्रिय',
    'usr.inactive': 'निष्क्रिय किया गया',
    'usr.never': 'कभी नहीं',
    'usr.empty': 'इन फ़िल्टरों से कोई उपयोगकर्ता नहीं मिला',
    'usr.edit': 'संपादित करें',
    'usr.create_title': 'उपयोगकर्ता बनाएँ',
    'usr.edit_title': '{name} संपादित करें',
    'usr.f_email': 'ईमेल पता (साइन-इन के लिए)',
    'usr.f_name': 'पूरा नाम',
    'usr.f_role': 'भूमिका',
    'usr.f_password': 'पासवर्ड',
    'usr.f_password_new': 'नया पासवर्ड (वर्तमान रखने के लिए खाली छोड़ें)',
    'usr.password_hint': 'कम से कम 8 अक्षर, जिनमें अक्षर और अंक दोनों हों।',
    'usr.f_designation': 'पदनाम',
    'usr.f_region': 'क्षेत्र',
    'usr.f_region_hint': 'क्षेत्रीय अधिकारी और क्षेत्रीय निदेशक के लिए आवश्यक।',
    'usr.f_institution': 'संस्था',
    'usr.f_institution_hint': 'वह संस्था जिससे यह खाता जुड़ा है।',
    'usr.choose': 'चुनें…',
    'usr.f_phone': 'फ़ोन',
    'usr.f_active': 'खाता सक्रिय है (साइन-इन कर सकता है)',
    'usr.create': 'उपयोगकर्ता बनाएँ',
    'usr.save': 'बदलाव सहेजें',
    'usr.created': 'उपयोगकर्ता बनाया गया।',
    'usr.updated': 'उपयोगकर्ता अद्यतन किया गया।',
    'usr.role_fixed': 'बनाने के बाद भूमिका बदली नहीं जा सकती।',
    'usr.need': 'ईमेल पता, नाम, भूमिका और पासवर्ड भरें।',
    'usr.need_region': 'इस भूमिका के लिए क्षेत्र चुनें।',
    'usr.need_inst': 'इस खाते की संस्था चुनें।',
  },
});

const { user: me, meta } = await initPage({
  roles: ['admin'],
  active: 'users',
  title: 'usr.title',
  subtitle: 'usr.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.users' }],
  actions: () => el('button', { class: 'btn', type: 'button', html: `${icon('plus', 16)} ${esc(t('usr.new'))}`, onclick: () => openForm(null) }),
});

const PAGE_SIZE = 25;
const ROLES = Object.keys(meta?.roles || {}).filter((r) => r !== 'system');
const roleLabel = (r) => (meta?.roles?.[r] ? tl(meta.roles[r]) : t(`role.${r}`, { _default: r }));
const f = { q: getParam('q') || '', role: getParam('role') || '', region: getParam('region') || '', page: Number(getParam('page')) || 1 };
let last = null;
let institutions = null;

const reload = debounce(() => { f.page = 1; load(); }, 300);
const syncUrl = () => setParams({ q: f.q, role: f.role, region: f.region, page: f.page > 1 ? String(f.page) : null });

function renderFilters() {
  mount($('#filters'),
    field('f-q', t('usr.q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('f-q', { type: 'search', value: f.q, placeholder: t('usr.q_ph'), onInput: (v) => { f.q = v; reload(); } }))),
    field('f-role', t('usr.role'), selectEl('f-role', [['', t('usr.all_roles')], ...ROLES.map((r) => [r, roleLabel(r)])], f.role, (v) => { f.role = v; f.page = 1; load(); })),
    field('f-region', t('f.region'), selectEl('f-region', [['', t('cc.all_regions')], ...regionOptions(meta)], f.region, (v) => { f.region = v; f.page = 1; load(); })));
}

function renderChips() {
  const c = last?.counts || {};
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  const defs = [['', t('usr.chip_all'), total], ...ROLES.filter((r) => c[r]).map((r) => [r, roleLabel(r), c[r]])];
  mount($('#chips'), defs.map(([key, label, n]) => el('button', {
    type: 'button', class: f.role === key ? 'active' : '', 'aria-pressed': f.role === key ? 'true' : 'false',
    onclick: () => { f.role = key; f.page = 1; renderFilters(); load(); },
  }, el('span', {}, label), el('b', {}, String(n)))));
}

function scopeOf(u) {
  if (u.region) return esc(regionName(meta, u.region));
  if (u.institution) return `${esc(u.institution.name)}<div class="cell-sub">${esc(u.institution.pid)}</div>`;
  return '—';
}

function renderList() {
  if (!last) return;
  renderChips();
  renderTable($('#list'), {
    columns: [
      { key: 'name', label: t('usr.col_user'), render: (u) => `<div class="cell-main">${esc(u.name)}</div><div class="cell-sub">${esc(u.designation || '')}</div>` },
      { key: 'email', label: t('usr.col_email'), render: (u) => `<span class="mono small">${esc(u.email)}</span>` },
      { key: 'role', label: t('usr.role'), render: (u) => esc(roleLabel(u.role)) },
      { key: 'scope', label: t('usr.col_scope'), render: scopeOf },
      { key: 'active', label: t('usr.col_active'), render: (u) => `<span class="badge ${u.active ? 'b-success' : 'b-slate'}">${esc(t(u.active ? 'usr.active' : 'usr.inactive'))}</span>` },
      { key: 'last_login_at', label: t('usr.col_login'), render: (u) => (u.last_login_at ? `<span style="white-space:nowrap">${esc(fmtDateTime(u.last_login_at))}</span>` : `<span class="muted">${esc(t('usr.never'))}</span>`) },
      { key: 'edit', label: '', render: (u) => el('button', { class: 'btn sm secondary', type: 'button', 'aria-label': `${t('usr.edit')}: ${u.name}`, html: `${icon('edit', 14)} ${esc(t('usr.edit'))}`, onclick: () => openForm(u) }) },
    ],
    rows: last.items,
    rowClass: (u) => (u.active ? '' : 'row-warning'),
    empty: { icon: 'users', title: t('usr.empty'), text: t('common.no_records_hint') },
  });
  pagination($('#pager'), { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; load(); } });
}

async function load() {
  syncUrl();
  loading($('#list'));
  mount($('#pager'));
  try {
    last = await api.get('/admin/users', { q: f.q || undefined, role: f.role || undefined, region: f.region || undefined, page: f.page, page_size: PAGE_SIZE });
    renderList();
  } catch (err) {
    errorState($('#list'), err, load);
  }
}

/* ---------------------------------------------------------------- create / edit */
async function loadInstitutions() {
  if (!institutions) institutions = (await api.get('/institutions', { page_size: 200 })).items.sort((a, b) => a.name.localeCompare(b.name));
  return institutions;
}

function openForm(u) {
  const editing = !!u;
  const v = {
    email: '', name: u?.name || '', role: u?.role || '', password: '', designation: u?.designation || '',
    region: u?.region?.code || (typeof u?.region === 'string' ? u.region : ''), institution_id: u?.institution?.id || '', phone: u?.phone || '', active: u ? u.active : true,
  };
  const email = inputEl('u-email', { type: 'email', value: v.email, attrs: { autocomplete: 'off' } });
  const name = inputEl('u-name', { value: v.name });
  const roleSel = selectEl('u-role', [['', t('usr.choose')], ...ROLES.map((r) => [r, roleLabel(r)])], v.role);
  const pw = inputEl('u-password', { type: 'password', attrs: { autocomplete: 'new-password' } });
  const desig = inputEl('u-designation', { value: v.designation });
  const regionSel = selectEl('u-region', [['', t('usr.choose')], ...regionOptions(meta)], v.region);
  const instSel = el('select', { class: 'select', id: 'u-institution' }, el('option', { value: '' }, t('usr.choose')));
  const phone = inputEl('u-phone', { value: v.phone });
  const active = checkEl('u-active', t('usr.f_active'), v.active);
  const regionField = field('u-region', t('usr.f_region'), regionSel, t('usr.f_region_hint'));
  const instField = field('u-institution', t('usr.f_institution'), instSel, t('usr.f_institution_hint'));
  const err = el('div', { class: 'error', style: { fontSize: '.85rem', color: 'var(--as-danger)', fontWeight: '500' }, hidden: true });

  const sync = () => {
    const r = editing ? u.role : roleSel.value;
    regionField.hidden = !(r === 'ro' || r === 'rd');
    instField.hidden = !(r === 'institution') || editing;
  };
  roleSel.addEventListener('change', async () => {
    sync();
    if (roleSel.value === 'institution' && instSel.options.length <= 1) {
      try {
        for (const i of await loadInstitutions()) instSel.appendChild(el('option', { value: String(i.id) }, `${i.name} (${i.pid})`));
      } catch (e) { toast(e.message, 'error'); }
    }
  });
  if (editing) roleSel.disabled = true;

  const body = el('form', { class: 'form-stack', novalidate: true, onsubmit: (e) => e.preventDefault() },
    editing ? el('div', { class: 'text-2 small' }, `${u.email} · ${roleLabel(u.role)} — ${t('usr.role_fixed')}`) : field('u-email', t('usr.f_email'), email),
    el('div', { class: 'two' }, field('u-name', t('usr.f_name'), name), editing ? null : field('u-role', t('usr.f_role'), roleSel)),
    field('u-password', editing ? t('usr.f_password_new') : t('usr.f_password'), pw, t('usr.password_hint')),
    el('div', { class: 'two' }, field('u-designation', t('usr.f_designation'), desig), field('u-phone', t('usr.f_phone'), phone)),
    regionField, instField,
    editing ? active : null,
    err);
  sync();

  const showErr = (msg) => { err.textContent = msg; err.hidden = false; };
  modal({
    title: editing ? t('usr.edit_title', { name: u.name }) : t('usr.create_title'),
    body,
    size: 'wide',
    actions: [
      { label: t('cc.cancel') },
      {
        label: editing ? t('usr.save') : t('usr.create'),
        variant: 'primary',
        onClick: async () => {
          err.hidden = true;
          if (editing) {
            const patch = { name: name.value.trim(), designation: desig.value.trim(), phone: phone.value.trim(), active: $('#u-active').checked };
            if (u.role === 'ro' || u.role === 'rd') patch.region = regionSel.value || null;
            if (pw.value) patch.password = pw.value;
            await api.patch(`/admin/users/${u.id}`, patch);
            toast(t('usr.updated'), 'success');
          } else {
            const role = roleSel.value;
            if (!email.value.trim() || !name.value.trim() || !role || !pw.value) { showErr(t('usr.need')); return false; }
            if ((role === 'ro' || role === 'rd') && !regionSel.value) { showErr(t('usr.need_region')); return false; }
            if (role === 'institution' && !instSel.value) { showErr(t('usr.need_inst')); return false; }
            await api.post('/admin/users', {
              email: email.value.trim(), name: name.value.trim(), role, password: pw.value, designation: desig.value.trim(), phone: phone.value.trim(),
              region: (role === 'ro' || role === 'rd') ? regionSel.value : null, institution_id: role === 'institution' ? Number(instSel.value) : null,
            });
            toast(t('usr.created'), 'success');
          }
          load();
          return true;
        },
      },
    ],
  });
}

renderFilters();
onLang(() => { renderFilters(); renderList(); });
load();
