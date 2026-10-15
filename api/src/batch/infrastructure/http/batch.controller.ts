import { Body, Controller, Get, Headers, HttpCode, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CalendarDate } from '../../../shared/domain/calendar-date';
import { MissingIdempotencyKeyException } from '../../../shared/infrastructure/http/http-problem.exception';
import { ContractValidator } from '../../../shared/infrastructure/validation/contract-validator';
import { BatchReceivable } from '../../domain/entity/batch';
import { CreateBatchUseCase } from '../../domain/use-case/create-batch.use-case';
import { GetBatchUseCase } from '../../domain/use-case/get-batch.use-case';
import { ListBatchRejectionsUseCase } from '../../domain/use-case/list-batch-rejections.use-case';
import { presentBatch, presentRejections } from './batch.presenter';

interface ReceivableRequest {
  externalId: string;
  type: string;
  debtor: { taxId: string; name: string };
  faceValue: number;
  issueDate: string;
  dueDate: string;
  invoiceKey?: string;
  annualDiscountRateBasisPoints: number;
}

interface BatchRequest {
  assignorId: string;
  receivables: ReceivableRequest[];
}

@Controller('remessas')
export class BatchController {
  constructor(
    private readonly createBatch: CreateBatchUseCase,
    private readonly getBatch: GetBatchUseCase,
    private readonly listBatchRejections: ListBatchRejectionsUseCase,
    private readonly contractValidator: ContractValidator,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (idempotencyKey === undefined || idempotencyKey.trim() === '') {
      throw new MissingIdempotencyKeyException();
    }
    this.contractValidator.assertBatchRequest(body);
    const request = body as BatchRequest;
    const output = await this.createBatch.execute({
      idempotencyKey,
      payload: body,
      assignorId: request.assignorId,
      receivables: request.receivables.map((receivable, index) => this.toReceivable(receivable, index + 1)),
    });
    response.setHeader('Location', `/remessas/${output.batch.id}`);
    if (output.replayed) {
      response.setHeader('Idempotent-Replayed', 'true');
    }
    return presentBatch(output.batch);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return presentBatch(await this.getBatch.execute(id));
  }

  @Get(':id/rejeicoes')
  async rejections(@Param('id') id: string) {
    return presentRejections(await this.listBatchRejections.execute(id));
  }

  private toReceivable(receivable: ReceivableRequest, position: number): BatchReceivable {
    return {
      position,
      externalId: receivable.externalId,
      type: receivable.type,
      debtorTaxId: receivable.debtor.taxId,
      debtorName: receivable.debtor.name,
      faceValue: receivable.faceValue,
      issueDate: new CalendarDate(receivable.issueDate),
      dueDate: new CalendarDate(receivable.dueDate),
      invoiceKey: receivable.invoiceKey ?? null,
      annualDiscountRateBasisPoints: receivable.annualDiscountRateBasisPoints,
    };
  }
}
