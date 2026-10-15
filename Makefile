.PHONY: check setup api newman conciliacao docs

# Estrutura do repositório + API: ESLint, tipos, dependency-cruiser, Jest e lint do OpenAPI.
check:
	@bash scripts/check-estrutura.sh
	@bash scripts/test-automacao.sh
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

# Site de documentação (docsify) com a referência da API gerada do openapi.yaml.
docs:
	@cd api && npx redocly build-docs openapi.yaml -o ../site/api.html > /dev/null
	@echo "Documentação em http://localhost:8000/site/"
	@python3 -m http.server 8000 --bind 127.0.0.1
