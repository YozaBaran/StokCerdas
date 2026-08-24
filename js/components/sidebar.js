/* StokCerdas — Sidebar Navigation Component */

export const NAV_ITEMS = [
  { id: 'landing', label: 'Landing Page', icon: 'globe', badge: 'Public', badgeClass: 'badge-blue' },
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'stok', label: 'Stok', icon: 'boxes' },
  { id: 'produk', label: 'Produk', icon: 'package' },
  { id: 'penjualan', label: 'Penjualan', icon: 'shopping-cart' },
  { id: 'pembelian', label: 'Pembelian', icon: 'truck' },
  { id: 'supplier', label: 'Supplier', icon: 'users' },
  { id: 'forecast', label: 'AI Forecast', icon: 'trending-up', badge: 'AI', badgeClass: 'badge-emerald' },
  { id: 'reorder', label: 'Smart Reorder', icon: 'sparkles', badge: 'AI', badgeClass: 'badge-teal' },
  { id: 'expiry', label: 'Expiry & Waste', icon: 'clock' },
  { id: 'surplus', label: 'Selamatkan Surplus', icon: 'heart-handshake', badge: 'Alert', badgeClass: 'badge-amber' },
  { id: 'impact', label: 'Impact', icon: 'leaf' },
  { id: 'reports', label: 'Reports', icon: 'file-bar-chart' },
  { id: 'aiAssistant', label: 'AI Assistant', icon: 'bot' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

export function renderSidebar(activePageId = 'dashboard', onNavigate) {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-brand" id="brand-logo-btn" style="cursor: pointer;" title="Klik untuk ke Landing Page">
      <div class="brand-icon"><i data-lucide="leaf"></i></div>
      <div class="brand-text">Stok<span>Cerdas</span></div>
    </div>
    
    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(
        item => `
        <a class="nav-item ${item.id === activePageId ? 'active' : ''}" data-page="${item.id}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge ${item.badgeClass}">${item.badge}</span>` : ''}
        </a>
      `
      ).join('')}
    </nav>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Click logo to go to Landing Page
  const brandBtn = container.querySelector('#brand-logo-btn');
  if (brandBtn && onNavigate) {
    brandBtn.addEventListener('click', () => onNavigate('landing'));
  }

  // Attach nav item event listeners
  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const pageId = el.getAttribute('data-page');
      if (onNavigate) onNavigate(pageId);
    });
  });
}
