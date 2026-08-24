/* StokCerdas — Smart Reorder Calculation Engine */

import { calculate7DayForecast } from './forecasting.js';

/**
 * Generate Smart Reorder Recommendations for products requiring replenishment
 */
export function generateSmartReorderRecommendations(products = [], salesRecords = [], suppliers = []) {
  const recommendations = [];

  products.forEach(product => {
    if (!product.active) return;

    const forecast = calculate7DayForecast(product, salesRecords);
    const supplier = suppliers.find(s => s.id === product.supplierId) || {
      name: 'Supplier Umum',
      leadTimeDays: product.leadTimeDays || 2,
      moq: 1
    };

    const leadTime = supplier.leadTimeDays || product.leadTimeDays || 2;
    const safetyStock = product.safetyStock || 3;
    const currentStock = product.currentStock;
    const predictedDemand = forecast ? forecast.predicted7DayDemand : product.minimumStock * 1.5;

    // Reorder Point = (Daily Velocity * Lead Time) + Safety Stock
    const dailyVelocity = forecast ? Number(forecast.dailyAverageVelocity) : 1;
    const reorderPoint = Math.ceil((dailyVelocity * leadTime) + safetyStock);

    // Condition to trigger reorder recommendation:
    // Current stock is below Reorder Point OR below (Predicted Demand + Safety Stock)
    const neededStock = predictedDemand + safetyStock;
    if (currentStock <= reorderPoint || currentStock < neededStock) {
      const rawRecommended = Math.ceil(neededStock - currentStock);
      const moq = supplier.moq || 1;
      const finalRecommendedOrder = Math.max(moq, rawRecommended);

      const estimatedCost = finalRecommendedOrder * (product.purchasePrice || 0);

      const rationale = `Stok saat ini (${currentStock} ${product.unit}) tidak cukup untuk memenuhi prediksi permintaan (${predictedDemand} ${product.unit}) dan safety stock (${safetyStock} ${product.unit}) dalam lead time supplier ${leadTime} hari.`;

      recommendations.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        category: product.category,
        unit: product.unit,
        currentStock,
        predictedDemand,
        safetyStock,
        reorderPoint,
        leadTimeDays: leadTime,
        supplierId: supplier.id,
        supplierName: supplier.name,
        moq,
        recommendedOrderQty: finalRecommendedOrder,
        unitPurchasePrice: product.purchasePrice,
        estimatedTotalCost: estimatedCost,
        rationale,
        priority: currentStock < reorderPoint ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  // Sort by High Priority first
  return recommendations.sort((a, b) => (a.priority === 'HIGH' ? -1 : 1));
}
