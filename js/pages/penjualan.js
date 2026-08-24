/* StokCerdas — Sales Recording & Trend Analytics Page View */

import { store } from '../store.js';
import { formatIDR, formatDate, generateID } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderPenjualan(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { sales, products } = state;

  // Revenue Totals
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date === todayStr);
  const todayRev = todaySales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

  const totalRev30Days = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Pencatatan Penjualan & Analytics</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Catat transaksi penjualan harian. Stok produk akan terpotong secara otomatis!</p>
      </div>
      <button id="btn-add-sale" class="btn btn-primary"><i data-lucide="plus-circle"></i> Catat Penjualan Baru</button>
    </div>

    <!-- Revenue Summary Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-emerald">
        <div class="kpi-top">
          <span class="kpi-label">Omset Penjualan Hari Ini</span>
          <div class="kpi-icon-box"><i data-lucide="shopping-cart"></i></div>
        </div>
        <div class="kpi-value">${formatIDR(todayRev)}</div>
        <div class="kpi-subtext">${todaySales.length} transaksi</div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-top">
          <span class="kpi-label">Total Omset 30 Hari</span>
          <div class="kpi-icon-box"><i data-lucide="trending-up"></i></div>
        </div>
        <div class="kpi-value">${formatIDR(totalRev30Days)}</div>
        <div class="kpi-subtext">Histori 30 Hari Terakhir</div>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="receipt" class="icon-emerald"></i> Riwayat Transaksi Penjualan</h3>
        <span class="badge badge-gray">${sales.length} Transaksi</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Tanggal</th>
              <th>Item Produk Dijual</th>
              <th>Total Revenue (Omset)</th>
            </tr>
          </thead>
          <tbody>
            ${sales.length === 0 
              ? `<tr><td colspan="4" style="text-align: center; color: var(--slate-400); padding: 24px;">Belum ada data transaksi penjualan.</td></tr>`
              : sales.map(s => `
                <tr>
                  <td><strong>#${s.id}</strong></td>
                  <td>${formatDate(s.date)}</td>
                  <td>
                    ${s.items ? s.items.map(i => `• ${i.productName} (<strong>${i.qty}</strong> @ ${formatIDR(i.sellingPrice)})`).join('<br>') : '-'}
                  </td>
                  <td><strong style="color: var(--primary-700); font-size: 1.05rem;">${formatIDR(s.totalRevenue)}</strong></td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach button handler
  document.getElementById('btn-add-sale')?.addEventListener('click', () => openAddSaleModal(products));
}

function openAddSaleModal(products) {
  let selectedItems = [];

  const html = `
    <form id="form-sale">
      <div class="form-group">
        <label class="form-label">Tanggal Transaksi Penjualan *</label>
        <input type="date" id="sale-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Pilih Produk *</label>
          <select id="sale-product-select" class="form-control">
            ${products.map(p => `<option value="${p.id}" data-price="${p.sellingPrice}">${p.name} (Stok: ${p.currentStock} ${p.unit}) - ${formatIDR(p.sellingPrice)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah (Qty) *</label>
          <input type="number" id="sale-qty-input" class="form-control" min="1" value="1">
        </div>
        <div class="form-group" style="display: flex; align-items: flex-end;">
          <button type="button" id="btn-add-item-to-cart" class="btn btn-teal" style="width: 100%;"><i data-lucide="plus"></i> Tambah Item</button>
        </div>
      </div>

      <!-- Item Cart List -->
      <div style="background: var(--slate-50); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 8px;">Daftar Item Transaksi:</h4>
        <div id="sale-cart-list" style="font-size: 0.9rem; color: var(--slate-700);">
          <p style="color: var(--slate-400); text-align: center; margin: 0;">Belum ada item ditambahkan.</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px;">
        <div>
          <span style="font-size: 0.9rem; color: var(--slate-600);">Total Revenue:</span><br>
          <strong id="sale-total-revenue" style="font-size: 1.3rem; color: var(--primary-700);">Rp 0</strong>
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-sale" disabled>Simpan Transaksi Penjualan</button>
        </div>
      </div>
    </form>
  `;

  openModal('Catat Penjualan Baru', html, (body) => {
    const pSelect = body.querySelector('#sale-product-select');
    const qtyInput = body.querySelector('#sale-qty-input');
    const cartList = body.querySelector('#sale-cart-list');
    const totalRevEl = body.querySelector('#sale-total-revenue');
    const submitBtn = body.querySelector('#btn-submit-sale');

    const updateCartUI = () => {
      if (selectedItems.length === 0) {
        cartList.innerHTML = `<p style="color: var(--slate-400); text-align: center; margin: 0;">Belum ada item ditambahkan.</p>`;
        totalRevEl.innerText = 'Rp 0';
        submitBtn.disabled = true;
        return;
      }

      let total = 0;
      cartList.innerHTML = selectedItems.map((item, idx) => {
        const subtotal = item.qty * item.sellingPrice;
        total += subtotal;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
            <span>• <strong>${item.productName}</strong> x ${item.qty} @ ${formatIDR(item.sellingPrice)}</span>
            <div>
              <strong style="color: var(--primary-700); font-size: 0.95rem;">${formatIDR(subtotal)}</strong>
              <button type="button" class="btn btn-sm btn-ghost btn-remove-cart" data-idx="${idx}"><i data-lucide="x" style="color: var(--red-500);"></i></button>
            </div>
          </div>
        `;
      }).join('');

      totalRevEl.innerText = formatIDR(total);
      submitBtn.disabled = false;

      if (window.lucide) window.lucide.createIcons();

      cartList.querySelectorAll('.btn-remove-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-idx'));
          selectedItems.splice(idx, 1);
          updateCartUI();
        });
      });
    };

    body.querySelector('#btn-add-item-to-cart')?.addEventListener('click', () => {
      const pId = pSelect.value;
      const targetP = products.find(p => p.id === pId);
      if (!targetP) return;

      const qty = Number(qtyInput.value) || 1;

      // Check if product already in cart
      const existingIdx = selectedItems.findIndex(i => i.productId === pId);
      if (existingIdx !== -1) {
        selectedItems[existingIdx].qty += qty;
      } else {
        selectedItems.push({
          productId: targetP.id,
          productName: targetP.name,
          qty,
          sellingPrice: targetP.sellingPrice
        });
      }

      updateCartUI();
    });

    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);

    body.querySelector('#form-sale')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (selectedItems.length === 0) return;

      const date = body.querySelector('#sale-date').value;
      const totalRev = selectedItems.reduce((sum, item) => sum + (item.qty * item.sellingPrice), 0);

      const saleRecord = {
        id: `sal-${Math.floor(10000 + Math.random() * 90000)}`,
        date,
        items: [...selectedItems],
        totalRevenue: totalRev
      };

      store.addSaleRecord(saleRecord);
      closeModal();
      showToast('Penjualan berhasil dicatat & stok produk otomatis terpotong!', 'success');
      renderPenjualan();
    });
  });
}
