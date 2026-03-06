/**
 * Brilliant Recap Widget
 * Add to pages: <script src="/js/brilliant-recap.js"></script>
 *
 * Shows a floating CTA offering personalized visit recap via email.
 * Collects session data privately, generates AI summary, sends to user.
 */
(function() {
  // Skip on excluded paths
  const EXCLUDED = ['/api/', '/.well-known/'];
  if (EXCLUDED.some(p => location.pathname.includes(p))) return;

  const API_URL = '/api/brilliant-recap';
  const SHOW_AFTER_MS = 30000; // Show after 30 seconds
  const MIN_PAGES = 2; // Only show if they've viewed 2+ pages

  // Session tracking
  let sessionId = sessionStorage.getItem('br_sid') || 'br_' + Math.random().toString(36).slice(2);
  let sessionStart = parseInt(sessionStorage.getItem('br_start')) || Date.now();
  let pagesViewed = JSON.parse(sessionStorage.getItem('br_pages') || '[]');
  let clicks = JSON.parse(sessionStorage.getItem('br_clicks') || '[]');
  let pageStart = Date.now();
  let maxScroll = 0;
  let recapRequested = sessionStorage.getItem('br_requested') === 'true';

  sessionStorage.setItem('br_sid', sessionId);
  if (!sessionStorage.getItem('br_start')) {
    sessionStorage.setItem('br_start', Date.now().toString());
  }

  // Track current page
  function savePageData() {
    const existing = pagesViewed.find(p => p.path === location.pathname);
    if (existing) {
      existing.time_on_page += Math.floor((Date.now() - pageStart) / 1000);
      existing.scroll_depth = Math.max(existing.scroll_depth, maxScroll);
    } else {
      pagesViewed.push({
        path: location.pathname,
        title: document.title,
        time_on_page: Math.floor((Date.now() - pageStart) / 1000),
        scroll_depth: maxScroll
      });
    }
    sessionStorage.setItem('br_pages', JSON.stringify(pagesViewed));
  }

  // Track scroll
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const depth = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      maxScroll = Math.max(maxScroll, Math.min(1, depth));
      scrollTick = false;
    });
  }, { passive: true });

  // Track clicks
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, [data-track]');
    if (el) {
      const text = (el.textContent || '').trim().slice(0, 50);
      if (text && !text.includes('recap') && clicks.length < 20) {
        clicks.push({ element_text: text, page_path: location.pathname });
        sessionStorage.setItem('br_clicks', JSON.stringify(clicks));
      }
    }
  }, { passive: true });

  // Save on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') savePageData();
  });
  window.addEventListener('beforeunload', savePageData);

  // Build session data
  function getSessionData(email) {
    savePageData();
    return {
      email,
      session_id: sessionId,
      landing_page: sessionStorage.getItem('br_landing') || pagesViewed[0]?.path || location.pathname,
      referrer: document.referrer,
      utm_source: new URLSearchParams(location.search).get('utm_source'),
      utm_campaign: new URLSearchParams(location.search).get('utm_campaign'),
      utm_term: new URLSearchParams(location.search).get('utm_term'),
      pages_viewed: pagesViewed,
      clicks: clicks,
      total_time: Math.floor((Date.now() - sessionStart) / 1000)
    };
  }

  // Store landing page
  if (!sessionStorage.getItem('br_landing')) {
    sessionStorage.setItem('br_landing', location.pathname);
  }

  // CSS
  const style = document.createElement('style');
  style.textContent = `
    .br-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .br-trigger {
      background: linear-gradient(135deg, #f77f00 0%, #e85d04 100%);
      color: white;
      border: none;
      padding: 14px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(247, 127, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
    }
    .br-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(247, 127, 0, 0.5);
    }
    .br-trigger svg {
      width: 18px;
      height: 18px;
    }
    .br-modal {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 340px;
      background: #0a0a1a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      padding: 24px;
      display: none;
      animation: br-slideUp 0.3s ease;
    }
    .br-modal.open { display: block; }
    @keyframes br-slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .br-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 4px;
      font-size: 20px;
      line-height: 1;
    }
    .br-close:hover { color: white; }
    .br-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .br-desc {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .br-input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px 14px;
      color: white;
      font-size: 14px;
      outline: none;
      margin-bottom: 12px;
      box-sizing: border-box;
    }
    .br-input:focus {
      border-color: #f77f00;
    }
    .br-input::placeholder {
      color: rgba(255,255,255,0.4);
    }
    .br-submit {
      width: 100%;
      background: linear-gradient(135deg, #f77f00 0%, #e85d04 100%);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .br-submit:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    .br-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .br-privacy {
      color: rgba(255,255,255,0.4);
      font-size: 11px;
      text-align: center;
      margin-top: 12px;
    }
    .br-success {
      text-align: center;
      padding: 20px 0;
    }
    .br-success svg {
      width: 48px;
      height: 48px;
      color: #2dd4bf;
      margin-bottom: 12px;
    }
    .br-success h3 {
      color: white;
      font-size: 18px;
      margin: 0 0 8px 0;
    }
    .br-success p {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  // Widget HTML
  const widget = document.createElement('div');
  widget.className = 'br-widget';
  widget.innerHTML = `
    <button class="br-trigger" style="display: none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      Get your visit recap
    </button>
    <div class="br-modal">
      <button class="br-close">&times;</button>
      <div class="br-form">
        <h3 class="br-title">✨ Want a personalized recap?</h3>
        <p class="br-desc">Drop your email and I'll send you a summary of what you explored, plus relevant resources.</p>
        <input type="email" class="br-input" placeholder="you@company.com" />
        <button class="br-submit">Send my recap</button>
        <p class="br-privacy">🔒 Totally private. No spam, just your recap.</p>
      </div>
      <div class="br-success" style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3>Check your inbox!</h3>
        <p>Your personalized recap is on its way.</p>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const trigger = widget.querySelector('.br-trigger');
  const modal = widget.querySelector('.br-modal');
  const closeBtn = widget.querySelector('.br-close');
  const input = widget.querySelector('.br-input');
  const submit = widget.querySelector('.br-submit');
  const form = widget.querySelector('.br-form');
  const success = widget.querySelector('.br-success');

  // Show trigger after delay if enough engagement
  function maybeShowTrigger() {
    if (recapRequested) return;
    if (pagesViewed.length >= MIN_PAGES || (Date.now() - sessionStart) > 60000) {
      trigger.style.display = 'flex';
    }
  }

  setTimeout(maybeShowTrigger, SHOW_AFTER_MS);
  // Also check on page changes
  window.addEventListener('popstate', () => setTimeout(maybeShowTrigger, 2000));

  // Toggle modal
  trigger.addEventListener('click', () => {
    modal.classList.toggle('open');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  // Submit
  submit.addEventListener('click', async () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      input.style.borderColor = '#ef4444';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending...';

    try {
      const data = getSessionData(email);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
        sessionStorage.setItem('br_requested', 'true');
        recapRequested = true;
        setTimeout(() => {
          modal.classList.remove('open');
          trigger.style.display = 'none';
        }, 3000);
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      submit.disabled = false;
      submit.textContent = 'Try again';
    }
  });

  // Enter key submits
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submit.click();
  });
})();
