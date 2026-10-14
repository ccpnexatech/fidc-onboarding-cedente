import { randomUUID } from 'node:crypto';
import { IdentifierGenerator } from '../../domain/service/identifier-generator';

export class CryptoIdentifierGenerator implements IdentifierGenerator {
  next(): string {
    return randomUUID();
  }
}
