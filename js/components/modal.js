/* StokCerdas — Universal Modal Controller */

export function openModal(title, htmlContent, onModalMounted) {
  const container = document.getElementById('modal-container');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  if (!container || !titleEl || !bodyEl) return;

  titleEl.innerText = title;
  bodyEl.innerHTML = htmlContent;
  container.classList.remove('hidden');

  if (window.lucide) window.lucide.createIcons();

  if (onModalMounted) {
    onModalMounted(bodyEl);
  }
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (container) {
    container.classList.add('hidden');
  }
}

// Global modal close button handler
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  const backdrop = document.getElementById('modal-container');
  if (backdrop) {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal();
    });
  }
});
