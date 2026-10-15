.PHONY: check setup api newman conciliacao docs

# Estrutura do repositório + API: ESLint, tipos, dependency-cruiser, Jest e lint do OpenAPI.
check:
	@bash scripts/check-estrutura.sh
	@cd api && npm run -s check

setup:
	@cd api && npm ci
	@docker compose up -d --wait

api:
	@cd api && npm run -s build && npm start

newman:
	@bash api/scripts/newman.sh

# SQL de conciliação contra o Postgres do docker compose (ou DATABASE_URL).
conciliacao:
	@bash api/scripts/reconciliation-test.sh

docs:
	@echo "Disponível ao fim do P2." && exit 1
