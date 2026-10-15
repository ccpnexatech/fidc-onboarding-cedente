export interface RequestFingerprint {
  of(payload: unknown): string;
}
