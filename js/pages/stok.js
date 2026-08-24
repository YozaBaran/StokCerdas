/* StokCerdas — Stock Management Page View */

import { store } from '../store.js';
import { formatIDR, formatDate, generateID } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderStok(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, stockTransactions, suppliers } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Manajemen & Histori Transaksi Stok</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Kelola barang masuk (Stock In), barang keluar (Stock Out), dan Stock Opname.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="btn-stock-in" class="btn btn-primary"><i data-lucide="arrow-down-left"></i> Catat Barang Masuk (Stock In)</button>
        <button id="btn-stock-out" class="btn btn-amber"><i data-lucide="arrow-up-right"></i> Catat Barang Keluar (Stock Out)</button>
        <button id="btn-stock-adjust" class="btn btn-outline"><i data-lucide="sliders"></i> Stock Opname / Penyesuaian</button>
      </div>
    </div>

    <!-- Live Stock Level Overview Table -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="boxes" class="icon-emerald"></i> Kondisi Real-Time Inventory</h3>
        <span class="badge badge-gray">${products.length} Jenis Produk</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>SKU / Nama Produk</th>
              <th>Kategori</th>
              <th>Stok Saat Ini</th>
              <th>Stok Minimal</th>
              <th>Safety Stock</th>
              <th>Status Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => {
              let statusBadge = `<span class="badge badge-emerald">Aman</span>`;
              if (p.currentStock <= p.minimumStock) {
                statusBadge = `<span class="badge badge-red">🔴 Kritis (Min: ${p.minimumStock})</span>`;
              } else if (p.currentStock < (p.minimumStock + p.safetyStock)) {
                statusBadge = `<span class="badge badge-amber">🟡 Menjelang Min</span>`;
              }
              return `
                <tr>
                  <td>
                    <strong>${p.name}</strong><br>
                    <small style="color: var(--slate-400);">${p.sku}</small>
                  </td>
                  <td>${p.category}</td>
                  <td><strong style="font-size: 1.05rem;">${p.currentStock}</strong> ${p.unit}</td>
                  <td>${p.minimumStock} ${p.unit}</td>
                  <td>${p.safetyStock} ${p.unit}</td>
                  <td>${statusBadge}</td>
                  <td>
                    <button class="btn btn-sm btn-ghost btn-adjust-single" data-id="${p.id}">
                      <i data-lucide="edit-2"></i> Koreksi
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Immutable Audit Trail History Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="history" class="icon-teal"></i> Audit Log Mutasi Stok (Immutable)</h3>
        <span class="badge badge-gray">${stockTransactions.length} Transaksi</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Produk</th>
              <th>Tipe Trx</th>
              <th>Jumlah</th>
              <th>Stok Sebelum → Sesudah</th>
              <th>Alasan / Keterangan</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            ${stockTransactions.length === 0 
              ? `<tr><td colspan="7" style="text-align: center; color: var(--slate-400);">Belum ada riwayat mutasi stok.</td></tr>`
              : stockTransactions.map(t => {
                const isInc = t.type === 'Stock In';
                const badge = isInc ? 'badge-emerald' : 'badge-amber';
                return `
                  <tr>
                    <td><small>${formatDate(t.timestamp)}</small></td>
                    <td><strong>${t.productName}</strong></td>
                    <td><span class="badge ${badge}">${t.type}</span></td>
                    <td><strong>${isInc ? '+' : '-'}${t.quantity}</strong></td>
                    <td>${t.qtyBefore} → <strong>${t.qtyAfter}</strong></td>
                    <td>${t.reason}</td>
                    <td><small style="color: var(--slate-500);">${t.user}</small></td>
                  </tr>
                `;
              }).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach button event listeners
  document.getElementById('btn-stock-in')?.addEventListener('click', () => openStockInModal(products, suppliers));
  document.getElementById('btn-stock-out')?.addEventListener('click', () => openStockOutModal(products));
  document.getElementById('btn-stock-adjust')?.addEventListener('click', () => openStockAdjustModal(products));

  container.querySelectorAll('.btn-adjust-single').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-id');
      const targetP = products.find(p => p.id === pId);
      if (targetP) openStockAdjustModal(products, targetP);
    });
  });
}

function openStockInModal(products, suppliers) {
  const html = `
    <form id="form-stock-in">
      <div class="form-group">
        <label class="form-label">Pilih Produk *</label>
        <select id="sin-product" class="form-control" required>
          ${products.map(p => `<option value="${p.id}">${p.name} (Stok Saat Ini: ${p.currentStock} ${p.unit})</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Jumlah Barang Masuk *</label>
          <input type="number" id="sin-qty" class="form-control" min="1" value="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Harga Beli Satuan (Rp)</label>
          <input type="number" id="sin-price" class="form-control" value="48000">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Supplier</label>
          <select id="sin-supplier" class="form-control">
            ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Kadaluarsa (Batch Expiry)</label>
          <input type="date" id="sin-expiry" class="form-control">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Alasan / Catatan *</label>
        <input type="text" id="sin-reason" class="form-control" value="Pembelian rutin pasokan gudang" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Stock In</button>
      </div>
    </form>
  `;

  openModal('Catat Barang Masuk (Stock In)', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-stock-in')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pId = body.querySelector('#sin-product').value;
      const qty = Number(body.querySelector('#sin-qty').value);
      const reason = body.querySelector('#sin-reason').value;

      store.adjustStock({
        productId: pId,
        changeQty: qty,
        type: 'Stock In',
        reason
      });

      closeModal();
      showToast('Berhasil mencatat barang masuk!', 'success');
      renderStok();
    });
  });
}

function openStockOutModal(products) {
  const html = `
    <form id="form-stock-out">
      <div class="form-group">
        <label class="form-label">Pilih Produk *</label>
        <select id="sout-product" class="form-control" required>
          ${products.map(p => `<option value="${p.id}">${p.name} (Stok Saat Ini: ${p.currentStock} ${p.unit})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Barang Keluar *</label>
        <input type="number" id="sout-qty" class="form-control" min="1" value="2" required>
      </div>
      <div class="form-group">
        <label class="form-label">Alasan Keluar *</label>
        <select id="sout-reason" class="form-control" required>
          <option value="Sale / Penjualan">Penjualan / Dapur Katering</option>
          <option value="Production / Pemakaian Produksi">Pemakaian Produksi / Pembuatan Menu</option>
          <option value="Damaged / Rusak">Barang Rusak / Pecah</option>
          <option value="Expired / Kadaluarsa">Kadaluarsa</option>
          <option value="Donation / Donasi">Donasi Pangan</option>
          <option value="Other / Lainnya">Lainnya</option>
        </select>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-amber">Simpan Stock Out</button>
      </div>
    </form>
  `;

  openModal('Catat Barang Keluar (Stock Out)', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-stock-out')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pId = body.querySelector('#sout-product').value;
      const qty = Number(body.querySelector('#sout-qty').value);
      const reason = body.querySelector('#sout-reason').value;

      store.adjustStock({
        productId: pId,
        changeQty: -qty,
        type: 'Stock Out',
        reason
      });

      closeModal();
      showToast('Berhasil mencatat barang keluar!', 'warning');
      renderStok();
    });
  });
}

function openStockAdjustModal(products, preSelectedProduct = null) {
  const selectedId = preSelectedProduct ? preSelectedProduct.id : (products[0] ? products[0].id : '');
  
  const html = `
    <form id="form-stock-adjust">
      <div class="form-group">
        <label class="form-label">Pilih Produk *</label>
        <select id="adj-product" class="form-control" required>
          ${products.map(p => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.name} (Stok Sistem: ${p.currentStock} ${p.unit})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Stok Fisik Sebenarnya (Stock Opname) *</label>
        <input type="number" id="adj-real-qty" class="form-control" min="0" value="${preSelectedProduct ? preSelectedProduct.currentStock : 10}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Alasan Koreksi / Opname *</label>
        <input type="text" id="adj-reason" class="form-control" value="Hasil Audit Stock Opname Fisik" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Koreksi Stok</button>
      </div>
    </form>
  `;

  openModal('Stock Opname / Koreksi Stok', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-stock-adjust')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pId = body.querySelector('#adj-product').value;
      const targetP = products.find(p => p.id === pId);
      if (!targetP) return;

      const realQty = Number(body.querySelector('#adj-real-qty').value);
      const diff = realQty - targetP.currentStock;
      const reason = body.querySelector('#adj-reason').value;

      store.adjustStock({
        productId: pId,
        changeQty: diff,
        type: 'Stock Adjustment',
        reason: `${reason} (Selisih: ${diff >= 0 ? '+' : ''}${diff})`
      });

      closeModal();
      showToast('Koreksi stok berhasil disimpan!', 'success');
      renderStok();
    });
  });
}
