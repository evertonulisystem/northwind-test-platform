# Padronização para v1 Concluída (Localhost)

Todos os endpoints da API foram migrados para o prefixo `/api/v1`, conforme planejado para elevar o nível de design da plataforma.

## Mudanças Realizadas

### 📁 Reestruturação de Pastas
- Todas as rotas que estavam na raiz de `app/api/` foram movidas para `app/api/v1/`.
- Pastas afetadas: `auth`, `products`, `categories`, `suppliers`, `orders`, `cart`, `admin`, `debug`, `health`, `keepalive`, `register`, `swagger.json`.

### 📝 Documentação Swagger (`lib/swagger.js`)
- Todos os caminhos (paths) no arquivo de configuração central agora incluem o prefixo `/v1`.
- O scanner de JSDoc foi atualizado para focar apenas na pasta `v1`, garantindo que não existam definições duplicadas.

### 🔗 Sincronização da UI (`app/api-docs/page.js`)
- A interface do Swagger agora consome o arquivo JSON de `/api/v1/swagger.json`.

### 🛠️ Ajustes de Código
- **Importações:** Corrigi as importações relativas que precisavam de um nível extra de profundidade (ex: `swagger.json/route.js`).
- **JSDoc Interno:** Atualizei os comentários JSDoc e cabeçalhos nos arquivos principais para refletir o novo endereço `/api/v1/...`.

## Como Validar em Localhost
1. Inicie o servidor: `npm run dev`.
2. Acesse `http://localhost:3000/api-docs`.
3. Verifique se todos os nomes de endpoints agora começam com `/api/v1/`.
4. Teste uma chamada (ex: `GET /api/v1/products`) para confirmar que o roteamento do Next.js está funcionando perfeitamente.

> [!IMPORTANT]
> Os caminhos antigos (sem o `/v1/`) não existem mais. Se você tiver testes ou front-end apontando para `/api/products`, eles precisarão ser atualizados para `/api/v1/products`.

render_diffs(file:///h:/windsurfProjects/app-northwind-test-platform/northwind-test-platform/lib/swagger.js)
render_diffs(file:///h:/windsurfProjects/app-northwind-test-platform/northwind-test-platform/app/api-docs/page.js)
