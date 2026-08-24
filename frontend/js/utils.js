/* StokCerdas — Utility Helper Functions */

/**
 * Format number to Indonesian Rupiah (Rp)
 */
export function formatIDR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format date to standard Indonesian date string
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Format relative time (e.g. "2 hari yang lalu", "3 hari lagi")
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return '-';
  const target = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === -1) return 'Kemarin';
  if (diffDays > 1) return `${diffDays} hari lagi`;
  return `${Math.abs(diffDays)} hari yang lalu`;
}

/**
 * Generate unique random ID with prefix
 */
export function generateID(prefix = 'ID') {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Generate SKU based on category & name
 */
export function generateSKU(category, name) {
  const catPrefix = (category || 'GEN').substring(0, 3).toUpperCase();
  const namePrefix = (name || 'PRD').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${catPrefix}-${namePrefix}-${num}`;
}

/**
 * Export Javascript Array of Objects to CSV download
 */
export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString('id-ID') : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Sort stock batches based on FEFO (First Expired, First Out)
 */
export function sortByFEFO(batches) {
  if (!batches || !Array.isArray(batches)) return [];
  return [...batches].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
}
