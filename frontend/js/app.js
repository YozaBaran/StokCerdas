/* StokCerdas — Main Application Router & Controller */

import { store } from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { renderNotificationDrawer, showToast } from './components/notifications.js';

// Page Views Imports
import { renderLanding } from './pages/landing.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderStok } from './pages/stok.js';
import { renderProduk } from './pages/produk.js';
import { renderPenjualan } from './pages/penjualan.js';
import { renderPembelian } from './pages/pembelian.js';
import { renderSupplier } from './pages/supplier.js';
import { renderForecast } from './pages/forecast.js';
import { renderReorder } from './pages/reorder.js';
import { renderExpiry } from './pages/expiry.js';
import { renderSurplus } from './pages/surplus.js';
import { renderImpact } from './pages/impact.js';
import { renderReports } from './pages/reports.js';
import { renderAIAssistant } from './pages/aiAssistant.js';
import { renderSettings } from './pages/settings.js';
import { renderOnboarding } from './pages/onboarding.js';

class AppController {
  constructor() {
    this.currentPageId = 'dashboard';
    this.isMobileSidebarOpen = false;
  }

  init() {
    console.log('StokCerdas Platform Initializing...');

    // Subscribe to store updates to keep UI synchronized
    store.subscribe((state) => {
      this.renderCurrentViewState();
    });

    this.renderCurrentViewState();
  }

  renderCurrentViewState() {
    const state = store.getState();
    const sidebarEl = document.getElementById('sidebar-container');
    const headerEl = document.getElementById('header-container');

    // If User is on Landing Page OR Logged Out:
    if (!state.currentUser || this.currentPageId === 'landing') {
      if (sidebarEl) sidebarEl.style.display = 'none';
      if (headerEl) headerEl.style.display = 'none';

      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper) mainWrapper.style.marginLeft = '0';

      renderLanding(() => this.navigateToPage('dashboard'));
    } else {
      // User is authenticated and on an internal app view:
      if (sidebarEl) sidebarEl.style.display = 'flex';
      if (headerEl) headerEl.style.display = 'flex';

      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper && window.innerWidth > 1024) mainWrapper.style.marginLeft = '260px';

      this.renderFramework();
      this.renderActivePage(this.currentPageId);
    }
  }

  renderFramework() {
    renderSidebar(this.currentPageId, (pageId) => this.navigateToPage(pageId));
    
    renderHeader(
      () => this.toggleMobileSidebar(),
      () => this.toggleNotificationDrawer(),
      () => this.navigateToPage('onboarding'),
      () => this.handleLogout(),
      () => this.navigateToPage('landing')
    );

    renderNotificationDrawer();
  }

  handleLogout() {
    store.logoutUser();
    this.navigateToPage('landing');
    showToast('Anda telah keluar dari akun.', 'info');
  }

  toggleMobileSidebar() {
    const sidebarEl = document.getElementById('sidebar-container');
    if (sidebarEl) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      if (this.isMobileSidebarOpen) {
        sidebarEl.classList.add('mobile-open');
      } else {
        sidebarEl.classList.remove('mobile-open');
      }
    }
  }

  toggleNotificationDrawer() {
    const drawerEl = document.getElementById('notification-drawer');
    if (drawerEl) {
      drawerEl.classList.toggle('hidden');
      if (!drawerEl.classList.contains('hidden')) {
        store.markAllNotificationsRead();
      }
    }
  }

  navigateToPage(pageId) {
    this.currentPageId = pageId;
    this.renderCurrentViewState();
    window.scrollTo(0, 0);
  }

  renderActivePage(pageId) {
    switch (pageId) {
      case 'landing':
        renderLanding(() => this.navigateToPage('dashboard'));
        break;
      case 'dashboard':
        renderDashboard((target) => this.navigateToPage(target));
        break;
      case 'stok':
        renderStok((target) => this.navigateToPage(target));
        break;
      case 'produk':
        renderProduk((target) => this.navigateToPage(target));
        break;
      case 'penjualan':
        renderPenjualan((target) => this.navigateToPage(target));
        break;
      case 'pembelian':
        renderPembelian((target) => this.navigateToPage(target));
        break;
      case 'supplier':
        renderSupplier((target) => this.navigateToPage(target));
        break;
      case 'forecast':
        renderForecast((target) => this.navigateToPage(target));
        break;
      case 'reorder':
        renderReorder((target) => this.navigateToPage(target));
        break;
      case 'expiry':
        renderExpiry((target) => this.navigateToPage(target));
        break;
      case 'surplus':
        renderSurplus((target) => this.navigateToPage(target));
        break;
      case 'impact':
        renderImpact((target) => this.navigateToPage(target));
        break;
      case 'reports':
        renderReports((target) => this.navigateToPage(target));
        break;
      case 'aiAssistant':
        renderAIAssistant((target) => this.navigateToPage(target));
        break;
      case 'settings':
        renderSettings((target) => this.navigateToPage(target));
        break;
      case 'onboarding':
        renderOnboarding(
          (target) => this.navigateToPage(target),
          () => this.navigateToPage('dashboard')
        );
        break;
      default:
        renderDashboard((target) => this.navigateToPage(target));
        break;
    }
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();

  // Attach drawer actions
  document.getElementById('close-notifications-btn')?.addEventListener('click', () => {
    document.getElementById('notification-drawer')?.classList.add('hidden');
  });

  document.getElementById('mark-all-read-btn')?.addEventListener('click', () => {
    store.markAllNotificationsRead();
    renderNotificationDrawer();
    showToast('Semua notifikasi ditandai dibaca.', 'info');
  });

  document.getElementById('clear-notifications-btn')?.addEventListener('click', () => {
    store.clearNotifications();
    renderNotificationDrawer();
    showToast('Notifikasi dibersihkan.', 'info');
  });
});
