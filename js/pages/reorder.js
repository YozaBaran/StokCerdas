/* StokCerdas — Smart Reorder Recommendation Page View */

import { store } from '../store.js';
import { formatIDR } from '../utils.js';
import { generateSmartReorderRecommendations } from '../engine/reorderEngine.js';
import { openCreatePOModal } from './pembelian.js';

export function renderReorder(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, sales, suppliers } = state;

  const recommendations = generateSmartReorderRecommendations(products, sales, suppliers);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Smart Reorder Engine (Rekomendasi Pembelian)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Algoritma menghitung jumlah pembelian optimal agar tidak stockout maupun overstock.</p>
      </div>
      <span class="badge badge-teal" style="font-size: 0.9rem; padding: 6px 14px;"><i data-lucide="sparkles"></i> ${recommendations.length} Rekomendasi Siap</span>
    </div>

    ${recommendations.length === 0 
      ? `<div class="card" style="text-align: center; padding: 50px 20px;">
          <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--primary-600); margin-bottom: 12px;"></i>
          <h3>Stok Dalam Kondisi Sangat Aman!</h3>
          <p style="color: var(--slate-500); margin-top: 4px;">Tidak ada rekomendasi pembelian saat ini. Seluruh produk mencukupi kebutuhan prediksi permintaan dan safety stock.</p>
         </div>`
      : `<div style="display: flex; flex-direction: column; gap: 16px;">
          ${recommendations.map(r => `
            <div class="card" style="border-left: 4px solid ${r.priority === 'HIGH' ? 'var(--red-500)' : 'var(--amber-500)'}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 style="font-size: 1.15rem; font-weight: 700;">${r.productName}</h3>
                    <span class="badge ${r.priority === 'HIGH' ? 'badge-red' : 'badge-amber'}">${r.priority === 'HIGH' ? '🔴 Kritis Stockout' : '🟡 Peringatan Restock'}</span>
                  </div>
                  <small style="color: var(--slate-400);">Supplier: <strong>${r.supplierName}</strong> (Lead time: ${r.leadTimeDays} hari | MOQ: ${r.moq} ${r.unit})</small>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.8rem; color: var(--slate-500);">Perkiraan Biaya:</span><br>
                  <strong style="font-size: 1.2rem; color: var(--primary-700);">${formatIDR(r.estimatedTotalCost)}</strong>
                </div>
              </div>

              <!-- Recommendation Metrics Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; background: var(--slate-50); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 12px;">
                <div>
                  <span style="font-size: 0.75rem; color: var(--slate-500);">Stok Saat Ini</span><br>
                  <strong>${r.currentStock} ${r.unit}</strong>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: var(--slate-500);">Prediksi Permintaan</span><br>
                  <strong>${r.predictedDemand} ${r.unit}</strong>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: var(--slate-500);">Safety Stock</span><br>
                  <strong>${r.safetyStock} ${r.unit}</strong>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: var(--slate-500);">Rekomendasi Order</span><br>
                  <strong style="color: var(--primary-600); font-size: 1.1rem;">${r.recommendedOrderQty} ${r.unit}</strong>
                </div>
              </div>

              <!-- Rationale Banner & Action Button -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <p style="font-size: 0.88rem; color: var(--slate-600); flex: 1; min-width: 250px;">
                  💡 <em>"${r.rationale}"</em>
                </p>
                <button class="btn btn-primary btn-create-po-rec" data-rec='${JSON.stringify(r).replace(/'/g, "&apos;")}'>
                  <i data-lucide="truck"></i> Buat Purchase Order
                </button>
              </div>
            </div>
          `).join('')}
         </div>`
    }
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach [Buat Purchase Order] action handlers
  container.querySelectorAll('.btn-create-po-rec').forEach(btn => {
    btn.addEventListener('click', () => {
      const recData = JSON.parse(btn.getAttribute('data-rec'));
      openCreatePOModal(suppliers, products, recData);
    });
  });
}
