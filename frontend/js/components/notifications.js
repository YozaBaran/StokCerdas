/* StokCerdas — Notification Drawer & Toast Engine */

import { store } from '../store.js';
import { formatRelativeDate } from '../utils.js';

export function renderNotificationDrawer() {
  const listEl = document.getElementById('notification-list');
  if (!listEl) return;

  const state = store.getState();
  const notifications = state.notifications || [];

  if (notifications.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--slate-400);">
        <i data-lucide="bell-off" style="width: 36px; height: 36px; margin-bottom: 8px;"></i>
        <p>Tidak ada notifikasi saat ini.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  listEl.innerHTML = notifications
    .map(
      n => `
    <div class="notification-item ${n.read ? '' : 'unread'}">
      <div class="notification-title">${n.title}</div>
      <div class="notification-desc">${n.message}</div>
      <div class="notification-time">${formatRelativeDate(n.timestamp)}</div>
    </div>
  `
    )
    .join('');

  if (window.lucide) window.lucide.createIcons();
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
