#!/usr/bin/env bash
# Teste do SQL de conciliação (HU-11): banco limpo, schema, dados de teste e comparação com o resultado esperado.
set -euo pipefail
cd "$(dirname "$0")/.."

DATABASE_URL="${DATABASE_URL:-postgresql://fidc:fidc@localhost:55432/fidc}"
schema="reconciliation_test_$$"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "CREATE SCHEMA $schema"
trap 'PGOPTIONS="-c client_min_messages=warning" psql "$DATABASE_URL" -q -c "DROP SCHEMA IF EXISTS $schema CASCADE" > /dev/null' EXIT

run() {
  PGOPTIONS="-c search_path=$schema" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"
}

run -f sql/schema.sql
run -f sql/test-data.sql
actual=$(run -A -t -F '|' -f sql/reconciliation.sql)

if diff <(echo "$actual") sql/expected-reconciliation.txt; then
  echo "Conciliação OK: $(wc -l < sql/expected-reconciliation.txt) divergências esperadas encontradas."
else
  echo "FALHA: relatório de conciliação diferente do esperado (diff acima: < atual, > esperado)."
  exit 1
fi
