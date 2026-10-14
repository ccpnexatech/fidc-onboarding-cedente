export interface ProblemFieldError {
  field: string;
  message: string;
}

export abstract class HttpProblemException extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
  abstract readonly title: string;

  constructor(
    readonly detail: string,
    readonly errors: ProblemFieldError[] = [],
  ) {
    super(detail);
    this.name = new.target.name;
  }
}

export class PayloadValidationException extends HttpProblemException {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';
  readonly title = 'Payload fora do contrato';

  constructor(errors: ProblemFieldError[]) {
    super('A remessa não segue o schema BatchRequest.', errors);
  }
}

export class MissingIdempotencyKeyException extends HttpProblemException {
  readonly status = 400;
  readonly code = 'MISSING_IDEMPOTENCY_KEY';
  readonly title = 'Idempotency-Key ausente';

  constructor() {
    super('O header Idempotency-Key é obrigatório em POST /remessas.');
  }
}
