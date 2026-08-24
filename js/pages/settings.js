/* StokCerdas — Settings & Role Management Page View */

import { store } from '../store.js';
import { showToast } from '../components/notifications.js';

export function renderSettings(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { business, userRole, isDemoMode } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Pengaturan Profil & Hak Akses (Settings)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Kelola identitas profil UMKM, hak akses pengguna (RBAC), serta preferensi sistem.</p>
      </div>
      <span class="badge badge-gray" style="font-size: 0.85rem; padding: 6px 12px;">Role Aktif: <strong>${userRole.toUpperCase()}</strong></span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
      
      <!-- Business Profile Form Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="store" class="icon-emerald"></i> Profil Bisnis UMKM</h3>
        </div>
        <form id="form-settings-biz">
          <div class="form-group">
            <label class="form-label">Nama Bisnis / Usaha *</label>
            <input type="text" id="set-biz-name" class="form-control" value="${business.name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Kategori / Tipe Usaha *</label>
            <select id="set-biz-type" class="form-control" required>
              <option value="UMKM Kuliner (Restoran & Katering)" ${business.type?.includes('Kuliner') ? 'selected' : ''}>UMKM Kuliner (Restoran, Cafe, Katering, Warung)</option>
              <option value="UMKM Retail Food (Sembako & Minimarket)" ${business.type?.includes('Retail') ? 'selected' : ''}>UMKM Retail Food (Sembako, Frozen Food, Minimarket)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Pemilik (Owner)</label>
              <input type="text" id="set-biz-owner" class="form-control" value="${business.owner || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Lokasi / Kota</label>
              <input type="text" id="set-biz-location" class="form-control" value="${business.location || ''}">
            </div>
          </div>
          <div style="margin-top: 16px;">
            <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Simpan Profil Bisnis</button>
          </div>
        </form>
      </div>

      <!-- Role-Based Access Control (RBAC) Matrix Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="shield-check" class="icon-teal"></i> Matriks Hak Akses User Role</h3>
        </div>
        
        <div style="font-size: 0.88rem; color: var(--slate-700); margin-bottom: 16px;">
          Pilih role aktif untuk mensimulasikan pembatasan hak akses karyawan:
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
            <input type="radio" name="role-radio" value="owner" ${userRole === 'owner' ? 'checked' : ''} style="margin-top: 3px;">
            <div>
              <strong>Owner (Akses Penuh)</strong><br>
              <small style="color: var(--slate-500);">Akses penuh ke Dashboard, Financial Insight, Forecasting, Reorder, Waste, Impact, & Reports.</small>
            </div>
          </label>

          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
            <input type="radio" name="role-radio" value="manager" ${userRole === 'manager' ? 'checked' : ''} style="margin-top: 3px;">
            <div>
              <strong>Manager (Operasional + Reports)</strong><br>
              <small style="color: var(--slate-500);">Akses operasional harian stok, supplier, PO, dan laporan dasar.</small>
            </div>
          </label>

          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
            <input type="radio" name="role-radio" value="staff" ${userRole === 'staff' ? 'checked' : ''} style="margin-top: 3px;">
            <div>
              <strong>Staff / Karyawan (Stok & Sales Input)</strong><br>
              <small style="color: var(--slate-500);">Akses terbatas untuk pencatatan barang masuk/keluar, stock opname, & input penjualan.</small>
            </div>
          </label>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span>Demo Mode Status: <strong>${isDemoMode ? 'Aktif (Kedai Nusantara)' : 'Non-aktif (Ruang Kosong)'}</strong></span>
          <button id="btn-toggle-demo-settings" class="btn btn-sm btn-outline">
            <i data-lucide="refresh-cw"></i> Reset / Switch Demo State
          </button>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach Form Submit
  document.getElementById('form-settings-biz')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedBiz = {
      ...state.business,
      name: document.getElementById('set-biz-name').value,
      type: document.getElementById('set-biz-type').value,
      owner: document.getElementById('set-biz-owner').value,
      location: document.getElementById('set-biz-location').value
    };

    store.getState().business = updatedBiz;
    store.saveState();
    showToast('Profil bisnis berhasil diperbarui!', 'success');
  });

  // Attach Role Radio Listeners
  container.querySelectorAll('input[name="role-radio"]').forEach(r => {
    r.addEventListener('change', (e) => {
      store.setUserRole(e.target.value);
      showToast(`Hak akses diubah ke role: ${e.target.value.toUpperCase()}`, 'info');
    });
  });

  // Toggle Demo State
  document.getElementById('btn-toggle-demo-settings')?.addEventListener('click', () => {
    if (confirm('Ubah status Demo Mode? Memuat sampel data baru.')) {
      store.setDemoMode(!isDemoMode);
      window.location.reload();
    }
  });
}
