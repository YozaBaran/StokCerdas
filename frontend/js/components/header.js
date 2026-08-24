/* StokCerdas — Header / Topbar Component */

import { store } from '../store.js';

export function renderHeader(onToggleMobileSidebar, onOpenNotifications, onLaunchOnboarding, onLogout, onNavigateLanding) {
  const container = document.getElementById('header-container');
  if (!container) return;

  const state = store.getState();
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const currentUser = state.currentUser || { name: 'Pengguna', email: 'owner@kedainusantara.com' };

  container.innerHTML = `
    <div class="header-left">
      <button id="mobile-sidebar-toggle" class="icon-btn" aria-label="Toggle Sidebar">
        <i data-lucide="menu"></i>
      </button>
      
      <div class="business-selector">
        <i data-lucide="store" class="icon-emerald"></i>
        <span>${state.business ? state.business.name : 'Kedai Nusantara'}</span>
        <span class="badge badge-gray">${state.business ? state.business.type : 'UMKM'}</span>
      </div>

      <!-- Quick Back to Landing Page Button -->
      <button id="header-landing-btn" class="btn btn-sm btn-ghost" title="Ke Landing Page Publik">
        <i data-lucide="globe"></i>
        <span>Landing Page</span>
      </button>
    </div>

    <div class="header-right">
      <!-- Demo Mode Toggle Button -->
      <button id="demo-mode-btn" class="btn btn-sm ${state.isDemoMode ? 'btn-teal' : 'btn-outline'}">
        <i data-lucide="sparkles"></i>
        <span>${state.isDemoMode ? 'Demo Mode Active' : 'Try Demo Mode'}</span>
      </button>

      <!-- Role Switcher -->
      <div class="role-selector">
        <select id="role-select" class="form-control" style="padding: 4px 8px; font-size: 0.8rem; font-weight: 700;">
          <option value="owner" ${state.userRole === 'owner' ? 'selected' : ''}>Role: Owner</option>
          <option value="manager" ${state.userRole === 'manager' ? 'selected' : ''}>Role: Manager</option>
          <option value="staff" ${state.userRole === 'staff' ? 'selected' : ''}>Role: Staff</option>
        </select>
      </div>

      <!-- Notification Bell -->
      <button id="notification-bell-btn" class="icon-btn" style="position: relative;" aria-label="Notifikasi">
        <i data-lucide="bell"></i>
        ${unreadCount > 0 ? `<span class="badge badge-red" style="position: absolute; top: -4px; right: -4px; padding: 2px 6px; font-size: 0.7rem;">${unreadCount}</span>` : ''}
      </button>

      <!-- Logged In User Profile & Logout -->
      <div style="display: flex; align-items: center; gap: 8px; border-left: 1px solid var(--border-color); padding-left: 12px;">
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--slate-800);">${currentUser.name}</span>
        <button id="logout-btn" class="btn btn-sm btn-ghost text-muted" title="Keluar ke Landing Page">
          <i data-lucide="log-out" style="color: var(--red-500);"></i>
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach event listeners
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', onToggleMobileSidebar);

  const landingBtn = document.getElementById('header-landing-btn');
  if (landingBtn && onNavigateLanding) landingBtn.addEventListener('click', onNavigateLanding);

  const demoBtn = document.getElementById('demo-mode-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      const isCurrentlyDemo = store.getState().isDemoMode;
      if (isCurrentlyDemo) {
        if (confirm('Matikan Demo Mode dan buat ruang kerja kosong baru?')) {
          store.setDemoMode(false);
          window.location.reload();
        }
      } else {
        store.setDemoMode(true);
        window.location.reload();
      }
    });
  }

  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', e => {
      store.setUserRole(e.target.value);
    });
  }

  const notifBell = document.getElementById('notification-bell-btn');
  if (notifBell && onOpenNotifications) {
    notifBell.addEventListener('click', onOpenNotifications);
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && onLogout) {
    logoutBtn.addEventListener('click', onLogout);
  }
}
