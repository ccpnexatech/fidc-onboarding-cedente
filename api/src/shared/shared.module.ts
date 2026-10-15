import { Global, Module } from '@nestjs/common';
import { ConfiguredClock, DEFAULT_REFERENCE_DATE } from './infrastructure/clock/configured-clock';
import { ContractValidator } from './infrastructure/validation/contract-validator';
import { loadOpenApiDocument } from './infrastructure/validation/openapi-document';

export const CLOCK = Symbol('Clock');

@Global()
@Module({
  providers: [
    { provide: CLOCK, useFactory: () => new ConfiguredClock(process.env.REFERENCE_DATE ?? DEFAULT_REFERENCE_DATE) },
    { provide: ContractValidator, useFactory: () => new ContractValidator(loadOpenApiDocument()) },
  ],
  exports: [CLOCK, ContractValidator],
})
export class SharedModule {}
