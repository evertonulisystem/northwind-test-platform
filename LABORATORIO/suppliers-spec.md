# User Story: Gestão de Fornecedores (POST, GET, DELETE)

## Descrição
Como usuário do sistema
Quero gerenciar os fornecedores (cadastrar, listar e excluir)
Para manter o controle da origem dos produtos e dados de contato dos parceiros comerciais

---

## Regras de Negócio

### Cadastro e Edição (POST/PUT)
- Razão social obrigatória e entre 3 e 100 caracteres (RN01)
- Nome do contato obrigatório e entre 5 e 80 caracteres (RN02)
- E-mail obrigatório, válido e único (RN03)
- Telefone obrigatório (RN04)
- CNPJ obrigatório, com 14 dígitos e único (RN05)
- UF obrigatória e com 2 letras (RN06)

---

## Critérios de Aceite

### POST - Validação de Campos Obrigatórios
**Cenário: Razão social ausente**
**Dado** que não informo a razão social
**Então** o sistema deve retornar status 400 e a mensagem "Razão social da empresa é obrigatória."

**Cenário: Nome do contato ausente**
**Dado** que não informo o nome do contato
**Então** o sistema deve retornar status 400 e a mensagem "Nome do contato é obrigatório."

**Cenário: E-mail ausente**
**Dado** que não informo o e-mail
**Então** o sistema deve retornar status 400 e a mensagem "E-mail do fornecedor é obrigatório."

### POST - Validação de Formato e Tamanho
**Cenário: E-mail inválido**
**Dado** que informo um e-mail com formato incorreto
**Então** o sistema deve retornar status 400 e a mensagem "E-mail inválido. Informe um e-mail válido."

**Cenário: Telefone inválido**
**Dado** que informo um telefone fora do padrão numérico (10-11 dígitos)
**Então** o sistema deve retornar status 400 e a mensagem "Telefone inválido. Informe apenas os números (10 ou 11 dígitos)."

**Cenário: CNPJ inválido**
**Dado** que informo um CNPJ sem 14 dígitos
**Então** o sistema deve retornar status 400 e a mensagem "CNPJ inválido. Informe apenas os 14 números do CNPJ."

**Cenário: UF inválida**
**Dado** que informo uma UF fora do padrão de 2 letras
**Então** o sistema deve retornar status 400 e a mensagem "UF inválida. Informe a sigla de 2 letras do estado (ex: SP, RJ, MG)."

### POST - Unicidade
**Cenário: E-mail duplicado**
**Dado** que o e-mail já existe no sistema
**Então** o sistema deve retornar status 409 e a mensagem "Já existe um fornecedor com este e-mail."

**Cenário: CNPJ duplicado**
**Dado** que o CNPJ já existe no sistema
**Então** o sistema deve retornar status 409 e a mensagem "Já existe um fornecedor com este CNPJ."

### GET/DELETE - Operações por ID
**Cenário: Fornecedor não encontrado**
**Dado** que informo um ID inexistente
**Então** o sistema deve retornar status 404 e a mensagem "Fornecedor com ID {id} não encontrado."

**Cenário: Exclusão bloqueada por uso**
**Dado** que o fornecedor possui produtos vinculados
**Então** o sistema deve retornar status 400 e a mensagem "Não é possível excluir. Este fornecedor está sendo usado por produtos."
