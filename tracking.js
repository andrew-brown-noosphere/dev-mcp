/**
 * DevExp.ai Site Telemetry - Comprehensive tracking
 * Add to pages: <script src="/tracking.js" data-org="devmcp"></script>
 */
(function() {
  // Skip tracking for internal/API paths
  const EXCLUDED_PATHS = ['/api/', '/telemetry', '/.well-known/'];
  if (EXCLUDED_PATHS.some(p => location.pathname.includes(p))) return;

  const script = document.currentScript;
  const ORG_ID = script?.getAttribute('data-org') || 'unknown';
  const API_URL = '/api/telemetry';

  let sessionId = sessionStorage.getItem('v_sid');
  let visitorId = sessionStorage.getItem('v_vid');
  let eventQueue = [];
  let pageLoadTime = Date.now();
  let maxScroll = 0;
  let engagementTime = 0;
  let lastActivity = Date.now();
  let isVisible = true;

  // Generate simple fingerprint
  function fingerprint() {
    const s = [navigator.userAgent, navigator.language, screen.width + 'x' + screen.height].join('|');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
    return Math.abs(h).toString(36);
  }

  // Get all UTM params
  function getUtm() {
    const p = new URLSearchParams(location.search);
    return {
      utm_source: p.get('utm_source'),
      utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
      utm_content: p.get('utm_content'),
      utm_term: p.get('utm_term'),
    };
  }

  // Get device/browser details
  function getDeviceInfo() {
    return {
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_pixel_ratio: window.devicePixelRatio || 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages?.join(','),
      platform: navigator.platform,
      connection_type: navigator.connection?.effectiveType || 'unknown',
      cookie_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack === '1',
    };
  }

  // Queue event
  function track(type, name, data = {}) {
    eventQueue.push({
      event_type: type,
      event_name: name,
      page_url: location.href,
      page_path: location.pathname,
      page_title: document.title,
      time_on_page: Math.floor((Date.now() - pageLoadTime) / 1000),
      engagement_time: Math.floor(engagementTime / 1000),
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Flush events to API
  function flush(beacon = false) {
    if (!eventQueue.length) return;

    const payload = {
      org_id: ORG_ID,
      fingerprint: fingerprint(),
      session_id: sessionId,
      events: eventQueue.splice(0, 50),
      landing_page: sessionStorage.getItem('v_lp') || location.pathname,
      referrer: document.referrer,
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      device_info: getDeviceInfo(),
      ...getUtm()
    };

    if (!sessionStorage.getItem('v_lp')) {
      sessionStorage.setItem('v_lp', location.pathname);
    }

    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(API_URL, JSON.stringify(payload));
    } else {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json()).then(data => {
        if (data.session_id) {
          sessionId = data.session_id;
          sessionStorage.setItem('v_sid', data.session_id);
        }
        if (data.visitor_id) {
          visitorId = data.visitor_id;
          sessionStorage.setItem('v_vid', data.visitor_id);
        }
      }).catch(() => {});
    }
  }

  // Track page view with full context
  track('page_view', 'page_view', {
    event_category: 'navigation',
    properties: {
      referrer: document.referrer,
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      ...getDeviceInfo(),
      ...getUtm()
    }
  });

  // Track engagement time (only when tab is visible and user is active)
  let engagementInterval = setInterval(() => {
    if (isVisible && (Date.now() - lastActivity < 30000)) {
      engagementTime += 1000;
    }
  }, 1000);

  // Track visibility changes
  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
    if (!isVisible) {
      track('engagement', 'tab_hidden', {
        event_category: 'engagement',
        properties: { engagement_time: Math.floor(engagementTime / 1000) }
      });
      flush(true);
    } else {
      track('engagement', 'tab_visible', { event_category: 'engagement' });
    }
  });

  // Track scroll depth with milestones
  let scrollTick = false;
  let scrollMilestones = new Set();
  window.addEventListener('scroll', () => {
    lastActivity = Date.now();
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const depth = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (depth > maxScroll) {
        maxScroll = depth;
        // Track at 25%, 50%, 75%, 90%, 100%
        [0.25, 0.5, 0.75, 0.9, 1.0].forEach(milestone => {
          if (depth >= milestone && !scrollMilestones.has(milestone)) {
            scrollMilestones.add(milestone);
            track('scroll', 'scroll_' + Math.floor(milestone * 100), {
              scroll_depth: depth,
              event_category: 'engagement'
            });
          }
        });
      }
      scrollTick = false;
    });
  }, { passive: true });

  // Track all clicks with context
  document.addEventListener('click', (e) => {
    lastActivity = Date.now();
    const el = e.target.closest('a, button, [data-track], input[type="submit"]');
    if (el) {
      const isExternal = el.href && new URL(el.href, location.origin).origin !== location.origin;
      track('click', el.getAttribute('data-track') || el.textContent?.trim().slice(0, 50) || 'click', {
        event_category: isExternal ? 'outbound' : 'engagement',
        element_text: el.textContent?.trim().slice(0, 100),
        element_id: el.id || undefined,
        element_class: el.className?.split?.(' ').slice(0, 3).join(' ') || undefined,
        element_tag: el.tagName.toLowerCase(),
        properties: {
          href: el.href || undefined,
          is_external: isExternal,
          target: el.target || undefined
        }
      });

      // Immediate flush for outbound links
      if (isExternal) flush(true);
    }
  }, { passive: true });

  // Track form interactions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    track('form', 'form_submit', {
      event_category: 'conversion',
      element_id: form.id || undefined,
      properties: {
        form_action: form.action,
        form_method: form.method,
        field_count: form.elements.length
      }
    });
    flush(true);
  }, { passive: true });

  // Track form field focus (first interaction)
  let formFieldsTracked = new Set();
  document.addEventListener('focus', (e) => {
    lastActivity = Date.now();
    if (e.target.matches('input, textarea, select')) {
      const fieldId = e.target.id || e.target.name || e.target.type;
      if (!formFieldsTracked.has(fieldId)) {
        formFieldsTracked.add(fieldId);
        track('form', 'field_focus', {
          event_category: 'engagement',
          element_id: e.target.id || undefined,
          properties: {
            field_name: e.target.name,
            field_type: e.target.type
          }
        });
      }
    }
  }, true);

  // Track copy events
  document.addEventListener('copy', () => {
    const selection = window.getSelection()?.toString().slice(0, 200);
    if (selection) {
      track('engagement', 'copy_text', {
        event_category: 'engagement',
        properties: { copied_text: selection }
      });
    }
  });

  // Track exit intent (mouse leaving viewport at top)
  let exitIntentTracked = false;
  document.addEventListener('mouseout', (e) => {
    if (!exitIntentTracked && e.clientY < 10 && e.relatedTarget === null) {
      exitIntentTracked = true;
      track('engagement', 'exit_intent', {
        event_category: 'engagement',
        properties: {
          time_on_page: Math.floor((Date.now() - pageLoadTime) / 1000),
          scroll_depth: maxScroll
        }
      });
    }
  });

  // Track errors
  window.addEventListener('error', (e) => {
    track('error', 'js_error', {
      event_category: 'error',
      properties: {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      }
    });
  });

  // Flush periodically
  setInterval(flush, 5000);

  // Flush on page hide with final stats
  window.addEventListener('beforeunload', () => {
    track('session', 'page_exit', {
      event_category: 'navigation',
      properties: {
        total_time: Math.floor((Date.now() - pageLoadTime) / 1000),
        engagement_time: Math.floor(engagementTime / 1000),
        max_scroll: maxScroll,
        scroll_milestones: [...scrollMilestones].map(m => Math.floor(m * 100))
      }
    });
    flush(true);
    clearInterval(engagementInterval);
  });

  // Initial flush
  setTimeout(flush, 1000);
})();
