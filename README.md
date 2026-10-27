# Smart Clinic Assistant — demonstração fictícia

Simulação de pedidos e gestão administrativa, **não destinada a marcações reais nem a dados clínicos ou pessoais reais**. Sem backend, autenticação, clínica, envio de email/SMS ou integrações. A interface permite apenas três pessoas e mensagens fictícias predefinidas. O serviço, a data, a hora e o estado são opções de simulação.

## Executar e verificar

Node.js 24+ recomendado. As dependências de desenvolvimento existentes são Astro e TypeScript; nenhuma dependência nova foi adicionada. Numa instalação nova, usar npm ci com o package-lock.json existente. Na instalação local já preparada, não é necessário reinstalar.

```powershell
npm run build
npm test
npx tsc --noEmit
npm run preview -- --host 127.0.0.1 --port 4182
```

Abrir http://127.0.0.1:4182/smart-clinic-assistant/ e /smart-clinic-assistant/admin/. O build deve anteceder os testes de recursos estáticos. npm run dev também usa o prefixo. Não há servidor de aplicação em produção.

## Preparação para GitHub Pages

O prefixo predefinido em astro.config.mjs é /smart-clinic-assistant/. Para outra utilização local, definir BASE_PATH=/ antes do build e do preview. O valor é validado e tem de começar e terminar em /. A saída é **dist**, com index.html, admin/index.html, 404.html, .nojekyll e recursos _astro. Todos os links usam BASE_URL e as páginas internas têm barra final. A URL https://tiagoapsantos.github.io/smart-clinic-assistant/ é prevista; não foi publicada nem confirmada online nesta tarefa.

Uma publicação futura deve usar apenas dist e um único mecanismo de Pages, após revisão. Não foram inicializados Git, repositórios, workflows de deploy ou serviços externos; sem commit, push ou deploy.

## Protecção da demonstração

- Pessoa fictícia seleccionada numa lista. Nome, email, telefone e mensagem são de leitura, sem autocomplete de contactos. O envio ignora estes valores do DOM e constrói o pedido a partir do cenário conhecido.
- A gravação valida novamente a identidade/mensagem contra os exemplos canónicos. Textos arbitrários nesses campos são rejeitados. Serviços e estados têm listas fechadas; datas, horas, IDs e timestamps têm formatos validados. Limite de 50 pedidos.
- localStorage guarda apenas ID, referência ao cenário fictício, serviço, data/hora, estado e timestamp. Os contactos e mensagens são reconstruídos a partir dos exemplos da aplicação. O dashboard usa textContent, sem executar conteúdo armazenado.
- Chave nova: smart-clinic-assistant:demo-only:v2. A chave antiga smart-clinic-assistant:appointments:v1 **não é lida, migrada nem apagada automaticamente**. Se alguém usou dados reais numa versão anterior, estes podem continuar nessa chave até remoção manual dos dados desse site. Não copiar/exportar dados reais para a demonstração.
- CSP nos documentos bloqueia ligações de dados (connect-src none) e submissão de formulários (form-action none). Scripts e estilos são recursos da própria origem, sem inline. Não há fontes remotas, telemetria, APIs, endpoints ou credenciais no código verificado. O alojamento estático recebe os pedidos normais de páginas/recursos; os dados de simulação não são enviados pela aplicação.

## Limitações e riscos residuais

localStorage não é encriptado, seguro ou sincronizado. É partilhado por origem: as subpastas de tiagoapsantos.github.io não constituem fronteiras de segurança. A chave própria evita mistura acidental, não impede leitura por outro script da mesma origem. O modo fictício é uma protecção contra introdução acidental, não uma barreira contra alguém que altere manualmente o código/armazenamento nas ferramentas de desenvolvimento.

Não há controlo de acesso; /admin/ é público numa publicação. Isto é adequado apenas aos exemplos fictícios. O browser pode apagar/bloquear a gravação; neste caso são apresentados exemplos em memória e as tentativas de gravação reportam erro. Não existe sincronização entre separadores; use uma janela de gestão de cada vez. Não há backup de dados antigos nem recuperação automática de conteúdo corrompido. CSP por meta não impõe frame-ancestors; não se reivindica protecção de enquadramento por Pages.

Doze testes essenciais cobrem regras críticas e as respostas de aceitar/cancelar nas confirmações, sem alegar cobertura integral. Ver docs/public-demo-readiness.md para resultados e verificações pendentes. As capturas anteriores no Portfolio representam a versão anterior; o Portfolio foi preservado nesta tarefa.

## Publicação autorizada — 27/10/2026

As indicações anteriores de ausência de publicação descrevem a fase de preparação. Foi agora autorizada a criação do repositório público `tiagoapsantos/smart-clinic-assistant` e publicação em https://tiagoapsantos.github.io/smart-clinic-assistant/. O resultado efectivo do deploy é confirmado no relatório de entrega.

O único workflow `.github/workflows/deploy.yml` usa Node 24, `npm ci` com o lockfile existente, build com `BASE_PATH=/smart-clinic-assistant/`, TypeScript e os 12 testes, publicando apenas `dist` pelas Actions oficiais de Pages. O build antecede os testes porque estes verificam os recursos gerados. Permissões de escrita de Pages limitadas ao job de deploy. `.gitignore` exclui dependências, saídas, capturas antigas locais, temporários, credenciais e backups. Dados do navegador não são ficheiros do projecto nem são incluídos na publicação. O modo fictício validado e o código funcional permanecem inalterados nesta fase.
