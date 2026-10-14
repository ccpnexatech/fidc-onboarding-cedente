import { PortfolioHolding } from '../entity/portfolio-holding';
import { ReceivableCandidate } from '../entity/receivable-candidate';
import { PortfolioRepository } from '../repository/portfolio-repository';

export interface RegisterAssignmentInput {
  assignorId: string;
  receivables: ReceivableCandidate[];
}

export class RegisterAssignmentUseCase {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  async execute(input: RegisterAssignmentInput): Promise<void> {
    const holdings = input.receivables.map(
      (receivable) =>
        new PortfolioHolding(
          input.assignorId,
          receivable.externalId,
          receivable.invoiceKey,
          receivable.debtorTaxId,
          receivable.faceValue,
          receivable.dueDate,
          null,
        ),
    );
    await this.portfolioRepository.addHoldings(holdings);
  }
}
