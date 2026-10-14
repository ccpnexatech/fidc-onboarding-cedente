.PHONY: check setup api newman docs

# Estrutura do repositório + checagens da API (lint OpenAPI; no P2 entram tipos, lint, arquitetura e testes).
check:
	@bash scripts/check-estrutura.sh
	@cd api && npm run -s check

setup:
	@cd api && npm ci

api:
	@echo "Disponível a partir do mock do P2." && exit 1

newman:
	@echo "Disponível a partir da coleção do P2." && exit 1

docs:
	@echo "Disponível ao fim do P2." && exit 1
