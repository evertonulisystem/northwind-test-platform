# Roteiro Aula 18: Como as Regras de Negócio se Transformam em Dados no Banco

---

## Objetivo da Aula
> Vamos pegar a US-08 (Cadastro de Produto) que já conhecemos e fazer uma **"ponte mental"** entre as regras de negócio e o que acontece no banco de dados. Não vamos entrar em detalhes técnicos (ainda!), mas sim **instigar a curiosidade** sobre *onde* e *como* essas regras se materializam.

---

## Passo 1: Revisão Rápida da US-08
Primeiro, vamos lembrar o que a US-08 pede:
- Cadastrar produtos
- Campos obrigatórios: Nome, Preço, Estoque, SKU, Categoria, Fornecedor
- Muitas regras de validação (tamanho, formato, etc.)
- Apenas admins logados podem fazer isso

---

## Passo 2: O Grande Questionamento Didático
> 🤔 Se o sistema precisa lembrar de um produto *forever* (mesmo fechando o navegador), onde ele guarda isso?
> **R: Em um banco de dados!**

Agora, vamos **desconstruir a US-08** para ver *o que* precisamos armazenar:

---

## Passo 3: Comparativo Didático: Regras de Negócio vs. "O que Vai pro Banco"

Vamos usar a tabela abaixo como guia. **Lembre-se: ainda não vamos falar de PK, FK ou tipos de dados — só de "coisas que precisamos lembrar"!**

| **Da US-08 (Regra de Negócio)** | **O que Isso Significa para o Banco? (Instigação)** |
|----------------------------------|-----------------------------------------------------|
| "Quero cadastrar novos produtos" | Precisamos de um lugar *especial* para guardar produtos. Vamos chamar isso de **tabela de produtos**? 🤔 |
| "Nome do produto obrigatório"    | Se o nome é obrigatório, o banco *não pode deixar ninguém salvar um produto sem nome*. Algo como "esse campo é obrigatório" existe no banco? |
| "Nome: 6 a 40 caracteres"        | O banco precisa "controlar" o tamanho do texto — não pode deixar salvar um nome de 100 letras! |
| "Preço obrigatório e positivo"   | Preço é um número, não texto. O banco precisa entender a diferença e não deixar valores negativos/zerados! |
| "Estoque: 1 a 999"               | Outro número, com limites. O banco vai guardar quantas unidades temos. |
| "SKU único e com formato"        | O SKU é o "CPF do produto" — nenhum produto pode ter o mesmo! O banco precisa lembrar disso para não confundir produtos. |
| "Selecionar uma Categoria"       | Categorias são coisas *separadas* (ex: "Eletrônicos", "Móveis"). Se temos 100 produtos na mesma categoria, não queremos escrever "Eletrônicos" 100 vezes! Vamos ter uma **tabela de categorias** e "ligar" cada produto a uma categoria? 🤯 |
| "Selecionar um Fornecedor"       | Mesma ideia das categorias! Fornecedores são entidades separadas (tem nome, CNPJ, etc.). Vamos ter uma **tabela de fornecedores** e "ligar" produtos a fornecedores? |
| "Apenas admins logados"          | Precisamos lembrar *quem* cadastrou o produto? Ou pelo menos saber se a pessoa tem permissão? Talvez uma **tabela de usuários**? |

---

## Passo 4: Vamos Visualizar (Sem Detalhes Técnicos!)
Imagine um quadro branco com 3 listas:
1. **Lista de Produtos**: Cada item tem Nome, Preço, Estoque, SKU, uma "referência" a uma categoria e uma "referência" a um fornecedor.
2. **Lista de Categorias**: Cada item tem Nome, Descrição.
3. **Lista de Fornecedores**: Cada item tem Nome Fantasia, CNPJ, Email, Telefone.

> 🤔 Por que separar? Porque se mudarmos o nome da categoria "Eletrônicos" para "Eletrônicos e Gadgets", não precisamos editar 100 produtos — só editamos um item na Lista de Categorias! Isso é inteligente, não?

---

## Passo 5: Instigação para a Próxima Seção!
Agora que temos essa visão, nas próximas aulas vamos aprender:
1. **Aula 19**: O que são tabelas, campos e registros?
2. **Aula 20**: Como "ligar" a Lista de Produtos com a Lista de Categorias (isso se chama *relacionamento*!).
3. **Aula 21**: Ver o banco de dados *real* do nosso projeto e identificar tudo o que imaginamos aqui!

---

## Exercício de "Preparação Mental" para os Alunos
Antes da próxima aula, peça aos alunos que:
1. Acessem a página de Categorias do projeto
2. Acessem a página de Fornecedores
3. Escrevam 3 coisas que acham que precisam ser "lembradas" pelo banco para Categorias e 3 para Fornecedores

Isso vai fazer com que eles já cheguem na Aula 19 com a mente "aquecida"!
