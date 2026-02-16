import { createHash } from 'crypto';

export interface EvidenceRecord {
  id: string;
  source: string;
  capturedAt: string;
  payload: unknown;
  payloadHash: string;
  previousHash?: string;
  chainHash: string;
}

export interface EvidenceBatchSeal {
  count: number;
  rootHash: string;
  generatedAt: string;
}

export function canonicalizeForHash(value: unknown): string {
  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map((item) => normalize(item));
    }

    if (input && typeof input === 'object') {
      const sortedEntries = Object.entries(input as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalize(item)]);
      return Object.fromEntries(sortedEntries);
    }

    return input;
  };

  return JSON.stringify(normalize(value));
}

export function hashEvidencePayload(payload: unknown): string {
  return createHash('sha256').update(canonicalizeForHash(payload)).digest('hex');
}

export function createEvidenceRecord(input: {
  id: string;
  source: string;
  payload: unknown;
  capturedAt?: string;
  previousHash?: string;
}): EvidenceRecord {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const payloadHash = hashEvidencePayload(input.payload);
  const chainBase = `${input.id}:${input.source}:${capturedAt}:${payloadHash}:${input.previousHash ?? ''}`;
  const chainHash = createHash('sha256').update(chainBase).digest('hex');

  return {
    id: input.id,
    source: input.source,
    capturedAt,
    payload: input.payload,
    payloadHash,
    previousHash: input.previousHash,
    chainHash,
  };
}

export function verifyEvidenceRecord(
  record: EvidenceRecord,
): { valid: true } | { valid: false; reason: string } {
  const expectedPayloadHash = hashEvidencePayload(record.payload);
  if (expectedPayloadHash !== record.payloadHash) {
    return { valid: false, reason: 'Payload hash mismatch' };
  }

  const chainBase = `${record.id}:${record.source}:${record.capturedAt}:${record.payloadHash}:${record.previousHash ?? ''}`;
  const expectedChainHash = createHash('sha256').update(chainBase).digest('hex');
  if (expectedChainHash !== record.chainHash) {
    return { valid: false, reason: 'Chain hash mismatch' };
  }

  return { valid: true };
}

export function sealEvidenceBatch(records: EvidenceRecord[]): EvidenceBatchSeal {
  const leafHashes = records.map((record) => record.chainHash).sort();
  const rootHash = createHash('sha256').update(leafHashes.join(':')).digest('hex');

  return {
    count: records.length,
    rootHash,
    generatedAt: new Date().toISOString(),
  };
}
