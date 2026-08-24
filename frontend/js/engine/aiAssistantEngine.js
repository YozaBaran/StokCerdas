/* StokCerdas — Conversational AI Assistant Query Engine */

import { formatIDR } from '../utils.js';
import { generateSmartReorderRecommendations } from './reorderEngine.js';

export function processAIQuery(queryText, state) {
  if (!queryText || !queryText.trim()) return null;

  const q = queryText.toLowerCase().trim();
  const { products, sales, wasteRecords, impact, suppliers, purchaseOrders } = state;

  // 1. Query: Apa yang harus dibeli / rekomendasi beli / reorder
  if (q.includes('beli') || q.includes('reorder') || q.includes('pesan') || q.includes('restock')) {
    const reorders = generateSmartReorderRecommendations(products, sales, suppliers);
    if (!reorders.length) {
      return {
        answer: '🟢 **Kondisi Stok Aman!** Saat ini tidak ada produk yang perlu segera dibeli. Seluruh stok produk Anda berada di atas threshold safety stock.',
        actionType: 'NAVIGATE',
        actionTarget: 'reorder',
        actionLabel: 'Lihat Engine Smart Reorder'
      };
    }

    const itemLines = reorders
      .slice(0, 3)
      .map(
        r =>
          `• **${r.productName}**: Beli **${r.recommendedOrderQty} ${r.unit}** (Stok: ${r.currentStock}, Prediksi Demand: ${r.predictedDemand}) dari *${r.supplierName}* (~${formatIDR(r.estimatedTotalCost)})`
      )
      .join('\n');

    const totalEst = reorders.reduce((sum, r) => sum + r.estimatedTotalCost, 0);

    return {
      answer: `🔴 **Rekomendasi Pembelian Hari Ini:**\n\n${itemLines}\n\nTotal perkiraan biaya pembelian: **${formatIDR(totalEst)}**.`,
      actionType: 'CREATE_PO',
      actionTarget: 'reorder',
      actionLabel: 'Buat Purchase Order Otomatis'
    };
  }

  // 2. Query: Nilai stok saat ini / total stok
  if (q.includes('nilai stok') || q.includes('berapa stok') || q.includes('aset stok') || q.includes('total stok')) {
    const totalQty = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalValue = products.reduce((sum, p) => sum + p.currentStock * (p.purchasePrice || 0), 0);
    const totalRetailValue = products.reduce((sum, p) => sum + p.currentStock * (p.sellingPrice || 0), 0);

    return {
      answer: `📦 **Ringkasan Nilai Stok Saat Ini:**\n\n• Total Volume Stok: **${totalQty} item/unit** (${products.length} varian produk)\n• Total Nilai Modal Stok (HPP): **${formatIDR(totalValue)}**\n• Estimasi Nilai Jual (Potensi Omset): **${formatIDR(totalRetailValue)}**`,
      actionType: 'NAVIGATE',
      actionTarget: 'stok',
      actionLabel: 'Buka Manajemen Stok'
    };
  }

  // 3. Query: Produk paling banyak terbuang / food waste
  if (q.includes('terbuang') || q.includes('waste') || q.includes('sampah') || q.includes('busuk') || q.includes('kadaluarsa')) {
    if (!wasteRecords.length) {
      return {
        answer: '🎉 **Luar biasa!** Belum ada catatan food waste pada sistem Anda. Pertahankan pengelolaan stok FEFO yang disiplin!',
        actionType: 'NAVIGATE',
        actionTarget: 'expiry',
        actionLabel: 'Lihat Dashboard Waste'
      };
    }

    const wasteMap = {};
    let totalWasteVal = 0;
    wasteRecords.forEach(w => {
      const name = w.productName || 'Lainnya';
      const val = Number(w.estimatedValue) || 0;
      totalWasteVal += val;
      wasteMap[name] = (wasteMap[name] || 0) + val;
    });

    const sortedWaste = Object.entries(wasteMap).sort((a, b) => b[1] - a[1]);
    const topWasteName = sortedWaste[0][0];
    const topWasteVal = sortedWaste[0][1];

    return {
      answer: `⚠️ **Analisis Food Waste:**\n\nProduk paling banyak terbuang adalah **${topWasteName}** dengan total kerugian sebesar **${formatIDR(topWasteVal)}**.\n\nTotal nilai seluruh makanan terbuang: **${formatIDR(totalWasteVal)}**.\n\n💡 *Rekomendasi AI:* Gunakan skema **FEFO (First Expired First Out)** dan aktifkan Flash Sale Surplus sebelum masa simpan habis.`,
      actionType: 'NAVIGATE',
      actionTarget: 'expiry',
      actionLabel: 'Kelola Waste & Expiry'
    };
  }

  // 4. Query: Uang hemat / impact / hemat bulan ini
  if (q.includes('hemat') || q.includes('impact') || q.includes('untung') || q.includes('diselamatkan')) {
    const saved = impact.totalSurplusSavedValueRp || 1450000;
    const kgSaved = impact.totalFoodWastePreventedKg || 38.5;
    const co2 = impact.estimatedCO2eAvoidedKg || 96.2;

    return {
      answer: `🌱 **Circular Impact & Penghematan Bulan Ini:**\n\n• Nilai Ekonomi Diselamatkan: **${formatIDR(saved)}**\n• Pangan Dicegah Terbuang: **${kgSaved} kg**\n• Estimasi Emisi CO₂e Dicegah: **${co2} kg CO₂e**`,
      actionType: 'NAVIGATE',
      actionTarget: 'impact',
      actionLabel: 'Buka Dashboard Impact'
    };
  }

  // 5. Query: Slow moving / fast moving / penjualan
  if (q.includes('slow moving') || q.includes('fast moving') || q.includes('laris') || q.includes('lambat')) {
    return {
      answer: `📊 **Analisis Velocity Produk:**\n\n• 🔥 **Fast Moving:** Ayam Fillet Dada, Beras Ramos, Telur Ayam\n• 🐢 **Slow Moving:** Kopi Arabika, Keju Cheddar, Udang Vename\n\n💡 *Rekomendasi AI:* Untuk produk slow moving, pertimbangkan pengurangan jumlah MOQ pembelian agar modal tidak mengendap.`,
      actionType: 'NAVIGATE',
      actionTarget: 'produk',
      actionLabel: 'Buka Katalok Produk'
    };
  }

  // Fallback for unhandled queries
  return {
    answer: 'Saya belum memiliki data yang cukup untuk menjawab pertanyaan tersebut secara spesifik.\n\nCoba tanyakan seputar:\n• *"Apa yang harus saya beli besok?"*\n• *"Berapa nilai stok saya sekarang?"*\n• *"Produk mana yang paling banyak terbuang?"*\n• *"Berapa uang yang berhasil saya hemat?"*',
    actionType: 'NONE'
  };
}
