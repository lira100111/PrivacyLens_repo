/**
 * Canonical JSON serialization and Web Crypto SHA-256 implementation
 * for deterministic evidence hashing and cryptographic chain integrity.
 */

import { EvidenceEvent } from './types';

/**
 * Deterministically sorts object keys recursively for canonical representation.
 */
export function canonicalStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return `${JSON.stringify(key)}:${canonicalStringify(val)}`;
  });

  return `{${pairs.join(',')}}`;
}

/**
 * Computes SHA-256 hash using the native Web Crypto API (SubtleCrypto)
 * Works in modern browsers, Service Workers, and Content Scripts.
 */
export async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates hash for an evidence event:
 * Hash = SHA-256(canonical(EventFieldsExcludingHash) + previousHash)
 */
export async function calculateEventHash(
  eventWithoutHash: Omit<EvidenceEvent, 'hash'>
): Promise<string> {
  const canonicalData = canonicalStringify({
    id: eventWithoutHash.id,
    auditSessionId: eventWithoutHash.auditSessionId,
    siteUrl: eventWithoutHash.siteUrl,
    timestamp: eventWithoutHash.timestamp,
    eventType: eventWithoutHash.eventType,
    consentState: eventWithoutHash.consentState,
    data: eventWithoutHash.data,
    previousHash: eventWithoutHash.previousHash
  });

  return computeSha256(`${canonicalData}:${eventWithoutHash.previousHash}`);
}

/**
 * Verifies the integrity of an entire evidence chain.
 * Returns { isValid: true } or { isValid: false, brokenAtIndex: number }
 */
export async function verifyEvidenceChain(
  chain: EvidenceEvent[]
): Promise<{ isValid: boolean; brokenAtIndex?: number }> {
  let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < chain.length; i++) {
    const event = chain[i];

    if (event.previousHash !== expectedPrevHash) {
      return { isValid: false, brokenAtIndex: i };
    }

    const computedHash = await calculateEventHash({
      id: event.id,
      auditSessionId: event.auditSessionId,
      siteUrl: event.siteUrl,
      timestamp: event.timestamp,
      eventType: event.eventType,
      consentState: event.consentState,
      data: event.data,
      previousHash: event.previousHash
    });

    if (computedHash !== event.hash) {
      return { isValid: false, brokenAtIndex: i };
    }

    expectedPrevHash = event.hash;
  }

  return { isValid: true };
}
