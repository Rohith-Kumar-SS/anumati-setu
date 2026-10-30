// Chart helpers on top of Chart.js (load ../assets/vendor/chart.umd.min.js with a classic <script> first)
// plus a DOM calendar heatmap. Colours match theme.css.
import { fmtINRShort, fmtNum, fmtDate, monthName, esc, el, mount } from './ui.js';
import { t } from './i18n.js';

export const COLORS = {
  primary: '#0b4ea2', navy: '#0a2c5a', saffron: '#f28c28', green: '#1a7f37', red: '#c62828', amber: '#e0a100',
  teal: '#00796b', violet: '#5b3cc4', slate: '#64748b', info: '#0369a1', orange: '#c2410c', sky: '#4f9ae6',
};
export const SERIES = [COLORS.primary, COLORS.saffron, COLORS.teal, COLORS.violet, COLORS.green, COLORS.orange, COLORS.info, COLORS.slate, COLORS.sky, COLORS.red];
export const CATEGORY_COLORS = {
  active: COLORS.green, expiring: COLORS.amber, matured: COLORS.red, renewed: COLORS.teal, released: COLORS.slate,
  pending: COLORS.primary, rejected: '#8e1b1b', submitted: COLORS.info, under_verification: COLORS.violet,
  discrepancy: COLORS.orange, release_requested: COLORS.primary,
};
export const TRUST_COLORS = { 0: '#94a3b8', 1: COLORS.info, 2: COLORS.green, flagged: COLORS.red };
export const RISK_COLORS = { low: COLORS.green, medium: COLORS.amber, high: COLORS.orange, critical: COLORS.red };

let configured = false;
const charts = new WeakMap();

function C() {
  if (!window.Chart) throw new Error('Chart.js not loaded (add ../assets/vendor/chart.umd.min.js)');
  if (!configured) {
    const Ch = window.Chart;
    Ch.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Ch.defaults.font.size = 12;
    Ch.defaults.color = '#3d4f66';
    Ch.defaults.borderColor = '#e3e9f1';
    Ch.defaults.maintainAspectRatio = false;
    Ch.defaults.plugins.legend.labels.usePointStyle = true;
    Ch.defaults.plugins.legend.labels.boxWidth = 8;
    Ch.defaults.plugins.tooltip.backgroundColor = '#0f1e33';
    Ch.defaults.plugins.tooltip.padding = 10;
    Ch.defaults.plugins.tooltip.cornerRadius = 6;
    Ch.defaults.animation.duration = 450;
    configured = true;
  }
  return window.Chart;
}

function make(canvas, config) {
  const Ch = C();
  const prev = charts.get(canvas);
  if (prev) prev.destroy();
  const chart = new Ch(canvas, config);
  charts.set(canvas, chart);
  return chart;
}

const moneyTick = (v) => fmtINRShort(v);

/** barChart(canvas, {labels, datasets:[{label, data, color}], horizontal, stacked, money, legend, onClick(index)}) */
export function barChart(canvas, { labels, datasets, horizontal = false, stacked = false, money = false, legend, onClick, maxBarThickness = 38 }) {
  const valueAxis = horizontal ? 'x' : 'y';
  return make(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({
        label: d.label, data: d.data, backgroundColor: d.colors || d.color || SERIES[i % SERIES.length],
        borderRadius: 5, maxBarThickness, borderSkipped: false,
      })),
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      onClick: onClick ? (_, els) => { if (els.length) onClick(els[0].index, els[0].datasetIndex); } : undefined,
      plugins: {
        legend: { display: legend ?? datasets.length > 1, position: 'bottom' },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label ? ctx.dataset.label + ': ' : ''}${money ? fmtINRShort(ctx.parsed[valueAxis]) : fmtNum(ctx.parsed[valueAxis])}` } },
      },
      scales: {
        x: { stacked, grid: { display: horizontal }, ticks: horizontal && money ? { callback: moneyTick } : {} },
        y: { stacked, grid: { display: !horizontal }, beginAtZero: true, ticks: !horizontal && money ? { callback: moneyTick } : { precision: 0 } },
      },
    },
  });
}

const centerText = {
  id: 'nkCenter',
  afterDraw(chart, _args, opts) {
    if (!opts || !opts.value) return;
    const { ctx, chartArea: a } = chart;
    const x = (a.left + a.right) / 2;
    const y = (a.top + a.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#142438';
    ctx.font = `700 ${opts.size || 20}px ${C().defaults.font.family}`;
    ctx.fillText(opts.value, x, y + (opts.label ? 0 : 6));
    if (opts.label) {
      ctx.fillStyle = '#66778c';
      ctx.font = `500 11px ${C().defaults.font.family}`;
      ctx.fillText(opts.label, x, y + 17);
    }
    ctx.restore();
  },
};

/** doughnutChart(canvas, {labels, data, colors, money, center:{value, label}, legend:'right'|'bottom', onClick(index)}) */
export function doughnutChart(canvas, { labels, data, colors, money = false, center, legend = 'right', onClick, cutout = '68%' }) {
  return make(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors || SERIES, borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }] },
    options: {
      cutout,
      onClick: onClick ? (_, els) => { if (els.length) onClick(els[0].index); } : undefined,
      plugins: {
        legend: { display: !!legend, position: legend || 'right' },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${money ? fmtINRShort(ctx.parsed) : fmtNum(ctx.parsed)}` } },
        nkCenter: center || {},
      },
    },
    plugins: [centerText],
  });
}

/** lineChart(canvas, {labels, datasets:[{label, data, color, fill}], money}) */
export function lineChart(canvas, { labels, datasets, money = false, legend }) {
  return make(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d, i) => {
        const col = d.color || SERIES[i % SERIES.length];
        return { label: d.label, data: d.data, borderColor: col, backgroundColor: col + '22', fill: !!d.fill, tension: 0.3, pointRadius: 3, borderWidth: 2.2 };
      }),
    },
    options: {
      plugins: {
        legend: { display: legend ?? datasets.length > 1, position: 'bottom' },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${money ? fmtINRShort(ctx.parsed.y) : fmtNum(ctx.parsed.y)}` } },
      },
      scales: { y: { beginAtZero: true, ticks: money ? { callback: moneyTick } : { precision: 0 } }, x: { grid: { display: false } } },
    },
  });
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/**
 * heatmap(container, {days:[{date, count, amount}], start:'YYYY-MM-DD', months:12, today:'YYYY-MM-DD', onClick(day)})
 * Calendar of maturities: one block per month, one cell per day (Mon-Sun rows), colour by count.
 */
export function heatmap(container, { days = [], start, months = 12, today, onClick }) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const level = (c) => (!c ? '' : c === 1 ? 'l1' : c === 2 ? 'l2' : c <= 4 ? 'l3' : 'l4');
  const wrap = el('div', { class: 'heatmap' });
  let [y, m] = (start || today || new Date().toISOString().slice(0, 10)).split('-').map(Number);
  for (let i = 0; i < months; i++) {
    const first = `${y}-${String(m).padStart(2, '0')}-01`;
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const dow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0
    const grid = el('div', { class: 'hm-grid' });
    for (let k = 0; k < dow; k++) grid.appendChild(el('span', { class: 'hm-cell', style: { visibility: 'hidden' } }));
    for (let d = 1; d <= dim; d++) {
      const iso = addDays(first, d - 1);
      const info = byDate.get(iso);
      const cnt = info ? info.count : 0;
      const past = today && iso < today;
      const cell = el('span', {
        class: `hm-cell ${level(cnt)} ${past && !cnt ? 'past' : ''} ${iso === today ? 'today' : ''}`,
        title: `${fmtDate(iso)}: ${cnt} FDR${cnt === 1 ? '' : 's'}${info && info.amount ? ' · ' + fmtINRShort(info.amount) : ''}`,
        dataset: cnt ? { count: cnt } : {},
      });
      if (cnt && onClick) { cell.style.cursor = 'pointer'; cell.addEventListener('click', () => onClick(info)); }
      grid.appendChild(cell);
    }
    wrap.appendChild(el('div', { class: 'hm-month' }, el('div', { class: 'hm-title' }, `${monthName(m - 1)} ${String(y).slice(2)}`), grid));
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  const legend = el('div', { class: 'hm-legend mt-1' }, el('span', {}, '0'),
    ...['', 'l1', 'l2', 'l3', 'l4'].map((l) => el('span', { class: `hm-cell ${l}`, style: l ? {} : { background: '#edf1f6' } })),
    el('span', {}, '5+'), el('span', { style: { marginLeft: '8px' } }, esc(t('f.maturity_date'))));
  return mount(container, wrap, legend);
}
