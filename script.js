console.log("Solar System page loaded");

/* Tooltip logic so labels stay upright while planets orbit */
const tooltip = document.getElementById('tooltip');
let rafId = null;
let followEl = null;

function showTooltipFor(el) {
  followEl = el;
  tooltip.textContent = el.getAttribute('data-name') || '';
  tooltip.style.display = 'block';
  tooltip.setAttribute('aria-hidden', 'false');

  // add glow (uses inline CSS var --glow on element)
  el.classList.add('hovered');

  function loop() {
    if (!followEl) return;
    const r = followEl.getBoundingClientRect();
    const centerX = r.left + r.width/2;
    const topCandidate = r.top - 8;
    const tooltipW = tooltip.offsetWidth || 70;
    const tooltipH = tooltip.offsetHeight || 24;

    let left = centerX - tooltipW/2;
    left = Math.max(6, Math.min(left, window.innerWidth - tooltipW - 6));
    let top = topCandidate - tooltipH;
    if (top < 6) top = r.bottom + 8;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    rafId = requestAnimationFrame(loop);
  }
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function hideTooltip() {
  if (followEl) followEl.classList.remove('hovered');
  followEl = null;
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden', 'true');
  if (rafId) cancelAnimationFrame(rafId);
}

/* attach event listeners to anything that has data-name */
document.querySelectorAll('[data-name]').forEach(el => {
  el.addEventListener('mouseenter', () => showTooltipFor(el));
  el.addEventListener('mouseleave', () => hideTooltip());
});
// ensure DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const chatbot = document.getElementById('chatbot');
  const chatIcon = document.getElementById('chat-icon');
  const chatBox = document.getElementById('chat-box');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  // open chat: add .open to wrapper and set aria
  function openChat() {
    chatbot.classList.add('open');
    chatBox.setAttribute('aria-hidden', 'false');
    // focus input after short delay so animation completes
    setTimeout(() => chatInput.focus(), 160);
  }

  function closeChat() {
    chatbot.classList.remove('open');
    chatBox.setAttribute('aria-hidden', 'true');
    chatIcon.focus();
  }

  // toggle on rocket click
  chatIcon.addEventListener('click', () => {
    if (chatbot.classList.contains('open')) closeChat();
    else openChat();
  });

  // close button inside chat
  chatClose.addEventListener('click', closeChat);

  // Make sure clicking inside chat doesn't close it (no bubbling)
  chatBox.addEventListener('click', (e) => e.stopPropagation());

  
//   // send message (append & optional backend call)
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMsg('You', escapeHtml(text));
    chatInput.value = '';
    // try backend
    try {
      const res = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      appendMsg('Bot', escapeHtml(data.reply || '(no reply)'));
    } catch (err) {
      // fallback local answers
      const fallback = {
        sun: "Sun — our star.",
        mercury: "Mercury — the smallest planet.",
        venus: "Venus — very hot greenhouse.",
        earth: "Earth — our home.",
        moon: "Moon — Earth's satellite.",
        mars: "Mars — red planet.",
        jupiter: "Jupiter — largest planet.",
        saturn: "Saturn — the one with rings.",
        uranus: "Uranus — tilted ice giant.",
        neptune: "Neptune — distant ice giant."
      };
      let reply = "Server not reachable. Ask a planet name like 'Mars'.";
      for (let k in fallback) if (text.toLowerCase().includes(k)) { reply = fallback[k]; break; }
      appendMsg('Bot', escapeHtml(reply));
    }
  }
  // append message DOM
  function appendMsg(who, text) {
    const el = document.createElement('div');
    el.innerHTML = `<strong style="color:#bfefff">${who}:</strong> <span style="margin-left:8px">${text}</span>`;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // click send
  chatSend.addEventListener('click', sendMessage);
  // enter key
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  // small helper to avoid XSS when echoing user text
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  }

  // close chat if user clicks outside (optional)
  document.addEventListener('click', (e) => {
    if (!chatbot.contains(e.target) && chatbot.classList.contains('open')) closeChat();
  });
});

// Generate random stars
function createStars(count = 150) {
  const starsContainer = document.querySelector('.stars');
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 2 + 1; // 1–3px
    const delay = Math.random() * 3;    // 0–3s twinkle delay

    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${delay}s`;

    starsContainer.appendChild(star);
  }
}

// Call on load
document.addEventListener("DOMContentLoaded", () => {
  createStars(200); // adjust number for density
});


