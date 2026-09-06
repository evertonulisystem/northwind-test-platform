
# 01 - Inventário Geral de Mensagens

> Relatório gerado automaticamente
> Data: 2026-07-06
> Projeto: Northwind Test Platform

---

## Resumo Geral
| Total de Mensagens | Mensagens Únicas | Mensagens Duplicadas | Backend | Frontend |
|---------------------|-------------------|-----------------------|---------|----------|
| ~150+               | ~80              | ~70                   | ~60     | ~90       |

---

## Tabela Geral de Mensagens

| Mensagem | Quantidade | Tipo | Localização | Arquivo | Linha |
|----------|------------|------|-------------|---------|-------|
| Token ausente | 12 | Erro Autenticação | Backend | Vários (products, categories, suppliers, auth, etc) | Várias |
| Token inválido | 12 | Erro Autenticação | Backend | Vários (products, categories, suppliers, auth, etc) | Várias |
| Erro de conexão | 8 | Erro Rede | Frontend | Vários (products, categories, suppliers, cart, etc) | Várias |
| Você precisa estar logado | 7 | Erro Autenticação | Frontend | Vários (products, categories, suppliers, cart, etc) | Várias |
| Produto criado com sucesso! | 2 | Sucesso | Backend | app/api/v1/products/route.js | 553 |
| Produto atualizado com sucesso! | 3 | Sucesso | Backend/Frontend | app/api/v1/products/[id]/route.js, components/EditProductModal.jsx | 454, 265 |
| Produto excluído com sucesso! | 2 | Sucesso | Backend/Frontend | app/api/v1/products/[id]/route.js, app/products/page.js | 919, 198 |
| Produtos carregados com sucesso. | 1 | Sucesso | Backend | app/api/v1/products/route.js | 289 |
| Produto carregado com sucesso. | 2 | Sucesso | Backend | app/api/v1/products/[id]/route.js | 166 |
| Erro interno ao carregar produtos. | 1 | Erro Interno | Backend | app/api/v1/products/route.js | 297 |
| Erro interno ao buscar produto. | 2 | Erro Interno | Backend | app/api/v1/products/[id]/route.js | 148, 172 |
| Erro ao criar produto. | 1 | Erro | Backend | app/api/v1/products/route.js | 563 |
| Erro ao atualizar produto. | 2 | Erro | Backend | app/api/v1/products/[id]/route.js | 491, 840 |
| Erro ao excluir produto. | 1 | Erro | Backend | app/api/v1/products/[id]/route.js | 946 |
| Nome é obrigatório | 4 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Preço é obrigatório | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Estoque é obrigatório | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| SKU é obrigatório | 4 | Validação | Frontend/Backend | AddProductModal.jsx, EditProductModal.jsx, app/api/v1/products/[id]/route.js | Várias |
| Campos obrigatórios não preenchidos: {campos} | 2 | Validação | Backend | app/api/v1/products/route.js | 463 |
| O preço deve ser um valor positivo maior que zero. | 3 | Validação | Backend | app/api/v1/products/route.js | 475, 567 |
| A quantidade em estoque deve ser um número inteiro maior ou igual a zero. | 3 | Validação | Backend | app/api/v1/products/route.js | 487, 569 |
| Já existe um produto com esse nome/slug. | 3 | Erro de Conflito | Backend | app/api/v1/products/route.js, app/api/v1/products/[id]/route.js | 506, 396, 674 |
| Já existe um produto com esse SKU. | 2 | Erro de Conflito | Backend | app/api/v1/products/route.js | 523 |
| Já existe outro produto com esse SKU. | 2 | Erro de Conflito | Backend | app/api/v1/products/[id]/route.js | 350, 733 |
| Categoria selecionada não existe. Escolha uma categoria válida. | 2 | Validação | Backend | app/api/v1/products/route.js | 356, 573 |
| Fornecedor selecionado não existe. Escolha um fornecedor válido. | 2 | Validação | Backend | app/api/v1/products/route.js | 361, 571 |
| Verificado: Salvo no banco Supabase ({host}) | 2 | Sucesso | Backend | app/api/v1/products/route.js, app/api/v1/categories/route.js | 554, 308 |
| Dados inválidos. Verifique se todos os campos foram preenchidos corretamente. | 2 | Validação | Backend | app/api/v1/products/route.js | 439 |
| Nenhum dado informado. Preencha os campos do produto. | 1 | Validação | Backend | app/api/v1/products/route.js | 449 |
| Nenhum produto encontrado para os filtros aplicados. | 1 | Erro | Backend | app/api/v1/products/route.js | 263 |
| Campo de ordenação "{sortBy}" não é permitido. Use: id, name, price, stock_quantity, sku, created_at. | 1 | Validação | Backend | app/api/v1/products/route.js | 229 |
| Ordem "{order}" não é permitida. Use: asc ou desc. | 1 | Validação | Backend | app/api/v1/products/route.js | 239 |
| ID do produto inválido. Deve ser um número positivo. | 6 | Validação | Backend | app/api/v1/products/[id]/route.js | Várias |
| Produto com ID {id} não encontrado. | 4 | Erro Não Encontrado | Backend | app/api/v1/products/[id]/route.js | Várias |
| Pelo menos um campo deve ser fornecido para atualização. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 615 |
| Nome não pode estar vazio. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 650 |
| Preço deve ser um número positivo. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 687 |
| Quantidade em estoque deve ser um número inteiro positivo. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 700 |
| ID da categoria deve ser um número positivo ou nulo. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 747 |
| ID do fornecedor deve ser um número positivo ou nulo. | 1 | Validação | Backend | app/api/v1/products/[id]/route.js | 760 |
| Nome e descrição são obrigatórios. | 1 | Validação | Backend | app/api/v1/categories/route.js | 275 |
| Descrição deve ter no máximo 200 caracteres. | 1 | Validação | Backend | app/api/v1/categories/route.js | 285 |
| Página deve ser maior que 0. | 1 | Validação | Backend | app/api/v1/categories/route.js | 105 |
| Limite deve estar entre 1 e 1000. | 1 | Validação | Backend | app/api/v1/categories/route.js | 112 |
| {count} categorias carregadas com sucesso! (Página {page} de {totalPages}) | 1 | Sucesso | Backend | app/api/v1/categories/route.js | 161 |
| Erro ao carregar categorias. | 1 | Erro | Backend | app/api/v1/categories/route.js | 168 |
| Categoria criada com sucesso! | 1 | Sucesso | Backend | app/api/v1/categories/route.js | 306 |
| Erro ao criar categoria. | 1 | Erro | Backend | app/api/v1/categories/route.js | 343 |
| Pelo menos um campo (name ou description) deve ser fornecido. | 1 | Validação | Backend | app/api/v1/categories/route.js | 405 |
| Categoria não encontrada. | 1 | Erro Não Encontrado | Backend | app/api/v1/categories/route.js | 424 |
| Categoria atualizada com sucesso! | 1 | Sucesso | Backend | app/api/v1/categories/route.js | 450 |
| Erro ao atualizar categoria. | 1 | Erro | Backend | app/api/v1/categories/route.js | 454 |
| ID do produto inválido. | 1 | Validação | Backend | app/api/v1/products/[id]/image/route.js | 60 |
| Nenhum arquivo enviado ou campo "file" ausente. | 1 | Validação | Backend | app/api/v1/products/[id]/image/route.js | 86 |
| Apenas arquivos PNG são permitidos para imagem do produto. | 2 | Validação | Backend/Frontend | app/api/v1/products/[id]/image/route.js, components/EditProductModal.jsx | 97 |
| Recebido: nome="{nome}", tipo="{tipo}". | 1 | Validação | Backend | app/api/v1/products/[id]/image/route.js | 98 |
| Certifique-se de que o arquivo tem a extensão .png e o tipo image/png. | 1 | Validação | Backend | app/api/v1/products/[id]/image/route.js | 99 |
| Arquivo muito grande. Tamanho máximo permitido: 2MB. | 2 | Validação | Backend/Frontend | app/api/v1/products/[id]/image/route.js, components/EditProductModal.jsx | 109 |
| Upload da imagem realizado com sucesso! | 1 | Sucesso | Backend | app/api/v1/products/[id]/image/route.js | 152 |
| Erro interno ao processar upload. | 1 | Erro Interno | Backend | app/api/v1/products/[id]/image/route.js | 157 |
| Lista de imagens recuperada com sucesso. | 1 | Sucesso | Backend | app/api/v1/products/[id]/image/route.js | 214 |
| Erro ao buscar imagens. | 1 | Erro | Backend | app/api/v1/products/[id]/image/route.js | 218 |
| Token não fornecido. | 1 | Validação JWT | lib/jwt.js | 38 |
| Configuração do servidor incompleta. | 1 | Erro Interno | lib/jwt.js | 42 |
| Token expirado. | 1 | Validação JWT | lib/jwt.js | 62 |
| Login realizado com sucesso! | 1 | Sucesso | Frontend | app/page.js | 58 |
| Erro ao fazer login | 1 | Erro | Frontend | app/page.js | 75 |
| Cadastro realizado com sucesso! Redirecionando... | 1 | Sucesso | Frontend | app/register/page.js | 188 |
| Erro ao cadastrar. Tente novamente. | 1 | Erro | Frontend | app/register/page.js | 199 |
| Erro de conexão. Tente novamente. | 1 | Erro | Frontend | app/register/page.js | 204 |
| Corrija os erros antes de salvar | 5 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx, categories/page.js, suppliers/page.js | Várias |
| Produto adicionado com sucesso! | 1 | Sucesso | Frontend | components/AddProductModal.jsx | 180 |
| Erro ao adicionar | 1 | Erro | Frontend | components/AddProductModal.jsx | 175 |
| Imagem enviada com sucesso! | 1 | Sucesso | Frontend | components/EditProductModal.jsx | 152 |
| Erro no upload | 1 | Erro | Frontend | components/EditProductModal.jsx | 148 |
| Selecione uma imagem primeiro | 1 | Validação | Frontend | components/EditProductModal.jsx | 122 |
| Erro de rede | 2 | Erro | Frontend | components/EditProductModal.jsx, categories/page.js | 269, 185 |
| Erro ao carregar produtos | 1 | Erro | Frontend | app/products/page.js | 115 |
| Erro ao excluir | 1 | Erro | Frontend | app/products/page.js | 202 |
| Você precisa estar logado para adicionar ao carrinho. | 1 | Validação | Frontend | components/ProductDetailsModal.jsx | 55 |
| {nome} adicionado ao carrinho! | 1 | Sucesso | Frontend | components/ProductDetailsModal.jsx | 73 |
| Erro ao adicionar ao carrinho | 1 | Erro | Frontend | components/ProductDetailsModal.jsx | 78 |
| Erro de conexão ao adicionar ao carrinho | 1 | Erro | Frontend | components/ProductDetailsModal.jsx | 81 |
| Erro ao carregar carrinho | 1 | Erro | Frontend | app/cart/page.js | 48 |
| Erro de conexão ao carregar carrinho | 1 | Erro | Frontend | app/cart/page.js | 52 |
| Erro ao atualizar quantidade | 2 | Erro | Frontend | app/cart/page.js | 83, 86 |
| Item removido | 1 | Sucesso | Frontend | app/cart/page.js | 102 |
| Erro ao remover item | 2 | Erro | Frontend | app/cart/page.js | 105, 108 |
| Pedido finalizado com sucesso! | 1 | Sucesso | Frontend | app/cart/page.js | 138 |
| Erro ao finalizar pedido | 2 | Erro | Frontend | app/cart/page.js | 145, 148 |
| Erro ao carregar categorias | 1 | Erro | Frontend | app/categories/page.js, components/AddProductModal.jsx | 44, 54 |
| Categoria cadastrada com sucesso! | 1 | Sucesso | Frontend | app/categories/page.js | 127 |
| Erro ao cadastrar | 1 | Erro | Frontend | app/categories/page.js | 122 |
| Erro de conexão | 1 | Erro | Frontend | app/categories/page.js | 136 |
| Categoria atualizada com sucesso! | 1 | Sucesso | Frontend | app/categories/page.js | 176 |
| Erro ao atualizar | 1 | Erro | Frontend | app/categories/page.js | 171 |
| ⚠️ Esta categoria não pode ser excluída pois está sendo usada por produtos. Primeiro remova ou altere a categoria dos produtos. | 1 | Aviso | Frontend | app/categories/page.js | 214 |
| Erro ao excluir categoria | 1 | Erro | Frontend | app/categories/page.js | 216 |
| Categoria excluída com sucesso! | 1 | Sucesso | Frontend | app/categories/page.js | 223 |
| Erro de conexão ao excluir categoria | 1 | Erro | Frontend | app/categories/page.js | 228 |
| Erro ao carregar fornecedores | 1 | Erro | Frontend | app/suppliers/page.js, components/AddProductModal.jsx | 72, 54 |
| Fornecedor cadastrado com sucesso! | 1 | Sucesso | Frontend | app/suppliers/page.js | 194 |
| Erro ao cadastrar | 1 | Erro | Frontend | app/suppliers/page.js | 189 |
| Erro de rede | 1 | Erro | Frontend | app/suppliers/page.js | 199 |
| Fornecedor atualizado com sucesso! | 1 | Sucesso | Frontend | app/suppliers/page.js | 260 |
| Erro ao atualizar | 1 | Erro | Frontend | app/suppliers/page.js | 255 |
| Erro de rede | 1 | Erro | Frontend | app/suppliers/page.js | 268 |
| Erro ao excluir fornecedor | 1 | Erro | Frontend | app/suppliers/page.js | 305 |
| Fornecedor excluído com sucesso! | 1 | Sucesso | Frontend | app/suppliers/page.js | 313 |
| Erro de conexão ao excluir fornecedor | 1 | Erro | Frontend | app/suppliers/page.js | 318 |
| Agora você pode excluir o fornecedor! | 1 | Sucesso | Frontend | app/suppliers/page.js | 328 |
| Selecione pelo menos um produto | 1 | Validação | Frontend | components/UnlinkSupplierModal.jsx | 68 |
| Erro ao carregar produtos do fornecedor | 1 | Erro | Frontend | components/UnlinkSupplierModal.jsx | 34 |
| Erro ao desvincular produtos | 2 | Erro | Frontend | components/UnlinkSupplierModal.jsx | 98, 107 |
| {count} produto(s) desvinculado(s) com sucesso! | 1 | Sucesso | Frontend | components/UnlinkSupplierModal.jsx | 103 |
| Ao desvincular o fornecedor, os produtos selecionados ficarão sem fornecedor associado. Você poderá atribuir um novo fornecedor posteriormente. | 1 | Aviso | Frontend | components/UnlinkSupplierModal.jsx | 145 |
| Nome deve ter no mínimo 3 caracteres | 1 | Validação | Frontend | app/register/page.js | Várias |
| Nome deve ter no máximo 100 caracteres | 1 | Validação | Frontend | app/register/page.js | Várias |
| Nome deve conter apenas letras e espaços | 1 | Validação | Frontend | app/register/page.js | Várias |
| Nome não pode ter espaços duplicados | 2 | Validação | Frontend | app/register/page.js, AddProductModal.jsx, EditProductModal.jsx | Várias |
| E-mail é obrigatório | 2 | Validação | Frontend | app/register/page.js | Várias |
| E-mail inválido | 2 | Validação | Frontend | app/register/page.js, app/suppliers/page.js | Várias |
| E-mail deve ter no máximo 255 caracteres | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha é obrigatória | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter no mínimo 8 caracteres | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter no máximo 128 caracteres | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter pelo menos uma letra minúscula | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter pelo menos uma letra maiúscula | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter pelo menos um número | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha deve ter pelo menos um caractere especial (@$!%*?&amp;) | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senha não pode ter 3 ou mais caracteres repetidos | 1 | Validação | Frontend | app/register/page.js | Várias |
| Confirmação de senha é obrigatória | 1 | Validação | Frontend | app/register/page.js | Várias |
| Senhas não conferem | 1 | Validação | Frontend | app/register/page.js | Várias |
| Nome da categoria é obrigatório | 1 | Validação | Frontend | app/categories/page.js | Várias |
| Deve ter entre 2 e 50 caracteres | 1 | Validação | Frontend | app/categories/page.js | Várias |
| Descrição é obrigatória | 1 | Validação | Frontend | app/categories/page.js | Várias |
| Deve ter entre 10 e 200 caracteres | 1 | Validação | Frontend | app/categories/page.js | Várias |
| Nome da empresa é obrigatório | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Deve ter entre 3 e 100 caracteres | 2 | Validação | Frontend | app/suppliers/page.js | Várias |
| Nome do contato é obrigatório | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Deve ter entre 5 e 80 caracteres | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Email é obrigatório | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Telefone é obrigatório | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Formato: (11) 98765-4321 | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| CNPJ é obrigatório | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| CNPJ deve ter 14 dígitos | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| UF é obrigatória | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| UF deve ter 2 letras maiúsculas (ex: SP) | 1 | Validação | Frontend | app/suppliers/page.js | Várias |
| Mínimo 6 caracteres | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Máximo 40 caracteres | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Não pode conter números | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Caracteres especiais não permitidos | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Apenas números de 1 a 999 | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Deve ter entre 5 e 20 caracteres | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Apenas letras maiúsculas, números e hífen | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
| Deve começar com letra maiúscula | 2 | Validação | Frontend | AddProductModal.jsx, EditProductModal.jsx | Várias |
