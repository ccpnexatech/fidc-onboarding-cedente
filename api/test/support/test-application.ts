import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApplication } from '../../src/bootstrap';

export async function startApplication(): Promise<INestApplication> {
  process.env.REFERENCE_DATE = '2026-10-14';
  const application = await createApplication();
  await application.init();
  return application;
}

export function postBatch(application: INestApplication, body: unknown, idempotencyKey: string) {
  return request(application.getHttpServer()).post('/remessas').set('Idempotency-Key', idempotencyKey).send(body as object);
}

export function getPath(application: INestApplication, path: string) {
  return request(application.getHttpServer()).get(path);
}
