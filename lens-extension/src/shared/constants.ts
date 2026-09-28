/**
 * Shared constants for storage keys and CMP detection signatures
 */

export const STORAGE_KEYS = {
  CURRENT_SESSION: 'project_lens_current_session',
  SETTINGS: 'project_lens_settings',
  AUDIT_HISTORY: 'project_lens_history'
} as const;

export const GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Known CMP DOM selectors and heuristics
export const CMP_DETECTION_SELECTORS = [
  { name: 'OneTrust', selector: '#onetrust-consent-sdk, #onetrust-banner-sdk' },
  { name: 'Cookiebot', selector: '#CybotCookiebotDialog, #CookiebotWidget' },
  { name: 'Klaro', selector: '.klaro, #klaro' },
  { name: 'Didomi', selector: '#didomi-host, #didomi-notice' },
  { name: 'Complianz', selector: '.cmplz-cookiebanner' },
  { name: 'Axeptio', selector: '#axeptio_overlay' },
  { name: 'Usercentrics', selector: '#usercentrics-root' },
  { name: 'Generic CMP', selector: '[id*="cookie-banner"], [class*="cookie-banner"], [id*="consent-banner"], [class*="consent-banner"]' }
];

export const CONSENT_ACTION_BUTTON_KEYWORDS = {
  ACCEPT: ['aceitar', 'aceito', 'concordar', 'permitir', 'concordo', 'accept', 'agree', 'allow all', 'accept all'],
  REJECT: ['rejeitar', 'recusar', 'negar', 'rejeito', 'reject', 'refuse', 'decline', 'deny', 'reject all', 'only essential', 'essenciais'],
  PREFERENCES: ['preferencias', 'configurar', 'gerenciar', 'opcoes', 'preferences', 'customize', 'settings', 'manage options']
};
