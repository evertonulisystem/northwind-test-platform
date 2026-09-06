# US-09: Validação e Busca de Produtos

## User Story
Como um **desenvolvedor de testes automatizados** do sistema QA Automation Shop, eu quero **validar dados de produtos e buscar produtos específicos** para que eu possa **garantir a integridade dos dados** e **realizar testes precisos**.

---

## 📋 **Critérios de Aceite (Endpoints)**

### **Endpoint 1: `/api/products/search`**

#### **Critério 1 – Busca por ID Válido**
**Dado que** estou autenticado com token JWT válido  
**E** existe um produto com ID 123 cadastrado no sistema  
**Quando** faço uma requisição GET para `/api/products/search?id=123`  
**Então** devo receber status code 200  
**E** o response deve conter os dados completos do produto  
**E** o campo `valid` deve ser true  
**E** o produto deve incluir categorias e fornecedores relacionados

#### **Critério 2 – Busca por SKU Válido**
**Dado que** estou autenticado com token JWT válido  
**E** existe um produto com SKU "MGP-2024" cadastrado  
**Quando** faço uma requisição GET para `/api/products/search?sku=MGP-2024`  
**Então** devo receber status code 200  
**E** o response deve conter o produto correto  
**E** o SKU retornado deve ser exatamente "MGP-2024"

#### **Critério 3 – Busca por Slug Válido**
**Dado que** estou autenticado com token JWT válido  
**E** existe um produto com slug "mouse-gamer-rgb"  
**Quando** faço uma requisição GET para `/api/products/search?slug=mouse-gamer-rgb`  
**Então** devo receber status code 200  
**E** o response deve conter o produto correto  
**E** o slug retornado deve estar em minúsculas

#### **Critério 4 – Produto Não Encontrado por ID**
**Dado que** estou autenticado com token JWT válido  
**E** não existe produto com ID 99999 no sistema  
**Quando** faço uma requisição GET para `/api/products/search?id=99999`  
**Então** devo receber status code 404  
**E** o response deve conter message "Produto não encontrado"  
**E** o campo `data` deve ser null

#### **Critério 5 – Produto Não Encontrado por SKU**
**Dado que** estou autenticado com token JWT válido  
**E** não existe produto com SKU "INEXISTENTE"  
**Quando** faço uma requisição GET para `/api/products/search?sku=INEXISTENTE`  
**Então** devo receber status code 404  
**E** o response deve conter message "Produto não encontrado"

#### **Critério 6 – Parâmetro ID Inválido**
**Dado que** estou autenticado com token JWT válido  
**Quando** faço uma requisição GET para `/api/products/search?id=abc`  
**Então** devo receber status code 400  
**E** o response deve conter message "ID deve ser um número positivo válido"

#### **Critério 7 – Parâmetro ID Negativo**
**Dado que** estou autenticado com token JWT válido  
**Quando** faço uma requisição GET para `/api/products/search?id=-1`  
**Então** devo receber status code 400  
**E** o response deve conter message "ID deve ser um número positivo válido"

#### **Critério 8 – Nenhum Parâmetro Fornecido**
**Dado que** estou autenticado com token JWT válido  
**Quando** faço uma requisição GET para `/api/products/search`  
**Então** devo receber status code 400  
**E** o response deve conter message "Pelo menos um parâmetro deve ser fornecido: id, sku ou slug"

#### **Critério 9 – Token Ausente**
**Dado que** não estou autenticado  
**Quando** faço uma requisição GET para `/api/products/search?id=123`  
**Então** devo receber status code 401  
**E** o response deve conter message "Token ausente"

#### **Critério 10 – Token Inválido**
**Dado que** estou autenticado com token JWT inválido  
**Quando** faço uma requisição GET para `/api/products/search?id=123`  
**Então** devo receber status code 401  
**E** o response deve conter message "Token inválido"

---

### **Endpoint 2: `/api/products/validate`**

#### **Critério 11 – Produto Completo Válido**
**Dado que** estou autenticado com token JWT válido  
**E** envio dados completos e válidos de produto  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser true  
**E** o array `errors` deve estar vazio  
**E** o response deve conter message "Produto válido para cadastro"

#### **Critério 12 – Nome Muito Curto**
**Dado que** estou autenticado com token JWT válido  
**E** envio nome com menos de 6 caracteres  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Nome deve ter no mínimo 6 caracteres"

#### **Critério 13 – Nome com Números**
**Dado que** estou autenticado com token JWT válido  
**E** envio nome contendo números  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Nome não pode conter números"

#### **Critério 14 – Nome com Caracteres Especiais**
**Dado que** estou autenticado com token JWT válido  
**E** envio nome contendo caracteres especiais  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Nome não pode conter caracteres especiais"

#### **Critério 15 – Preço Zero ou Negativo**
**Dado que** estou autenticado com token JWT válido  
**E** envio preço menor ou igual a zero  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Preço deve ser maior que zero"

#### **Critério 16 – Preço Não Numérico**
**Dado que** estou autenticado com token JWT válido  
**E** envio preço como texto inválido  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Preço deve ser um número válido"

#### **Critério 17 – Estoque Negativo**
**Dado que** estou autenticado com token JWT válido  
**E** envio quantidade de estoque negativa  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Estoque não pode ser negativo"

#### **Critério 18 – SKU Muito Curto**
**Dado que** estou autenticado com token JWT válido  
**E** envio SKU com menos de 5 caracteres  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "SKU deve ter no mínimo 5 caracteres"

#### **Critério 19 – SKU com Formato Inválido**
**Dado que** estou autenticado com token JWT válido  
**E** envio SKU com caracteres inválidos  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "SKU deve conter apenas letras maiúsculas, números e hífen"

#### **Critério 20 – SKU Duplicado**
**Dado que** estou autenticado com token JWT válido  
**E** envio SKU que já existe no banco  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "SKU já cadastrado no sistema"

#### **Critério 21 – Categoria Inexistente**
**Dado que** estou autenticado com token JWT válido  
**E** envio category_id que não existe  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Categoria informada não existe"

#### **Critério 22 – Fornecedor Inexistente**
**Dado que** estou autenticado com token JWT válido  
**E** envio supplier_id que não existe  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Fornecedor informado não existe"

#### **Critério 23 – Campos Obrigatórios Ausentes**
**Dado que** estou autenticado com token JWT válido  
**E** não envio campos obrigatórios (name, price, stock_quantity, sku)  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve listar os campos ausentes

#### **Critério 24 – Avisos de Estoque Baixo**
**Dado que** estou autenticado com token JWT válido  
**E** envio estoque com valor baixo (menor que 5)  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o campo `valid` deve ser true  
**E** o array `warnings` deve conter "Estoque baixo, considere repor em breve"

#### **Critério 25 – Sugestões para Produtos Gamer**
**Dado que** estou autenticado com token JWT válido  
**E** envio nome contendo "gamer" ou "gaming"  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 200  
**E** o array `suggestions` deve conter "Produtos gamer podem ter margens maiores"

#### **Critério 26 – JSON Inválido**
**Dado que** estou autenticado com token JWT válido  
**E** envio corpo da requisição com JSON malformado  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 400  
**E** o response deve conter "JSON inválido"

#### **Critério 27 – Token Ausente na Validação**
**Dado que** não estou autenticado  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 401  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Token ausente"

#### **Critério 28 – Token Inválido na Validação**
**Dado que** estou autenticado com token JWT inválido  
**Quando** faço uma requisição POST para `/api/products/validate`  
**Então** devo receber status code 401  
**E** o campo `valid` deve ser false  
**E** o array `errors` deve conter "Token inválido"

---

## 📋 **Capítulo de Critérios de Aceite (Gherkin)**

### **Feature: Busca e Validação de Produtos**

```gherkin
Feature: Busca e Validação de Produtos
  Como um desenvolvedor de testes automatizados
  Eu quero buscar e validar dados de produtos
  Para garantir a integridade dos dados e realizar testes precisos

  Scenario: Buscar produto por ID válido
    Given estou autenticado com token JWT válido
    And existe um produto com ID 123 cadastrado
    When faço uma requisição GET para "/api/products/search?id=123"
    Then devo receber status code 200
    And o response deve conter os dados completos do produto
    And o campo "valid" deve ser true

  Scenario: Buscar produto por SKU válido
    Given estou autenticado com token JWT válido
    And existe um produto com SKU "MGP-2024" cadastrado
    When faço uma requisição GET para "/api/products/search?sku=MGP-2024"
    Then devo receber status code 200
    And o response deve conter o produto correto
    And o SKU retornado deve ser exatamente "MGP-2024"

  Scenario: Produto não encontrado por ID
    Given estou autenticado com token JWT válido
    And não existe produto com ID 99999 no sistema
    When faço uma requisição GET para "/api/products/search?id=99999"
    Then devo receber status code 404
    And o response deve conter message "Produto não encontrado"

  Scenario: Validar produto completo e válido
    Given estou autenticado com token JWT válido
    And envio dados completos e válidos de produto
    When faço uma requisição POST para "/api/products/validate"
    Then devo receber status code 200
    And o campo "valid" deve ser true
    And o array "errors" deve estar vazio

  Scenario: Validar produto com nome muito curto
    Given estou autenticado com token JWT válido
    And envio nome com menos de 6 caracteres
    When faço uma requisição POST para "/api/products/validate"
    Then devo receber status code 200
    And o campo "valid" deve ser false
    And o array "errors" deve conter "Nome deve ter no mínimo 6 caracteres"

  Scenario: Validar produto com preço inválido
    Given estou autenticado com token JWT válido
    And envio preço menor ou igual a zero
    When faço uma requisição POST para "/api/products/validate"
    Then devo receber status code 200
    And o campo "valid" deve ser false
    And o array "errors" deve conter "Preço deve ser maior que zero"

  Scenario: Validar produto com SKU duplicado
    Given estou autenticado com token JWT válido
    And envio SKU que já existe no banco
    When faço uma requisição POST para "/api/products/validate"
    Then devo receber status code 200
    And o campo "valid" deve ser false
    And o array "errors" deve conter "SKU já cadastrado no sistema"

  Scenario: Tentar buscar sem autenticação
    Given não estou autenticado
    When faço uma requisição GET para "/api/products/search?id=123"
    Then devo receber status code 401
    And o response deve conter message "Token ausente"

  Scenario: Tentar validar sem autenticação
    Given não estou autenticado
    When faço uma requisição POST para "/api/products/validate"
    Then devo receber status code 401
    And o campo "valid" deve ser false
    And o array "errors" deve conter "Token ausente"
```

---

## 📋 **Critérios Técnicos**

### **Requisitos Funcionais:**
- ✅ Autenticação JWT obrigatória em ambos os endpoints
- ✅ Validação completa de dados do produto
- ✅ Busca por múltiplos critérios (ID, SKU, slug)
- ✅ Retorno estruturado com erros, avisos e sugestões
- ✅ Verificação de duplicidade no banco de dados

### **Requisitos Não Funcionais:**
- ✅ Performance: resposta em menos de 500ms
- ✅ Segurança: validação de token em todas as requisições
- ✅ Logs: registro de operações para debug
- ✅ Tratamento de erros: mensagens claras e específicas

### **Critérios de Teste:**
- ✅ Cobertura 100% dos cenários positivos e negativos
- ✅ Testes de integração com banco de dados
- ✅ Testes de segurança com tokens válidos/inválidos
- ✅ Testes de performance com múltiplas requisições

---

## 📋 **Definição de Pronto**

**Considerarei esta User Story completa quando:**

- ✅ **Endpoints implementados** e funcionando
- ✅ **Documentação Swagger** atualizada
- ✅ **Todos os critérios de aceite** testados e aprovados
- ✅ **Cobertura de testes** 100% dos cenários
- ✅ **Logs de debug** implementados
- ✅ **Tratamento de erros** robusto
- ✅ **Performance** dentro dos limites aceitáveis
- ✅ **Segurança** validada com JWT
- ✅ **Integração** com frontend funcionando
- ✅ **Documentação** completa e atualizada

---

**Status:** 🔄 **Em Desenvolvimento**  
**Prioridade:** 🚀 **Alta**  
**Complexidade:** 📊 **Intermediária**
