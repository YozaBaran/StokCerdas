/* StokCerdas — Central Reactive State Store & LocalStorage / Node.js Express MySQL Sync Engine */

import {
  DEMO_BUSINESS,
  DEMO_CATEGORIES,
  DEMO_SUPPLIERS,
  DEMO_PRODUCTS,
  DEMO_EXPIRY_BATCHES,
  DEMO_PURCHASE_ORDERS,
  DEMO_WASTE_RECORDS,
  DEMO_SURPLUS_RECORDS,
  DEMO_IMPACT_RECORD,
  DEMO_NOTIFICATIONS,
  generate30DaysSales
} from './seedData.js';

const STORAGE_KEY = 'stokcerdas_app_state_v1';
const MYSQL_API_URL = '/api';

export const DEMO_USERS = [
  {
    id: 'usr-001',
    email: 'owner@kedainusantara.com',
    password: 'password123',
    name: 'Budi Santoso',
    role: 'owner',
    businessName: 'Kedai Nusantara'
  },
  {
    id: 'usr-002',
    email: 'manager@kedainusantara.com',
    password: 'password123',
    name: 'Siti Rahma',
    role: 'manager',
    businessName: 'Kedai Nusantara'
  },
  {
    id: 'usr-003',
    email: 'staff@kedainusantara.com',
    password: 'password123',
    name: 'Agus Pratama',
    role: 'staff',
    businessName: 'Kedai Nusantara'
  }
];

class Store {
  constructor() {
    this.subscribers = [];
    this.isMySQLConnected = false;
    this.state = this.loadInitialState();
    this.checkAndSyncMySQL();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal membaca state dari LocalStorage:', e);
    }
    return this.createDemoState();
  }

  async checkAndSyncMySQL() {
    try {
      const res = await fetch(`${MYSQL_API_URL}/state`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          console.log('✅ Synchronized state from Node.js Express & MySQL Database / phpMyAdmin');
          this.isMySQLConnected = true;
          this.state = json.data;
          this.notifySubscribers();
        }
      }
    } catch (e) {
      // Backend server offline or initial startup; standard fallback to LocalStorage
    }
  }

  createDemoState() {
    return {
      users: [...DEMO_USERS],
      currentUser: DEMO_USERS[0], // Logged in by default as Owner for instant demo access!
      business: DEMO_BUSINESS,
      userRole: 'owner', // 'owner' | 'manager' | 'staff'
      isDemoMode: true,
      isOnboarded: true,
      products: [...DEMO_PRODUCTS],
      categories: [...DEMO_CATEGORIES],
      suppliers: [...DEMO_SUPPLIERS],
      expiryBatches: [...DEMO_EXPIRY_BATCHES],
      sales: generate30DaysSales(),
      purchaseOrders: [...DEMO_PURCHASE_ORDERS],
      wasteRecords: [...DEMO_WASTE_RECORDS],
      surplusRecords: [...DEMO_SURPLUS_RECORDS],
      impact: { ...DEMO_IMPACT_RECORD },
      notifications: [...DEMO_NOTIFICATIONS],
      stockTransactions: [
        {
          id: 'trx-001',
          timestamp: '2026-08-18T10:00:00',
          productId: 'prd-001',
          productName: 'Ayam Fillet Dada',
          type: 'Stock In',
          quantity: 10,
          qtyBefore: 0,
          qtyAfter: 10,
          reason: 'Pembelian dari PT Agrimart',
          user: 'Budi Santoso (Owner)'
        },
        {
          id: 'trx-002',
          timestamp: '2026-08-19T09:00:00',
          productId: 'prd-008',
          productName: 'Cabai Merah Keriting',
          type: 'Stock Out',
          quantity: 2,
          qtyBefore: 5,
          qtyAfter: 3,
          reason: 'Penjualan / Dapur Katering',
          user: 'Siti (Staff)'
        }
      ]
    };
  }

  saveState() {
    // 1. Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Gagal menyimpan state ke LocalStorage:', e);
    }

    // 2. Dual-Sync to Node.js Express MySQL API if available
    try {
      fetch(`${MYSQL_API_URL}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: this.state })
      }).then(res => res.json())
        .then(json => {
          if (json.status === 'success') {
            this.isMySQLConnected = true;
            console.log('✅ State saved to MySQL Database via Express backend');
          }
        }).catch(err => {
          // Offline mode
        });
    } catch (e) {
      // Offline mode
    }

    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.state));
  }

  getState() {
    return this.state;
  }

  // Auth & Account Database Actions
  async loginUser(email, password) {
    // Try hitting Node.js Express MySQL Login Endpoint first
    try {
      const res = await fetch(`${MYSQL_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.user) {
          this.state.currentUser = json.user;
          this.state.userRole = json.user.role || 'owner';
          this.saveState();
          return { success: true, user: json.user };
        }
      }
    } catch (e) {
      // Fallback local check
    }

    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      this.state.currentUser = user;
      this.state.userRole = user.role;
      this.saveState();
      return { success: true, user };
    }
    return { success: false, message: 'Email atau password salah.' };
  }

  async registerUser({ name, email, password, businessName, businessType }) {
    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      password,
      name,
      role: 'owner',
      businessName
    };

    // Push to Node.js Express MySQL Backend
    try {
      const res = await fetch(`${MYSQL_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, businessName, businessType })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.user && json.user.id) {
          newUser.id = json.user.id;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.message) {
          return { success: false, message: errJson.message };
        }
      }
    } catch (e) {
      console.warn('MySQL Backend tidak merespons, fallback menyimpan di LocalStorage:', e);
    }

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.state.userRole = 'owner';
    this.state.business = {
      id: `biz-${Date.now()}`,
      name: businessName,
      type: businessType || 'UMKM Kuliner',
      owner: name
    };
    this.saveState();
    return { success: true, user: newUser };
  }

  logoutUser() {
    this.state.currentUser = null;
    this.saveState();
  }

  setDemoMode(enable = true) {
    if (enable) {
      this.state = this.createDemoState();
    } else {
      this.state.isDemoMode = false;
    }
    this.saveState();
  }

  setUserRole(role) {
    this.state.userRole = role;
    if (this.state.currentUser) {
      this.state.currentUser.role = role;
    }
    this.saveState();
  }

  // Product Actions
  addProduct(productData) {
    this.state.products.push(productData);

    // Sync to Express MySQL Backend
    try {
      fetch(`${MYSQL_API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      }).catch(e => {});
    } catch (e) {}

    this.saveState();
  }

  updateProduct(productId, updatedData) {
    const idx = this.state.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      this.state.products[idx] = { ...this.state.products[idx], ...updatedData };

      try {
        fetch(`${MYSQL_API_URL}/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        }).catch(e => {});
      } catch (e) {}

      this.saveState();
    }
  }

  deleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);

    try {
      fetch(`${MYSQL_API_URL}/products/${productId}`, {
        method: 'DELETE'
      }).catch(e => {});
    } catch (e) {}

    this.saveState();
  }

  // Stock Adjustment / In / Out Action
  adjustStock({ productId, changeQty, type, reason, user = 'System' }) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const qtyBefore = product.currentStock;
    const qtyAfter = Math.max(0, qtyBefore + changeQty);
    product.currentStock = qtyAfter;

    this.state.stockTransactions.unshift({
      id: `trx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      type: type || (changeQty >= 0 ? 'Stock In' : 'Stock Out'),
      quantity: Math.abs(changeQty),
      qtyBefore,
      qtyAfter,
      reason: reason || 'Adjustment',
      user: user || this.state.userRole
    });

    this.saveState();
  }

  // Sales Actions
  addSaleRecord(saleData) {
    this.state.sales.unshift(saleData);
    if (saleData.items && Array.isArray(saleData.items)) {
      saleData.items.forEach(item => {
        this.adjustStock({
          productId: item.productId,
          changeQty: -Math.abs(item.qty),
          type: 'Stock Out',
          reason: `Penjualan (Trx #${saleData.id})`,
          user: 'Sistem Kasir/Sales'
        });
      });
    }

    // Sync sale to Express MySQL Backend
    try {
      fetch(`${MYSQL_API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      }).catch(e => {});
    } catch (e) {}

    this.saveState();
  }

  // Purchase Order Actions
  addPurchaseOrder(poData) {
    this.state.purchaseOrders.unshift(poData);
    this.saveState();
  }

  updatePOStatus(poId, newStatus) {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const prevStatus = po.status;
    po.status = newStatus;

    if ((newStatus === 'Received' || newStatus === 'Completed') && prevStatus !== 'Received' && prevStatus !== 'Completed') {
      po.items.forEach(item => {
        this.adjustStock({
          productId: item.productId,
          changeQty: item.quantity,
          type: 'Stock In',
          reason: `Penerimaan Barang (PO ${po.poNumber})`,
          user: 'Gudang / Penerimaan'
        });
      });
    }

    this.saveState();
  }

  // Food Waste Logging Action
  addWasteRecord(wasteData) {
    this.state.wasteRecords.unshift(wasteData);
    if (wasteData.productId) {
      this.adjustStock({
        productId: wasteData.productId,
        changeQty: -Math.abs(wasteData.quantity),
        type: 'Stock Out',
        reason: `Food Waste (${wasteData.reason})`,
        user: 'Food Waste Tracker'
      });
    }

    const val = Number(wasteData.estimatedValue) || 0;
    const kg = Number(wasteData.quantity) || 0;
    this.state.impact.totalFoodWastePreventedKg += kg;
    this.state.impact.totalSurplusSavedValueRp += val;
    this.state.impact.estimatedCO2eAvoidedKg += kg * 2.5;

    // Sync waste record to Express MySQL Backend
    try {
      fetch(`${MYSQL_API_URL}/waste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wasteData)
      }).catch(e => {});
    } catch (e) {}

    this.saveState();
  }

  // Surplus Rescue Action
  takeSurplusAction({ surplusId, actionType, quantity, details }) {
    const surplus = this.state.surplusRecords.find(s => s.id === surplusId);
    if (surplus) {
      surplus.actionsTaken.push({
        type: actionType,
        qty: quantity,
        details,
        date: new Date().toISOString().split('T')[0]
      });
      surplus.status = 'Rescued';
    }

    const kg = Number(quantity) || 0;
    if (actionType === 'Donation') {
      this.state.impact.totalFoodDonatedKg += kg;
    } else if (actionType === 'Flash Sale') {
      this.state.impact.totalFlashSaleSold += 1;
    } else if (actionType === 'Compost') {
      this.state.impact.totalCompostProcessedKg += kg;
    }
    this.state.impact.estimatedCO2eAvoidedKg += kg * 2.5;

    this.saveState();
  }

  // Notification Actions
  addNotification(notif) {
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    });
    this.saveState();
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => (n.read = true));
    this.saveState();
  }

  clearNotifications() {
    this.state.notifications = [];
    this.saveState();
  }
}

export const store = new Store();
