/* StokCerdas — AI Demand Forecasting Page View */

import { store } from '../store.js';
import { getFullForecastReport } from '../engine/forecasting.js';

export function renderForecast(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, sales } = state;

  const forecastReports = getFullForecastReport(products, sales);
  const totalDaysObserved = new Set(sales.map(s => s.date)).size;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">AI Demand Forecasting (Prediksi Permintaan 7 Hari)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Model AI menganalisis velocity penjualan, hari-dalam-minggu, tren, dan lead time supplier.</p>
      </div>
      <button id="btn-goto-reorder" class="btn btn-teal">
        <i data-lucide="sparkles"></i> Lanjut ke Smart Reorder Engine
      </button>
    </div>

    ${totalDaysObserved < 7 
      ? `<div class="card" style="background: var(--amber-50); border-color: var(--amber-500); margin-bottom: 20px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <i data-lucide="alert-circle" style="color: var(--amber-600); width: 24px; height: 24px;"></i>
            <div>
              <strong style="color: var(--amber-600);">Catatan Data Penjualan Belum Cukup (Baru ${totalDaysObserved} Hari Observasi)</strong>
              <p style="font-size: 0.85rem; color: var(--slate-700); margin-top: 2px;">
                Forecasting AI paling akurat membutuhkan minimal 7-14 hari data penjualan harian. Saat ini sistem menggunakan fallback Weighted Moving Average.
              </p>
            </div>
          </div>
         </div>`
      : ''
    }

    <!-- Forecast Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="trending-up" class="icon-emerald"></i> Proyeksi Kebutuhan Stok 7 Hari Ke Depan</h3>
        <span class="badge badge-emerald">Confidence Avg: 85%</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Stok Saat Ini</th>
              <th>Velocity Penjualan Harian</th>
              <th>Prediksi Permintaan 7 Hari</th>
              <th>Skor Kepercayaan AI</th>
              <th>Level Risiko Stok</th>
            </tr>
          </thead>
          <tbody>
            ${forecastReports.map(f => `
              <tr>
                <td><strong>${f.productName}</strong></td>
                <td><strong style="font-size: 1.05rem;">${f.currentStock}</strong> ${f.unit}</td>
                <td>~${f.dailyAverageVelocity} ${f.unit} / hari</td>
                <td><strong>${f.predicted7DayDemand}</strong> ${f.unit}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; background: var(--slate-200); height: 8px; border-radius: 4px; overflow: hidden; max-width: 80px;">
                      <div style="width: ${f.confidenceScore}%; background: var(--primary-600); height: 100%;"></div>
                    </div>
                    <small>${f.confidenceScore}%</small>
                  </div>
                </td>
                <td><span class="badge ${f.riskBadgeClass}">${f.riskLevel}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('btn-goto-reorder')?.addEventListener('click', () => onNavigate('reorder'));
}
