# Preparação de demonstração pública — 27/10/2026

## Risco e mitigação

A versão inicial apresentava avisos, mas aceitava nome/email/telefone/mensagem livres e persistia-os em localStorage. Era um bloqueador para a demonstração pública proposta. A versão preparada permite apenas cenários fictícios predefinidos e valida-os antes da gravação. Persistem só opções de simulação, numa chave nova v2; a chave livre v1 fica preservada e nunca é lida. Dados históricos eventualmente reais nessa chave precisam de remoção manual pelo utilizador na origem/perfil original. Não há recolha livre de dados pessoais ou clínicos no formulário preparado.

Revisão dirigida do código e configuração: sem credenciais, endpoints ou integrações de dados externas identificados. Astro e TypeScript são dependências de build existentes. Recursos de execução locais; sem fontes remotas ou analytics. CSP incorporada nos documentos bloqueia connect-src e form-action. Dados locais não são transmitidos pela aplicação; o servidor estático recebe os pedidos normais de recursos. Não é uma auditoria de segurança integral.

## Alterações

- astro.config.mjs: aplicação estática, prefixo validado /smart-clinic-assistant/, barras finais e recursos externos ao HTML.
- src/components/AppointmentForm.astro e src/scripts/booking.ts: selecção de cenário, contactos/mensagem não editáveis, construção canónica do pedido e feedback explícito.
- src/lib/appointment-store.ts: formato reduzido de metadados, listas fechadas, validação, limite de 50 pedidos e chave isolada v2; rejeição de dados arbitrários.
- src/components/BaseLayout.astro: CSP estática. SiteHeader.astro e pages/index.astro: links com BASE_URL e avisos reforçados. pages/admin.astro: âmbito exclusivamente fictício.
- public/.nojekyll e src/pages/404.astro para Pages.
- package.json, tests/demo.test.mjs, README.md e este relatório: testes/documentação, sem novas dependências.

## Validação

- Build estático: 3 páginas (início, admin e 404), recursos e .nojekyll. Prefixo /smart-clinic-assistant/.
- TypeScript: npx tsc --noEmit aprovado.
- npm test: 8 testes essenciais aprovados. Construção canónica; rejeição de pessoa/serviço/data/hora inválidos; rejeição de contactos/mensagem arbitrários; persistência reduzida e estados; isolamento da chave antiga e leitura inválida; limites/duplicados/estados; remoção/reposição e falha de armazenamento; referências estáticas e CSP sem scripts inline.
- Browser local no prefixo previsto: pessoa fictícia Marta Teste, serviço de exemplo, data 05/11/2026 às 10:30, criação e painel com 4 pedidos; alteração para Confirmada persistiu após reload; pesquisa Marta combinada com filtro Confirmada mostrou um pedido; detalhe completo observado. Campos de contacto/mensagem de leitura confirmados.
- Mobile a 390 píxeis de viewport: formulário e dashboard sem overflow horizontal; avisos visíveis e navegação interna funcional. Não foram feitos testes em todos os dispositivos ou leitores de ecrã. Consola consultada sem erros/avisos antes da confirmação nativa.
- A confirmação nativa de Apagar bloqueou a ferramenta de automação. Foi cancelada, mantendo quatro pedidos no reload. A confirmação final de apagar/repor não foi validada no browser; as operações de armazenamento foram verificadas nos testes. Rever manualmente antes de publicação. Não se afirma que a eliminação tenha sido concluída no browser.

## Prontidão

O bloqueador de recolha livre de dados reais foi mitigado e o build está preparado para Pages. A pendência original de confirmação de apagar/repor foi resolvida pelos testes automatizados descritos abaixo. A preparação está pronta para revisão e eventual publicação; a limitação da ferramenta nos diálogos nativos não é um bloqueador de publicação. Nenhuma URL pública foi criada ou testada; não há Git inicializado, commit, push ou deploy. Portfolio e restantes projectos não foram alterados. O modo é exclusivamente demonstrativo e nunca adequado a uso clínico real. O preview pode deixar exemplos fictícios no armazenamento do perfil de QA.

## Conclusão das confirmações — 27/10/2026

Sem repetir a auditoria: revistos apenas os handlers de confirmação em src/scripts/admin.ts, as operações de src/lib/appointment-store.ts e os testes associados. A ferramenta de browser já demonstrou bloqueios nos diálogos nativos; nesta conclusão foi utilizada a alternativa automatizada autorizada, sem alterar a interface nem o código de produção.

Novo tests/admin-confirmations.test.mjs transpila e executa o módulo administrativo e o armazenamento reais, usando TypeScript já instalado, um DOM mínimo em memória e window.confirm com resposta true/false. Não reproduz a lógica de apagar/repor no teste. Cada cenário parte de quatro pedidos fictícios e verifica dados persistidos, cartões, contadores, feedback e preservação de chaves de outras aplicações e da chave antiga.

- Apagar/cancelar: zero gravações, dados serializados exactamente iguais, cartões e contadores inalterados.
- Apagar/aceitar: apenas o ID escolhido é removido, os restantes mantêm-se, uma gravação, contadores e feedback correctos; releitura do armazenamento confirma três pedidos.
- Repor/cancelar: zero gravações, pedidos adicionais e estados alterados preservados integralmente.
- Repor/aceitar: uma gravação, exactamente os três exemplos canónicos e os estados pendente/confirmado/cancelado, com cartões, contadores e feedback actualizados; releitura confirma a reposição.

Quatro testes relevantes aprovados; suite completa com 12 testes, zero falhas. Build estático aprovado com três páginas. Nenhum problema funcional encontrado nestas operações; não foi necessária correcção de produção. O aspecto e a aceitação real dos diálogos nativos continuam sem nova verificação no browser, mas ambos os ramos dos handlers reais estão cobertos. Não há bloqueador de publicação identificado nestas operações. Mantêm-se as limitações de privacidade e âmbito fictício já documentadas.

Ficheiros desta conclusão: tests/admin-confirmations.test.mjs (novo), README.md e este relatório. dist foi regenerado. Sem alterações a outros projectos, sem commit, push ou deploy.

## Execução da publicação autorizada — 27/10/2026

Reutilizada a auditoria e os 12 testes anteriores, sem alterar o código funcional. Verificação inicial: sem `.git`, remoto pretendido ausente e autenticação disponível. Ficheiros antigos de `screenshots/`, `dist/`, `.astro/`, dependências e ficheiros locais sensíveis excluídos da publicação. Nenhum dado do localStorage é recolhido para o repositório. Workflow único de Pages, com build, TypeScript e testes antes do upload exclusivo de `dist`. Os resultados do commit, Actions e da validação online são apresentados no relatório de entrega. As secções anteriores mantêm o registo histórico das fases sem publicação.
