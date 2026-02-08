(function () {
  if (document.getElementById('demo-modal')) return;

  const init = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Gypsum Design System Variables */
      .demo-modal, .demo-success-overlay {
        --gypsum-primary: hsl(24, 80%, 45%);
        --gypsum-primary-hover: hsl(24, 80%, 40%);
        --gypsum-accent: hsl(170, 85%, 42%);
        --gypsum-bg: #030712;
        --gypsum-surface: rgba(255, 255, 255, 0.03);
        --gypsum-border: rgba(255, 255, 255, 0.1);
        --gypsum-border-accent: rgba(247, 127, 0, 0.4);
        --gypsum-text: #ffffff;
        --gypsum-text-muted: rgba(255, 255, 255, 0.7);
        --gypsum-radius: 0.5rem;
      }

      .demo-modal {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(3, 7, 18, 0.9);
        backdrop-filter: blur(12px);
        z-index: 2000;
        padding: 1.5rem;
      }

      .demo-modal.active {
        display: flex;
      }

      .demo-modal__card {
        position: relative;
        width: min(600px, 100%);
        background: var(--gypsum-bg);
        border: 1px solid var(--gypsum-border);
        border-radius: var(--gypsum-radius);
        padding: 2rem;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
      }

      .demo-modal__close {
        position: absolute;
        right: 1rem;
        top: 1rem;
        width: 36px;
        height: 36px;
        border-radius: var(--gypsum-radius);
        border: 1px solid var(--gypsum-border);
        background: var(--gypsum-surface);
        color: var(--gypsum-text-muted);
        cursor: pointer;
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .demo-modal__close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--gypsum-text);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .demo-modal__header {
        margin-bottom: 1.5rem;
      }

      .demo-modal__title {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-family: 'Source Serif 4', ui-serif, Georgia, serif;
        letter-spacing: -0.01em;
        color: var(--gypsum-text);
      }

      .demo-modal__subtitle {
        margin: 0;
        color: var(--gypsum-text-muted);
        line-height: 1.6;
        font-size: 0.95rem;
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
        gap: 0.35rem;
      }

      .demo-form-group label {
        font-size: 0.85rem;
        color: var(--gypsum-text-muted);
        font-family: 'Source Serif 4', serif;
        font-weight: 500;
      }

      .demo-form-group input,
      .demo-form-group textarea {
        width: 100%;
        border-radius: calc(var(--gypsum-radius) - 2px);
        border: 1px solid var(--gypsum-border);
        background: var(--gypsum-surface);
        color: var(--gypsum-text);
        padding: 0.75rem 0.875rem;
        font-size: 0.95rem;
        font-family: 'Source Serif 4', serif;
        transition: all 0.2s ease;
      }

      .demo-form-group input:focus,
      .demo-form-group textarea:focus {
        outline: none;
        border-color: var(--gypsum-accent);
        box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.15);
      }

      .demo-form-group textarea {
        resize: vertical;
        min-height: 100px;
      }

      .demo-submit {
        width: 100%;
        margin-top: 0.75rem;
        padding: 0.875rem 1.25rem;
        border-radius: calc(var(--gypsum-radius) - 2px);
        border: none;
        cursor: pointer;
        font-family: 'Source Serif 4', serif;
        font-size: 0.95rem;
        font-weight: 500;
        color: #fff;
        background: var(--gypsum-primary);
        transition: all 0.2s ease;
      }

      .demo-submit:hover:not(:disabled) {
        background: var(--gypsum-primary-hover);
        transform: translateY(-1px);
      }

      .demo-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .demo-status {
        margin-top: 0.75rem;
        font-size: 0.9rem;
        display: none;
      }

      .demo-status.success {
        color: var(--gypsum-accent);
      }

      .demo-status.error {
        color: hsl(0, 84%, 60%);
      }

      .demo-ai {
        display: none;
        margin-top: 1rem;
        padding: 1rem;
        border-radius: var(--gypsum-radius);
        border: 1px solid var(--gypsum-border-accent);
        background: rgba(247, 127, 0, 0.05);
      }

      .demo-ai h4 {
        margin: 0 0 0.35rem 0;
        color: var(--gypsum-primary);
        font-size: 0.85rem;
      }

      .demo-ai p {
        margin: 0;
        line-height: 1.6;
        color: var(--gypsum-text-muted);
      }

      .demo-success-overlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(3, 7, 18, 0.92);
        backdrop-filter: blur(16px);
        z-index: 2100;
        padding: 1.5rem;
      }

      .demo-success-overlay.active {
        display: flex;
      }

      .demo-success-card {
        position: relative;
        width: min(480px, 100%);
        background: var(--gypsum-bg);
        border: 1px solid var(--gypsum-border-accent);
        border-radius: var(--gypsum-radius);
        padding: 2rem;
        text-align: center;
        box-shadow: 0 30px 100px rgba(247, 127, 0, 0.1);
      }

      .demo-success-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 1.25rem;
        border-radius: 50%;
        background: var(--gypsum-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
      }

      .demo-success-title {
        margin: 0 0 0.35rem 0;
        font-size: 1.375rem;
        font-family: 'Source Serif 4', serif;
        color: var(--gypsum-text);
      }

      .demo-success-subtitle {
        margin: 0 0 1.25rem 0;
        color: var(--gypsum-text-muted);
        font-size: 0.95rem;
      }

      .demo-ai-response {
        text-align: left;
        padding: 1rem;
        border-radius: var(--gypsum-radius);
        border: 1px solid var(--gypsum-border-accent);
        background: rgba(247, 127, 0, 0.05);
        margin-bottom: 1.25rem;
        min-height: 70px;
      }

      .demo-ai-response-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 0.6rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gypsum-primary);
        font-family: 'Source Serif 4', serif;
        font-weight: 600;
      }

      .demo-ai-response-label::before {
        content: '✦';
        font-size: 0.8rem;
      }

      .demo-ai-response-text {
        color: var(--gypsum-text-muted);
        line-height: 1.65;
        font-size: 0.95rem;
        font-family: 'Source Serif 4', serif;
      }

      .demo-ai-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background: var(--gypsum-primary);
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
        padding: 0.75rem 0;
      }

      .demo-ai-loading span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--gypsum-primary);
        animation: loadingDot 1.4s ease-in-out infinite;
      }

      .demo-ai-loading span:nth-child(2) { animation-delay: 0.2s; }
      .demo-ai-loading span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes loadingDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      .demo-success-close {
        padding: 0.75rem 1.5rem;
        border-radius: calc(var(--gypsum-radius) - 2px);
        border: 1px solid var(--gypsum-border);
        background: var(--gypsum-surface);
        color: var(--gypsum-text);
        cursor: pointer;
        font-family: 'Source Serif 4', serif;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .demo-success-close:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 640px) {
        .demo-grid {
          grid-template-columns: 1fr;
        }

        .demo-modal__card {
          padding: 1.5rem;
        }

        .demo-modal__title {
          font-size: 1.25rem;
        }
      }
    `;
    document.head.appendChild(style);

    const modalMarkup = `
      <div class="demo-modal" id="demo-modal" aria-hidden="true">
        <div class="demo-modal__card" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <button class="demo-modal__close" type="button" data-demo-close aria-label="Close demo form">×</button>
          <div class="demo-modal__header">
            <h2 class="demo-modal__title" id="demo-modal-title">Schedule a Demo</h2>
            <p class="demo-modal__subtitle">Share context about your platform and we'll set up a tailored walkthrough.</p>
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
