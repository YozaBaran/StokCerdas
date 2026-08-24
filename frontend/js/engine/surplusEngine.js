/* StokCerdas — Surplus Detection & Rescue Action Engine */

import { formatIDR } from '../utils.js';

/**
 * Scan inventory batches and product velocity to detect Surplus Alerts
 */
export function detectSurplusAlerts(products = [], expiryBatches = [], surplusRecords = []) {
  const alerts = [];
  const today = new Date();

  // 1. Scan expiry batches expiring within 3 days
  expiryBatches.forEach(batch => {
    const expDate = new Date(batch.expiryDate);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 3 && batch.quantity > 0) {
      const product = products.find(p => p.id === batch.productId) || {
        sellingPrice: 10000,
        purchasePrice: 7000
      };

      const originalValue = batch.quantity * (product.sellingPrice || 10000);
      const flashSalePrice = Math.round((product.sellingPrice || 10000) * 0.5); // 50% discount

      alerts.push({
        id: `srp-alert-${batch.id}`,
        batchId: batch.id,
        productId: batch.productId,
        productName: batch.productName,
        quantity: batch.quantity,
        unit: batch.unit,
        expiryDate: batch.expiryDate,
        daysRemaining: diffDays,
        riskLevel: diffDays <= 1 ? 'CRITICAL' : 'WARNING',
        originalValue,
        suggestedFlashSalePrice: flashSalePrice,
        message: `⚠️ ${batch.productName} (${batch.quantity} ${batch.unit}) berpotensi terbuang! Expired dalam ${diffDays === 0 ? 'hari ini' : diffDays + ' hari'}.`
      });
    }
  });

  return alerts;
}

/**
 * Calculate financial & rescue impact for Flash Sale option
 */
export function calculateFlashSaleDiscount(originalPrice, discountPercent = 50) {
  const discountAmount = Math.round(originalPrice * (discountPercent / 100));
  const salePrice = originalPrice - discountAmount;
  return {
    originalPrice,
    discountPercent,
    salePrice,
    formattedSalePrice: formatIDR(salePrice)
  };
}
