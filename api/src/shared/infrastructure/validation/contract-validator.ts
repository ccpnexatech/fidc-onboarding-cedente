import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { isValidTaxId } from '../../domain/tax-id';
import { PayloadValidationException, ProblemFieldError } from '../http/http-problem.exception';

interface TaxIdentifiedPayload {
  assignorId: string;
  receivables: { debtor: { taxId: string } }[];
}

export class ContractValidator {
  private readonly validateBatchRequest: ValidateFunction;

  constructor(openApiDocument: Record<string, unknown>) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    ajv.addSchema({ $id: 'openapi.json', components: openApiDocument.components });
    const validate = ajv.getSchema('openapi.json#/components/schemas/BatchRequest');
    if (validate === undefined) {
      throw new Error('Schema BatchRequest ausente em openapi.yaml.');
    }
    this.validateBatchRequest = validate;
  }

  assertBatchRequest(payload: unknown): void {
    if (!this.validateBatchRequest(payload)) {
      throw new PayloadValidationException((this.validateBatchRequest.errors ?? []).map((error) => this.toFieldError(error)));
    }
    const taxIdErrors = this.taxIdErrors(payload as TaxIdentifiedPayload);
    if (taxIdErrors.length > 0) {
      throw new PayloadValidationException(taxIdErrors);
    }
  }

  private taxIdErrors(payload: TaxIdentifiedPayload): ProblemFieldError[] {
    const errors: ProblemFieldError[] = [];
    if (!isValidTaxId(payload.assignorId)) {
      errors.push({ field: '/assignorId', message: 'CNPJ com dígito verificador inválido' });
    }
    payload.receivables.forEach((receivable, index) => {
      if (!isValidTaxId(receivable.debtor.taxId)) {
        errors.push({ field: `/receivables/${index}/debtor/taxId`, message: 'CNPJ ou CPF com dígito verificador inválido' });
      }
    });
    return errors;
  }

  private toFieldError(error: ErrorObject): ProblemFieldError {
    const base = error.instancePath === '' ? '' : error.instancePath;
    if (error.keyword === 'required') {
      return { field: `${base}/${(error.params as { missingProperty: string }).missingProperty}`, message: 'campo obrigatório ausente' };
    }
    if (error.keyword === 'additionalProperties') {
      return { field: `${base}/${(error.params as { additionalProperty: string }).additionalProperty}`, message: 'campo não previsto no contrato' };
    }
    return { field: base === '' ? '/' : base, message: error.message ?? 'valor inválido' };
  }
}
