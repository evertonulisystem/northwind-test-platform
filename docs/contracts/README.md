# Documentação de Categories

`categories.production.json` registra apenas os caminhos de Categories e seus
schemas referenciados, obtidos do Swagger público. A URL e o instante da captura
estão no arquivo. Esta é a referência publicada, não uma captura de respostas reais.

`lib/openapi/categories.js` enriquece essa referência com schemas de envelopes
ausentes e exemplos. `lib/openapi/examples.js` gera os objetos a partir dos schemas,
reutilizando exemplos de campos, defaults e tipos. Não há consulta ao banco nem
requisição à produção durante a geração. Mensagens são ilustrativas.

Nesta etapa a referência publicada é também a entrada da documentação. Não há
inferência automática dos handlers nem compartilhamento com a validação runtime.
Os comentários JSDoc antigos dos handlers não são mais lidos para Categories.
Outras tags continuam usando a documentação existente.

## Divergências a resolver antes de unificar validação e documentação

- GET `/categories/{id}` publicado descreve produtos em array; o handler local
  retorna uma categoria. A descrição publicada foi preservada.
- Schema Category publicado: nome de 3–100 e descrição até 500 caracteres.
  POST/PUT/PATCH publicados: nome até 25 e descrição de 6–40 caracteres.
- POST e PATCH locais permitem descrição até 200 caracteres.
- Paginação publicada da coleção usa page/totalPages/total; o handler local usa
  currentPage/totalPages/totalItems/itemsPerPage/hasNextPage/hasPreviousPage.
- POST publica 409, mas o tratamento local de erro retorna 400.

Nenhuma dessas divergências foi resolvida alterando comportamento da API. É preciso
verificar as respostas do ambiente publicado para decidir correções documentais.

## Padronização posterior do envelope JSON

A pedido do usuário, os handlers agora aplicam `lib/api-envelope.js`: toda resposta
JSON de negócio inclui `data` e `mensagens` (array de strings). Mensagens antes
retornadas em `error`, `message`, `mensagem` ou em uma string `mensagens` passam para
`mensagens[]`. Respostas antes sem `data` têm seus campos de negócio agrupados em
`data`. Por exemplo, `{ valid, message }` passa a `{ data: { valid }, mensagens }`.
Respostas já padronizadas mantêm seus dados e metadados, como paginação e expires_at.
Os HTTP status e os headers permanecem iguais. Downloads binários e o documento
OpenAPI não recebem esse envelope. Essa etapa altera os formatos divergentes da API
local; os snapshots de produção continuam registrados sem modificação.

O Swagger aplica a mesma normalização aos exemplos e exige os dois campos nos
schemas das respostas. Os modais de produtos passam a ler `mensagens[0]`.
Testes: `node --test lib/api-envelope.test.js lib/openapi/categories.test.js lib/openapi/complete.test.js`.
Verificação HTTP local sem credenciais e sem escrita no banco:
`node scripts/verify-api-envelope.cjs`.

## Expansão para as demais tags

`api.production.json` é a cópia pública completa consultada nesta etapa.
`response-errors.json` registra erros encontrados nos handlers locais, com arquivo
e linha de origem. É um registro estático para documentação e exige revisão manual
quando o código mudar. Expressões dinâmicas têm valores ilustrativos.

`lib/openapi/complete.js` recupera operações publicadas ausentes no documento local,
acrescenta a documentação das demais rotas e completa schemas e exemplos. Schemas
deduzidos de exemplos descrevem o formato ilustrado, não todas as restrições de
validação do endpoint. Nenhum desses módulos altera validação ou respostas runtime.

São 57 operações e 230 respostas documentadas. Categories tem 35 respostas,
incluindo 500 nos seis handlers que o retornam. O POST de Categories retorna 400
em seu catch, portanto não ganhou um 500 fictício. Respostas binárias de download
usam string/binary e o MIME apropriado, sem apresentar JSON como se fosse arquivo.

A rota legada PATCH `/categories` continua fora do Swagger: não faz parte do
contrato publicado e tenta usar um ID que não está presente no caminho. O endpoint
de infraestrutura `/swagger.json` e OPTIONS também não são operações de negócio.

Verificação: `node --test lib/openapi/categories.test.js lib/openapi/complete.test.js`.
Os testes protegem cobertura, referências, contratos de Categories e compatibilidade
dos exemplos JSON com seus schemas. O teste de schemas usa Ajv disponível na árvore
de dependências do projeto. Não executam operações de negócio em produção.

`scripts/verify-swagger-ui.cjs` usa Playwright com Edge headless para abrir todas as
operações e conferir a renderização das abas Example Value no localhost. Aceita como
argumento o caminho de um pacote Playwright instalado; não executa Try it out.
