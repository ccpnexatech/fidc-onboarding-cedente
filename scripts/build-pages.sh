#!/usr/bin/env bash
# Monta o site do GitHub Pages (#33): os arquivos versionados do repo, a referência da API gerada do
# openapi.yaml e um index na raiz que leva ao site docsify. Mesma estrutura do `make docs`.
# uso: scripts/build-pages.sh <pasta de saída>
set -euo pipefail
cd "$(dirname "$0")/.."

saida=$(realpath -m "$1")
rm -rf "$saida"
mkdir -p "$saida"

git ls-files -z | xargs -0 cp --parents -t "$saida"
(cd api && npx redocly build-docs openapi.yaml -o "$saida/site/api.html" > /dev/null)

cat > "$saida/index.html" <<'HTML'
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=site/">
  <title>fidc-onboarding-cedente</title>
</head>
<body>
  <p><a href="site/">Documentação do fidc-onboarding-cedente</a></p>
</body>
</html>
HTML

echo "Pages montado em $saida ($(find "$saida" -type f | wc -l) arquivos)."
