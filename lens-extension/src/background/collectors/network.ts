import { NetworkEvidence, SecurityHeadersEvidence } from '../../shared/types';
import { evidenceManager } from '../evidence-manager';

export class NetworkCollector {
  private isListening = false;
  private targetTabId: number | null = null;
  private targetDomain = '';

  private handleHeadersReceived = (
    details: chrome.webRequest.OnHeadersReceivedDetails
  ): undefined => {
    (async () => {
    if (this.targetTabId !== null && details.tabId !== this.targetTabId) {
      return;
    }

    const session = evidenceManager.getSession();
    if (!session || session.status !== 'RECORDING') return;

    try {
      const requestUrl = new URL(details.url);
      const isThirdParty = !requestUrl.hostname.includes(this.targetDomain) && 
                           !this.targetDomain.includes(requestUrl.hostname);

      const netEvidence: NetworkEvidence = {
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        domain: requestUrl.hostname,
        isThirdParty,
        initiator: details.initiator,
        timestamp: new Date().toISOString(),
        statusCode: details.statusCode
      };

      session.networkRequests.push(netEvidence);

      // If third-party, record evidence event
      if (isThirdParty) {
        await evidenceManager.appendEvidence('THIRD_PARTY_REQUEST', {
          domain: requestUrl.hostname,
          url: details.url,
          method: details.method,
          statusCode: details.statusCode,
          type: details.type
        });
      }

      // Check security headers for main frame document response
      if (details.type === 'main_frame' && details.responseHeaders) {
        const headers: Record<string, string> = {};
        for (const h of details.responseHeaders) {
          if (h.name && h.value) {
            headers[h.name.toLowerCase()] = h.value;
          }
        }

        const warnings: string[] = [];
        if (!headers['content-security-policy']) {
          warnings.push('Content-Security-Policy (CSP) não configurado na resposta principal.');
        }
        if (!headers['strict-transport-security']) {
          warnings.push('Strict-Transport-Security (HSTS) não detectado.');
        }
        if (!headers['x-content-type-options']) {
          warnings.push('X-Content-Type-Options: nosniff ausente.');
        }
        if (!headers['referrer-policy']) {
          warnings.push('Referrer-Policy explícito não configurado.');
        }

        const secEvidence: SecurityHeadersEvidence = {
          url: details.url,
          timestamp: new Date().toISOString(),
          headers: {
            csp: headers['content-security-policy'],
            hsts: headers['strict-transport-security'],
            xContentTypeOptions: headers['x-content-type-options'],
            referrerPolicy: headers['referrer-policy'],
            permissionsPolicy: headers['permissions-policy']
          },
          warnings
        };

        session.securityHeaders = secEvidence;

        await evidenceManager.appendEvidence('SECURITY_HEADER_CHECK', {
          url: details.url,
          headers: secEvidence.headers,
          warnings
        });
      }
    } catch (err) {
      console.error('[NetworkCollector] Header processing error:', err);
    }
    })();
    return undefined;
  };

  start(tabId: number, domain: string): void {
    this.targetTabId = tabId;
    this.targetDomain = domain;

    if (!this.isListening && chrome.webRequest && chrome.webRequest.onHeadersReceived) {
      chrome.webRequest.onHeadersReceived.addListener(
        this.handleHeadersReceived,
        { urls: ['<all_urls>'] },
        ['responseHeaders']
      );
      this.isListening = true;
    }
  }

  stop(): void {
    if (this.isListening && chrome.webRequest && chrome.webRequest.onHeadersReceived) {
      chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived);
      this.isListening = false;
    }
    this.targetTabId = null;
    this.targetDomain = '';
  }
}

export const networkCollector = new NetworkCollector();
