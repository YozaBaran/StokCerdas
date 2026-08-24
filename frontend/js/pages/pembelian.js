/* StokCerdas — Purchase Order Workflow Page View */

import { store } from '../store.js';
import { formatIDR, formatDate } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderPembelian(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { purchaseOrders, suppliers, products } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Purchase Orders (PO Pembelian)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Kelola pesanan pembelian ke supplier. Ketika PO diset ke 'Received', stok otomatis bertambah!</p>
      </div>
      <button id="btn-create-po-manual" class="btn btn-primary"><i data-lucide="plus"></i> Buat PO Baru</button>
    </div>

    <!-- PO Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="truck" class="icon-emerald"></i> Daftar Purchase Order</h3>
        <span class="badge badge-gray">${purchaseOrders.length} PO</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>No. PO</th>
              <th>Supplier</th>
              <th>Tanggal PO</th>
              <th>Total Biaya (Rp)</th>
              <th>Status PO</th>
              <th>Ekspektasi Tiba</th>
              <th>Aksi Update Status</th>
            </tr>
          </thead>
          <tbody>
            ${purchaseOrders.length === 0 
              ? `<tr><td colspan="7" style="text-align: center; color: var(--slate-400); padding: 30px;">Belum ada Purchase Order.</td></tr>`
              : purchaseOrders.map(po => {
                let badgeClass = 'badge-gray';
                if (po.status === 'Draft') badgeClass = 'badge-gray';
                if (po.status === 'Sent') badgeClass = 'badge-blue';
                if (po.status === 'Confirmed') badgeClass = 'badge-purple';
                if (po.status === 'Received') badgeClass = 'badge-amber';
                if (po.status === 'Completed') badgeClass = 'badge-emerald';

                return `
                  <tr>
                    <td><strong>${po.poNumber}</strong></td>
                    <td>${po.supplierName}</td>
                    <td>${formatDate(po.dateCreated)}</td>
                    <td><strong>${formatIDR(po.totalAmount)}</strong></td>
                    <td><span class="badge ${badgeClass}">${po.status}</span></td>
                    <td>${formatDate(po.expectedDelivery)}</td>
                    <td>
                      <select class="form-control po-status-select" data-id="${po.id}" style="padding: 4px 8px; font-size: 0.8rem; width: 140px;">
                        <option value="Draft" ${po.status === 'Draft' ? 'selected' : ''}>Draft</option>
                        <option value="Sent" ${po.status === 'Sent' ? 'selected' : ''}>Sent (Kirim)</option>
                        <option value="Confirmed" ${po.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Received" ${po.status === 'Received' ? 'selected' : ''}>Received (Terima Stok)</option>
                        <option value="Completed" ${po.status === 'Completed' ? 'selected' : ''}>Completed</option>
                      </select>
                    </td>
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

  // Attach PO status change listeners
  container.querySelectorAll('.po-status-select').forEach(sel => {
    sel.addEventListener('change', e => {
      const poId = sel.getAttribute('data-id');
      const newStatus = e.target.value;

      store.updatePOStatus(poId, newStatus);
      if (newStatus === 'Received' || newStatus === 'Completed') {
        showToast(`PO ${poId} berhasil diterima & stok produk otomatis bertambah!`, 'success');
      } else {
        showToast(`Status PO diperbarui ke ${newStatus}`, 'info');
      }
      renderPembelian();
    });
  });

  // Attach button handler
  document.getElementById('btn-create-po-manual')?.addEventListener('click', () => openCreatePOModal(suppliers, products));
}

export function openCreatePOModal(suppliers, products, prefillData = null) {
  const selectedSupplierId = prefillData ? prefillData.supplierId : (suppliers[0] ? suppliers[0].id : '');
  
  const html = `
    <form id="form-create-po">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Pilih Supplier *</label>
          <select id="po-supplier" class="form-control" required>
            ${suppliers.map(s => `<option value="${s.id}" ${s.id === selectedSupplierId ? 'selected' : ''}>${s.name} (Lead time: ${s.leadTimeDays} hr)</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal PO *</label>
          <input type="date" id="po-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Produk yang Dipesan *</label>
        <select id="po-product-select" class="form-control">
          ${products.map(p => `<option value="${p.id}" data-price="${p.purchasePrice}">${p.name} (Harga Beli: ${formatIDR(p.purchasePrice)})</option>`).join('')}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Jumlah Order (Qty) *</label>
          <input type="number" id="po-qty-input" class="form-control" value="${prefillData ? prefillData.recommendedOrderQty : 10}" min="1">
        </div>
        <div class="form-group" style="display: flex; align-items: flex-end;">
          <button type="button" id="btn-add-po-item" class="btn btn-teal" style="width: 100%;"><i data-lucide="plus"></i> Tambah ke PO</button>
        </div>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 8px;">Daftar Item Purchase Order:</h4>
        <div id="po-items-list" style="font-size: 0.9rem; color: var(--slate-700);">
          <!-- Dynamic PO items -->
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px;">
        <div>
          <span style="font-size: 0.9rem; color: var(--slate-600);">Total Perkiraan Biaya:</span><br>
          <strong id="po-total-amount" style="font-size: 1.3rem; color: var(--primary-700);">Rp 0</strong>
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-po">Simpan & Kirim PO</button>
        </div>
      </div>
    </form>
  `;

  openModal('Buat Purchase Order Baru', html, (body) => {
    let poItems = [];

    // Pre-populate if created from Reorder engine recommendation
    if (prefillData) {
      poItems.push({
        productId: prefillData.productId,
        productName: prefillData.productName,
        quantity: prefillData.recommendedOrderQty,
        unitPrice: prefillData.unitPurchasePrice || 10000,
        subtotal: prefillData.recommendedOrderQty * (prefillData.unitPurchasePrice || 10000)
      });
    }

    const pSelect = body.querySelector('#po-product-select');
    const qtyInput = body.querySelector('#po-qty-input');
    const listContainer = body.querySelector('#po-items-list');
    const totalEl = body.querySelector('#po-total-amount');

    const updatePOListUI = () => {
      if (poItems.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--slate-400); text-align: center; margin: 0;">Belum ada produk dimasukkan.</p>`;
        totalEl.innerText = 'Rp 0';
        return;
      }

      let total = 0;
      listContainer.innerHTML = poItems.map((item, idx) => {
        total += item.subtotal;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
            <span>• <strong>${item.productName}</strong> (${item.quantity} unit @ ${formatIDR(item.unitPrice)})</span>
            <div>
              <strong style="color: var(--primary-700); font-size: 0.95rem;">${formatIDR(item.subtotal)}</strong>
              <button type="button" class="btn btn-sm btn-ghost btn-remove-po-item" data-idx="${idx}"><i data-lucide="x" style="color: var(--red-500);"></i></button>
            </div>
          </div>
        `;
      }).join('');

      totalEl.innerText = formatIDR(total);

      if (window.lucide) window.lucide.createIcons();

      listContainer.querySelectorAll('.btn-remove-po-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-idx'));
          poItems.splice(idx, 1);
          updatePOListUI();
        });
      });
    };

    updatePOListUI();

    body.querySelector('#btn-add-po-item')?.addEventListener('click', () => {
      const pId = pSelect.value;
      const targetP = products.find(p => p.id === pId);
      if (!targetP) return;

      const qty = Number(qtyInput.value) || 1;
      const subtotal = qty * targetP.purchasePrice;

      poItems.push({
        productId: targetP.id,
        productName: targetP.name,
        quantity: qty,
        unitPrice: targetP.purchasePrice,
        subtotal
      });

      updatePOListUI();
    });

    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);

    body.querySelector('#form-create-po')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (poItems.length === 0) {
        alert('Masukkan minimal 1 produk ke dalam PO.');
        return;
      }

      const supId = body.querySelector('#po-supplier').value;
      const targetSup = suppliers.find(s => s.id === supId) || { name: 'Supplier Umum', leadTimeDays: 2 };
      const dateCreated = body.querySelector('#po-date').value;

      const expDeliveryDate = new Date(dateCreated);
      expDeliveryDate.setDate(expDeliveryDate.getDate() + (targetSup.leadTimeDays || 2));

      const totalAmt = poItems.reduce((sum, i) => sum + i.subtotal, 0);

      const newPO = {
        id: `po-${Math.floor(100 + Math.random() * 900)}`,
        poNumber: `PO-${new Date().toISOString().slice(0,7).replace('-','')}-${Math.floor(100 + Math.random() * 900)}`,
        supplierId: supId,
        supplierName: targetSup.name,
        dateCreated,
        status: 'Sent',
        items: [...poItems],
        totalAmount: totalAmt,
        expectedDelivery: expDeliveryDate.toISOString().split('T')[0]
      };

      store.addPurchaseOrder(newPO);
      closeModal();
      showToast('Purchase Order berhasil dibuat dan dikirim ke supplier!', 'success');
      renderPembelian();
    });
  });
}
