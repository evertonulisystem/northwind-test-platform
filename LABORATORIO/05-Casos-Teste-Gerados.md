
# 05 - Casos de Teste Gerados

> Casos de teste baseados nas mensagens de erro, validação e sucesso do sistema

---

## 1. Autenticação

| Caso de Teste | Descrição | Passos | Resultado Esperado |
|----------------|-----------|--------|--------------------|
| CT-Auth-001 | Acessar rota protegida sem token | 1. Tentar acessar qualquer rota /api/v1/* sem enviar header Authorization | 401 Unauthorized com mensagem "Token ausente" |
| CT-Auth-002 | Acessar rota protegida com token inválido | 1. Enviar header Authorization com token quebrado ou expirado | 401 Unauthorized com mensagem "Token inválido" ou "Token expirado" |
| CT-Auth-003 | Acessar rota protegida com token válido | 1. Enviar header Authorization com token válido | Acesso concedido |
| CT-Auth-004 | Frontend: tentar ação sem estar logado | 1. Tentar criar produto sem estar logado | Toast de erro: "Você precisa estar logado para adicionar produtos" |

---

## 2. Produtos

| Caso de Teste | Descrição | Passos | Resultado Esperado |
|----------------|-----------|--------|--------------------|
| CT-Prod-001 | Criar produto com campos obrigatórios faltantes | 1. Tentar criar produto sem enviar nome e preço | 400 Bad Request com mensagem: "Campos obrigatórios não preenchidos: name, price." |
| CT-Prod-002 | Criar produto com preço inválido (zero ou negativo) | 1. Tentar criar produto com price=0 ou price=-10 | 400 Bad Request com mensagem: "O preço deve ser um valor positivo maior que zero." |
| CT-Prod-003 | Criar produto com estoque inválido (negativo) | 1. Tentar criar produto com stock_quantity=-10 | 400 Bad Request com mensagem: "A quantidade em estoque deve ser um número inteiro maior ou igual a zero." |
| CT-Prod-004 | Criar produto com nome/SKU já existente | 1. Criar produto com nome/SKU "TEST-001" 2. Tentar criar outro produto com mesmo nome/SKU | 409 Conflict com mensagem: "Já existe um produto com esse nome/slug." ou "Já existe um produto com esse SKU." |
| CT-Prod-005 | Criar produto com sucesso | 1. Enviar requisição POST com campos válidos | 201 Created com mensagem "Produto criado com sucesso!" |
| CT-Prod-006 | Buscar produto por ID válido | 1. Buscar produto por ID existente | 200 OK com dados do produto |
| CT-Prod-007 | Buscar produto por ID inválido | 1. Buscar produto por ID não existente (99999) | 404 Not Found com mensagem: "Produto com ID 99999 não encontrado." |
| CT-Prod-008 | Buscar produto por ID não numérico | 1. Buscar produto por ID = "abc" | 400 Bad Request com mensagem: "ID do produto inválido. Deve ser um número positivo." |
| CT-Prod-009 | Atualizar produto com sucesso | 1. Enviar requisição PUT para produto existente com campos válidos | 200 OK com mensagem "Produto atualizado com sucesso!" |
| CT-Prod-010 | Excluir produto com sucesso | 1. Enviar requisição DELETE para produto existente | 200 OK com mensagem "Produto excluído com sucesso!" |
| CT-Prod-011 | Upload de imagem PNG válida | 1. Enviar arquivo PNG válido para rota de upload | 200 OK com mensagem "Upload da imagem realizado com sucesso!" |
| CT-Prod-012 | Upload de imagem não-PNG | 1. Enviar arquivo JPEG/GIF para rota de upload | 400 Bad Request com mensagem: "Apenas arquivos PNG são permitidos para imagem do produto." |
| CT-Prod-013 | Upload de imagem maior que 2MB | 1. Enviar arquivo PNG com tamanho &gt;2MB | 400 Bad Request com mensagem: "Arquivo muito grande. Tamanho máximo permitido: 2MB." |
| CT-Prod-014 | Listar produtos com paginação e filtros | 1. Testar parâmetros page, limit, search, category_id, supplier_id, sortBy, order | Lista de produtos e paginação correta |
| CT-Prod-015 | Tentar ordenar por campo não permitido | 1. Enviar sortBy=campo_invalido | 400 Bad Request com mensagem: "Campo de ordenação 'campo_invalido' não é permitido. Use: id, name, price, stock_quantity, sku, created_at." |

---

## 3. Categorias

| Caso de Teste | Descrição | Passos | Resultado Esperado |
|----------------|-----------|--------|--------------------|
| CT-Cat-001 | Criar categoria sem nome/descrição | 1. Tentar criar categoria sem enviar campos name ou description | 400 Bad Request com mensagem: "Nome e descrição são obrigatórios." |
| CT-Cat-002 | Criar categoria com descrição maior que 200 caracteres | 1. Tentar criar categoria com descrição &gt;200 caracteres | 400 Bad Request com mensagem: "Descrição deve ter no máximo 200 caracteres." |
| CT-Cat-003 | Criar categoria com sucesso | 1. Enviar requisição POST com campos válidos | 201 Created com mensagem "Categoria criada com sucesso!" |
| CT-Cat-004 | Atualizar categoria com sucesso | 1. Enviar requisição PUT para categoria existente com campos válidos | 200 OK com mensagem "Categoria atualizada com sucesso!" |
| CT-Cat-005 | Excluir categoria com sucesso | 1. Enviar requisição DELETE para categoria existente (não usada por produtos) | 200 OK com mensagem "Categoria excluída com sucesso!" |
| CT-Cat-006 | Tentar excluir categoria usada por produtos | 1. Tentar excluir categoria que já está associada a produtos | Erro com mensagem: "⚠️ Esta categoria não pode ser excluída pois está sendo usada por produtos. Primeiro remova ou altere a categoria dos produtos." |
| CT-Cat-007 | Listar categorias com paginação | 1. Testar parâmetros page, limit | Lista de categorias e paginação correta |

---

## 4. Fornecedores

| Caso de Teste | Descrição | Passos | Resultado Esperado |
|----------------|-----------|--------|--------------------|
| CT-For-001 | Criar fornecedor sem campos obrigatórios | 1. Tentar criar fornecedor sem enviar name, email, etc. | 400 Bad Request com mensagem de campos obrigatórios |
| CT-For-002 | Criar fornecedor com sucesso | 1. Enviar requisição POST com campos válidos | 201 Created com mensagem "Fornecedor criado com sucesso!" |
| CT-For-003 | Atualizar fornecedor com sucesso | 1. Enviar requisição PUT para fornecedor existente com campos válidos | 200 OK com mensagem "Fornecedor atualizado com sucesso!" |
| CT-For-004 | Excluir fornecedor com sucesso | 1. Enviar requisição DELETE para fornecedor existente (não usado por produtos) | 200 OK com mensagem "Fornecedor excluído com sucesso!" |
| CT-For-005 | Desvincular fornecedor de produtos | 1. Acessar modal desvincular fornecedor 2. Selecionar produtos 3. Confirmar | Mensagem de sucesso: "{count} produto(s) desvinculado(s) com sucesso!" |

---

## 5. Frontend

| Caso de Teste | Descrição | Passos | Resultado Esperado |
|----------------|-----------|--------|--------------------|
| CT-Front-001 | Formulário com validações frontend (Produto) | 1. Tentar enviar formulário com campos inválidos | Mensagens de erro exibidas em cada campo |
| CT-Front-002 | Formulário com validações frontend (Registro) | 1. Tentar enviar formulário de registro com senha fraca | Mensagens de erro exibidas em cada campo |
| CT-Front-003 | Toast de sucesso após ação válida | 1. Criar produto válido | Toast verde exibido com mensagem de sucesso |
| CT-Front-004 | Toast de erro após ação inválida | 1. Tentar criar produto com campos inválidos | Toast vermelho exibido com mensagem de erro |
