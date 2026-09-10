/* StokCerdas — Central Reactive State Store & Supabase / LocalStorage Multi-Tenant Sync Engine */

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

import { getSupabaseClient, isSupabaseConfigured } from './supabaseConfig.js';

const STORAGE_KEY = 'stokcerdas_app_state_v2';
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
    this.isSupabaseActive = false;
    this.state = this.loadInitialState();
    this.initSupabaseSession();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca state dari LocalStorage:', e);
    }
    // Default: Unauthenticated state on first load so user starts clean or chooses login/demo
    return this.createUnauthenticatedState();
  }

  createUnauthenticatedState() {
    return {
      users: [...DEMO_USERS],
      currentUser: null, // Null by default -> Auth Guard will trigger landing page
      business: { id: '', name: '', type: '', owner: '' },
      userRole: 'owner',
      isDemoMode: false,
      isOnboarded: false,
      products: [],
      categories: [...DEMO_CATEGORIES],
      suppliers: [],
      expiryBatches: [],
      sales: [],
      purchaseOrders: [],
      wasteRecords: [],
      surplusRecords: [],
      impact: {
        totalFoodWastePreventedKg: 0,
        totalSurplusSavedValueRp: 0,
        totalFoodDonatedKg: 0,
        totalFlashSaleSold: 0,
        totalCompostProcessedKg: 0,
        estimatedCO2eAvoidedKg: 0
      },
      notifications: [],
      stockTransactions: []
    };
  }

  createCleanStateForUser(user) {
    return {
      users: [...DEMO_USERS, user],
      currentUser: user,
      business: {
        id: `biz-${user.id}`,
        name: user.businessName || 'Toko Saya',
        type: user.businessType || 'UMKM Kuliner',
        owner: user.name,
        location: 'Indonesia'
      },
      userRole: user.role || 'owner',
      isDemoMode: false,
      isOnboarded: false,
      products: [],
      categories: [...DEMO_CATEGORIES],
      suppliers: [],
      expiryBatches: [],
      sales: [],
      purchaseOrders: [],
      wasteRecords: [],
      surplusRecords: [],
      impact: {
        totalFoodWastePreventedKg: 0,
        totalSurplusSavedValueRp: 0,
        totalFoodDonatedKg: 0,
        totalFlashSaleSold: 0,
        totalCompostProcessedKg: 0,
        estimatedCO2eAvoidedKg: 0
      },
      notifications: [
        {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
          title: 'Selamat Datang di StokCerdas!',
          message: `Akun toko ${user.businessName || 'Anda'} berhasil dibuat. Tambahkan produk pertama Anda untuk memulai.`
        }
      ],
      stockTransactions: []
    };
  }

  createDemoState() {
    return {
      users: [...DEMO_USERS],
      currentUser: DEMO_USERS[0],
      business: DEMO_BUSINESS,
      userRole: 'owner',
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
        }
      ]
    };
  }

  async initSupabaseSession() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: { session } } = await client.auth.getSession();
      if (session && session.user) {
        this.isSupabaseActive = true;
        const userMeta = session.user.user_metadata || {};
        const appUser = {
          id: session.user.id,
          email: session.user.email,
          name: userMeta.name || session.user.email.split('@')[0],
          role: 'owner',
          businessName: userMeta.businessName || 'Toko Saya'
        };

        if (!this.state.currentUser || this.state.currentUser.id !== session.user.id) {
          await this.loadSupabaseUserData(session.user.id, appUser);
        }
      }
    } catch (e) {
      console.warn('Supabase Auth init session error:', e);
    }
  }

  async loadSupabaseUserData(userId, userObj) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      this.isSupabaseActive = true;
      // Fetch user's business
      const { data: bizData } = await client.from('businesses').select('*').eq('user_id', userId).single();
      const business = bizData ? {
        id: bizData.id,
        name: bizData.name,
        type: bizData.type,
        owner: bizData.owner,
        location: bizData.location
      } : {
        id: `biz-${userId}`,
        name: userObj.businessName || 'Toko Saya',
        type: 'UMKM Kuliner',
        owner: userObj.name,
        location: 'Indonesia'
      };

      // Fetch user's products
      const { data: prodData } = await client.from('products').select('*').eq('user_id', userId);
      const products = (prodData || []).map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unit: p.unit,
        purchasePrice: Number(p.purchase_price),
        sellingPrice: Number(p.selling_price),
        currentStock: Number(p.current_stock),
        minimumStock: Number(p.minimum_stock),
        safetyStock: Number(p.safety_stock),
        leadTimeDays: p.lead_time_days,
        supplierId: p.supplier_id,
        expiryTracking: p.expiry_tracking,
        shelfLifeDays: p.shelf_life_days
      }));

      // Fetch user's suppliers
      const { data: suppData } = await client.from('suppliers').select('*').eq('user_id', userId);
      const suppliers = (suppData || []).map(s => ({
        id: s.id,
        name: s.name,
        contact: s.contact,
        email: s.email,
        leadTimeDays: s.lead_time_days,
        moq: s.moq,
        paymentTerms: s.payment_terms,
        fulfillmentRate: s.fulfillment_rate
      }));

      // Fetch user's sales
      const { data: salesData } = await client.from('sales').select('*').eq('user_id', userId);
      const sales = (salesData || []).map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        date: s.timestamp ? s.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
        totalRevenue: Number(s.total_amount),
        paymentMethod: s.payment_method,
        items: s.items || [],
        user: s.user
      }));

      // Fetch user's waste records
      const { data: wasteData } = await client.from('waste_records').select('*').eq('user_id', userId);
      const wasteRecords = (wasteData || []).map(w => ({
        id: w.id,
        timestamp: w.timestamp,
        productId: w.product_id,
        productName: w.product_name,
        quantity: Number(w.quantity),
        reason: w.reason,
        estimatedValue: Number(w.estimated_value),
        user: w.user
      }));

      // Fetch user's purchase orders
      const { data: poData } = await client.from('purchase_orders').select('*').eq('user_id', userId);
      const purchaseOrders = (poData || []).map(po => ({
        id: po.id,
        poNumber: po.id,
        supplierId: po.supplier_id,
        supplierName: po.supplier_name,
        orderDate: po.order_date,
        expectedDate: po.expected_date,
        status: po.status,
        totalAmount: Number(po.total_amount),
        items: po.items || []
      }));

      // Fetch user's stock transactions
      const { data: trxData } = await client.from('stock_transactions').select('*').eq('user_id', userId);
      const stockTransactions = (trxData || []).map(t => ({
        id: t.id,
        timestamp: t.timestamp,
        productId: t.product_id,
        productName: t.product_name,
        type: t.type,
        quantity: Number(t.quantity),
        qtyBefore: Number(t.qty_before),
        qtyAfter: Number(t.qty_after),
        reason: t.reason,
        user: t.user
      }));

      // Fetch user's expiry batches
      const { data: expiryData } = await client.from('expiry_batches').select('*').eq('user_id', userId);
      const expiryBatches = (expiryData || []).map(eb => ({
        id: eb.id,
        productId: eb.product_id,
        batchNumber: eb.batch_number,
        quantity: Number(eb.quantity),
        expiryDate: eb.expiry_date
      }));

      this.state = {
        ...this.state,
        currentUser: userObj,
        business,
        userRole: 'owner',
        isDemoMode: false,
        isOnboarded: true,
        products,
        suppliers,
        sales,
        wasteRecords,
        purchaseOrders,
        stockTransactions,
        expiryBatches
      };

      this.saveState();
      this.notifySubscribers();
    } catch (e) {
      console.warn('Gagal memuat data user dari Supabase:', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Gagal menyimpan state ke LocalStorage:', e);
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

  // Auth & User Actions
  async loginUser(email, password) {
    // 1. Try Supabase Auth first
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (!error && data.session && data.user) {
          const userMeta = data.user.user_metadata || {};
          const appUser = {
            id: data.user.id,
            email: data.user.email,
            name: userMeta.name || data.user.email.split('@')[0],
            role: 'owner',
            businessName: userMeta.businessName || 'Toko Saya'
          };
          await this.loadSupabaseUserData(data.user.id, appUser);
          return { success: true, user: appUser };
        } else if (error) {
          console.warn('Supabase Auth login error:', error.message);
        }
      } catch (e) {
        console.warn('Supabase Login fallback to local check:', e);
      }
    }

    // 2. Local Demo User Match
    const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (demoUser) {
      this.state = this.createDemoState();
      this.state.currentUser = demoUser;
      this.saveState();
      return { success: true, user: demoUser };
    }

    // 3. Saved Custom User Match
    const savedUser = (this.state.users || []).find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (savedUser) {
      this.state.currentUser = savedUser;
      this.saveState();
      return { success: true, user: savedUser };
    }

    return { success: false, message: 'Email atau password salah.' };
  }

  async registerUser({ name, email, password, businessName, businessType }) {
    // 1. Try Supabase Auth Register
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name,
              businessName,
              businessType
            }
          }
        });
        if (!error && data.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            name,
            role: 'owner',
            businessName: businessName || 'Toko Saya'
          };
          this.state = this.createCleanStateForUser(newUser);

          // Save business to Supabase
          try {
            await client.from('businesses').insert([{
              id: `biz-${data.user.id}`,
              user_id: data.user.id,
              name: businessName || 'Toko Saya',
              type: businessType || 'UMKM Kuliner',
              owner: name
            }]);
          } catch (e) {}

          this.saveState();
          return { success: true, user: newUser };
        } else if (error) {
          return { success: false, message: error.message };
        }
      } catch (e) {
        console.warn('Supabase Register fallback to local creation:', e);
      }
    }

    // 2. Local Clean Slate User Register
    const newUser = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      password,
      name,
      role: 'owner',
      businessName: businessName || 'Toko Saya',
      businessType: businessType || 'UMKM Kuliner'
    };

    this.state = this.createCleanStateForUser(newUser);
    this.saveState();
    return { success: true, user: newUser };
  }

  async logoutUser() {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    this.state = this.createUnauthenticatedState();
    localStorage.removeItem(STORAGE_KEY);
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
  async addProduct(productData) {
    this.state.products.push(productData);

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        await client.from('products').insert([{
          id: productData.id,
          user_id: this.state.currentUser.id,
          sku: productData.sku,
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          purchase_price: productData.purchasePrice,
          selling_price: productData.sellingPrice,
          current_stock: productData.currentStock,
          minimum_stock: productData.minimumStock,
          safety_stock: productData.safetyStock,
          lead_time_days: productData.leadTimeDays,
          supplier_id: productData.supplierId,
          expiry_tracking: productData.expiryTracking ? 1 : 0,
          shelf_life_days: productData.shelfLifeDays || 14
        }]);
      } catch (e) {
        console.warn('Gagal sync addProduct ke Supabase:', e);
      }
    }

    this.saveState();
  }

  async updateProduct(productId, updatedData) {
    const idx = this.state.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      this.state.products[idx] = { ...this.state.products[idx], ...updatedData };

      const client = getSupabaseClient();
      if (client && this.state.currentUser && !this.state.isDemoMode) {
        try {
          await client.from('products').update({
            name: updatedData.name,
            purchase_price: updatedData.purchasePrice,
            selling_price: updatedData.sellingPrice,
            current_stock: updatedData.currentStock,
            minimum_stock: updatedData.minimumStock
          }).eq('id', productId).eq('user_id', this.state.currentUser.id);
        } catch (e) {}
      }

      this.saveState();
    }
  }

  async deleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        await client.from('products').delete().eq('id', productId).eq('user_id', this.state.currentUser.id);
      } catch (e) {}
    }

    this.saveState();
  }

  // Stock Adjustment Action
  adjustStock({ productId, changeQty, type, reason, user = 'System' }) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const qtyBefore = product.currentStock;
    const qtyAfter = Math.max(0, qtyBefore + changeQty);
    product.currentStock = qtyAfter;

    const trx = {
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
    };

    this.state.stockTransactions.unshift(trx);

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('products').update({ current_stock: qtyAfter }).eq('id', productId).eq('user_id', this.state.currentUser.id);
        client.from('stock_transactions').insert([{
          id: trx.id,
          user_id: this.state.currentUser.id,
          product_id: product.id,
          product_name: product.name,
          type: trx.type,
          quantity: trx.quantity,
          qty_before: qtyBefore,
          qty_after: qtyAfter,
          reason: trx.reason,
          user: trx.user
        }]);
      } catch (e) {}
    }

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

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('sales').insert([{
          id: saleData.id,
          user_id: this.state.currentUser.id,
          total_amount: saleData.totalRevenue,
          payment_method: saleData.paymentMethod || 'Cash',
          items: saleData.items,
          user: saleData.user || 'Kasir'
        }]);
      } catch (e) {}
    }

    this.saveState();
  }

  // Supplier Actions
  addSupplier(supplierData) {
    this.state.suppliers.push(supplierData);

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('suppliers').insert([{
          id: supplierData.id,
          user_id: this.state.currentUser.id,
          name: supplierData.name,
          contact: supplierData.contact,
          email: supplierData.email,
          lead_time_days: supplierData.leadTimeDays,
          moq: supplierData.moq,
          payment_terms: supplierData.paymentTerms,
          fulfillment_rate: supplierData.fulfillmentRate || 95
        }]);
      } catch (e) {}
    }

    this.saveState();
  }

  // Purchase Orders
  addPurchaseOrder(poData) {
    this.state.purchaseOrders.unshift(poData);

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('purchase_orders').insert([{
          id: poData.id || poData.poNumber,
          user_id: this.state.currentUser.id,
          supplier_id: poData.supplierId,
          supplier_name: poData.supplierName,
          order_date: poData.orderDate || new Date().toISOString(),
          expected_date: poData.expectedDate,
          status: poData.status || 'DRAFT',
          total_amount: poData.totalAmount,
          items: poData.items || []
        }]);
      } catch (e) {}
    }

    this.saveState();
  }

  updatePOStatus(poId, newStatus) {
    const po = this.state.purchaseOrders.find(p => p.id === poId || p.poNumber === poId);
    if (!po) return;

    const prevStatus = po.status;
    po.status = newStatus;

    if ((newStatus === 'Received' || newStatus === 'Completed') && prevStatus !== 'Received' && prevStatus !== 'Completed') {
      po.items.forEach(item => {
        this.adjustStock({
          productId: item.productId,
          changeQty: item.quantity,
          type: 'Stock In',
          reason: `Penerimaan Barang (PO ${po.poNumber || po.id})`,
          user: 'Gudang / Penerimaan'
        });
      });
    }

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('purchase_orders').update({ status: newStatus }).eq('id', po.id).eq('user_id', this.state.currentUser.id);
      } catch (e) {}
    }

    this.saveState();
  }

  // Food Waste Actions
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

    const client = getSupabaseClient();
    if (client && this.state.currentUser && !this.state.isDemoMode) {
      try {
        client.from('waste_records').insert([{
          id: wasteData.id || `waste-${Date.now()}`,
          user_id: this.state.currentUser.id,
          product_id: wasteData.productId,
          product_name: wasteData.productName,
          quantity: wasteData.quantity,
          reason: wasteData.reason,
          estimated_value: val,
          user: wasteData.user || 'Staff'
        }]);
      } catch (e) {}
    }

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
