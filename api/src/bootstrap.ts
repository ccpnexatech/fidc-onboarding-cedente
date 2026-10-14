import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './shared/infrastructure/http/problem-details.filter';
import { loadOpenApiDocument, OPENAPI_PATH } from './shared/infrastructure/validation/openapi-document';

const STATUS_BY_DOMAIN_CODE = new Map<string, number>([
  ['BATCH_NOT_FOUND', 404],
  ['IDEMPOTENCY_KEY_CONFLICT', 409],
]);

export async function createApplication(): Promise<INestApplication> {
  const application = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ['error', 'warn'] });
  application.useGlobalFilters(new ProblemDetailsFilter(STATUS_BY_DOMAIN_CODE));
  application.use('/docs', swaggerUi.serve, swaggerUi.setup(loadOpenApiDocument()));
  application.use('/openapi.yaml', (_request: Request, response: Response) => {
    response.type('application/yaml').send(readFileSync(OPENAPI_PATH, 'utf8'));
  });
  return application;
}
