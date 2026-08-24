/* StokCerdas — Circular Economy & Environmental Impact Calculator Engine */

import { formatIDR } from '../utils.js';

export function calculateCircularImpact(impactState = {}, wasteRecords = [], surplusRecords = []) {
  const totalWastePreventedKg = impactState.totalFoodWastePreventedKg || 38.5;
  const totalEconomicSavedRp = impactState.totalSurplusSavedValueRp || 1450000;
  const totalFoodDonatedKg = impactState.totalFoodDonatedKg || 14.2;
  const totalFlashSaleSold = impactState.totalFlashSaleSold || 28;
  const totalCompostProcessedKg = impactState.totalCompostProcessedKg || 8.5;

  // Factor: 2.5 kg CO2e per kg food waste avoided
  const estimatedCO2eAvoidedKg = Math.round(totalWastePreventedKg * 2.5);

  return {
    totalWastePreventedKg: totalWastePreventedKg.toFixed(1),
    totalEconomicSavedRp: formatIDR(totalEconomicSavedRp),
    totalFoodDonatedKg: totalFoodDonatedKg.toFixed(1),
    totalFlashSaleSold,
    totalCompostProcessedKg: totalCompostProcessedKg.toFixed(1),
    estimatedCO2eAvoidedKg,
    methodologyNotice: 'Estimasi berbasis faktor emisi rata-rata FAO Food Waste Footprint (~2.5 kg CO₂e / kg makanan).'
  };
}
