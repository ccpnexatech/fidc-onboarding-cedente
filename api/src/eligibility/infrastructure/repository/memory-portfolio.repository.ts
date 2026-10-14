import { PortfolioHolding } from '../../domain/entity/portfolio-holding';
import { PortfolioRepository } from '../../domain/repository/portfolio-repository';

export class MemoryPortfolioRepository implements PortfolioRepository {
  private readonly holdings: PortfolioHolding[];

  constructor(holdings: PortfolioHolding[]) {
    this.holdings = [...holdings];
  }

  async listHoldings(): Promise<PortfolioHolding[]> {
    return [...this.holdings];
  }

  async addHoldings(holdings: PortfolioHolding[]): Promise<void> {
    this.holdings.push(...holdings);
  }
}
