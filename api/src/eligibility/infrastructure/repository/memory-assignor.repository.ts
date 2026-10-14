import { Assignor } from '../../domain/entity/assignor';
import { AssignorRepository } from '../../domain/repository/assignor-repository';

export class MemoryAssignorRepository implements AssignorRepository {
  private readonly assignors: Map<string, Assignor>;

  constructor(assignors: Assignor[]) {
    this.assignors = new Map(assignors.map((assignor) => [assignor.id, assignor]));
  }

  async findById(id: string): Promise<Assignor | null> {
    return this.assignors.get(id) ?? null;
  }
}
