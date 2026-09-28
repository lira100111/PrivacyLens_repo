import { CookieEvidence } from '../../shared/types';
import { evidenceManager } from '../evidence-manager';

export class CookieCollector {
  private isListening = false;
  private targetDomain = '';

  private handleCookieChange = async (changeInfo: chrome.cookies.CookieChangeInfo) => {
    const session = evidenceManager.getSession();
    if (!session || session.status !== 'RECORDING') return;

    const cookie = changeInfo.cookie;
    // Check if the cookie domain matches or is related to our audited target domain
    if (!cookie.domain.includes(this.targetDomain) && !this.targetDomain.includes(cookie.domain.replace(/^\./, ''))) {
      return;
    }

    const cookieKey = `${cookie.domain}:${cookie.name}:${cookie.path}`;
    const evidence: CookieEvidence = {
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      session: cookie.session,
      expirationDate: cookie.expirationDate,
      firstObservedAt: new Date().toISOString(),
      sourceContext: session.currentConsentState === 'UNKNOWN' ? 'before_consent' : 'after_consent'
    };

    session.cookies[cookieKey] = evidence;

    await evidenceManager.appendEvidence(
      changeInfo.removed ? 'COOKIE_MODIFIED' : 'COOKIE_DETECTED',
      {
        action: changeInfo.removed ? 'REMOVED' : changeInfo.cause,
        cookieName: cookie.name,
        domain: cookie.domain,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
        context: evidence.sourceContext
      }
    );
  };

  async start(domain: string, url: string): Promise<void> {
    this.targetDomain = domain;

    if (!this.isListening) {
      chrome.cookies.onChanged.addListener(this.handleCookieChange);
      this.isListening = true;
    }

    // Initial snapshot of cookies
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      const session = evidenceManager.getSession();
      if (!session) return;

      for (const c of cookies) {
        const key = `${c.domain}:${c.name}:${c.path}`;
        session.cookies[key] = {
          name: c.name,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          session: c.session,
          expirationDate: c.expirationDate,
          firstObservedAt: new Date().toISOString(),
          sourceContext: 'before_consent'
        };
      }

      await evidenceManager.appendEvidence('COOKIE_DETECTED', {
        type: 'INITIAL_SNAPSHOT',
        url,
        totalCookiesFound: cookies.length,
        names: cookies.map((c) => c.name)
      });
    } catch (err) {
      console.error('[CookieCollector] Error taking initial cookie snapshot:', err);
    }
  }

  stop(): void {
    if (this.isListening) {
      chrome.cookies.onChanged.removeListener(this.handleCookieChange);
      this.isListening = false;
    }
    this.targetDomain = '';
  }
}

export const cookieCollector = new CookieCollector();
