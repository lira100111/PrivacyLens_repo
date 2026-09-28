import { AuditSession, IPCMessage } from '../shared/types';
import { verifyEvidenceChain } from '../shared/crypto';
import { evidenceManager } from './evidence-manager';
import { cookieCollector } from './collectors/cookies';
import { networkCollector } from './collectors/network';

console.log('[ProjectLens Service Worker] Initialized.');

// Initialize side panel behavior so clicking the extension action icon opens the side panel
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.warn('[ProjectLens] Could not set side panel behavior:', error);
  });
}

// Restore session from storage on wake up
evidenceManager.loadSession().then((session) => {
  if (session && session.status === 'RECORDING') {
    // Resume collectors if service worker restarted mid-session
    try {
      const url = new URL(session.targetUrl);
      cookieCollector.start(url.hostname, session.targetUrl);
    } catch {
      // url parsing fallback
    }
  }
});

// IPC Message handling
chrome.runtime.onMessage.addListener((message: IPCMessage, _sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'START_AUDIT': {
        const { targetUrl, tabId } = message;
        const urlObj = new URL(targetUrl);
        const domain = urlObj.hostname;

        const newSession: AuditSession = {
          id: `session_${Date.now()}`,
          targetUrl,
          targetDomain: domain,
          startedAt: new Date().toISOString(),
          status: 'RECORDING',
          currentConsentState: 'UNKNOWN',
          cookies: {},
          storageItems: [],
          networkRequests: [],
          consentEvents: [],
          evidenceEvents: []
        };

        await evidenceManager.setSession(newSession);
        await evidenceManager.appendEvidence('AUDIT_STARTED', {
          targetUrl,
          domain,
          tabId,
          userAgent: navigator.userAgent
        });

        await cookieCollector.start(domain, targetUrl);
        networkCollector.start(tabId, domain);

        sendResponse({ success: true, session: evidenceManager.getSession() });
        break;
      }

      case 'STOP_AUDIT': {
        const session = evidenceManager.getSession();
        if (session) {
          session.status = 'COMPLETED';
          session.endedAt = new Date().toISOString();
          await evidenceManager.appendEvidence('AUDIT_STOPPED', {
            endedAt: session.endedAt,
            totalEvidenceEvents: session.evidenceEvents.length + 1
          });
          await evidenceManager.setSession(session);
        }

        cookieCollector.stop();
        networkCollector.stop();
        sendResponse({ success: true, session: evidenceManager.getSession() });
        break;
      }

      case 'GET_SESSION': {
        const session = evidenceManager.getSession() || await evidenceManager.loadSession();
        sendResponse({ session });
        break;
      }

      case 'CONTENT_CONSENT_EVENT': {
        const session = evidenceManager.getSession();
        if (session && session.status === 'RECORDING') {
          session.currentConsentState = message.event.actionTaken;
          session.consentEvents.push(message.event);

          await evidenceManager.appendEvidence(
            'CONSENT_ACTION',
            {
              cmpName: message.event.cmpName,
              action: message.event.actionTaken,
              details: message.event.details
            },
            message.event.actionTaken
          );
        }
        sendResponse({ success: true });
        break;
      }

      case 'CONTENT_STORAGE_DUMP': {
        const session = evidenceManager.getSession();
        if (session && session.status === 'RECORDING') {
          session.storageItems = message.storage;
          await evidenceManager.appendEvidence('STORAGE_RECORDED', {
            totalItems: message.storage.length,
            items: message.storage
          });
        }
        sendResponse({ success: true });
        break;
      }

      case 'VERIFY_CHAIN_INTEGRITY': {
        const session = evidenceManager.getSession();
        if (!session || session.evidenceEvents.length === 0) {
          sendResponse({ isValid: true, brokenAtIndex: undefined });
          return;
        }

        const verification = await verifyEvidenceChain(session.evidenceEvents);
        sendResponse(verification);
        break;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();

  // Return true to indicate asynchronous response
  return true;
});
