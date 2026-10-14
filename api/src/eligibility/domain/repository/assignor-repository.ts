import { Assignor } from '../entity/assignor';

export interface AssignorRepository {
  findById(id: string): Promise<Assignor | null>;
}
