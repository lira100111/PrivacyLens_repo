import { CMP_DETECTION_SELECTORS, CONSENT_ACTION_BUTTON_KEYWORDS } from '../shared/constants';
import { ConsentChoice, StorageEvidence } from '../shared/types';

console.log('[PrivacyLens Content Script] Loaded on:', window.location.href);

function dumpStorage(): StorageEvidence[] {
  const result: StorageEvidence[] = [];
  const now = new Date().toISOString();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        result.push({
          type: 'localStorage',
          key,
          sizeBytes: new Blob([val]).size,
          observedAt: now
        });
      }
    }
  } catch (err) {
    console.warn('[PrivacyLens] LocalStorage read blocked:', err);
  }

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const val = sessionStorage.getItem(key) || '';
        result.push({
          type: 'sessionStorage',
          key,
          sizeBytes: new Blob([val]).size,
          observedAt: now
        });
      }
    }
  } catch (err) {
    console.warn('[PrivacyLens] SessionStorage read blocked:', err);
  }

  return result;
}

function detectCMP(): string | null {
  for (const cmp of CMP_DETECTION_SELECTORS) {
    const el = document.querySelector(cmp.selector);
    if (el && (el as HTMLElement).offsetParent !== null) {
      return cmp.name;
    }
  }
  return null;
}

function classifyButtonAction(text: string): ConsentChoice {
  const clean = text.toLowerCase().trim();

  for (const keyword of CONSENT_ACTION_BUTTON_KEYWORDS.REJECT) {
    if (clean.includes(keyword)) return 'REJECTED_ALL';
  }
  for (const keyword of CONSENT_ACTION_BUTTON_KEYWORDS.ACCEPT) {
    if (clean.includes(keyword)) return 'ACCEPTED_ALL';
  }
  for (const keyword of CONSENT_ACTION_BUTTON_KEYWORDS.PREFERENCES) {
    if (clean.includes(keyword)) return 'CUSTOMIZED';
  }

  return 'UNKNOWN';
}

// Initial storage dump sent to background
setTimeout(() => {
  const storage = dumpStorage();
  chrome.runtime.sendMessage({
    type: 'CONTENT_STORAGE_DUMP',
    storage
  }).catch(() => {});

  const detectedCmp = detectCMP();
  if (detectedCmp) {
    chrome.runtime.sendMessage({
      type: 'CONTENT_CONSENT_EVENT',
      event: {
        timestamp: new Date().toISOString(),
        cmpName: detectedCmp,
        actionTaken: 'BANNER_DETECTED',
        details: `Banner detectado via seletor para CMP: ${detectedCmp}`
      }
    }).catch(() => {});
  }
}, 1500);

// Global click listener to detect user interaction with consent banners
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const clickable = target.closest('button, a, [role="button"]') as HTMLElement | null;
  if (!clickable) return;

  const text = (clickable.innerText || clickable.textContent || clickable.getAttribute('aria-label') || '').trim();
  if (!text) return;

  const action = classifyButtonAction(text);
  if (action !== 'UNKNOWN') {
    const cmpName = detectCMP() || 'Detectado por heurística de clique';
    chrome.runtime.sendMessage({
      type: 'CONTENT_CONSENT_EVENT',
      event: {
        timestamp: new Date().toISOString(),
        cmpName,
        actionTaken: action,
        details: `Ação detectada no botão: "${text}"`
      }
    }).catch(() => {});

    // Re-check storage shortly after click
    setTimeout(() => {
      const storage = dumpStorage();
      chrome.runtime.sendMessage({
        type: 'CONTENT_STORAGE_DUMP',
        storage
      }).catch(() => {});
    }, 1000);
  }
}, { capture: true });
