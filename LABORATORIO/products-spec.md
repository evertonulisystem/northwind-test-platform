# User Story: Gestão de Produtos (POST, GET, DELETE)

## Descrição
Como usuário do sistema
Quero gerenciar o catálogo de produtos (cadastrar, listar e excluir)
Para manter o inventário atualizado e disponível para os clientes

---

## Regras de Negócio

### Cadastro e Edição (POST/PUT/PATCH)
- Nome do produto entre 3 e 100 caracteres e único (RN01)
- Preço positivo maior que zero (RN02)
- Estoque inteiro maior ou igual a zero (RN03)
- SKU único e alfanumérico (6-20 caracteres) (RN04)
- Categoria e Fornecedor obrigatórios e existentes (RN05)

---

## Critérios de Aceite

### POST - Validação de Campos
**Cenário: Preço inválido**
**Dado** que informo um preço menor ou igual a zero
**Então** o sistema deve retornar status 400 e a mensagem "O preço deve ser um valor positivo maior que zero."

**Cenário: Estoque inválido**
**Dado** que informo um estoque negativo
**Então** o sistema deve retornar status 400 e a mensagem "A quantidade em estoque deve ser um número inteiro maior ou igual a zero."

**Cenário: Campos obrigatórios ausentes**
**Dado** que não informo um dos campos obrigatórios
**Então** o sistema deve retornar status 400 e a mensagem contendo "Campos obrigatórios não preenchidos:"

### GET/DELETE - Operações por ID
**Cenário: Produto não encontrado**
**Dado** que informo um ID inexistente
**Então** o sistema deve retornar status 404 e a mensagem "Produto com ID {id} não encontrado."

**Cenário: ID inválido**
**Dado** que informo um ID não numérico ou negativo
**Então** o sistema deve retornar status 400 e a mensagem "ID do produto inválido. Deve ser um número positivo."

### DELETE - Integridade
**Cenário: Exclusão bloqueada por vínculo**
**Dado** que o produto possui pedidos ou itens no carrinho
**Quando** tento excluir o produto
**Então** o sistema deve retornar status 500 e a mensagem "Não é possível excluir este produto pois existem pedidos ou itens no carrinho vinculados a ele."
