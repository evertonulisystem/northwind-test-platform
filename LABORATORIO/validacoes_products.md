# Validações do Endpoint de Produtos

1- POST /api/v1/products
. Campos Obrigatorios: name, price, stock_quantity, sku, category_id, supplier_id
. Mensagem de 'name' vazio: "Campos obrigatórios não preenchidos: name."
. Mensagem de 'sku' vazio: "Campos obrigatórios não preenchidos: sku."
. Mensagem de 'price' vazio: "Campos obrigatórios não preenchidos: price."
. Mensagem de 'stock_quantity' vazio: "Campos obrigatórios não preenchidos: stock_quantity."
. Mensagem de 'category_id' vazio: "Campos obrigatórios não preenchidos: category_id."
. Mensagem de 'supplier_id' vazio: "Campos obrigatórios não preenchidos: supplier_id."
. Mensagem de 'name' duplicado: "Já existe um produto com esse nome/slug."
. Mensagem de 'sku' duplicado: "Já existe um produto com esse SKU."
. Mensagem de 'price' inválido (<= 0): "O preço deve ser um valor positivo maior que zero."
. Mensagem de 'stock_quantity' inválido (< 0): "A quantidade em estoque deve ser um número inteiro maior ou igual a zero."
. Mensagem de 'category_id' inexistente: "Categoria selecionada não existe. Escolha uma categoria válida."
. Mensagem de 'supplier_id' inexistente: "Fornecedor selecionado não existe. Escolha um fornecedor válido."
. Mensagem de Token ausente: "Token ausente"
. Mensagem de Token inválido: "Token inválido"
. Mensagem de JSON inválido: "Dados inválidos. Verifique se todos os campos foram preenchidos corretamente."
. Mensagem de Corpo vazio: "Nenhum dado informado. Preencha os campos do produto."

2- GET /api/v1/products
. Filtros Disponiveis: page, limit, search, category_id, supplier_id, sortBy, order
. Mensagem de Sucesso: "Produtos carregados com sucesso."
. Mensagem de Filtro sem Resultado: "Nenhum produto encontrado para os filtros aplicados."
. Mensagem de 'sortBy' inválido: "Campo de ordenação '[campo]' não é permitido. Use: id, name, price, stock_quantity, sku, created_at."
. Mensagem de 'order' inválido: "Ordem '[valor]' não é permitida. Use: asc ou desc."
. Mensagem de Token ausente: "Token ausente"
. Mensagem de Token inválido: "Token inválido"
. Mensagem de Erro interno: "Erro interno ao carregar produtos."
