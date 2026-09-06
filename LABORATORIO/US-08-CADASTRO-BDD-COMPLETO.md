# US-08: Cadastro de Produto, Categoria e Fornecedor (BDD Completo)

## User Stories
- US-08: Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novos produtos** para que eu possa **gerenciar o estoque** e **disponibilizar produtos para venda**.
- US-Extra Categoria: Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novas categorias** para organizar os produtos.
- US-Extra Fornecedor: Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novos fornecedores** para manter o cadastro de quem nos abastece.

---

## 📋 Critérios de Aceite e Gherkin

### Feature: Cadastro de Produto
```gherkin
Feature: Cadastro de Produto
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novos produtos
  Para que eu possa gerenciar o estoque e disponibilizar produtos para venda

  # Autenticação & Contexto
  Background:
    Given que estou autenticado como administrador

  Scenario Outline: Nome do produto obrigatório
    Given que estou no campo Nome do produto
    When informo um valor <valor_nome>
    Then devo ver a mensagem "Nome é obrigatório"
    Examples:
      | valor_nome |
      | ""         |
      | "   "      |

  Scenario: Nome do produto muito curto
    Given que estou no campo Nome do produto
    When informo um valor com menos de 6 caracteres
    Then devo ver a mensagem "Mínimo 6 caracteres"

  Scenario: Nome do produto muito longo
    Given que estou no campo Nome do produto
    When informo um valor com mais de 40 caracteres
    Then devo ver a mensagem "Máximo 40 caracteres"

  Scenario: Nome do produto com números
    Given que estou no campo Nome do produto
    When informo um valor contendo números
    Then devo ver a mensagem "Não pode conter números"

  Scenario: Nome do produto com caracteres especiais
    Given que estou no campo Nome do produto
    When informo um valor com caracteres especiais (exceto espaços)
    Then devo ver a mensagem "Caracteres especiais não permitidos"

  Scenario: Nome do produto com espaços duplicados
    Given que estou no campo Nome do produto
    When informo um valor com espaços duplicados
    Then devo ver a mensagem "Não pode ter espaços duplicados"

  Scenario: Nome do produto já existe
    Given que já existe um produto com nome "Cadeira Gamer"
    When tento cadastrar um novo produto com nome "Cadeira Gamer"
    Then devo ver a mensagem "Já existe um produto com esse nome/slug"

  Scenario: Preço do produto obrigatório
    Given que estou no campo Preço do produto
    When informo um valor vazio
    Then devo ver a mensagem "Preço é obrigatório"

  Scenario: Preço do produto inválido (não é número)
    Given que estou no campo Preço do produto
    When informo um valor que não é número
    Then devo ver a mensagem "Deve ser um valor positivo"

  Scenario: Preço do produto inválido (menor ou igual a zero)
    Given que estou no campo Preço do produto
    When informo um valor menor ou igual a zero
    Then devo ver a mensagem "Deve ser um valor positivo"

  Scenario: Preço do produto muito grande
    Given que estou no campo Preço do produto
    When informo um valor maior que 999999.99
    Then devo ver a mensagem de erro correspondente

  Scenario: Estoque do produto obrigatório
    Given que estou no campo Estoque do produto
    When informo um valor vazio
    Then devo ver a mensagem "Estoque é obrigatório"

  Scenario: Estoque do produto inválido (não é número)
    Given que estou no campo Estoque do produto
    When informo um valor que não é número
    Then devo ver a mensagem "Apenas números de 1 a 999"

  Scenario: Estoque do produto inválido (menor que 1)
    Given que estou no campo Estoque do produto
    When informo um valor menor que 1
    Then devo ver a mensagem "Apenas números de 1 a 999"

  Scenario: Estoque do produto inválido (maior que 999)
    Given que estou no campo Estoque do produto
    When informo um valor maior que 999
    Then devo ver a mensagem "Apenas números de 1 a 999"

  Scenario: SKU do produto obrigatório
    Given que estou no campo SKU do produto
    When informo um valor <valor_sku>
    Then devo ver a mensagem "SKU é obrigatório"
    Examples:
      | valor_sku |
      | ""        |
      | "   "     |

  Scenario: SKU do produto com tamanho inválido (menor que 5)
    Given que estou no campo SKU do produto
    When informo um valor com menos de 5 caracteres
    Then devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

  Scenario: SKU do produto com tamanho inválido (maior que 20)
    Given que estou no campo SKU do produto
    When informo um valor com mais de 20 caracteres
    Then devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

  Scenario: SKU do produto com formato inválido
    Given que estou no campo SKU do produto
    When informo um valor contendo caracteres diferentes de letras maiúsculas, números e hífen
    Then devo ver a mensagem "Apenas letras maiúsculas, números e hífen"

  Scenario: SKU do produto não começa com letra maiúscula
    Given que estou no campo SKU do produto
    When informo um valor que não começa com letra maiúscula
    Then devo ver a mensagem "Deve começar com letra maiúscula"

  Scenario: SKU do produto já existe
    Given que já existe um produto com SKU "MGP-2024"
    When tento cadastrar um novo produto com SKU "MGP-2024"
    Then devo ver a mensagem "Já existe um produto com esse SKU"

  Scenario: Categoria do produto obrigatória
    Given que estou no campo Categoria do produto
    When não seleciono nenhuma categoria
    Then devo ver o campo destacado como obrigatório

  Scenario: Categoria do produto inexistente
    Given que estou cadastrando um produto
    When seleciono uma categoria que não existe no sistema
    Then devo ver a mensagem "Categoria selecionada não existe. Escolha uma categoria válida."

  Scenario: Fornecedor do produto obrigatório
    Given que estou no campo Fornecedor do produto
    When não seleciono nenhum fornecedor
    Then devo ver o campo destacado como obrigatório

  Scenario: Fornecedor do produto inexistente
    Given que estou cadastrando um produto
    When seleciono um fornecedor que não existe no sistema
    Then devo ver a mensagem "Fornecedor selecionado não existe. Escolha um fornecedor válido."

  Scenario: Cadastro de produto com sucesso
    Given que preenchi todos os campos do produto corretamente
    And a categoria selecionada existe
    And o fornecedor selecionado existe
    When clico em "Adicionar"
    Then devo ver mensagem "Produto adicionado com sucesso!"
    And o modal deve fechar automaticamente
    And o produto deve aparecer na listagem de produtos

  Scenario: Limpeza de erros ao digitar no cadastro de produto
    Given que um campo do produto está com erro de validação
    When começo a digitar nesse campo
    Then a mensagem de erro deve desaparecer imediatamente

  Scenario: Tentativa de cadastro de produto sem autenticação
    Given que não estou logado no sistema
    When tento adicionar um produto
    Then devo ver mensagem "Você precisa estar logado para adicionar produtos"

  Scenario: Tratamento de erro de conexão no cadastro de produto
    Given que estou com problemas de conexão
    When tento adicionar um produto
    Then devo ver mensagem "Erro de conexão"
```

---

### Feature: Cadastro de Categoria
```gherkin
Feature: Cadastro de Categoria
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novas categorias
  Para organizar os produtos do catálogo

  # Autenticação & Contexto
  Background:
    Given que estou autenticado como administrador

  Scenario Outline: Nome da categoria obrigatório
    Given que estou no campo Nome da categoria
    When informo um valor <valor_nome>
    Then devo ver a mensagem "Nome e descrição são obrigatórios."
    Examples:
      | valor_nome |
      | ""         |
      | "   "      |

  Scenario: Descrição da categoria obrigatória
    Given que estou no campo Descrição da categoria
    When informo um valor <valor_desc>
    Then devo ver a mensagem "Nome e descrição são obrigatórios."
    Examples:
      | valor_desc |
      | ""         |
      | "   "      |

  Scenario: Nome da categoria muito curto
    Given que estou no campo Nome da categoria
    When informo um valor com menos de 3 caracteres
    Then devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

  Scenario: Nome da categoria muito longo
    Given que estou no campo Nome da categoria
    When informo um valor com mais de 100 caracteres
    Then devo ver a mensagem "Nome da categoria deve ter entre 3 e 100 caracteres."

  Scenario: Nome da categoria já existe
    Given que já existe uma categoria com nome "Eletrônicos"
    When tento cadastrar uma nova categoria com nome "Eletrônicos"
    Then devo ver a mensagem "Já existe uma categoria com este nome."

  Scenario: Descrição da categoria muito longa
    Given que estou no campo Descrição da categoria
    When informo um valor com mais de 500 caracteres
    Then devo ver a mensagem "Descrição da categoria deve ter no máximo 500 caracteres."

  Scenario: Cadastro de categoria com sucesso
    Given que preenchi todos os campos da categoria corretamente
    When clico em "Salvar"
    Then devo ver mensagem "Categoria criada com sucesso!"
    And a categoria deve aparecer na listagem de categorias

  Scenario: Tentativa de cadastro de categoria sem autenticação
    Given que não estou logado no sistema
    When tento adicionar uma categoria
    Then devo ver mensagem "Token ausente" ou "Você precisa estar logado"

  Scenario: Tratamento de erro de conexão no cadastro de categoria
    Given que estou com problemas de conexão
    When tento adicionar uma categoria
    Then devo ver mensagem "Erro de conexão"
```

---

### Feature: Cadastro de Fornecedor
```gherkin
Feature: Cadastro de Fornecedor
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novos fornecedores
  Para manter o cadastro de quem nos abastece

  # Autenticação & Contexto
  Background:
    Given que estou autenticado como administrador

  Scenario: Razão social do fornecedor obrigatória
    Given que estou no campo Razão Social do fornecedor
    When informo um valor <valor_razao>
    Then devo ver a mensagem "Razão social da empresa é obrigatória."
    Examples:
      | valor_razao |
      | ""          |
      | "   "       |

  Scenario: Razão social do fornecedor muito curta
    Given que estou no campo Razão Social do fornecedor
    When informo um valor com menos de 3 caracteres
    Then devo ver a mensagem "Razão social deve ter no mínimo 3 caracteres."

  Scenario: Razão social do fornecedor muito longa
    Given que estou no campo Razão Social do fornecedor
    When informo um valor com mais de 100 caracteres
    Then devo ver a mensagem "Razão social deve ter no máximo 100 caracteres."

  Scenario: Nome do contato do fornecedor obrigatório
    Given que estou no campo Nome do Contato do fornecedor
    When informo um valor <valor_contato>
    Then devo ver a mensagem "Nome do contato é obrigatório."
    Examples:
      | valor_contato |
      | ""            |
      | "   "         |

  Scenario: Nome do contato do fornecedor muito curto
    Given que estou no campo Nome do Contato do fornecedor
    When informo um valor com menos de 5 caracteres
    Then devo ver a mensagem "Nome do contato deve ter no mínimo 5 caracteres."

  Scenario: Nome do contato do fornecedor muito longo
    Given que estou no campo Nome do Contato do fornecedor
    When informo um valor com mais de 80 caracteres
    Then devo ver a mensagem "Nome do contato deve ter no máximo 80 caracteres."

  Scenario: E-mail do fornecedor obrigatório
    Given que estou no campo E-mail do fornecedor
    When informo um valor <valor_email>
    Then devo ver a mensagem "E-mail do fornecedor é obrigatório."
    Examples:
      | valor_email |
      | ""          |
      | "   "       |

  Scenario: E-mail do fornecedor inválido
    Given que estou no campo E-mail do fornecedor
    When informo um valor que não é um e-mail válido
    Then devo ver a mensagem "E-mail inválido. Informe um e-mail válido."

  Scenario: E-mail do fornecedor já existe
    Given que já existe um fornecedor com e-mail "contato@tech.com"
    When tento cadastrar um novo fornecedor com e-mail "contato@tech.com"
    Then devo ver mensagem de erro de e-mail duplicado

  Scenario: Telefone do fornecedor obrigatório
    Given que estou no campo Telefone do fornecedor
    When informo um valor <valor_telefone>
    Then devo ver a mensagem "Telefone do fornecedor é obrigatório."
    Examples:
      | valor_telefone |
      | ""             |
      | "   "          |

  Scenario: Telefone do fornecedor inválido
    Given que estou no campo Telefone do fornecedor
    When informo um valor que não segue o formato (XX) XXXXX-XXXX
    Then devo ver mensagem de erro de formato de telefone

  Scenario: CNPJ do fornecedor obrigatório
    Given que estou no campo CNPJ do fornecedor
    When informo um valor <valor_cnpj>
    Then devo ver a mensagem "CNPJ do fornecedor é obrigatório."
    Examples:
      | valor_cnpj |
      | ""         |
      | "   "      |

  Scenario: CNPJ do fornecedor inválido
    Given que estou no campo CNPJ do fornecedor
    When informo um valor que não segue o formato de 14 números
    Then devo ver mensagem de erro de formato de CNPJ

  Scenario: CNPJ do fornecedor já existe
    Given que já existe um fornecedor com CNPJ "12345678901234"
    When tento cadastrar um novo fornecedor com CNPJ "12345678901234"
    Then devo ver mensagem de erro de CNPJ duplicado

  Scenario: UF do fornecedor obrigatória
    Given que estou no campo UF do fornecedor
    When informo um valor <valor_uf>
    Then devo ver a mensagem "UF do fornecedor é obrigatória."
    Examples:
      | valor_uf |
      | ""       |
      | "   "    |

  Scenario: UF do fornecedor inválido
    Given que estou no campo UF do fornecedor
    When informo um valor que não são 2 letras maiúsculas
    Then devo ver mensagem de erro de formato de UF

  Scenario: Cadastro de fornecedor com sucesso
    Given que preenchi todos os campos do fornecedor corretamente
    When clico em "Salvar"
    Then devo ver mensagem de sucesso
    And o fornecedor deve aparecer na listagem de fornecedores

  Scenario: Tentativa de cadastro de fornecedor sem autenticação
    Given que não estou logado no sistema
    When tento adicionar um fornecedor
    Then devo ver mensagem "Token ausente" ou "Você precisa estar logado"

  Scenario: Tratamento de erro de conexão no cadastro de fornecedor
    Given que estou com problemas de conexão
    When tento adicionar um fornecedor
    Then devo ver mensagem "Erro de conexão"
```
