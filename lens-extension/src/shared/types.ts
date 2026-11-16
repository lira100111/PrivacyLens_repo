/**
 * Core types for Privacylens Audit Extension
 */

export type AuditStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'COMPLETED';

export type ConsentChoice = 'UNKNOWN' | 'ACCEPTED_ALL' | 'REJECTED_ALL' | 'CUSTOMIZED' | 'BANNER_DETECTED';

export interface CookieEvidence {
  name: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'no_restriction' | 'lax' | 'strict' | 'unspecified';
  session: boolean;
  expirationDate?: number;
  firstObservedAt: string;
  sourceContext: 'before_consent' | 'after_consent' | 'unknown';
}

export interface StorageEvidence {
  type: 'localStorage' | 'sessionStorage';
  key: string;
  sizeBytes: number;
  observedAt: string;
}

export interface NetworkEvidence {
  requestId: string;
  url: string;
  method: string;
  domain: string;
  isThirdParty: boolean;
  initiator?: string;
  timestamp: string;
  statusCode?: number;
}

export interface SecurityHeadersEvidence {
  url: string;
  timestamp: string;
  headers: {
    csp?: string;
    hsts?: string;
    xContentTypeOptions?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
  };
  warnings: string[];
}

export interface ConsentEvidence {
  timestamp: string;
  cmpName?: string;
  actionTaken: ConsentChoice;
  details?: string;
}

export type EvidenceType = 
  | 'AUDIT_STARTED'
  | 'AUDIT_STOPPED'
  | 'COOKIE_DETECTED'
  | 'COOKIE_MODIFIED'
  | 'STORAGE_RECORDED'
  | 'THIRD_PARTY_REQUEST'
  | 'CONSENT_ACTION'
  | 'SECURITY_HEADER_CHECK';

export interface EvidenceEvent {
  id: string;
  auditSessionId: string;
  siteUrl: string;
  timestamp: string;
  eventType: EvidenceType;
  consentState: ConsentChoice;
  data: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

export interface AuditSession {
  id: string;
  targetUrl: string;
  targetDomain: string;
  startedAt: string;
  endedAt?: string;
  status: AuditStatus;
  currentConsentState: ConsentChoice;
  cookies: Record<string, CookieEvidence>;
  storageItems: StorageEvidence[];
  networkRequests: NetworkEvidence[];
  securityHeaders?: SecurityHeadersEvidence;
  consentEvents: ConsentEvidence[];
  evidenceEvents: EvidenceEvent[];
}

// IPC Message Contracts between Content Script, React UI, and Background Service Worker
export type IPCMessage =
  | { type: 'START_AUDIT'; targetUrl: string; tabId: number }
  | { type: 'STOP_AUDIT' }
  | { type: 'GET_SESSION' }
  | { type: 'SESSION_UPDATED'; session: AuditSession | null }
  | { type: 'CONTENT_CONSENT_EVENT'; event: ConsentEvidence }
  | { type: 'CONTENT_STORAGE_DUMP'; storage: StorageEvidence[] }
  | { type: 'VERIFY_CHAIN_INTEGRITY' }
  | { type: 'CHAIN_VERIFICATION_RESULT'; isValid: boolean; brokenAtIndex?: number };
