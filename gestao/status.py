"""Monta o status report semanal (.claude/rules/gestao.md) a partir dos dados coletados por status.sh.

Entrada: JSON na entrada padrão. Saída: markdown com Feito, Riscos (dono e ação) e Próximo.
Os riscos saem só dos dados; risco de negócio o Caio acrescenta à mão na revisão do PR.
"""

import json
import re
import sys
from datetime import date

ISSUE_LIGADA = re.compile(r"\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?) #(\d+)", re.IGNORECASE)
WIP_LIMITE = 2
PR_PARADO_DIAS = 3


def lista_de_numeros(numeros):
    return ", ".join(f"#{numero}" for numero in numeros)


def feito(dados):
    linhas = []
    for pr in sorted(dados["mergeados"], key=lambda pr: pr["number"]):
        issues = sorted({int(numero) for numero in ISSUE_LIGADA.findall(pr["body"] or "")})
        fecha = f" (fecha {lista_de_numeros(issues)})" if issues else ""
        linhas.append(f"- #{pr['number']} {pr['title']}{fecha}")
    return linhas or ["- Nenhum PR mergeado no período."]


def riscos(dados):
    hoje = date.fromisoformat(dados["data"])
    linhas = []
    if dados["ciMain"] not in ("success", ""):
        linhas.append(("CI vermelho na `main`", "Todo PR novo herda a falha.", "Caio", "Corrigir a `main` antes de abrir outro PR."))
    em_andamento = [item for item in dados["itens"] if item["status"] == "In progress"]
    if len(em_andamento) > WIP_LIMITE:
        linhas.append((
            f"WIP estourado: {len(em_andamento)} itens em In progress (limite {WIP_LIMITE})",
            "Trabalho começado e não terminado; o lead time cresce.",
            "Caio",
            f"Terminar ou devolver para Todo: {lista_de_numeros(sorted(item['number'] for item in em_andamento))}.",
        ))
    parados = sorted(
        pr["number"] for pr in dados["abertos"]
        if (hoje - date.fromisoformat(pr["createdAt"][:10])).days > PR_PARADO_DIAS
    )
    if parados:
        linhas.append((
            f"PR aberto há mais de {PR_PARADO_DIAS} dias: {lista_de_numeros(parados)}",
            "Fila de revisão; o lead time cresce.",
            "Caio",
            "Revisar e fazer o merge, ou fechar.",
        ))
    if dados["adrsEmProposta"]:
        linhas.append((
            f"ADRs em `proposta`: {', '.join(dados['adrsEmProposta'])}",
            "Decisão registrada sem a voz do decisor; não pode virar `aceita`.",
            "Caio",
            "Escrever a seção Decisão de cada uma.",
        ))
    if dados["premissasAValidar"]:
        linhas.append((
            f"Premissas a validar: {', '.join(dados['premissasAValidar'])}",
            "Regras e conciliação podem mudar quando a premissa cair.",
            "Caio",
            "Validar com quem opera FIDC; premissa que cair vira ADR.",
        ))
    if not linhas:
        return ["Nenhum risco nos dados do quadro e do repositório."]
    tabela = ["| Risco | Efeito | Dono | Ação |", "|---|---|---|---|"]
    tabela += [f"| {risco} | {efeito} | {dono} | {acao} |" for risco, efeito, dono, acao in linhas]
    return tabela


def proximo(dados):
    ordem = {"Review": 0, "In progress": 1, "Todo": 2}
    abertos = sorted(
        (item for item in dados["itens"] if item["status"] in ordem),
        key=lambda item: (ordem[item["status"]], item["number"]),
    )
    return [f"- #{item['number']} {item['title']} ({item['status']})" for item in abertos] or ["- Quadro vazio: abrir as próximas issues do backlog."]


def status_report(dados):
    partes = [
        f"# Status · {dados['data']}",
        "",
        f"Período: {dados['desde']} a {dados['data']}. Gerado por `gestao/status.sh` a partir do quadro e do Git (ADR-0007).",
        "",
        "## Feito",
        "",
        *feito(dados),
        "",
        "## Riscos",
        "",
        *riscos(dados),
        "",
        "## Próximo",
        "",
        *proximo(dados),
    ]
    return "\n".join(partes) + "\n"


if __name__ == "__main__":
    sys.stdout.write(status_report(json.load(sys.stdin)))
