export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly title: string;

  constructor(readonly detail: string) {
    super(detail);
    this.name = new.target.name;
  }
}
