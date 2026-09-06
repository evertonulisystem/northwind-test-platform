# US-08: Cadastro de Produto

## User Story
Como um **administrador do sistema QA Automation Shop**, eu quero **cadastrar novos produtos** para que eu possa **gerenciar o estoque** e **disponibilizar produtos para venda**.

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

### **Critério 7 – Preço Obrigatório**
Dado que estou no campo Preço
Quando informo um valor vazio
Então devo ver a mensagem "Preço é obrigatório"

### **Critério 8 – Preço Inválido**
Dado que estou no campo Preço
Quando informo um valor que não é número ou é menor/igual a zero
Então devo ver a mensagem "Deve ser um valor positivo"

### **Critério 9 – Estoque Obrigatório**
Dado que estou no campo Estoque
Quando informo um valor vazio
Então devo ver a mensagem "Estoque é obrigatório"

### **Critério 10 – Estoque Inválido**
Dado que estou no campo Estoque
Quando informo um valor que não é número ou está fora do intervalo 1-999
Então devo ver a mensagem "Apenas números de 1 a 999"

### **Critério 11 – SKU Obrigatório**
Dado que estou no campo SKU
Quando informo um valor vazio ou espaços
Então devo ver a mensagem "SKU é obrigatório"

### **Critério 12 – SKU com Tamanho Inválido**
Dado que estou no campo SKU
Quando informo um valor com menos de 5 ou mais de 20 caracteres
Então devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

### **Critério 13 – SKU com Formato Inválido**
Dado que estou no campo SKU
Quando informo um valor contendo caracteres diferentes de letras maiúsculas, números e hífen
Então devo ver a mensagem "Apenas letras maiúsculas, números e hífen"

### **Critério 14 – SKU Não Começa com Letra**
Dado que estou no campo SKU
Quando informo um valor que não começa com letra maiúscula
Então devo ver a mensagem "Deve começar com letra maiúscula"

### **Critério 15 – Categoria Obrigatória**
Dado que estou no campo Categoria
Quando não seleciono nenhuma categoria
Então devo ver o campo destacado como obrigatório

### **Critério 16 – Fornecedor Obrigatório**
Dado que estou no campo Fornecedor
Quando não seleciono nenhum fornecedor
Então devo ver o campo destacado como obrigatório

### **Critério 17 – Cadastro com Sucesso**
Dado que preenchi todos os campos corretamente
Quando clico em "Adicionar"
Então devo ver mensagem "Produto adicionado com sucesso!"
E o modal deve fechar automaticamente

### **Critério 18 – Limpeza de Erros ao Digitar**
Dado que um campo está com erro de validação
Quando começo a digitar nesse campo
Então a mensagem de erro deve desaparecer imediatamente

### **Critério 19 – Validação de Autenticação**
Dado que não estou logado no sistema
Quando tento adicionar um produto
Então devo ver mensagem "Você precisa estar logado para adicionar produtos"

### **Critério 20 – Tratamento de Erro de Conexão**
Dado que estou com problemas de conexão
Quando tento adicionar um produto
Então devo ver mensagem "Erro de conexão"

---

## 📋 **Capítulo de Critérios de Aceite (Gherkin)**

### **Feature:** Cadastro de Produto

```gherkin
Feature: Cadastro de Produto
  Como um administrador do sistema QA Automation Shop
  Eu quero cadastrar novos produtos
  Para que eu possa gerenciar o estoque e disponibilizar produtos para venda

  Scenario: Nome do produto obrigatório
    Given que estou no campo Nome
    When informo um valor vazio ou espaços
    Then devo ver a mensagem "Nome é obrigatório"

  Scenario: Nome do produto muito curto
    Given que estou no campo Nome
    When informo um valor com menos de 6 caracteres
    Then devo ver a mensagem "Mínimo 6 caracteres"

  Scenario: Nome do produto muito longo
    Given que estou no campo Nome
    When informo um valor com mais de 40 caracteres
    Then devo ver a mensagem "Máximo 40 caracteres"

  Scenario: Nome do produto com números
    Given que estou no campo Nome
    When informo um valor contendo números
    Then devo ver a mensagem "Não pode conter números"

  Scenario: Nome do produto com caracteres especiais
    Given que estou no campo Nome
    When informo um valor com caracteres especiais (exceto espaços)
    Then devo ver a mensagem "Caracteres especiais não permitidos"

  Scenario: Nome do produto com espaços duplicados
    Given que estou no campo Nome
    When informo um valor com espaços duplicados
    Then devo ver a mensagem "Não pode ter espaços duplicados"

  Scenario: Preço obrigatório
    Given que estou no campo Preço
    When informo um valor vazio
    Then devo ver a mensagem "Preço é obrigatório"

  Scenario: Preço inválido
    Given que estou no campo Preço
    When informo um valor que não é número ou é menor/igual a zero
    Then devo ver a mensagem "Deve ser um valor positivo"

  Scenario: Estoque obrigatório
    Given que estou no campo Estoque
    When informo um valor vazio
    Then devo ver a mensagem "Estoque é obrigatório"

  Scenario: Estoque inválido
    Given que estou no campo Estoque
    When informo um valor que não é número ou está fora do intervalo 1-999
    Then devo ver a mensagem "Apenas números de 1 a 999"

  Scenario: SKU obrigatório
    Given que estou no campo SKU
    When informo um valor vazio ou espaços
    Then devo ver a mensagem "SKU é obrigatório"

  Scenario: SKU com tamanho inválido
    Given que estou no campo SKU
    When informo um valor com menos de 5 ou mais de 20 caracteres
    Then devo ver a mensagem "Deve ter entre 5 e 20 caracteres"

  Scenario: SKU com formato inválido
    Given que estou no campo SKU
    When informo um valor contendo caracteres diferentes de letras maiúsculas, números e hífen
    Then devo ver a mensagem "Apenas letras maiúsculas, números e hífen"

  Scenario: SKU não começa com letra
    Given que estou no campo SKU
    When informo um valor que não começa com letra maiúscula
    Then devo ver a mensagem "Deve começar com letra maiúscula"

  Scenario: Categoria obrigatória
    Given que estou no campo Categoria
    When não seleciono nenhuma categoria
    Then devo ver o campo destacado como obrigatório

  Scenario: Fornecedor obrigatório
    Given que estou no campo Fornecedor
    When não seleciono nenhum fornecedor
    Then devo ver o campo destacado como obrigatório

  Scenario: Cadastro com sucesso
    Given que preenchi todos os campos corretamente
      | Campo | Valor |
      | Nome | "Produto Teste QA" |
      | Preço | "99.99" |
      | Estoque | "50" |
      | SKU | "PRD-2024-001" |
      | Categoria | "Eletrônicos" |
      | Fornecedor | "Tech Supplier" |
    When clico em "Adicionar"
    Then devo ver mensagem "Produto adicionado com sucesso!"
    And o modal deve fechar automaticamente

  Scenario: Limpeza de erros ao digitar
    Given que um campo está com erro de validação
    When começo a digitar nesse campo
    Then a mensagem de erro deve desaparecer imediatamente

  Scenario: Validação de autenticação
    Given que não estou logado no sistema
    When tento adicionar um produto
    Then devo ver mensagem "Você precisa estar logado para adicionar produtos"

  Scenario: Tratamento de erro de conexão
    Given que estou com problemas de conexão
    When tento adicionar um produto
    Then devo ver mensagem "Erro de conexão"
```

---

## Critérios Técnicos

### 🛡️ **Segurança**
- ✅ Validação deve ocorrer no frontend e backend
- ✅ Proteção contra SQL injection
- ✅ Sanitização de inputs
- ✅ Autenticação obrigatória

### 🎯 **Acessibilidade**
- ✅ Labels associadas aos inputs
- ✅ Mensagens de erro com aria-describedby
- ✅ Navegação por teclado funcional
- ✅ Contraste de cores WCAG compliant

### 📊 **Performance**
- ✅ Validação em tempo real
- ✅ Limpeza de erros ao digitar
- ✅ Feedback visual imediato
- ✅ Tratamento de erros de conexão

## Definição de Pronto

Esta User Story está **pronta** quando:

1. ✅ **Todos os critérios de aceite** estão implementados
2. ✅ **Testes automatizados** passam 100%
3. ✅ **Testes manuais** validam todos os cenários
4. ✅ **Performance** atende aos requisitos
5. ✅ **Acessibilidade** está em conformidade
6. ✅ **Segurança** está implementada
7. ✅ **UX** é consistente e intuitiva
8. ✅ **Deploy** realizado com sucesso

---

**Prioridade:** Alta  
**Complexidade:** Média  
**Tempo Estimado:** 2-3 dias  
**Dependencies:** API de produtos funcional, Componentes CustomSelect, Toast configurado
