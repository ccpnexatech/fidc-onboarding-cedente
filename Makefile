.PHONY: check setup api newman docs

# Cresce a cada fase: no P2 entram lint, tipos, arquitetura, testes e lint OpenAPI.
check:
	@bash scripts/check-estrutura.sh

setup:
	@echo "Disponível a partir do P2 (depende da ADR-0002)." && exit 1

api:
	@echo "Disponível a partir do P2 (depende da ADR-0002)." && exit 1

newman:
	@echo "Disponível a partir do P2." && exit 1

docs:
	@echo "Disponível a partir do P1." && exit 1
