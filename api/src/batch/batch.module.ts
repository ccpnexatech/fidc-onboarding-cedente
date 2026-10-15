import { Module } from '@nestjs/common';
import { AssessBatchEligibilityUseCase } from '../eligibility/domain/use-case/assess-batch-eligibility.use-case';
import { RegisterAssignmentUseCase } from '../eligibility/domain/use-case/register-assignment.use-case';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { Clock } from '../shared/domain/clock';
import { CLOCK } from '../shared/shared.module';
import { BatchRepository } from './domain/repository/batch-repository';
import { IdempotencyRepository } from './domain/repository/idempotency-repository';
import { EligibilityGateway } from './domain/service/eligibility-gateway';
import { CreateBatchUseCase } from './domain/use-case/create-batch.use-case';
import { GetBatchUseCase } from './domain/use-case/get-batch.use-case';
import { ListBatchRejectionsUseCase } from './domain/use-case/list-batch-rejections.use-case';
import { BatchController } from './infrastructure/http/batch.controller';
import { MemoryBatchRepository } from './infrastructure/repository/memory-batch.repository';
import { MemoryIdempotencyRepository } from './infrastructure/repository/memory-idempotency.repository';
import { CryptoIdentifierGenerator } from './infrastructure/service/crypto-identifier-generator';
import { EligibilityModuleGateway } from './infrastructure/service/eligibility-module.gateway';
import { Sha256RequestFingerprint } from './infrastructure/service/sha256-request-fingerprint';

const BATCH_REPOSITORY = Symbol('BatchRepository');
const IDEMPOTENCY_REPOSITORY = Symbol('IdempotencyRepository');
const ELIGIBILITY_GATEWAY = Symbol('EligibilityGateway');

@Module({
  imports: [EligibilityModule],
  controllers: [BatchController],
  providers: [
    { provide: BATCH_REPOSITORY, useFactory: () => new MemoryBatchRepository() },
    { provide: IDEMPOTENCY_REPOSITORY, useFactory: () => new MemoryIdempotencyRepository() },
    {
      provide: ELIGIBILITY_GATEWAY,
      useFactory: (assess: AssessBatchEligibilityUseCase, register: RegisterAssignmentUseCase) =>
        new EligibilityModuleGateway(assess, register),
      inject: [AssessBatchEligibilityUseCase, RegisterAssignmentUseCase],
    },
    {
      provide: CreateBatchUseCase,
      useFactory: (batches: BatchRepository, idempotency: IdempotencyRepository, eligibility: EligibilityGateway, clock: Clock) =>
        new CreateBatchUseCase(batches, idempotency, eligibility, new CryptoIdentifierGenerator(), new Sha256RequestFingerprint(), clock),
      inject: [BATCH_REPOSITORY, IDEMPOTENCY_REPOSITORY, ELIGIBILITY_GATEWAY, CLOCK],
    },
    {
      provide: GetBatchUseCase,
      useFactory: (batches: BatchRepository) => new GetBatchUseCase(batches),
      inject: [BATCH_REPOSITORY],
    },
    {
      provide: ListBatchRejectionsUseCase,
      useFactory: (batches: BatchRepository) => new ListBatchRejectionsUseCase(batches),
      inject: [BATCH_REPOSITORY],
    },
  ],
})
export class BatchModule {}
