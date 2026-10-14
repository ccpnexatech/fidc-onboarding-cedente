.PHONY: check setup api newman docs

# Estrutura do repositório + API: ESLint, tipos, dependency-cruiser, Jest e lint do OpenAPI.
check:
	@bash scripts/check-estrutura.sh
	@cd api && npm run -s check

setup:
	@cd api && npm ci

api:
	@cd api && npm run -s build && npm start

newman:
	@echo "Disponível a partir da coleção do P2." && exit 1

docs:
	@echo "Disponível ao fim do P2." && exit 1
