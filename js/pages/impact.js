/* StokCerdas — Circular Impact Dashboard Page View */

import { store } from '../store.js';
import { formatIDR } from '../utils.js';
import { calculateCircularImpact } from '../engine/impactEngine.js';

export function renderImpact(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const impactData = calculateCircularImpact(state.impact, state.wasteRecords, state.surplusRecords);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Circular Impact & Environmental Dashboard</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Ukur dampak positif efisiensi stok terhadap finansial bisnis dan pengurangan emisi lingkungan.</p>
      </div>
      <span class="badge badge-emerald" style="font-size: 0.9rem; padding: 6px 14px;"><i data-lucide="leaf"></i> Sustainable Business Certification Ready</span>
    </div>

    <!-- Impact Hero Card -->
    <div class="impact-hero-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="text-transform: uppercase; font-weight: 700; font-size: 0.85rem; letter-spacing: 1px; color: rgba(255,255,255,0.8);">Ringkasan Dampak Lingkungan & Finansial</span>
          <h2 style="color: #FFFFFF; font-size: 1.8rem; margin-top: 4px;">Pencegahan Food Waste & Penyelamatan Surplus</h2>
        </div>
        <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
          <i data-lucide="globe"></i>
        </div>
      </div>

      <div class="impact-hero-grid">
        <div class="impact-hero-item">
          <span style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Food Waste Dicegah</span>
          <div class="impact-hero-val">${impactData.totalWastePreventedKg} kg</div>
          <small style="color: rgba(255,255,255,0.7);">Total Bahan Pangan</small>
        </div>

        <div class="impact-hero-item">
          <span style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Nilai Ekonomi Saved</span>
          <div class="impact-hero-val">${impactData.totalEconomicSavedRp}</div>
          <small style="color: rgba(255,255,255,0.7);">Hemat Modal Usaha</small>
        </div>

        <div class="impact-hero-item">
          <span style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Estimated CO₂e Avoided</span>
          <div class="impact-hero-val">${impactData.estimatedCO2eAvoidedKg} kg</div>
          <small style="color: rgba(255,255,255,0.7);">Emisi Karbon Dicegah</small>
        </div>
      </div>
    </div>

    <!-- Impact Metric Breakdown Cards -->
    <div class="kpi-grid" style="margin-bottom: 24px;">
      <div class="kpi-card kpi-teal">
        <div class="kpi-top">
          <span class="kpi-label">Pangan Didonasikan</span>
          <div class="kpi-icon-box"><i data-lucide="heart"></i></div>
        </div>
        <div class="kpi-value">${impactData.totalFoodDonatedKg} <span style="font-size: 1rem;">kg</span></div>
        <div class="kpi-subtext">Disalurkan ke Panti & Bank Pangan</div>
      </div>

      <div class="kpi-card kpi-emerald">
        <div class="kpi-top">
          <span class="kpi-label">Laku Terjual Flash Sale</span>
          <div class="kpi-icon-box"><i data-lucide="tag"></i></div>
        </div>
        <div class="kpi-value">${impactData.totalFlashSaleSold} <span style="font-size: 1rem;">porsi</span></div>
        <div class="kpi-subtext">Surplus Terjual Diskon</div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-top">
          <span class="kpi-label">Diolah Menjadi Kompos</span>
          <div class="kpi-icon-box"><i data-lucide="sprout"></i></div>
        </div>
        <div class="kpi-value">${impactData.totalCompostProcessedKg} <span style="font-size: 1rem;">kg</span></div>
        <div class="kpi-subtext">Pupuk Organik / Maggot Feed</div>
      </div>
    </div>

    <!-- Methodology Notice Card -->
    <div class="card" style="background: var(--slate-100); border-color: var(--slate-300);">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <i data-lucide="info" style="color: var(--slate-600); width: 22px; height: 22px; margin-top: 2px;"></i>
        <div>
          <strong style="color: var(--slate-800);">Metodologi & Sumber Estimasi Emisi Karbon:</strong>
          <p style="font-size: 0.85rem; color: var(--slate-600); margin-top: 4px;">
            ${impactData.methodologyNotice} Perhitungan ini adalah estimasi dampak langsung dari pencegahan penimbunan sampah makanan di TPA (Landfill) yang berpotensi menghasilkan gas metana (CH₄).
          </p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
