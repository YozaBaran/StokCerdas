/* StokCerdas — Dashboard Page View */

import { store } from '../store.js';
import { formatIDR } from '../utils.js';
import { generateSmartReorderRecommendations } from '../engine/reorderEngine.js';

export function renderDashboard(onNavigate, onTriggerAction) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, sales, wasteRecords, impact, suppliers, expiryBatches } = state;

  // KPI Calculations
  const totalStockQty = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * (p.purchasePrice || 0), 0);
  
  // Today's Sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date === todayStr);
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

  // Low stock products
  const lowStockProducts = products.filter(p => p.currentStock <= (p.minimumStock || 5));
  
  // Overstock products (current stock > 2.5x minimum stock)
  const overstockProducts = products.filter(p => p.currentStock > (p.minimumStock * 2.5));

  // Near Expiry
  const nearExpiryBatches = expiryBatches.filter(b => {
    const diffDays = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  // Food waste
  const totalWasteKg = wasteRecords.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);
  const wasteSavedKg = impact.totalFoodWastePreventedKg || 38.5;

  // Reorder recommendations count
  const reorders = generateSmartReorderRecommendations(products, sales, suppliers);
  const criticalReordersCount = reorders.filter(r => r.priority === 'HIGH').length;

  container.innerHTML = `
    <!-- Page Title Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Dashboard Performa & Stok</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Selamat datang kembali, <strong>${state.business.owner || 'Budi Santoso'}</strong>! Berikut ringkasan real-time usaha Anda.</p>
      </div>
      <button id="ai-assistant-shortcut" class="btn btn-teal">
        <i data-lucide="bot"></i> Tanya AI Assistant
      </button>
    </div>

    <!-- AI Summary Card: StokCerdas AI Insight -->
    <div class="ai-summary-card">
      <div class="ai-summary-header">
        <div class="ai-badge"><i data-lucide="sparkles"></i> StokCerdas AI Insight</div>
        <span style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Diperbarui real-time</span>
      </div>
      <div class="ai-insights-list">
        ${criticalReordersCount > 0 
          ? `<div class="ai-insight-item critical">
              <span>🔴 <strong>${criticalReordersCount} produk berisiko stockout</strong> dalam 3 hari ke depan. Disarankan segera buat PO ke supplier.</span>
             </div>`
          : `<div class="ai-insight-item success">
              <span>🟢 Tidak ada produk kritis. Stok berada dalam rentang aman.</span>
             </div>`
        }

        ${overstockProducts.length > 0 
          ? `<div class="ai-insight-item warning">
              <span>🟡 <strong>${overstockProducts.length} produk mengalami overstock risk</strong>. Pertimbangkan promosi atau penyesuaian porsi.</span>
             </div>`
          : ''
        }

        ${nearExpiryBatches.length > 0 
          ? `<div class="ai-insight-item warning">
              <span>🟡 <strong>${nearExpiryBatches.length} batch bahan</strong> akan kadaluarsa dalam 3 hari. Aktifkan modul Selamatkan Surplus!</span>
             </div>`
          : ''
        }

        <div class="ai-insight-item success">
          <span>🟢 <strong>${wasteSavedKg} kg makanan</strong> berhasil diselamatkan bulan ini (Estimasi penghematan ${formatIDR(impact.totalSurplusSavedValueRp)}).</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="quick-actions-bar">
      <button id="act-add-product" class="btn btn-primary"><i data-lucide="plus-circle"></i> Tambah Produk</button>
      <button id="act-record-sale" class="btn btn-secondary"><i data-lucide="shopping-cart"></i> Catat Penjualan</button>
      <button id="act-record-stock" class="btn btn-secondary"><i data-lucide="boxes"></i> Catat Stok (Stock In/Out)</button>
      <button id="act-create-po" class="btn btn-secondary"><i data-lucide="truck"></i> Buat Purchase Order</button>
      <button id="act-stock-opname" class="btn btn-outline"><i data-lucide="clipboard-check"></i> Stock Opname</button>
    </div>

    <!-- KPI Cards Grid -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-emerald">
        <div class="kpi-top">
          <span class="kpi-label">Total Volume Stok</span>
          <div class="kpi-icon-box"><i data-lucide="boxes"></i></div>
        </div>
        <div class="kpi-value">${totalStockQty} <span style="font-size: 1rem;">item</span></div>
        <div class="kpi-subtext">${products.length} varian aktif</div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-top">
          <span class="kpi-label">Nilai Modal Stok</span>
          <div class="kpi-icon-box"><i data-lucide="wallet"></i></div>
        </div>
        <div class="kpi-value">${formatIDR(totalStockValue)}</div>
        <div class="kpi-subtext">Berdasarkan HPP Pembelian</div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-top">
          <span class="kpi-label">Penjualan Hari Ini</span>
          <div class="kpi-icon-box"><i data-lucide="trending-up"></i></div>
        </div>
        <div class="kpi-value">${formatIDR(todayRevenue)}</div>
        <div class="kpi-subtext">${todaySales.length} transaksi dicatat</div>
      </div>

      <div class="kpi-card kpi-red">
        <div class="kpi-top">
          <span class="kpi-label">Stok Kritis / Minimal</span>
          <div class="kpi-icon-box"><i data-lucide="alert-triangle"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--red-600);">${lowStockProducts.length} <span style="font-size: 1rem;">produk</span></div>
        <div class="kpi-subtext">Di bawah threshold min stock</div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-top">
          <span class="kpi-label">Hampir Kadaluarsa</span>
          <div class="kpi-icon-box"><i data-lucide="clock"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--amber-600);">${nearExpiryBatches.length} <span style="font-size: 1rem;">batch</span></div>
        <div class="kpi-subtext">Kadaluarsa dalam <= 3 hari</div>
      </div>

      <div class="kpi-card kpi-emerald">
        <div class="kpi-top">
          <span class="kpi-label">Waste Diselamatkan</span>
          <div class="kpi-icon-box"><i data-lucide="leaf"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--primary-600);">${wasteSavedKg} <span style="font-size: 1rem;">kg</span></div>
        <div class="kpi-subtext">Diselamatkan dari pembuangan</div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="line-chart" class="icon-emerald"></i> Tren Penjualan 7 Hari Terakhir</h3>
          <span class="badge badge-gray">IDR (Rp)</span>
        </div>
        <div class="chart-box">
          <canvas id="salesTrendChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="pie-chart" class="icon-teal"></i> Komposisi Stok per Kategori</h3>
          <span class="badge badge-gray">Persentase</span>
        </div>
        <div class="chart-box">
          <canvas id="stockCategoryChart"></canvas>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach quick action listeners
  document.getElementById('ai-assistant-shortcut')?.addEventListener('click', () => onNavigate('aiAssistant'));
  document.getElementById('act-add-product')?.addEventListener('click', () => onNavigate('produk'));
  document.getElementById('act-record-sale')?.addEventListener('click', () => onNavigate('penjualan'));
  document.getElementById('act-record-stock')?.addEventListener('click', () => onNavigate('stok'));
  document.getElementById('act-create-po')?.addEventListener('click', () => onNavigate('pembelian'));
  document.getElementById('act-stock-opname')?.addEventListener('click', () => onNavigate('stok'));

  // Render Chart.js Visualizations
  renderDashboardCharts(sales, products);
}

function renderDashboardCharts(sales, products) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Sales Trend 7 Days
  const ctxSales = document.getElementById('salesTrendChart')?.getContext('2d');
  if (ctxSales) {
    const last7Sales = sales.slice(0, 7).reverse();
    const labels = last7Sales.map(s => s.date ? s.date.substring(5) : '');
    const data = last7Sales.map(s => s.totalRevenue || 0);

    new Chart(ctxSales, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Omset Penjualan (Rp)',
          data,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#059669'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: value => 'Rp ' + (value / 1000) + 'k'
            }
          }
        }
      }
    });
  }

  // Chart 2: Category Breakdown
  const ctxCategory = document.getElementById('stockCategoryChart')?.getContext('2d');
  if (ctxCategory) {
    const catMap = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + (p.currentStock * (p.purchasePrice || 10000));
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#10B981', '#14B8A6', '#F59E0B', '#3B82F6', '#9333EA']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
