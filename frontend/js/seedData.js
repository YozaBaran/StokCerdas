/* StokCerdas — Comprehensive Seed Data for "Kedai Nusantara" (Demo Mode) */

export const DEMO_BUSINESS = {
  id: 'biz-001',
  name: 'Kedai Nusantara',
  type: 'UMKM Kuliner (Restoran & Katering)',
  owner: 'Budi Santoso',
  location: 'Jakarta Selatan',
  currency: 'IDR'
};

export const DEMO_CATEGORIES = [
  'Bahan Utama',
  'Sembako',
  'Sayur & Bumbu',
  'Minuman',
  'Olahan & Dairy'
];

export const DEMO_SUPPLIERS = [
  {
    id: 'sup-101',
    name: 'PT Agrimart Pangan Utama',
    contact: '0812-3456-7890 (Pak Hery)',
    email: 'order@agrimart.co.id',
    leadTimeDays: 2,
    moq: 10,
    paymentTerms: 'Tempo 14 Hari',
    productsSupplied: ['Ayam Fillet', 'Daging Sapi', 'Udang Vename', 'Ikan Gurame'],
    fulfillmentRate: 98,
    priceHistoryAvg: 48000
  },
  {
    id: 'sup-102',
    name: 'CV Berkah Sembako Nusantara',
    contact: '0813-9876-5432 (Bu Dewi)',
    email: 'berkahsembako@gmail.com',
    leadTimeDays: 1,
    moq: 5,
    paymentTerms: 'Tunai Saat Diterima (COD)',
    productsSupplied: ['Beras Ramos', 'Minyak Goreng', 'Tepung Terigu', 'Gula Pasir'],
    fulfillmentRate: 95,
    priceHistoryAvg: 14000
  },
  {
    id: 'sup-103',
    name: 'Koperasi Tani Segar Jaya',
    contact: '0857-1122-3344 (Pak Jarwo)',
    email: 'koperasitani@jawa.id',
    leadTimeDays: 1,
    moq: 3,
    paymentTerms: 'Tunai Saat Diterima (COD)',
    productsSupplied: ['Cabai Merah', 'Bawang Merah', 'Bawang Putih', 'Kentang', 'Tomat'],
    fulfillmentRate: 92,
    priceHistoryAvg: 28000
  },
  {
    id: 'sup-104',
    name: 'PT Dairy & Beverage Indonesia',
    contact: '0811-4455-6677 (Sales Team)',
    email: 'sales@dairyindo.com',
    leadTimeDays: 3,
    moq: 12,
    paymentTerms: 'Tempo 30 Hari',
    productsSupplied: ['Susu UHT', 'Keju Cheddar', 'Mentega'],
    fulfillmentRate: 100,
    priceHistoryAvg: 22000
  },
  {
    id: 'sup-105',
    name: 'Toko Roti & Bahan Katering Prima',
    contact: '0821-7788-9900 (Pak Budi)',
    email: 'primakatering@yahoo.com',
    leadTimeDays: 1,
    moq: 5,
    paymentTerms: 'Tunai Saat Diterima (COD)',
    productsSupplied: ['Roti Tawar', 'Teh Celup', 'Kopi Arabika', 'Santan Kelapa', 'Kecap Manis', 'Saus Sambal'],
    fulfillmentRate: 96,
    priceHistoryAvg: 35000
  }
];

export const DEMO_PRODUCTS = [
  {
    id: 'prd-001',
    sku: 'BU-AYM-1001',
    name: 'Ayam Fillet Dada',
    category: 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 48000,
    sellingPrice: 75000,
    currentStock: 10,
    minimumStock: 12,
    safetyStock: 5,
    leadTimeDays: 2,
    supplierId: 'sup-101',
    expiryTracking: true,
    shelfLifeDays: 5,
    active: true
  },
  {
    id: 'prd-002',
    sku: 'SMB-BRS-1002',
    name: 'Beras Ramos Super',
    category: 'Sembako',
    unit: 'kg',
    purchasePrice: 13500,
    sellingPrice: 17000,
    currentStock: 25,
    minimumStock: 15,
    safetyStock: 8,
    leadTimeDays: 1,
    supplierId: 'sup-102',
    expiryTracking: true,
    shelfLifeDays: 90,
    active: true
  },
  {
    id: 'prd-003',
    sku: 'BU-DNG-1003',
    name: 'Daging Sapi Rendang',
    category: 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 110000,
    sellingPrice: 155000,
    currentStock: 6,
    minimumStock: 8,
    safetyStock: 4,
    leadTimeDays: 2,
    supplierId: 'sup-101',
    expiryTracking: true,
    shelfLifeDays: 7,
    active: true
  },
  {
    id: 'prd-004',
    sku: 'SMB-MYK-1004',
    name: 'Minyak Goreng Sawit',
    category: 'Sembako',
    unit: 'Liter',
    purchasePrice: 15500,
    sellingPrice: 19000,
    currentStock: 30,
    minimumStock: 10,
    safetyStock: 5,
    leadTimeDays: 1,
    supplierId: 'sup-102',
    expiryTracking: false,
    shelfLifeDays: 180,
    active: true
  },
  {
    id: 'prd-005',
    sku: 'BU-TLR-1005',
    name: 'Telur Ayam Negeri',
    category: 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 26000,
    sellingPrice: 32000,
    currentStock: 14,
    minimumStock: 10,
    safetyStock: 5,
    leadTimeDays: 1,
    supplierId: 'sup-102',
    expiryTracking: true,
    shelfLifeDays: 14,
    active: true
  },
  {
    id: 'prd-006',
    sku: 'DRY-SSU-1006',
    name: 'Susu UHT Plain 1L',
    category: 'Olahan & Dairy',
    unit: 'Liter',
    purchasePrice: 18000,
    sellingPrice: 24000,
    currentStock: 18,
    minimumStock: 10,
    safetyStock: 4,
    leadTimeDays: 3,
    supplierId: 'sup-104',
    expiryTracking: true,
    shelfLifeDays: 45,
    active: true
  },
  {
    id: 'prd-007',
    sku: 'DRY-RTI-1007',
    name: 'Roti Tawar Kupas',
    category: 'Olahan & Dairy',
    unit: 'pack',
    purchasePrice: 12000,
    sellingPrice: 18000,
    currentStock: 15,
    minimumStock: 8,
    safetyStock: 3,
    leadTimeDays: 1,
    supplierId: 'sup-105',
    expiryTracking: true,
    shelfLifeDays: 4,
    active: true
  },
  {
    id: 'prd-008',
    sku: 'SYR-CBI-1008',
    name: 'Cabai Merah Keriting',
    category: 'Sayur & Bumbu',
    unit: 'kg',
    purchasePrice: 42000,
    sellingPrice: 58000,
    currentStock: 3,
    minimumStock: 5,
    safetyStock: 2,
    leadTimeDays: 1,
    supplierId: 'sup-103',
    expiryTracking: true,
    shelfLifeDays: 5,
    active: true
  },
  {
    id: 'prd-009',
    sku: 'SYR-BWG-1009',
    name: 'Bawang Merah Brebes',
    category: 'Sayur & Bumbu',
    unit: 'kg',
    purchasePrice: 32000,
    sellingPrice: 45000,
    currentStock: 8,
    minimumStock: 6,
    safetyStock: 3,
    leadTimeDays: 1,
    supplierId: 'sup-103',
    expiryTracking: true,
    shelfLifeDays: 14,
    active: true
  },
  {
    id: 'prd-010',
    sku: 'SYR-BWP-1010',
    name: 'Bawang Putih Honan',
    category: 'Sayur & Bumbu',
    unit: 'kg',
    purchasePrice: 36000,
    sellingPrice: 48000,
    currentStock: 7,
    minimumStock: 5,
    safetyStock: 2,
    leadTimeDays: 1,
    supplierId: 'sup-103',
    expiryTracking: true,
    shelfLifeDays: 20,
    active: true
  },
  {
    id: 'prd-011',
    sku: 'MNM-KPI-1011',
    name: 'Kopi Arabika House Blend',
    category: 'Minuman',
    unit: 'kg',
    purchasePrice: 140000,
    sellingPrice: 210000,
    currentStock: 4,
    minimumStock: 3,
    safetyStock: 1,
    leadTimeDays: 1,
    supplierId: 'sup-105',
    expiryTracking: true,
    shelfLifeDays: 60,
    active: true
  },
  {
    id: 'prd-012',
    sku: 'DRY-KJU-1012',
    name: 'Keju Cheddar Olahan 2kg',
    category: 'Olahan & Dairy',
    unit: 'block',
    purchasePrice: 95000,
    sellingPrice: 130000,
    currentStock: 5,
    minimumStock: 3,
    safetyStock: 1,
    leadTimeDays: 3,
    supplierId: 'sup-104',
    expiryTracking: true,
    shelfLifeDays: 60,
    active: true
  },
  {
    id: 'prd-013',
    sku: 'BU-UDG-1013',
    name: 'Udang Vename Segar',
    category: 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 85000,
    sellingPrice: 120000,
    currentStock: 2,
    minimumStock: 4,
    safetyStock: 2,
    leadTimeDays: 2,
    supplierId: 'sup-101',
    expiryTracking: true,
    shelfLifeDays: 3,
    active: true
  },
  {
    id: 'prd-014',
    sku: 'BU-IKN-1014',
    name: 'Ikan Gurame Segar',
    category: 'Bahan Utama',
    unit: 'kg',
    purchasePrice: 55000,
    sellingPrice: 80000,
    currentStock: 7,
    minimumStock: 5,
    safetyStock: 2,
    leadTimeDays: 2,
    supplierId: 'sup-101',
    expiryTracking: true,
    shelfLifeDays: 3,
    active: true
  },
  {
    id: 'prd-015',
    sku: 'SYR-KNT-1015',
    name: 'Kentang Dieng Super',
    category: 'Sayur & Bumbu',
    unit: 'kg',
    purchasePrice: 18000,
    sellingPrice: 25000,
    currentStock: 12,
    minimumStock: 8,
    safetyStock: 3,
    leadTimeDays: 1,
    supplierId: 'sup-103',
    expiryTracking: true,
    shelfLifeDays: 15,
    active: true
  }
];

export const DEMO_EXPIRY_BATCHES = [
  {
    id: 'btc-001',
    productId: 'prd-001',
    productName: 'Ayam Fillet Dada',
    batchNo: 'BAT-AYM-20260818',
    quantity: 6,
    unit: 'kg',
    expiryDate: '2026-08-21', // 2 days
    dateReceived: '2026-08-18',
    supplierId: 'sup-101'
  },
  {
    id: 'btc-002',
    productId: 'prd-001',
    productName: 'Ayam Fillet Dada',
    batchNo: 'BAT-AYM-20260819',
    quantity: 4,
    unit: 'kg',
    expiryDate: '2026-08-23',
    dateReceived: '2026-08-19',
    supplierId: 'sup-101'
  },
  {
    id: 'btc-003',
    productId: 'prd-007',
    productName: 'Roti Tawar Kupas',
    batchNo: 'BAT-RTI-20260817',
    quantity: 8,
    unit: 'pack',
    expiryDate: '2026-08-20', // Tomorrow
    dateReceived: '2026-08-17',
    supplierId: 'sup-105'
  },
  {
    id: 'btc-004',
    productId: 'prd-008',
    productName: 'Cabai Merah Keriting',
    batchNo: 'BAT-CBI-20260817',
    quantity: 3,
    unit: 'kg',
    expiryDate: '2026-08-21',
    dateReceived: '2026-08-17',
    supplierId: 'sup-103'
  },
  {
    id: 'btc-005',
    productId: 'prd-013',
    productName: 'Udang Vename Segar',
    batchNo: 'BAT-UDG-20260818',
    quantity: 2,
    unit: 'kg',
    expiryDate: '2026-08-20',
    dateReceived: '2026-08-18',
    supplierId: 'sup-101'
  }
];

// Helper to generate 30 days history of realistic sales
export function generate30DaysSales() {
  const sales = [];
  const now = new Date('2026-08-19');
  
  for (let i = 30; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Day of week multiplier (weekend higher)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const mult = isWeekend ? 1.4 : 1.0;

    // Sales items
    sales.push({
      id: `sal-${1000 + i}`,
      date: dateStr,
      items: [
        { productId: 'prd-001', productName: 'Ayam Fillet Dada', qty: Math.round((2.5 + Math.random() * 1.5) * mult), sellingPrice: 75000 },
        { productId: 'prd-002', productName: 'Beras Ramos Super', qty: Math.round((3.0 + Math.random() * 2.0) * mult), sellingPrice: 17000 },
        { productId: 'prd-003', productName: 'Daging Sapi Rendang', qty: Math.round((1.0 + Math.random() * 1.0) * mult), sellingPrice: 155000 },
        { productId: 'prd-005', productName: 'Telur Ayam Negeri', qty: Math.round((2.0 + Math.random() * 1.5) * mult), sellingPrice: 32000 },
        { productId: 'prd-007', productName: 'Roti Tawar Kupas', qty: Math.round((2.0 + Math.random() * 2.0) * mult), sellingPrice: 18000 }
      ],
      totalRevenue: Math.round((350000 + Math.random() * 250000) * mult)
    });
  }
  return sales;
}

export const DEMO_PURCHASE_ORDERS = [
  {
    id: 'po-101',
    poNumber: 'PO-202608-001',
    supplierId: 'sup-101',
    supplierName: 'PT Agrimart Pangan Utama',
    dateCreated: '2026-08-18',
    status: 'Sent', // Draft, Sent, Confirmed, Received, Completed
    items: [
      { productId: 'prd-001', productName: 'Ayam Fillet Dada', quantity: 15, unitPrice: 48000, subtotal: 720000 },
      { productId: 'prd-003', productName: 'Daging Sapi Rendang', quantity: 6, unitPrice: 110000, subtotal: 660000 }
    ],
    totalAmount: 1380000,
    expectedDelivery: '2026-08-20'
  },
  {
    id: 'po-102',
    poNumber: 'PO-202608-002',
    supplierId: 'sup-103',
    supplierName: 'Koperasi Tani Segar Jaya',
    dateCreated: '2026-08-15',
    status: 'Completed',
    items: [
      { productId: 'prd-008', productName: 'Cabai Merah Keriting', quantity: 8, unitPrice: 42000, subtotal: 336000 },
      { productId: 'prd-009', productName: 'Bawang Merah Brebes', quantity: 10, unitPrice: 32000, subtotal: 320000 }
    ],
    totalAmount: 656000,
    expectedDelivery: '2026-08-16'
  }
];

export const DEMO_WASTE_RECORDS = [
  {
    id: 'wst-201',
    productId: 'prd-001',
    productName: 'Ayam Fillet Dada',
    quantity: 1.5,
    unit: 'kg',
    estimatedValue: 72000,
    reason: 'Expired',
    date: '2026-08-14',
    notes: 'Kadaluarsa di kulkas penyimpanan'
  },
  {
    id: 'wst-202',
    productId: 'prd-008',
    productName: 'Cabai Merah Keriting',
    quantity: 0.8,
    unit: 'kg',
    estimatedValue: 33600,
    reason: 'Damaged',
    date: '2026-08-12',
    notes: 'Cabai membusuk karena kelembaban'
  },
  {
    id: 'wst-203',
    productId: 'prd-007',
    productName: 'Roti Tawar Kupas',
    quantity: 3,
    unit: 'pack',
    estimatedValue: 36000,
    reason: 'Overstock',
    date: '2026-08-10',
    notes: 'Penjualan sarapan sepi saat hujan'
  }
];

export const DEMO_SURPLUS_RECORDS = [
  {
    id: 'srp-301',
    productName: 'Roti Tawar Kupas (Batch 17 Ags)',
    quantity: 8,
    unit: 'pack',
    status: 'Active',
    potentialWasteValue: 96000,
    riskReason: 'Kadaluarsa dalam 24 jam',
    actionsTaken: []
  },
  {
    id: 'srp-302',
    productName: 'Porsi Nasi Rendang Siap Saji',
    quantity: 12,
    unit: 'porsi',
    status: 'Rescued',
    potentialWasteValue: 240000,
    riskReason: 'Surplus sisa prasmanan lunch katering',
    actionsTaken: [
      { type: 'Flash Sale', qty: 6, revenue: 90000, date: '2026-08-18' },
      { type: 'Donation', qty: 6, recipient: 'Panti Asuhan Kasih Ibu', date: '2026-08-18' }
    ]
  }
];

export const DEMO_IMPACT_RECORD = {
  totalFoodWastePreventedKg: 38.5,
  totalSurplusSavedValueRp: 1450000,
  totalFoodDonatedKg: 14.2,
  totalFlashSaleSold: 28,
  totalCompostProcessedKg: 8.5,
  estimatedCO2eAvoidedKg: 96.2, // ~2.5 kg CO2e per kg food waste avoided
  lastUpdated: '2026-08-19'
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: '🔴 Critical Stockout Risk',
    message: 'Stok Cabai Merah Keriting sisa 3 kg. Diprediksi habis dalam 24 jam!',
    type: 'critical',
    read: false,
    timestamp: '2026-08-19T08:30:00'
  },
  {
    id: 'notif-002',
    title: '🟠 Low Stock Warning',
    message: 'Ayam Fillet Dada di bawah minimum stok (10/12 kg).',
    type: 'warning',
    read: false,
    timestamp: '2026-08-19T09:15:00'
  },
  {
    id: 'notif-003',
    title: '🟡 Expiry Alert (FEFO)',
    message: 'Roti Tawar Kupas (8 pack) akan kadaluarsa besok!',
    type: 'warning',
    read: false,
    timestamp: '2026-08-19T09:30:00'
  },
  {
    id: 'notif-004',
    title: '🟢 Smart Reorder Ready',
    message: 'Rekomendasi pembelian otomatis siap untuk 3 produk.',
    type: 'info',
    read: true,
    timestamp: '2026-08-18T16:00:00'
  }
];
