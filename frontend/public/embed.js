/**
 * Embed script for Customer Success FTE Widget
 * 
 * This script creates a floating support button and modal form
 * that can be embedded on any website.
 * 
 * Usage:
 * <script
 *   src="https://your-domain.com/embed.js"
 *   data-api-url="https://your-domain.com/api"
 *   data-position="bottom-right"
 *   data-theme="auto"
 *   async
 * ></script>
 */

(function () {
  // Configuration from data attributes
  const script = document.currentScript || document.querySelector('script[src*="embed.js"]');
  const config = {
    apiUrl: script?.getAttribute('data-api-url') || '/api',
    position: script?.getAttribute('data-position') || 'bottom-right',
    theme: script?.getAttribute('data-theme') || 'auto',
    accentColor: script?.getAttribute('data-accent-color') || '#2563eb',
  };

  // Global configuration support
  window.SupportWidget = window.SupportWidget || {
    config: {},
    onOpen: () => {},
    onClose: () => {},
    onSubmit: (ticketId) => {},
  };

  // Merge configurations
  const finalConfig = { ...config, ...window.SupportWidget.config };

  // Create widget container
  const container = document.createElement('div');
  container.id = 'support-widget-container';
  container.style.cssText = `
    position: fixed;
    ${finalConfig.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
    bottom: 24px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create floating button
  const button = document.createElement('button');
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `;
  button.style.cssText = `
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: ${finalConfig.accentColor};
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
  button.setAttribute('aria-label', 'Open support form');

  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  });

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999998;
    backdrop-filter: blur(4px);
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 999999;
    padding: 24px;
  `;

  // Modal content (simple form for demo)
  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">Contact Support</h2>
      <button id="support-widget-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <p style="color: #666; margin-bottom: 24px;">Fill out the form below and our AI-powered support team will get back to you shortly.</p>
    <div id="support-widget-form">
      <p style="text-align: center; color: #666; padding: 40px 20px;">
        Form component would be loaded here from React app.<br><br>
        <strong>For production:</strong> This embed script would mount the React SupportForm component.<br>
        <strong>Current setup:</strong> Use the form directly at http://localhost:3000
      </p>
    </div>
  `;

  // State
  let isOpen = false;

  // Toggle modal
  function toggleModal() {
    isOpen = !isOpen;
    
    if (isOpen) {
      overlay.style.display = 'block';
      modal.style.display = 'block';
      button.style.display = 'none';
      finalConfig.onOpen?.();
    } else {
      overlay.style.display = 'none';
      modal.style.display = 'none';
      button.style.display = 'flex';
      finalConfig.onClose?.();
    }
  }

  // Event listeners
  button.addEventListener('click', toggleModal);
  overlay.addEventListener('click', toggleModal);
  document.getElementById('support-widget-close')?.addEventListener('click', toggleModal);

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleModal();
    }
  });

  // Add to DOM
  container.appendChild(button);
  document.body.appendChild(container);
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Log initialization
  console.log('[SupportWidget] Initialized with config:', finalConfig);
})();
