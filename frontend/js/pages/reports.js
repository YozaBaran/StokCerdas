/* StokCerdas — Reports Center & Data Export Page View */

import { store } from '../store.js';
import { formatIDR, formatDate, exportToCSV } from '../utils.js';
import { showToast } from '../components/notifications.js';

export function renderReports(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, sales, purchaseOrders, wasteRecords, impact } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Pusat Laporan & Analytics (Reports)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Unduh laporan resmi persediaan, penjualan, pembelian, food waste, dan impact lingkungan.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="btn-print-report" class="btn btn-outline"><i data-lucide="printer"></i> Cetak / Export PDF</button>
      </div>
    </div>

    <!-- 6 Report Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
      
      <!-- 1. Inventory Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="boxes" class="icon-emerald"></i> 1. Laporan Stok & Inventory</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Berisi rincian stok produk, nilai modal (HPP), minimum stock, dan rotasi stok.
        </p>
        <button id="exp-inv-csv" class="btn btn-sm btn-primary" style="width: 100%;"><i data-lucide="download"></i> Download CSV Inventory</button>
      </div>

      <!-- 2. Sales Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="shopping-cart" class="icon-teal"></i> 2. Laporan Penjualan</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Berisi rincian omset penjualan harian, total unit terjual, dan histori transaksi.
        </p>
        <button id="exp-sales-csv" class="btn btn-sm btn-teal" style="width: 100%;"><i data-lucide="download"></i> Download CSV Penjualan</button>
      </div>

      <!-- 3. Purchase Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="truck" class="icon-blue"></i> 3. Laporan Pembelian (PO)</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Berisi riwayat pengeluaran PO, nama supplier, dan status penerimaan barang.
        </p>
        <button id="exp-po-csv" class="btn btn-sm btn-secondary" style="width: 100%;"><i data-lucide="download"></i> Download CSV PO</button>
      </div>

      <!-- 4. Waste Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="trash-2" class="icon-amber"></i> 4. Laporan Food Waste</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Berisi rincian produk terbuang, estimasi kerugian Rp, dan alasan kerusakan.
        </p>
        <button id="exp-waste-csv" class="btn btn-sm btn-amber" style="width: 100%;"><i data-lucide="download"></i> Download CSV Food Waste</button>
      </div>

      <!-- 5. Forecast Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="trending-up" class="icon-emerald"></i> 5. Laporan AI Demand Forecast</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Berisi analisis prediksi permintaan 7 hari, skor kepercayaan AI, dan tingkat risiko.
        </p>
        <button id="exp-forecast-csv" class="btn btn-sm btn-outline" style="width: 100%;"><i data-lucide="download"></i> Download CSV Forecast</button>
      </div>

      <!-- 6. Impact Report -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="leaf" class="icon-teal"></i> 6. Laporan Circular Impact</h3>
        </div>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">
          Ringkasan waste diselamatkan, nilai ekonomi saved, dan estimasi CO₂e avoided.
        </p>
        <button id="exp-impact-csv" class="btn btn-sm btn-outline" style="width: 100%;"><i data-lucide="download"></i> Download CSV Impact</button>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // CSV Export Event Listeners
  document.getElementById('exp-inv-csv')?.addEventListener('click', () => {
    exportToCSV(`StokCerdas_Inventory_${new Date().toISOString().split('T')[0]}.csv`, products);
    showToast('Laporan Inventory berhasil dieksport!', 'success');
  });

  document.getElementById('exp-sales-csv')?.addEventListener('click', () => {
    exportToCSV(`StokCerdas_Penjualan_${new Date().toISOString().split('T')[0]}.csv`, sales);
    showToast('Laporan Penjualan berhasil dieksport!', 'success');
  });

  document.getElementById('exp-po-csv')?.addEventListener('click', () => {
    exportToCSV(`StokCerdas_PurchaseOrders_${new Date().toISOString().split('T')[0]}.csv`, purchaseOrders);
    showToast('Laporan Purchase Order berhasil dieksport!', 'success');
  });

  document.getElementById('exp-waste-csv')?.addEventListener('click', () => {
    exportToCSV(`StokCerdas_FoodWaste_${new Date().toISOString().split('T')[0]}.csv`, wasteRecords);
    showToast('Laporan Food Waste berhasil dieksport!', 'success');
  });

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}
