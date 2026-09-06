# US-08 a US-10: Cadastro de Produto, Categoria e Fornecedor (BDD Completo em Português)

---

## User Story Produto
Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novos produtos** para que eu possa **gerenciar o estoque** e **disponibilizar produtos para venda**.

## User Story Categoria
Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novas categorias** para organizar os produtos do catálogo.

## User Story Fornecedor
Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novos fornecedores** para manter o cadastro de quem nos abastece.

---

## Critérios de Aceite

### **Critério 1 – Nome do Produto Obrigatório**
Dado que estou no campo Nome
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Nome é obrigatório"

### **Critério 2 – Nome do Produto Muito Curto**
Dado que estou no campo Nome
Quando informo um valor com menos de 6 caracteres
Então devo ver a mensagem "Mínimo 6 caracteres"

### **Critério 3 – Nome do Produto Muito Longo**
Dado que estou no campo Nome
Quando informo um valor com mais de 40 caracteres
Então devo ver a mensagem "Máximo 40 caracteres"

### **Critério 4 – Nome do Produto com Números**
Dado que estou no campo Nome
Quando informo um valor contendo números
Então devo ver a mensagem "Não pode conter números"

### **Critério 5 – Nome do Produto com Caracteres Especiais**
Dado que estou no campo Nome
Quando informo um valor com caracteres especiais (exceto espaços)
Então devo ver a mensagem "Caracteres especiais não permitidos"

### **Critério 6 – Nome do Produto com Espaços Duplicados**
Dado que estou no campo Nome
Quando informo um valor com espaços duplicados
Então devo ver a mensagem "Não pode ter espaços duplicados"

### **Critério 7 – Nome do Produto Já Existe**
Dado que já existe um produto com nome "Cadeira Gamer"
Quando tento cadastrar um novo produto com nome "Cadeira Gamer"
Então devo ver a mensagem "Já existe um produto com esse nome/slug"

### **Critério 8 – Preço Obrigatório**
Dado que estou no campo Preço
Quando informo um valor vazio
Então devo ver a mensagem "Preço é obrigatório"

### **Critério 9 – Preço Inválido (Não é Número ou <= 0)**
Dado que estou no campo Preço
Quando informo um valor que não é número ou é menor/igual a zero
Então devo ver a mensagem "Deve ser um valor positivo"

### **Critério 10 – Preço Muito Grande (> 999999.99)**
Dado que estou no campo Preço
Quando informo um valor maior que 999999.99
Então devo ver mensagem de erro correspondente

### **Critério 11 – Estoque Obrigatório**
Dado que estou no campo Estoque
Quando informo um valor vazio
Então devo ver a mensagem "Estoque é obrigatório"

### **Critério 12 – Estoque Inválido (Não é Número ou Fora do Intervalo 1-999)**
Dado que estou no campo Estoque
Quando informo um valor que não é número ou está fora do intervalo 1-999
Então devo ver a mensagem "Apenas números de 1 a 999"

### **Critério 13 – SKU Obrigatório**
Dado que estou no campo SKU
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "SKU é obrigatório"

### **Critério 14 – SKU com Tamanho Inválido**
Dado que estou no campo SKU
Quando informo um valor com menos de 5 ou mais de 20 caracteres
Então devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

### **Critério 15 – SKU com Formato Inválido**
Dado que estou no campo SKU
Quando informo um valor contendo caracteres diferentes de letras maiúsculas, números e hífen
Então devo ver a mensagem "Apenas letras maiúsculas, números e hífen"

### **Critério 16 – SKU Não Começa com Letra Maiúscula**
Dado que estou no campo SKU
Quando informo um valor que não começa com letra maiúscula
Então devo ver a mensagem "Deve começar com letra maiúscula"

### **Critério 17 – SKU Já Existe**
Dado que já existe um produto com SKU "MGP-2024"
Quando tento cadastrar um novo produto com SKU "MGP-2024"
Então devo ver a mensagem "Já existe um produto com esse SKU"

### **Critério 18 – Categoria Obrigatória**
Dado que estou no campo Categoria
Quando não seleciono nenhuma categoria
Então devo ver o campo destacado como obrigatório

### **Critério 19 – Categoria Inexistente**
Dado que estou cadastrando um produto
Quando seleciono uma categoria que não existe no sistema
Então devo ver a mensagem "Categoria selecionada não existe. Escolha uma categoria válida."

### **Critério 20 – Fornecedor Obrigatório**
Dado que estou no campo Fornecedor
Quando não seleciono nenhum fornecedor
Então devo ver o campo destacado como obrigatório

### **Critério 21 – Fornecedor Inexistente**
Dado que estou cadastrando um produto
Quando seleciono um fornecedor que não existe no sistema
Então devo ver a mensagem "Fornecedor selecionado não existe. Escolha um fornecedor válido."

### **Critério 22 – Cadastro de Produto com Sucesso**
Dado que preenchi todos os campos corretamente
Quando clico em "Adicionar"
Então devo ver mensagem "Produto adicionado com sucesso!"
E o modal deve fechar automaticamente
E o produto deve aparecer na listagem de produtos

### **Critério 23 – Limpeza de Erros ao Digitar (Produto)**
Dado que um campo está com erro de validação
Quando começo a digitar nesse campo
Então a mensagem de erro deve desaparecer imediatamente

### **Critério 24 – Validação de Autenticação (Produto)**
Dado que não estou logado no sistema
Quando tento adicionar um produto
Então devo ver mensagem "Você precisa estar logado para adicionar produtos"

### **Critério 25 – Tratamento de Erro de Conexão (Produto)**
Dado que estou com problemas de conexão
Quando tento adicionar um produto
Então devo ver mensagem "Erro de conexão"

---

### **Critério 26 – Nome da Categoria Obrigatório**
Dado que estou no campo Nome da Categoria
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Nome e descrição são obrigatórios."

### **Critério 27 – Descrição da Categoria Obrigatória**
Dado que estou no campo Descrição da Categoria
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Nome e descrição são obrigatórios."

### **Critério 28 – Nome da Categoria Muito Curto**
Dado que estou no campo Nome da Categoria
Quando informo um valor com menos de 3 caracteres
Então devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

### **Critério 29 – Nome da Categoria Muito Longo**
Dado que estou no campo Nome da Categoria
Quando informo um valor com mais de 100 caracteres
Então devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

### **Critério 30 – Nome da Categoria Já Existe**
Dado que já existe uma categoria com nome "Eletrônicos"
Quando tento cadastrar uma nova categoria com nome "Eletrônicos"
Então devo ver a mensagem "Já existe uma categoria com este nome."

### **Critério 31 – Descrição da Categoria Muito Longa**
Dado que estou no campo Descrição da Categoria
Quando informo um valor com mais de 500 caracteres
Então devo ver a mensagem "Descrição da categoria deve ter no máximo 500 caracteres."

### **Critério 32 – Cadastro de Categoria com Sucesso**
Dado que preenchi todos os campos da categoria corretamente
Quando clico em "Salvar"
Então devo ver mensagem "Categoria criada com sucesso!"
E a categoria deve aparecer na listagem de categorias

---

### **Critério 33 – Razão Social do Fornecedor Obrigatória**
Dado que estou no campo Razão Social do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Razão social da empresa é obrigatória."

### **Critério 34 – Razão Social do Fornecedor Muito Curta**
Dado que estou no campo Razão Social do Fornecedor
Quando informo um valor com menos de 3 caracteres
Então devo ver a mensagem "Razão social deve ter no mínimo 3 caracteres."

### **Critério 35 – Razão Social do Fornecedor Muito Longa**
Dado que estou no campo Razão Social do Fornecedor
Quando informo um valor com mais de 100 caracteres
Então devo ver a mensagem "Razão social deve ter no máximo 100 caracteres."

### **Critério 36 – Nome do Contato do Fornecedor Obrigatório**
Dado que estou no campo Nome do Contato do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Nome do contato é obrigatório."

### **Critério 37 – Nome do Contato do Fornecedor Muito Curto**
Dado que estou no campo Nome do Contato do Fornecedor
Quando informo um valor com menos de 5 caracteres
Então devo ver a mensagem "Nome do contato deve ter no mínimo 5 caracteres."

### **Critério 38 – Nome do Contato do Fornecedor Muito Longo**
Dado que estou no campo Nome do Contato do Fornecedor
Quando informo um valor com mais de 80 caracteres
Então devo ver a mensagem "Nome do contato deve ter no máximo 80 caracteres."

### **Critério 39 – E-mail do Fornecedor Obrigatório**
Dado que estou no campo E-mail do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "E-mail do fornecedor é obrigatório."

### **Critério 40 – E-mail do Fornecedor Inválido**
Dado que estou no campo E-mail do Fornecedor
Quando informo um valor que não é um e-mail válido
Então devo ver a mensagem "E-mail inválido. Informe um e-mail válido."

### **Critério 41 – Telefone do Fornecedor Obrigatório**
Dado que estou no campo Telefone do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "Telefone do fornecedor é obrigatório."

### **Critério 42 – CNPJ do Fornecedor Obrigatório**
Dado que estou no campo CNPJ do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "CNPJ do fornecedor é obrigatório."

### **Critério 43 – CNPJ do Fornecedor Inválido**
Dado que estou no campo CNPJ do Fornecedor
Quando informo um valor que não segue o formato de 14 números
Então devo ver mensagem de erro correspondente

### **Critério 44 – UF do Fornecedor Obrigatória**
Dado que estou no campo UF do Fornecedor
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "UF do fornecedor é obrigatória."

### **Critério 45 – Cadastro de Fornecedor com Sucesso**
Dado que preenchi todos os campos do fornecedor corretamente
Quando clico em "Salvar"
Então devo ver mensagem de sucesso
E o fornecedor deve aparecer na listagem de fornecedores

---

## 📋 Capítulo de Critérios de Aceite (Gherkin)

### Feature: Cadastro de Produto
```gherkin
Feature: Cadastro de Produto
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novos produtos
  Para que eu possa gerenciar o estoque e disponibilizar produtos para venda

  Contexto:
    Dado que estou autenticado como administrador

  Esquema de Cenário: Nome do produto obrigatório
    Dado que estou no campo Nome do produto
    Quando informo um valor <valor_nome>
    Então devo ver a mensagem "Nome é obrigatório"
    Exemplos:
      | valor_nome |
      | ""         |
      | "   "      |

  Cenário: Nome do produto muito curto
    Dado que estou no campo Nome do produto
    Quando informo um valor com menos de 6 caracteres
    Então devo ver a mensagem "Mínimo 6 caracteres"

  Cenário: Nome do produto muito longo
    Dado que estou no campo Nome do produto
    Quando informo um valor com mais de 40 caracteres
    Então devo ver a mensagem "Máximo 40 caracteres"

  Cenário: Nome do produto com números
    Dado que estou no campo Nome do produto
    Quando informo um valor contendo números
    Então devo ver a mensagem "Não pode conter números"

  Cenário: Nome do produto com caracteres especiais
    Dado que estou no campo Nome do produto
    Quando informo um valor com caracteres especiais (exceto espaços)
    Então devo ver a mensagem "Caracteres especiais não permitidos"

  Cenário: Nome do produto com espaços duplicados
    Dado que estou no campo Nome do produto
    Quando informo um valor com espaços duplicados
    Então devo ver a mensagem "Não pode ter espaços duplicados"

  Cenário: Nome do produto já existe
    Dado que já existe um produto com nome "Cadeira Gamer"
    Quando tento cadastrar um novo produto com nome "Cadeira Gamer"
    Então devo ver a mensagem "Já existe um produto com esse nome/slug"

  Cenário: Preço do produto obrigatório
    Dado que estou no campo Preço do produto
    Quando informo um valor vazio
    Então devo ver a mensagem "Preço é obrigatório"

  Cenário: Preço do produto inválido (não é número)
    Dado que estou no campo Preço do produto
    Quando informo um valor que não é número
    Então devo ver a mensagem "Deve ser um valor positivo"

  Cenário: Preço do produto inválido (menor ou igual a zero)
    Dado que estou no campo Preço do produto
    Quando informo um valor menor ou igual a zero
    Então devo ver a mensagem "Deve ser um valor positivo"

  Cenário: Preço do produto muito grande
    Dado que estou no campo Preço do produto
    Quando informo um valor maior que 999999.99
    Então devo ver mensagem de erro correspondente

  Cenário: Estoque do produto obrigatório
    Dado que estou no campo Estoque do produto
    Quando informo um valor vazio
    Então devo ver a mensagem "Estoque é obrigatório"

  Cenário: Estoque do produto inválido (não é número)
    Dado que estou no campo Estoque do produto
    Quando informo um valor que não é número
    Então devo ver a mensagem "Apenas números de 1 a 999"

  Cenário: Estoque do produto inválido (menor que 1)
    Dado que estou no campo Estoque do produto
    Quando informo um valor menor que 1
    Então devo ver a mensagem "Apenas números de 1 a 999"

  Cenário: Estoque do produto inválido (maior que 999)
    Dado que estou no campo Estoque do produto
    Quando informo um valor maior que 999
    Então devo ver a mensagem "Apenas números de 1 a 999"

  Esquema de Cenário: SKU do produto obrigatório
    Dado que estou no campo SKU do produto
    Quando informo um valor <valor_sku>
    Então devo ver a mensagem "SKU é obrigatório"
    Exemplos:
      | valor_sku |
      | ""        |
      | "   "     |

  Cenário: SKU do produto com tamanho inválido (menor que 5)
    Dado que estou no campo SKU do produto
    Quando informo um valor com menos de 5 caracteres
    Então devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

  Cenário: SKU do produto com tamanho inválido (maior que 20)
    Dado que estou no campo SKU do produto
    Quando informo um valor com mais de 20 caracteres
    Então devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

  Cenário: SKU do produto com formato inválido
    Dado que estou no campo SKU do produto
    Quando informo um valor contendo caracteres diferentes de letras maiúsculas, números e hífen
    Então devo ver a mensagem "Apenas letras maiúsculas, números e hífen"

  Cenário: SKU do produto não começa com letra maiúscula
    Dado que estou no campo SKU do produto
    Quando informo um valor que não começa com letra maiúscula
    Então devo ver a mensagem "Deve começar com letra maiúscula"

  Cenário: SKU do produto já existe
    Dado que já existe um produto com SKU "MGP-2024"
    Quando tento cadastrar um novo produto com SKU "MGP-2024"
    Então devo ver a mensagem "Já existe um produto com esse SKU"

  Cenário: Categoria do produto obrigatória
    Dado que estou no campo Categoria do produto
    Quando não seleciono nenhuma categoria
    Então devo ver o campo destacado como obrigatório

  Cenário: Categoria do produto inexistente
    Dado que estou cadastrando um produto
    Quando seleciono uma categoria que não existe no sistema
    Então devo ver a mensagem "Categoria selecionada não existe. Escolha uma categoria válida."

  Cenário: Fornecedor do produto obrigatório
    Dado que estou no campo Fornecedor do produto
    Quando não seleciono nenhum fornecedor
    Então devo ver o campo destacado como obrigatório

  Cenário: Fornecedor do produto inexistente
    Dado que estou cadastrando um produto
    Quando seleciono um fornecedor que não existe no sistema
    Então devo ver a mensagem "Fornecedor selecionado não existe. Escolha um fornecedor válido."

  Cenário: Cadastro de produto com sucesso
    Dado que preenchi todos os campos do produto corretamente
    E a categoria selecionada existe
    E o fornecedor selecionado existe
    Quando clico em "Adicionar"
    Então devo ver mensagem "Produto adicionado com sucesso!"
    E o modal deve fechar automaticamente
    E o produto deve aparecer na listagem de produtos

  Cenário: Limpeza de erros ao digitar no cadastro de produto
    Dado que um campo do produto está com erro de validação
    Quando começo a digitar nesse campo
    Então a mensagem de erro deve desaparecer imediatamente

  Cenário: Tentativa de cadastro de produto sem autenticação
    Dado que não estou logado no sistema
    Quando tento adicionar um produto
    Então devo ver mensagem "Você precisa estar logado para adicionar produtos"

  Cenário: Tratamento de erro de conexão no cadastro de produto
    Dado que estou com problemas de conexão
    Quando tento adicionar um produto
    Então devo ver mensagem "Erro de conexão"
```

---

### Feature: Cadastro de Categoria
```gherkin
Feature: Cadastro de Categoria
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novas categorias
  Para organizar os produtos do catálogo

  Contexto:
    Dado que estou autenticado como administrador

  Esquema de Cenário: Nome da categoria obrigatório
    Dado que estou no campo Nome da categoria
    Quando informo um valor <valor_nome>
    Então devo ver a mensagem "Nome e descrição são obrigatórios."
    Exemplos:
      | valor_nome |
      | ""         |
      | "   "      |

  Esquema de Cenário: Descrição da categoria obrigatória
    Dado que estou no campo Descrição da categoria
    Quando informo um valor <valor_desc>
    Então devo ver a mensagem "Nome e descrição são obrigatórios."
    Exemplos:
      | valor_desc |
      | ""         |
      | "   "      |

  Cenário: Nome da categoria muito curto
    Dado que estou no campo Nome da categoria
    Quando informo um valor com menos de 3 caracteres
    Então devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

  Cenário: Nome da categoria muito longo
    Dado que estou no campo Nome da categoria
    Quando informo um valor com mais de 100 caracteres
    Então devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

  Cenário: Nome da categoria já existe
    Dado que já existe uma categoria com nome "Eletrônicos"
    Quando tento cadastrar uma nova categoria com nome "Eletrônicos"
    Então devo ver a mensagem "Já existe uma categoria com este nome."

  Cenário: Descrição da categoria muito longa
    Dado que estou no campo Descrição da categoria
    Quando informo um valor com mais de 500 caracteres
    Então devo ver a mensagem "Descrição da categoria deve ter no máximo 500 caracteres."

  Cenário: Cadastro de categoria com sucesso
    Dado que preenchi todos os campos da categoria corretamente
    Quando clico em "Salvar"
    Então devo ver mensagem "Categoria criada com sucesso!"
    E a categoria deve aparecer na listagem de categorias

  Cenário: Tentativa de cadastro de categoria sem autenticação
    Dado que não estou logado no sistema
    Quando tento adicionar uma categoria
    Então devo ver mensagem "Token ausente"

  Cenário: Tratamento de erro de conexão no cadastro de categoria
    Dado que estou com problemas de conexão
    Quando tento adicionar uma categoria
    Então devo ver mensagem "Erro de conexão"
```

---

### Feature: Cadastro de Fornecedor
```gherkin
Feature: Cadastro de Fornecedor
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novos fornecedores
  Para manter o cadastro de quem nos abastece

  Contexto:
    Dado que estou autenticado como administrador

  Esquema de Cenário: Razão social do fornecedor obrigatória
    Dado que estou no campo Razão Social do fornecedor
    Quando informo um valor <valor_razao>
    Então devo ver a mensagem "Razão social da empresa é obrigatória."
    Exemplos:
      | valor_razao |
      | ""          |
      | "   "       |

  Cenário: Razão social do fornecedor muito curta
    Dado que estou no campo Razão Social do fornecedor
    Quando informo um valor com menos de 3 caracteres
    Então devo ver a mensagem "Razão social deve ter no mínimo 3 caracteres."

  Cenário: Razão social do fornecedor muito longa
    Dado que estou no campo Razão Social do fornecedor
    Quando informo um valor com mais de 100 caracteres
    Então devo ver a mensagem "Razão social deve ter no máximo 100 caracteres."

  Esquema de Cenário: Nome do contato do fornecedor obrigatório
    Dado que estou no campo Nome do Contato do fornecedor
    Quando informo um valor <valor_contato>
    Então devo ver a mensagem "Nome do contato é obrigatório."
    Exemplos:
      | valor_contato |
      | ""            |
      | "   "         |

  Cenário: Nome do contato do fornecedor muito curto
    Dado que estou no campo Nome do Contato do fornecedor
    Quando informo um valor com menos de 5 caracteres
    Então devo ver a mensagem "Nome do contato deve ter no mínimo 5 caracteres."

  Cenário: Nome do contato do fornecedor muito longo
    Dado que estou no campo Nome do Contato do fornecedor
    Quando informo um valor com mais de 80 caracteres
    Então devo ver a mensagem "Nome do contato deve ter no máximo 80 caracteres."

  Esquema de Cenário: E-mail do fornecedor obrigatório
    Dado que estou no campo E-mail do fornecedor
    Quando informo um valor <valor_email>
    Então devo ver a mensagem "E-mail do fornecedor é obrigatório."
    Exemplos:
      | valor_email |
      | ""          |
      | "   "       |

  Cenário: E-mail do fornecedor inválido
    Dado que estou no campo E-mail do fornecedor
    Quando informo um valor que não é um e-mail válido
    Então devo ver a mensagem "E-mail inválido. Informe um e-mail válido."

  Esquema de Cenário: Telefone do fornecedor obrigatório
    Dado que estou no campo Telefone do fornecedor
    Quando informo um valor <valor_telefone>
    Então devo ver a mensagem "Telefone do fornecedor é obrigatório."
    Exemplos:
      | valor_telefone |
      | ""             |
      | "   "          |

  Esquema de Cenário: CNPJ do fornecedor obrigatório
    Dado que estou no campo CNPJ do fornecedor
    Quando informo um valor <valor_cnpj>
    Então devo ver a mensagem "CNPJ do fornecedor é obrigatório."
    Exemplos:
      | valor_cnpj |
      | ""         |
      | "   "      |

  Esquema de Cenário: UF do fornecedor obrigatória
    Dado que estou no campo UF do fornecedor
    Quando informo um valor <valor_uf>
    Então devo ver a mensagem "UF do fornecedor é obrigatória."
    Exemplos:
      | valor_uf |
      | ""       |
      | "   "    |

  Cenário: Cadastro de fornecedor com sucesso
    Dado que preenchi todos os campos do fornecedor corretamente
    Quando clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o fornecedor deve aparecer na listagem de fornecedores

  Cenário: Tentativa de cadastro de fornecedor sem autenticação
    Dado que não estou logado no sistema
    Quando tento adicionar um fornecedor
    Então devo ver mensagem "Token ausente"

  Cenário: Tratamento de erro de conexão no cadastro de fornecedor
    Dado que estou com problemas de conexão
    Quando tento adicionar um fornecedor
    Então devo ver mensagem "Erro de conexão"
```
