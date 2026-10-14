---
name: História
about: História de usuário com regras e critérios de aceite em Gherkin
title: "HU-NN · "
labels: historia
---

## História

Como **<papel>**, quero **<ação>**, para **<benefício>**.

## Regras cobertas

- RN-NN:

## Critérios de aceite

```gherkin
Funcionalidade: <nome>

  Cenário: <caminho feliz>
    Dado
    Quando
    Então

  Cenário: <caminho de erro>
    Dado
    Quando
    Então
```

## Definition of Ready

- [ ] Regras existem em `docs/discovery/regras.md`
- [ ] Gherkin com caminho feliz e de erro
- [ ] Sem dependência bloqueante
