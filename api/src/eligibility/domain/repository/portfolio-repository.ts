import { PortfolioHolding } from '../entity/portfolio-holding';

export interface PortfolioRepository {
  listHoldings(): Promise<PortfolioHolding[]>;
  addHoldings(holdings: PortfolioHolding[]): Promise<void>;
}
