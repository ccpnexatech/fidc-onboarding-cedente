#!/usr/bin/env bash
# Rotina semanal (ADR-0007): gera gestao/status/<data>.md, atualiza a tabela de gestao/metricas.md
# e aponta o menu do site para o status mais recente.
# A tabela só muda entre os marcadores <!-- metricas:inicio --> e <!-- metricas:fim -->; o texto à mão fica intacto.
# uso: gestao/semanal.sh [AAAA-MM-DD]
set -euo pipefail
cd "$(dirname "$0")/.."

data="${1:-$(TZ=America/Sao_Paulo date +%F)}"

bash gestao/status.sh "$data" > "gestao/status/$data.md"
tabela=$(bash gestao/metricas.sh)

python3 -I - "$data" "$tabela" <<'PY'
import re, sys
data, tabela = sys.argv[1], sys.argv[2]
caminho = "gestao/metricas.md"
texto = open(caminho, encoding="utf-8").read()
bloco = f"<!-- metricas:inicio -->\n_Gerado em {data} por `gestao/metricas.sh`._\n\n{tabela}\n<!-- metricas:fim -->"
novo, trocas = re.subn(r"<!-- metricas:inicio -->.*?<!-- metricas:fim -->", lambda _: bloco, texto, flags=re.S)
if trocas != 1:
    sys.exit("gestao/metricas.md sem o par de marcadores <!-- metricas:inicio --> / <!-- metricas:fim -->")
open(caminho, "w", encoding="utf-8").write(novo)
PY
sed -i -E "s#^  - \[Status [0-9-]+\]\(gestao/status/[0-9-]+\.md\)#  - [Status $data](gestao/status/$data.md)#" site/_sidebar.md
echo "gestao/status/$data.md, gestao/metricas.md e o menu do site atualizados."
