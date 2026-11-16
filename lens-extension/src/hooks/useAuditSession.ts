import { useState, useEffect, useCallback } from 'react';
import { AuditSession, IPCMessage } from '../shared/types';
import { STORAGE_KEYS } from '../shared/constants';

export function useAuditSession() {
  const [session, setSession] = useState<AuditSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chainStatus, setChainStatus] = useState<{ isValid: boolean; brokenAtIndex?: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Initial load from storage and background
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEYS.CURRENT_SESSION, (data) => {
      if (data[STORAGE_KEYS.CURRENT_SESSION]) {
        setSession(data[STORAGE_KEYS.CURRENT_SESSION] as AuditSession);
      }
      setIsLoading(false);
    });

    const handleMessage = (msg: IPCMessage) => {
      if (msg.type === 'SESSION_UPDATED') {
        setSession(msg.session);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const startAudit = useCallback(async () => {
    setIsLoading(true);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url) {
      alert('Nenhuma aba ativa identificada para iniciar a auditoria.');
      setIsLoading(false);
      return;
    }

    chrome.runtime.sendMessage(
      { type: 'START_AUDIT', targetUrl: tab.url, tabId: tab.id },
      (response) => {
        if (response?.session) {
          setSession(response.session);
        }
        setIsLoading(false);
      }
    );
  }, []);

  const stopAudit = useCallback(async () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({ type: 'STOP_AUDIT' }, (response) => {
      if (response?.session) {
        setSession(response.session);
      }
      setIsLoading(false);
    });
  }, []);

  const verifyChain = useCallback(async () => {
    setIsVerifying(true);
    chrome.runtime.sendMessage({ type: 'VERIFY_CHAIN_INTEGRITY' }, (result) => {
      setChainStatus(result);
      setIsVerifying(false);
    });
  }, []);

  const exportReport = useCallback(() => {
    if (!session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacylens-audit-${session.targetDomain || 'report'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [session]);

  return {
    session,
    isLoading,
    isVerifying,
    chainStatus,
    startAudit,
    stopAudit,
    verifyChain,
    exportReport
  };
}
