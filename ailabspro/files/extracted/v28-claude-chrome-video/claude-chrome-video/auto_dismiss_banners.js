/**
 * Auto Cookie Banner Dismisser for Claude in Chrome
 * Run this JavaScript snippet to automatically dismiss cookie banners
 * Usage: Execute via mcp__claude-in-chrome__javascript_tool
 */

(function() {
  'use strict';

  const SELECTORS = [
    // Button text patterns (common accept/dismiss buttons)
    'button:is([class*="accept"], [id*="accept"], [aria-label*="accept"])',
    'button:is([class*="agree"], [id*="agree"], [aria-label*="agree"])',
    'button:is([class*="consent"], [id*="consent"])',
    'button:is([class*="allow"], [id*="allow"])',
    'button:is([class*="dismiss"], [id*="dismiss"])',
    'a:is([class*="accept"], [id*="accept"])',
    'a:is([class*="agree"], [id*="agree"])',

    // Specific consent platforms
    '#onetrust-accept-btn-handler',
    '.onetrust-close-btn-handler',
    '#truste-consent-button',
    '.trustarc-agree-btn',
    '.cc-dismiss',
    '.cc-allow',
    '#CybotCookiebotDialogBodyButtonAccept',
    '.qc-cmp-button[mode="primary"]',
    '[data-testid*="cookie"][data-testid*="accept"]',
    '[data-testid*="cookie"][data-testid*="banner-accept"]',

    // Generic patterns
    '[class*="cookie"] button:first-of-type',
    '[id*="cookie-banner"] button',
    '[class*="consent-banner"] button',
    '[role="dialog"] button[class*="accept"]',
    '[role="dialog"] button[class*="agree"]',

    // Close buttons for modals/popups
    'button[aria-label*="close"][class*="modal"]',
    'button[aria-label*="close"][class*="popup"]',
    '[class*="modal"] [class*="close"]',
    '[class*="popup"] [class*="close"]',
  ];

  let dismissed = 0;

  // Function to click element safely
  function clickElement(element) {
    try {
      // Check if element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      // Try normal click first
      element.click();
      return true;
    } catch (e) {
      // Try programmatic click
      try {
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        element.dispatchEvent(event);
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  // First, try direct text matching on ALL buttons (most reliable)
  const allButtons = document.querySelectorAll('button, a[role="button"], [role="button"]');
  for (const btn of allButtons) {
    const text = btn.textContent.trim().toLowerCase();
    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();

    // Check if already hidden
    const computed = window.getComputedStyle(btn);
    if (computed.display === 'none' || computed.visibility === 'hidden') continue;

    // Match common accept phrases
    if (text.match(/^(yes,?\s*i\s*accept|accept\s*all|accept\s*cookies|i\s*agree|agree\s*and\s*close|allow\s*all)$/i) ||
        ariaLabel.match(/accept|agree|allow/i)) {
      if (clickElement(btn)) {
        dismissed++;
        console.log('✓ Dismissed via text match:', text);
        break;
      }
    }
  }

  // If text matching didn't work, try selectors
  if (dismissed === 0) {
    for (const selector of SELECTORS) {
      try {
        const elements = document.querySelectorAll(selector);

        for (const element of elements) {
          const computed = window.getComputedStyle(element);
          if (computed.display === 'none' || computed.visibility === 'hidden') {
            continue;
          }

          const text = element.textContent.trim().toLowerCase();
          if (text.length > 0 && text.length < 200) {
            const hasRelevantText =
              text.includes('accept') ||
              text.includes('agree') ||
              text.includes('allow') ||
              text.includes('consent') ||
              text.includes('ok') ||
              text.includes('dismiss') ||
              text.includes('close') ||
              text.includes('continue') ||
              element.getAttribute('aria-label')?.toLowerCase().includes('close');

            if (hasRelevantText && clickElement(element)) {
              dismissed++;
              console.log('✓ Dismissed banner:', selector);
              break;
            }
          }
        }
        if (dismissed > 0) break;
      } catch (e) {
        continue;
      }
    }
  }

  // Also try to remove common banner containers if clicking didn't work
  const bannerContainers = [
    '[id*="cookie-banner"]',
    '[class*="cookie-banner"]',
    '[id*="consent-banner"]',
    '[class*="consent-banner"]',
    '[class*="cookie-notice"]',
    '[id*="cookie-notice"]',
  ];

  for (const selector of bannerContainers) {
    try {
      const containers = document.querySelectorAll(selector);
      for (const container of containers) {
        if (container.offsetParent !== null) { // Is visible
          container.style.display = 'none';
          dismissed++;
          console.log('✓ Hid banner container:', selector);
        }
      }
    } catch (e) {
      continue;
    }
  }

  return {
    dismissed: dismissed,
    message: dismissed > 0
      ? `✅ Dismissed ${dismissed} banner(s)`
      : 'ℹ️  No banners found',
    timestamp: new Date().toISOString()
  };
})();
