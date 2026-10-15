import { DomainException } from '../../../shared/domain/domain-exception';

export class AssignorNotEnabledException extends DomainException {
  readonly code = 'RN-10_ASSIGNOR_NOT_ENABLED';
  readonly title = 'Cedente não habilitado';

  constructor(assignorId: string, status: string | null) {
    super(
      status === null
        ? `O cedente ${assignorId} não está cadastrado no fundo.`
        : `O cedente ${assignorId} está com status ${status}.`,
    );
  }
}
