# User Story: Gestão de Categorias (POST, GET, DELETE)

## Descrição
Como usuário do sistema
Quero gerenciar as categorias de produtos (cadastrar, listar e excluir)
Para organizar os itens de forma estruturada e manter a taxonomia do sistema atualizada

---

## Regras de Negócio

### Cadastro e Edição (POST/PUT/PATCH)
- O nome da categoria deve ser único (RN01)
- O nome deve ter entre 3 e 100 caracteres (RN02)
- A descrição deve ter no máximo 200 caracteres no POST (RN03)
- Não é permitido cadastro com campos obrigatórios vazios (RN04)
- O sistema deve gerar um slug automaticamente baseado no nome (RN05)

### Listagem e Consulta (GET)
- A listagem geral suporta paginação (page, limit) (RN06)
- A consulta por ID deve validar se o ID é um número positivo (RN07)

### Exclusão (DELETE)
- Não é permitido excluir categorias que possuam produtos vinculados (RN08)

### Geral
- O sistema deve retornar erro em caso de violação das regras (RN09)
- O acesso aos endpoints deve ser autenticado via Bearer Token (RN10)

---

## Critérios de Aceite

### POST - Cadastro de Categoria
**Cenário: Campos obrigatórios ausentes**
**Dado** que não informo nome ou descrição
**Quando** realizo o cadastro
**Então** o sistema deve retornar status 400
**E** a mensagem "Nome e descrição são obrigatórios."

**Cenário: Descrição muito longa**
**Dado** que informo uma descrição com mais de 200 caracteres
**Quando** realizo o cadastro
**Então** o sistema deve retornar status 400
**E** a mensagem "Descrição deve ter no máximo 200 caracteres."

**Cenário: Nome fora do limite (Check Constraint)**
**Dado** que informo um nome fora do intervalo permitido (3 a 100 caracteres)
**Quando** o banco processa a requisição
**Então** o sistema deve retornar status 400
**E** a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

### GET - Detalhes da Categoria
**Cenário: ID inválido**
**Dado** que informo um ID que não é um número positivo
**Quando** realizo a consulta
**Então** o sistema deve retornar status 400
**E** a mensagem "ID da categoria inválido. Deve ser um número positivo."

**Cenário: Categoria não encontrada**
**Dado** que informo um ID que não existe
**Quando** realizo a consulta
**Então** o sistema deve retornar status 404
**E** a mensagem "Categoria com ID {id} não encontrada."

### DELETE - Exclusão de Categoria
**Cenário: Exclusão bloqueada por uso**
**Dado** que a categoria possui produtos vinculados
**Quando** tento excluir
**Então** o sistema deve retornar status 400
**E** a mensagem "Não é possível excluir. Esta categoria está sendo usada por produtos."

**Cenário: Erro de integridade referencial**
**Dado** que o banco bloqueia a exclusão por foreign key
**Quando** tento excluir
**Então** o sistema deve retornar status 500
**E** a mensagem "Não é possível excluir esta categoria pois existem produtos vinculados a ela."
