import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/domain-exception';
import { HttpProblemException, ProblemFieldError } from './http-problem.exception';

const PROBLEM_TYPE_BASE = 'https://fidc-onboarding-cedente.example/problemas/';

interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: ProblemFieldError[];
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  constructor(private readonly statusByDomainCode: Map<string, number>) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const problem = this.toProblem(exception, request.originalUrl);
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string): Problem {
    if (exception instanceof HttpProblemException) {
      const problem = this.problem(exception.status, exception.code, exception.title, exception.detail, instance);
      return exception.errors.length > 0 ? { ...problem, errors: exception.errors } : problem;
    }
    if (exception instanceof DomainException) {
      const status = this.statusByDomainCode.get(exception.code) ?? 422;
      return this.problem(status, exception.code, exception.title, exception.detail, instance);
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 400) {
        return this.problem(status, 'MALFORMED_REQUEST', 'Requisição malformada', exception.message, instance);
      }
      const code = status === 404 ? 'ROUTE_NOT_FOUND' : 'HTTP_ERROR';
      return this.problem(status, code, exception.message, exception.message, instance);
    }
    this.logger.error(exception);
    return this.problem(500, 'INTERNAL_ERROR', 'Erro interno', 'Erro inesperado no mock.', instance);
  }

  private problem(status: number, code: string, title: string, detail: string, instance: string): Problem {
    return { type: PROBLEM_TYPE_BASE + code.toLowerCase().replaceAll('_', '-'), title, status, detail, instance, code };
  }
}
