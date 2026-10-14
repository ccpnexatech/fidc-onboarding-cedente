export type AssignorStatus = 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';

export class Assignor {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly status: AssignorStatus,
  ) {}

  isEnabled(): boolean {
    return this.status === 'ACTIVE';
  }
}
