/* StokCerdas — Product Catalog Management Page View */

import { store } from '../store.js';
import { formatIDR, generateSKU, generateID, exportToCSV } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderProduk(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, categories, suppliers } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Katalog & Manajemen Produk</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Kelola master data produk, harga, threshold minimum stok, dan lead time supplier.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="btn-export-csv" class="btn btn-outline"><i data-lucide="download"></i> Export CSV</button>
        <button id="btn-add-product" class="btn btn-primary"><i data-lucide="plus"></i> Tambah Produk Baru</button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="search-filter-bar">
      <div class="search-box">
        <i data-lucide="search"></i>
        <input type="text" id="search-product-input" class="form-control" placeholder="Cari nama produk, SKU, atau kategori...">
      </div>
      <select id="filter-category-select" class="form-control" style="width: 200px;">
        <option value="">Semua Kategori</option>
        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>

    <!-- Product Table Card -->
    <div class="card">
      <div class="table-container">
        <table class="table" id="product-table">
          <thead>
            <tr>
              <th>SKU / Nama Produk</th>
              <th>Kategori</th>
              <th>Harga Beli (HPP)</th>
              <th>Harga Jual</th>
              <th>Stok saat Ini</th>
              <th>Min / Safety Stock</th>
              <th>Lead Time</th>
              <th>Status Expiry</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="product-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Initial render of product rows
  renderProductRows(products);

  // Search and Filter Listeners
  const searchInput = document.getElementById('search-product-input');
  const catSelect = document.getElementById('filter-category-select');

  const filterHandler = () => {
    const q = searchInput.value.toLowerCase();
    const cat = catSelect.value;
    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = cat === '' || p.category === cat;
      return matchSearch && matchCat;
    });
    renderProductRows(filtered);
  };

  searchInput?.addEventListener('input', filterHandler);
  catSelect?.addEventListener('change', filterHandler);

  // Button Action Listeners
  document.getElementById('btn-add-product')?.addEventListener('click', () => openProductModal(categories, suppliers));
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    exportToCSV(`StokCerdas_Produk_${new Date().toISOString().split('T')[0]}.csv`, products);
    showToast('Berhasil mengeksport data produk ke CSV!', 'success');
  });
}

function renderProductRows(products) {
  const tbody = document.getElementById('product-table-body');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px 20px;">
      <div style="max-width: 400px; margin: 0 auto;">
        <i data-lucide="package-open" style="width: 48px; height: 48px; color: var(--slate-300); margin-bottom: 12px;"></i>
        <h4 style="margin-bottom: 6px; color: var(--slate-700);">Katalog Produk Masih Kosong</h4>
        <p style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 16px;">Tambahkan produk/bahan baku pertama toko Anda untuk mulai memantau stok dan penjualan.</p>
        <button id="empty-add-product-btn" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Tambah Produk Pertama</button>
      </div>
    </td></tr>`;
    if (window.lucide) window.lucide.createIcons();
    document.getElementById('empty-add-product-btn')?.addEventListener('click', () => {
      const state = store.getState();
      openProductModal(state.categories, state.suppliers);
    });
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <strong>${p.name}</strong><br>
        <small style="color: var(--slate-400);">${p.sku}</small>
      </td>
      <td><span class="badge badge-gray">${p.category}</span></td>
      <td>${formatIDR(p.purchasePrice)}</td>
      <td><strong>${formatIDR(p.sellingPrice)}</strong></td>
      <td>
        <strong style="font-size: 1.05rem;">${p.currentStock}</strong> ${p.unit}
      </td>
      <td>
        Min: ${p.minimumStock} | Safety: ${p.safetyStock} ${p.unit}
      </td>
      <td>${p.leadTimeDays || 2} Hari</td>
      <td>
        ${p.expiryTracking 
          ? `<span class="badge badge-amber"><i data-lucide="clock"></i> FEFO Active (${p.shelfLifeDays} hr)</span>`
          : `<span class="badge badge-gray">Non-Expiry</span>`
        }
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-ghost btn-edit-prd" data-id="${p.id}"><i data-lucide="edit"></i></button>
          <button class="btn btn-sm btn-ghost text-muted btn-delete-prd" data-id="${p.id}"><i data-lucide="trash-2" style="color: var(--red-500);"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach Edit & Delete handlers
  tbody.querySelectorAll('.btn-edit-prd').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-id');
      const p = store.getState().products.find(x => x.id === pId);
      if (p) openProductModal(store.getState().categories, store.getState().suppliers, p);
    });
  });

  tbody.querySelectorAll('.btn-delete-prd').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-id');
      if (confirm('Yakin ingin menghapus produk ini dari katalog?')) {
        store.deleteProduct(pId);
        showToast('Produk dihapus.', 'info');
        renderProduk();
      }
    });
  });
}

function openProductModal(categories, suppliers, existingProduct = null) {
  const isEdit = !!existingProduct;
  const p = existingProduct || {
    id: generateID('prd'),
    sku: generateSKU('GEN', 'PRD'),
    name: '',
    category: categories[0] || 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 10000,
    sellingPrice: 15000,
    currentStock: 10,
    minimumStock: 5,
    safetyStock: 3,
    leadTimeDays: 2,
    supplierId: suppliers[0] ? suppliers[0].id : '',
    expiryTracking: true,
    shelfLifeDays: 14
  };

  const html = `
    <form id="form-product">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">SKU Produk *</label>
          <input type="text" id="prd-sku" class="form-control" value="${p.sku}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Produk *</label>
          <input type="text" id="prd-name" class="form-control" value="${p.name}" placeholder="misal: Ayam Fillet Dada" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kategori *</label>
          <select id="prd-category" class="form-control" required>
            ${categories.map(c => `<option value="${c}" ${c === p.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Satuan (Unit) *</label>
          <input type="text" id="prd-unit" class="form-control" value="${p.unit}" placeholder="misal: kg, Liter, pack, pcs" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Harga Beli (HPP Rp) *</label>
          <input type="number" id="prd-pprice" class="form-control" value="${p.purchasePrice}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Harga Jual (Rp) *</label>
          <input type="number" id="prd-sprice" class="form-control" value="${p.sellingPrice}" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Stok Awal Saat Ini *</label>
          <input type="number" id="prd-stock" class="form-control" value="${p.currentStock}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Stock (Threshold) *</label>
          <input type="number" id="prd-minstock" class="form-control" value="${p.minimumStock}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Safety Stock *</label>
          <input type="number" id="prd-safetystock" class="form-control" value="${p.safetyStock}" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Supplier Utama</label>
          <select id="prd-supplier" class="form-control">
            ${suppliers.map(s => `<option value="${s.id}" ${s.id === p.supplierId ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Lead Time Supplier (Hari)</label>
          <input type="number" id="prd-leadtime" class="form-control" value="${p.leadTimeDays || 2}">
        </div>
      </div>

      <div class="form-row" style="align-items: center; margin-top: 10px;">
        <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="prd-expirytracking" ${p.expiryTracking ? 'checked' : ''} style="width: 18px; height: 18px;">
          <label for="prd-expirytracking" class="form-label" style="margin-bottom: 0;">Lacak Tanggal Kadaluarsa (FEFO)</label>
        </div>
        <div class="form-group">
          <label class="form-label">Masa Simpan Rata-rata (Masa Kadaluarsa - Hari)</label>
          <input type="number" id="prd-shelflife" class="form-control" value="${p.shelfLifeDays || 14}">
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
      </div>
    </form>
  `;

  openModal(isEdit ? 'Edit Produk' : 'Tambah Produk Baru', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-product')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const productData = {
        id: p.id,
        sku: body.querySelector('#prd-sku').value,
        name: body.querySelector('#prd-name').value,
        category: body.querySelector('#prd-category').value,
        unit: body.querySelector('#prd-unit').value,
        purchasePrice: Number(body.querySelector('#prd-pprice').value),
        sellingPrice: Number(body.querySelector('#prd-sprice').value),
        currentStock: Number(body.querySelector('#prd-stock').value),
        minimumStock: Number(body.querySelector('#prd-minstock').value),
        safetyStock: Number(body.querySelector('#prd-safetystock').value),
        supplierId: body.querySelector('#prd-supplier').value,
        leadTimeDays: Number(body.querySelector('#prd-leadtime').value),
        expiryTracking: body.querySelector('#prd-expirytracking').checked,
        shelfLifeDays: Number(body.querySelector('#prd-shelflife').value),
        active: true
      };

      if (isEdit) {
        store.updateProduct(p.id, productData);
        showToast('Produk berhasil diperbarui!', 'success');
      } else {
        store.addProduct(productData);
        showToast('Produk baru berhasil ditambahkan!', 'success');
      }

      closeModal();
      renderProduk();
    });
  });
}
