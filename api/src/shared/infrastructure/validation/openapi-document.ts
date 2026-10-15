import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';

export const OPENAPI_PATH = join(__dirname, '..', '..', '..', '..', 'openapi.yaml');

export function loadOpenApiDocument(): Record<string, unknown> {
  return load(readFileSync(OPENAPI_PATH, 'utf8')) as Record<string, unknown>;
}
