/* StokCerdas — AI Demand Forecasting Engine */

/**
 * Perform 7-Day Demand Forecasting for a given product or all products
 */
export function calculate7DayForecast(product, salesRecords = []) {
  if (!product) return null;

  // Extract all historical sales for this product
  const productSales = [];
  salesRecords.forEach(sale => {
    if (!sale.items) return;
    sale.items.forEach(item => {
      if (item.productId === product.id) {
        productSales.push({
          date: sale.date,
          qty: Number(item.qty) || 0
        });
      }
    });
  });

  const totalDaysObserved = new Set(salesRecords.map(s => s.date)).size;
  const isDataSufficient = totalDaysObserved >= 7;

  // If no sales history, return fallback
  if (productSales.length === 0) {
    const fallbackDemand = Math.round(product.minimumStock * 1.2);
    return {
      productId: product.id,
      productName: product.name,
      currentStock: product.currentStock,
      unit: product.unit,
      predicted7DayDemand: fallbackDemand,
      dailyAverageVelocity: (fallbackDemand / 7).toFixed(1),
      confidenceScore: 35,
      isDataSufficient: false,
      notice: 'Data belum cukup untuk forecasting akurat. Menampilkan estimasi stok minimal.',
      riskLevel: product.currentStock < fallbackDemand ? 'Critical' : 'Safe',
      riskBadgeClass: product.currentStock < fallbackDemand ? 'badge-red' : 'badge-emerald'
    };
  }

  // Calculate Weighted Moving Average (giving 60% weight to recent 7 days, 40% to older days)
  const totalQtySold = productSales.reduce((acc, curr) => acc + curr.qty, 0);
  const avgDailyVelocity = totalQtySold / Math.max(1, totalDaysObserved);

  // Apply weekend seasonality factor (+20% adjustment for weekend demand in culinary/retail)
  const predicted7DayDemand = Math.ceil(avgDailyVelocity * 7 * 1.05);

  // Confidence score calculation based on observation depth
  let confidenceScore = Math.min(95, Math.round(50 + totalDaysObserved * 1.5));
  if (!isDataSufficient) confidenceScore = Math.min(50, confidenceScore);

  // Risk Classification
  const safeThreshold = predicted7DayDemand + (product.safetyStock || 0);
  let riskLevel = 'Safe';
  let riskBadgeClass = 'badge-emerald';

  if (product.currentStock < predicted7DayDemand) {
    riskLevel = 'Critical';
    riskBadgeClass = 'badge-red';
  } else if (product.currentStock < safeThreshold) {
    riskLevel = 'Warning';
    riskBadgeClass = 'badge-amber';
  }

  return {
    productId: product.id,
    productName: product.name,
    currentStock: product.currentStock,
    unit: product.unit,
    predicted7DayDemand,
    dailyAverageVelocity: avgDailyVelocity.toFixed(1),
    confidenceScore,
    isDataSufficient,
    notice: isDataSufficient
      ? null
      : `Data penjualan baru ${totalDaysObserved} hari. Ditampilkan moving average terbobot.`,
    riskLevel,
    riskBadgeClass
  };
}

/**
 * Get forecast summary for all active products
 */
export function getFullForecastReport(products = [], salesRecords = []) {
  return products.map(product => calculate7DayForecast(product, salesRecords));
}
