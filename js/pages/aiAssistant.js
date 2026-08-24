/* StokCerdas — Conversational AI Assistant Interface Page View */

import { store } from '../store.js';
import { processAIQuery } from '../engine/aiAssistantEngine.js';

export function renderAIAssistant(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">StokCerdas Conversational AI Assistant</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Asisten AI interaktif berbahasa Indonesia yang menjawab pertanyaan berdasarkan data real-time bisnis Anda.</p>
      </div>
      <span class="badge badge-emerald" style="font-size: 0.9rem; padding: 6px 14px;"><i data-lucide="sparkles"></i> AI Engine Active</span>
    </div>

    <!-- Chat Box Component -->
    <div class="chat-container">
      
      <!-- Suggestion Chips Bar -->
      <div class="chat-suggestions">
        <div class="chip-suggestion" data-query="Apa yang harus saya beli besok?">💡 Apa yang harus saya beli besok?</div>
        <div class="chip-suggestion" data-query="Berapa nilai stok saya sekarang?">📦 Berapa nilai stok saya sekarang?</div>
        <div class="chip-suggestion" data-query="Produk apa yang paling banyak terbuang?">⚠️ Produk paling banyak terbuang?</div>
        <div class="chip-suggestion" data-query="Berapa uang yang berhasil saya hemat bulan ini?">🌱 Berapa uang yang berhasil dihemat?</div>
        <div class="chip-suggestion" data-query="Produk mana yang slow moving?">📊 Produk slow moving vs fast moving?</div>
      </div>

      <!-- Messages Scroll Area -->
      <div id="chat-messages-area" class="chat-messages">
        <!-- Initial Welcome Message from Assistant -->
        <div class="chat-bubble assistant">
          👋 <strong>Halo! Saya StokCerdas AI Assistant.</strong><br><br>
          Saya siap membantu menganalisis stok, prediksi pembelian, risiko food waste, dan penghematan bisnis Anda. Silakan ketik pertanyaan Anda atau klik contoh saran di atas!
        </div>
      </div>

      <!-- Chat Input Field -->
      <form id="chat-form" class="chat-input-bar">
        <input type="text" id="chat-input-text" class="form-control" placeholder="Tanyakan sesuatu pada StokCerdas AI..." required autocomplete="off">
        <button type="submit" class="btn btn-teal"><i data-lucide="send"></i> Kirim</button>
      </form>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const messagesArea = document.getElementById('chat-messages-area');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input-text');

  const appendUserMessage = (msg) => {
    const div = document.createElement('div');
    div.className = 'chat-bubble user';
    div.innerText = msg;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  const appendAssistantMessage = (res) => {
    const div = document.createElement('div');
    div.className = 'chat-bubble assistant';

    let html = res.answer.replace(/\n/g, '<br>');
    if (res.actionType !== 'NONE') {
      html += `<div style="margin-top: 14px;">
        <button class="btn btn-sm btn-primary btn-chat-action" data-target="${res.actionTarget}">
          <i data-lucide="arrow-right"></i> ${res.actionLabel}
        </button>
      </div>`;
    }

    div.innerHTML = html;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    if (window.lucide) window.lucide.createIcons();

    div.querySelector('.btn-chat-action')?.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      if (onNavigate) onNavigate(target);
    });
  };

  const handleQuery = (text) => {
    appendUserMessage(text);
    chatInput.value = '';

    // Process query deterministically against store
    setTimeout(() => {
      const state = store.getState();
      const response = processAIQuery(text, state);
      appendAssistantMessage(response);
    }, 300);
  };

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value.trim()) handleQuery(chatInput.value);
  });

  container.querySelectorAll('.chip-suggestion').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      handleQuery(q);
    });
  });
}
