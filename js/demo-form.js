(function () {
  if (document.getElementById('demo-modal')) return;

  const init = () => {
    const style = document.createElement('style');
    style.textContent = `
      .demo-modal {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(12px);
        z-index: 2000;
        padding: 1.5rem;
      }

      .demo-modal.active {
        display: flex;
      }

      .demo-modal__card {
        position: relative;
        width: min(720px, 100%);
        background: rgba(10, 10, 10, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 2.5rem;
        box-shadow: 0 30px 120px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04);
      }

      .demo-modal__close {
        position: absolute;
        right: 1.25rem;
        top: 1.25rem;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        cursor: pointer;
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;
      }

      .demo-modal__close:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
      }

      .demo-modal__header {
        margin-bottom: 1.5rem;
      }

      .demo-modal__title {
        margin: 0 0 0.35rem 0;
        font-size: 2rem;
        font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
        letter-spacing: -0.02em;
      }

      .demo-modal__subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.72);
        line-height: 1.6;
      }

      .demo-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .demo-form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .demo-form-group label {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.7);
        letter-spacing: 0.04em;
        font-family: 'JetBrains Mono', 'Inter', monospace;
      }

      .demo-form-group input,
      .demo-form-group textarea {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        padding: 0.95rem 1rem;
        font-size: 1rem;
        font-family: 'Inter', system-ui, sans-serif;
        transition: all 0.2s ease;
      }

      .demo-form-group input:focus,
      .demo-form-group textarea:focus {
        outline: none;
        border-color: #7850ff;
        box-shadow: 0 0 0 1px rgba(120, 80, 255, 0.25);
      }

      .demo-form-group textarea {
        resize: vertical;
        min-height: 120px;
      }

      .demo-submit {
        width: 100%;
        margin-top: 0.5rem;
        padding: 1rem 1.25rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        font-family: 'JetBrains Mono', 'Inter', monospace;
        font-size: 0.95rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(135deg, #7850ff 0%, #5040ff 50%, #ff5078 100%);
        background-size: 200% auto;
        transition: all 0.25s ease;
      }

      .demo-submit:hover:not(:disabled) {
        background-position: right center;
        transform: translateY(-2px);
        box-shadow: 0 10px 45px rgba(120, 80, 255, 0.4);
      }

      .demo-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .demo-status {
        margin-top: 0.85rem;
        font-size: 0.95rem;
        display: none;
      }

      .demo-status.success {
        color: #67ffb3;
      }

      .demo-status.error {
        color: #ff5078;
      }

      .demo-ai {
        display: none;
        margin-top: 1.25rem;
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid rgba(120, 80, 255, 0.4);
        background: linear-gradient(135deg, rgba(120, 80, 255, 0.1) 0%, rgba(80, 64, 255, 0.1) 100%);
      }

      .demo-ai h4 {
        margin: 0 0 0.35rem 0;
      }

      .demo-ai p {
        margin: 0;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.85);
      }

      .demo-success-overlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(16px);
        z-index: 2100;
        padding: 1.5rem;
      }

      .demo-success-overlay.active {
        display: flex;
      }

      .demo-success-card {
        position: relative;
        width: min(560px, 100%);
        background: rgba(10, 10, 10, 0.98);
        border: 1px solid rgba(120, 80, 255, 0.3);
        border-radius: 24px;
        padding: 2.5rem;
        text-align: center;
        box-shadow: 0 40px 140px rgba(120, 80, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.04);
      }

      .demo-success-icon {
        width: 72px;
        height: 72px;
        margin: 0 auto 1.5rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #7850ff 0%, #5040ff 50%, #ff5078 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        animation: successPulse 2s ease-in-out infinite;
      }

      @keyframes successPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(120, 80, 255, 0.4); }
        50% { transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(120, 80, 255, 0.2); }
      }

      .demo-success-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
        background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .demo-success-subtitle {
        margin: 0 0 1.5rem 0;
        color: rgba(255, 255, 255, 0.6);
        font-size: 1rem;
      }

      .demo-ai-response {
        text-align: left;
        padding: 1.25rem;
        border-radius: 16px;
        border: 1px solid rgba(120, 80, 255, 0.25);
        background: linear-gradient(135deg, rgba(120, 80, 255, 0.08) 0%, rgba(80, 64, 255, 0.08) 100%);
        margin-bottom: 1.5rem;
        min-height: 80px;
      }

      .demo-ai-response-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #7850ff;
        font-family: 'JetBrains Mono', 'Inter', monospace;
      }

      .demo-ai-response-label::before {
        content: '✦';
        font-size: 0.9rem;
      }

      .demo-ai-response-text {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.7;
        font-size: 1rem;
      }

      .demo-ai-cursor {
        display: inline-block;
        width: 2px;
        height: 1.1em;
        background: #7850ff;
        margin-left: 2px;
        animation: cursorBlink 0.8s ease-in-out infinite;
        vertical-align: text-bottom;
      }

      @keyframes cursorBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      .demo-ai-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 1rem 0;
      }

      .demo-ai-loading span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #7850ff;
        animation: loadingDot 1.4s ease-in-out infinite;
      }

      .demo-ai-loading span:nth-child(2) { animation-delay: 0.2s; }
      .demo-ai-loading span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes loadingDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      .demo-success-close {
        padding: 0.9rem 2rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        cursor: pointer;
        font-family: 'JetBrains Mono', 'Inter', monospace;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        transition: all 0.25s ease;
      }

      .demo-success-close:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      @media (max-width: 640px) {
        .demo-grid {
          grid-template-columns: 1fr;
        }

        .demo-modal__card {
          padding: 1.5rem;
        }

        .demo-modal__title {
          font-size: 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    const modalMarkup = `
      <div class="demo-modal" id="demo-modal" aria-hidden="true">
        <div class="demo-modal__card" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <button class="demo-modal__close" type="button" data-demo-close aria-label="Close demo form">×</button>
          <div class="demo-modal__header">
            <p class="demo-modal__eyebrow" style="text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono','Inter',monospace; margin: 0 0 0.4rem 0;">Talk with the team</p>
            <h2 class="demo-modal__title" id="demo-modal-title">Schedule a demo</h2>
            <p class="demo-modal__subtitle">Share a little context about your platform and we will set up a tailored walkthrough of the DevMCP workflow.</p>
          </div>
          <form id="demo-form" novalidate>
            <div class="demo-grid">
              <div class="demo-form-group">
                <label for="demo-name">Name</label>
                <input id="demo-name" name="name" type="text" autocomplete="name" required>
              </div>
              <div class="demo-form-group">
                <label for="demo-email">Work Email</label>
                <input id="demo-email" name="email" type="email" autocomplete="email" required>
              </div>
            </div>
            <div class="demo-grid">
              <div class="demo-form-group">
                <label for="demo-company">Company</label>
                <input id="demo-company" name="company" type="text" autocomplete="organization">
              </div>
              <div class="demo-form-group">
                <label for="demo-subject">Topic</label>
                <input id="demo-subject" name="subject" type="text" value="Schedule a Demo" required>
              </div>
            </div>
            <div class="demo-form-group">
              <label for="demo-message">What should we prepare?</label>
              <textarea id="demo-message" name="message" required placeholder="APIs to showcase, KPIs you care about, current onboarding pain..."></textarea>
            </div>
            <button class="demo-submit" type="submit">Send Request</button>
            <div class="demo-status" data-demo-status></div>
            <div class="demo-ai" data-demo-ai>
              <h4>AI Assistant Notes</h4>
              <p data-demo-ai-text></p>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalMarkup);

    const successModalMarkup = `
      <div class="demo-success-overlay" id="demo-success-modal">
        <div class="demo-success-card">
          <div class="demo-success-icon">✓</div>
          <h3 class="demo-success-title">Request Received!</h3>
          <p class="demo-success-subtitle">We'll be in touch shortly.</p>
          <div class="demo-ai-response">
            <div class="demo-ai-response-label">AI Assistant</div>
            <div class="demo-ai-loading" data-ai-loading>
              <span></span><span></span><span></span>
            </div>
            <div class="demo-ai-response-text" data-ai-text></div>
          </div>
          <button class="demo-success-close" type="button" data-success-close>Close</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successModalMarkup);

    const modal = document.getElementById('demo-modal');
    const successModal = document.getElementById('demo-success-modal');
    const form = document.getElementById('demo-form');
    const statusEl = modal.querySelector('[data-demo-status]');
    const aiContainer = modal.querySelector('[data-demo-ai]');
    const aiText = modal.querySelector('[data-demo-ai-text]');
    const closeButtons = modal.querySelectorAll('[data-demo-close]');
    const successCloseBtn = successModal.querySelector('[data-success-close]');
    const aiLoading = successModal.querySelector('[data-ai-loading]');
    const aiResponseText = successModal.querySelector('[data-ai-text]');
    const subjectInput = document.getElementById('demo-subject');
    const nameInput = document.getElementById('demo-name');

    const openModal = (subject = 'Schedule a Demo') => {
      subjectInput.value = subject;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => nameInput.focus(), 50);
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const closeSuccessModal = () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
      aiResponseText.textContent = '';
      aiLoading.style.display = 'flex';
    };

    const showSuccessModal = (aiResponse) => {
      closeModal();
      successModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Show loading dots initially
      aiLoading.style.display = 'flex';
      aiResponseText.innerHTML = '';

      // Start typing animation after a brief delay
      setTimeout(() => {
        aiLoading.style.display = 'none';

        if (aiResponse) {
          let index = 0;
          const cursor = document.createElement('span');
          cursor.className = 'demo-ai-cursor';

          const typeWriter = () => {
            if (index < aiResponse.length) {
              aiResponseText.textContent = aiResponse.slice(0, index + 1);
              aiResponseText.appendChild(cursor);
              index++;
              setTimeout(typeWriter, 18);
            } else {
              // Remove cursor after typing completes
              setTimeout(() => cursor.remove(), 1500);
            }
          };

          typeWriter();
        }
      }, 800);
    };

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    successCloseBtn.addEventListener('click', closeSuccessModal);
    successModal.addEventListener('click', (event) => {
      if (event.target === successModal) closeSuccessModal();
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (successModal.classList.contains('active')) {
          closeSuccessModal();
        } else if (modal.classList.contains('active')) {
          closeModal();
        }
      }
    });

    const handleSubmit = async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('.demo-submit');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      statusEl.style.display = 'none';
      aiContainer.style.display = 'none';

      const payload = {
        name: nameInput.value.trim(),
        email: document.getElementById('demo-email').value.trim(),
        company: document.getElementById('demo-company').value.trim(),
        subject: subjectInput.value.trim() || 'Schedule a Demo',
        message: document.getElementById('demo-message').value.trim()
      };

      try {
        const response = await fetch('/api/demo-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit. Please try again.');
        }

        form.reset();
        subjectInput.value = 'Schedule a Demo';

        // Show the success modal with AI response
        showSuccessModal(data.aiResponse || data.message || 'Thanks! We will reach out shortly.');
      } catch (error) {
        statusEl.textContent = error.message || 'Something went wrong. Please try again.';
        statusEl.className = 'demo-status error';
        statusEl.style.display = 'block';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Request';
      }
    };

    form.addEventListener('submit', handleSubmit);

    const attachTriggers = () => {
      const triggers = Array.from(document.querySelectorAll('a[href="#demo"], a[href="/#demo"], [data-demo-trigger], .schedule-demo'));
      triggers.forEach(trigger => {
        if (trigger.dataset.demoBound) return;
        trigger.dataset.demoBound = 'true';
        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          const subject = trigger.dataset.demoSubject || trigger.getAttribute('aria-label') || trigger.textContent.trim();
          openModal(subject || 'Schedule a Demo');
        });
      });
    };

    attachTriggers();
    const observer = new MutationObserver(attachTriggers);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
