/** Camadas travadas: .claude/rules/arquitetura.md */
module.exports = {
  forbidden: [
    {
      name: 'domain-nao-importa-infrastructure',
      comment: 'domain/ não importa nada de infrastructure/.',
      severity: 'error',
      from: { path: '^src/[^/]+/domain/' },
      to: { path: '^src/[^/]+/infrastructure/' },
    },
    {
      name: 'domain-nao-importa-framework',
      comment: 'domain/ não importa framework nem bibliotecas de infraestrutura.',
      severity: 'error',
      from: { path: '^src/[^/]+/domain/' },
      to: { dependencyTypes: ['npm'] },
    },
    {
      name: 'domain-nao-cruza-modulo',
      comment: 'Um módulo não importa o domain de outro; a comunicação é por porta em domain/service (exceto shared).',
      severity: 'error',
      from: { path: '^src/([^/]+)/domain/' },
      to: { path: '^src/[^/]+/domain/', pathNot: ['^src/$1/domain/', '^src/shared/domain/'] },
    },
    {
      name: 'sem-ciclos',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: { path: '\\.spec\\.ts$' },
  },
};
