import { Batch } from '../entity/batch';

export interface BatchRepository {
  save(batch: Batch): Promise<void>;
  findById(id: string): Promise<Batch | null>;
}
