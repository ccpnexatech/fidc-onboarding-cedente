import { createHash } from 'node:crypto';
import { RequestFingerprint } from '../../domain/service/request-fingerprint';

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export class Sha256RequestFingerprint implements RequestFingerprint {
  of(payload: unknown): string {
    return createHash('sha256').update(canonicalJson(payload)).digest('hex');
  }
}
