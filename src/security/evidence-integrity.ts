import * as crypto from 'crypto';

export function sealEvidence(payload: any): any {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return { ...payload, hash };
}