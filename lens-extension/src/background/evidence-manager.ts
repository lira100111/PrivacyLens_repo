import { AuditSession, EvidenceEvent, EvidenceType, ConsentChoice } from '../shared/types';
import { calculateEventHash } from '../shared/crypto';
import { STORAGE_KEYS, GENESIS_PREVIOUS_HASH } from '../shared/constants';

export class EvidenceManager {
  private currentSession: AuditSession | null = null;

  async loadSession(): Promise<AuditSession | null> {
    const data = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_SESSION);
    this.currentSession = (data[STORAGE_KEYS.CURRENT_SESSION] as AuditSession) || null;
    return this.currentSession;
  }

  getSession(): AuditSession | null {
    return this.currentSession;
  }

  async setSession(session: AuditSession | null): Promise<void> {
    this.currentSession = session;
    if (session) {
      await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_SESSION]: session });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.CURRENT_SESSION);
    }
    this.broadcastSessionUpdate();
  }

  async appendEvidence(
    eventType: EvidenceType,
    data: Record<string, unknown>,
    consentState?: ConsentChoice
  ): Promise<EvidenceEvent | null> {
    if (!this.currentSession || this.currentSession.status !== 'RECORDING') {
      return null;
    }

    const previousEvents = this.currentSession.evidenceEvents;
    const previousHash = previousEvents.length > 0 
      ? previousEvents[previousEvents.length - 1].hash 
      : GENESIS_PREVIOUS_HASH;

    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();
    const effectiveConsentState = consentState || this.currentSession.currentConsentState;

    const eventWithoutHash = {
      id: eventId,
      auditSessionId: this.currentSession.id,
      siteUrl: this.currentSession.targetUrl,
      timestamp,
      eventType,
      consentState: effectiveConsentState,
      data,
      previousHash
    };

    const hash = await calculateEventHash(eventWithoutHash);

    const fullEvent: EvidenceEvent = {
      ...eventWithoutHash,
      hash
    };

    this.currentSession.evidenceEvents.push(fullEvent);
    await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_SESSION]: this.currentSession });
    this.broadcastSessionUpdate();

    return fullEvent;
  }

  private broadcastSessionUpdate(): void {
    chrome.runtime.sendMessage({
      type: 'SESSION_UPDATED',
      session: this.currentSession
    }).catch(() => {
      // Ignored if no popup or sidepanel is currently open listening to messages
    });
  }
}

export const evidenceManager = new EvidenceManager();
