#!/usr/bin/env bash
# Renderiza cada diagrama Mermaid dos .md versionados com o mermaid-cli (Chrome headless).
# Diagrama que não renderiza falha o CI: o site e o GitHub mostrariam um erro no lugar dele.
# uso: scripts/check-diagramas.sh
set -euo pipefail
cd "$(dirname "$0")/.."

temporario=$(mktemp -d)
trap 'rm -rf "$temporario"' EXIT
echo '{"args": ["--no-sandbox"]}' > "$temporario/puppeteer.json"

git ls-files '*.md' | python3 -I -c '
import re, sys, pathlib
saida = pathlib.Path(sys.argv[1])
for arquivo in sys.stdin.read().split():
    texto = pathlib.Path(arquivo).read_text(encoding="utf-8")
    for numero, bloco in enumerate(re.findall(r"```mermaid\n(.*?)```", texto, re.S), start=1):
        nome = arquivo.replace("/", "__") + f"__{numero}.mmd"
        (saida / nome).write_text(bloco, encoding="utf-8")
' "$temporario"

falhas=0
total=0
for diagrama in "$temporario"/*.mmd; do
  [[ -e "$diagrama" ]] || continue
  total=$((total + 1))
  origem=$(basename "$diagrama" .mmd | sed -E 's#__#/#g; s#/([0-9]+)$# (diagrama \1)#')
  if npx -y @mermaid-js/mermaid-cli@11.4.2 -q -p "$temporario/puppeteer.json" -i "$diagrama" -o "${diagrama%.mmd}.svg" > "$temporario/saida.txt" 2>&1; then
    echo "ok    $origem"
  else
    echo "FALHA $origem: $(grep -m1 -i error "$temporario/saida.txt")"
    falhas=$((falhas + 1))
  fi
done

if (( falhas > 0 )); then
  echo "$falhas de $total diagrama(s) não renderizam."
  exit 1
fi
echo "Diagramas OK: $total renderizados."
