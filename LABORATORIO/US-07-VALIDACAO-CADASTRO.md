# US-07: Validação Completa do Cadastro de Usuário

## User Story
Como um **novo usuário** do sistema QA Automation Shop, eu quero **me cadastrar com informações válidas** para que eu possa **acessar a plataforma** e **realizar testes automatizados**.

## Critérios de Aceite

### 📝 **Campos Obrigatórios**

**Dado** que estou na página de cadastro
**Quando** deixo campos obrigatórios vazios
**Então** devo ver mensagens de erro específicas:

| Campo | Mensagem Esperada |
|--------|------------------|
| Nome Completo | "Nome completo é obrigatório" |
| Email | "Email é obrigatório" |
| Senha | "Senha é obrigatória" |
| Confirmar Senha | "Confirmação de senha é obrigatória" |

### 📧 **Validação de Email**

**Dado** que estou no campo de email
**Quando** digito um email inválido
**Então** devo ver mensagens específicas:

| Email Inválido | Mensagem Esperada |
|---------------|------------------|
| `test` | "Formato de email inválido" |
| `test@` | "Formato de email inválido" |
| `test@domain` | "Formato de email inválido" |
| `@domain.com` | "Formato de email inválido" |
| `test..email@domain.com` | "Formato de email inválido" |
| `test@domain..com` | "Formato de email inválido" |
| `test@.com` | "Formato de email inválido" |

### 👤 **Validação de Nome Completo**

**Dado** que estou no campo de nome completo
**Quando** digito um nome inválido
**Então** devo ver mensagens específicas:

| Nome Inválido | Mensagem Esperada |
|---------------|------------------|
| `""` (vazio) | "Nome completo é obrigatório" |
| `" "` (espaço) | "Nome completo é obrigatório" |
| `"Jo"` | "Nome deve ter no mínimo 3 caracteres" |
| `"J"` | "Nome deve ter no mínimo 3 caracteres" |
| Nome com 101+ caracteres | "Nome deve ter no máximo 100 caracteres" |
| `"12345"` | "Nome deve conter apenas letras" |
| `"João123"` | "Nome deve conter apenas letras" |
| `"João@#$"` | "Nome deve conter apenas letras e espaços" |

### 🔒 **Validação de Senha**

**Dado** que estou no campo de senha
**Quando** digito uma senha inválida
**Então** devo ver mensagens específicas:

| Senha Inválida | Mensagem Esperada |
|-----------------|------------------|
| `""` (vazia) | "Senha é obrigatória" |
| `"123"` | "Senha deve ter no mínimo 6 caracteres" |
| `"12345"` | "Senha deve ter no mínimo 6 caracteres" |
| `" "` (espaço) | "Senha é obrigatória" |
| `"password"` | "Senha deve conter letras e números" |
| `"123456"` | "Senha deve conter letras e números" |
| `"PASSWORD"` | "Senha deve conter letras e números" |

### 🔄 **Validação de Confirmação de Senha**

**Dado** que preenchi a senha
**Quando** a confirmação não coincide
**Então** devo ver mensagem específica:

| Senha | Confirmação | Mensagem Esperada |
|--------|-------------|------------------|
| `"Teste@123"` | `"Teste@124"` | "Senhas não conferem" |
| `"Teste@123"` | `"teste@123"` | "Senhas não conferem" |
| `"Teste@123"` | `"Teste@123 "` | "Senhas não conferem" |
| `"Teste@123"` | `""` | "Confirmação de senha é obrigatória" |

### 🚫 **Validação de Email Duplicado**

**Dado** que existe um usuário cadastrado
**Quando** tento cadastrar com o mesmo email
**Então** devo ver mensagem específica:

| Email Existente | Mensagem Esperada |
|-----------------|------------------|
| `admin@qatest.com` | "Email já cadastrado. Use outro email ou faça login." |
| Email já no banco | "Email já cadastrado. Use outro email ou faça login." |

### ✅ **Cenários de Sucesso**

**Dado** que preenchi todos os campos corretamente
**Quando** clico em "Criar Conta"
**Então** devo ser redirecionado para o login

| Campos Válidos | Resultado Esperado |
|----------------|-------------------|
| Nome: `"João Silva"`<br>Email: `"joao.silva@test.com"`<br>Senha: `"Teste@123"`<br>Confirmação: `"Teste@123"` | "Cadastro realizado com sucesso! Redirecionando..."<br>Redirecionamento para `/` após 2 segundos |

### 🎨 **Validação Visual (UX)**

**Dado** que estou interagindo com o formulário
**Quando** ocorrem erros
**Então** devo ver feedback visual consistente:

| Estado | Visual Esperado |
|---------|-----------------|
| Campo com erro | Borda vermelha, fundo levemente avermelhado |
| Campo válido | Borda branca, fundo normal |
| Mensagem de erro | Texto vermelho claro com bolinha indicadora |
| Campo focado | Anel branco ao redor |
| Botão desabilitado | Opacidade 50%, cursor não clicável |
| Botão habilitado | Opacidade 100%, cursor clicável |

### 🔍 **Validação em Tempo Real**

**Dado** que estou digitando nos campos
**Quando** corrijo um erro
**Então** a mensagem de erro deve desaparecer:

| Ação | Resultado Esperado |
|--------|------------------|
| Digitar em campo com erro | Mensagem de erro some imediatamente |
| Corrigir formatação | Borda volta ao normal |
| Preencher campo obrigatório | Mensagem de obrigatório desaparece |

### 📱 **Validação Responsiva**

**Dado** que acesso em diferentes dispositivos
**Quando** preencho o formulário
**Então** a validação deve funcionar igualmente:

| Dispositivo | Comportamento Esperado |
|-------------|---------------------|
| Desktop | Validação em tempo real, mensagens visíveis |
| Tablet | Layout adaptado, mensagens legíveis |
| Mobile | Campos empilhados, mensagens visíveis |

### 🚀 **Performance**

**Dado** que estou usando o formulário
**Quando** interajo com os campos
**Então** a resposta deve ser imediata:

| Ação | Tempo Máximo Esperado |
|--------|---------------------|
| Validação de campo | < 100ms |
| Exibição de erro | < 50ms |
| Remoção de erro | < 50ms |
| Submissão do formulário | < 200ms |

## Critérios Técnicos

### 🛡️ **Segurança**
- ✅ Senha nunca deve ser exibida em texto claro
- ✅ Validação deve ocorrer no frontend e backend
- ✅ Proteção contra SQL injection
- ✅ Sanitização de inputs

### 🎯 **Acessibilidade**
- ✅ Labels associadas aos inputs
- ✅ Mensagens de erro com aria-describedby
- ✅ Navegação por teclado funcional
- ✅ Contraste de cores WCAG compliant

### 📊 **Analytics**
- ✅ Eventos de validação trackeados
- ✅ Taxa de conversão medida
- ✅ Erros comuns identificados

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

## 📋 **Capítulo de Critérios de Aceite (Gherkin)**

### **Feature:** Cadastro de Usuário

```gherkin
Feature: Cadastro de Usuário
  Como um novo usuário do sistema
  Eu quero me cadastrar com informações válidas
  Para que eu possa acessar a plataforma e realizar testes automatizados

  Scenario: Campos obrigatórios vazios
    Given que estou na página de cadastro
    When deixo todos os campos obrigatórios vazios
    And clico em "Criar Conta"
    Then devo ver mensagens de erro específicas para cada campo
      | Campo | Mensagem Esperada |
      | Nome Completo | "Nome completo é obrigatório" |
      | Email | "Email é obrigatório" |
      | Senha | "Senha é obrigatória" |
      | Confirmar Senha | "Confirmação de senha é obrigatória" |

  Scenario: Email inválido
    Given que estou na página de cadastro
    And preencho todos os campos corretamente
    When digito um email inválido no campo email
    Then devo ver mensagem "Formato de email inválido"
    And o campo deve ficar com borda vermelha

  Scenario: Nome muito curto
    Given que estou na página de cadastro
    And preencho todos os campos corretamente
    When digito "Jo" no campo nome completo
    Then devo ver mensagem "Nome deve ter no mínimo 3 caracteres"
    And o campo deve ficar com borda vermelha

  Scenario: Senha muito curta
    Given que estou na página de cadastro
    And preencho todos os campos corretamente
    When digito "123" no campo senha
    Then devo ver mensagem "Senha deve ter no mínimo 6 caracteres"
    And o campo deve ficar com borda vermelha

  Scenario: Senhas não conferem
    Given que estou na página de cadastro
    And preencho todos os campos corretamente
    When digito "Teste@123" no campo senha
    And digito "Teste@124" no campo confirmação de senha
    Then devo ver mensagem "Senhas não conferem"
    And ambos os campos devem ficar com borda vermelha

  Scenario: Email já cadastrado
    Given que existe um usuário com email "admin@qatest.com"
    And estou na página de cadastro
    When preencho todos os campos com email "admin@qatest.com"
    And clico em "Criar Conta"
    Then devo ver mensagem "Email já cadastrado. Use outro email ou faça login."
    And o campo email deve ficar com borda vermelha

  Scenario: Cadastro com sucesso
    Given que estou na página de cadastro
    When preencho todos os campos corretamente
      | Campo | Valor |
      | Nome Completo | "João Silva" |
      | Email | "joao.silva@test.com" |
      | Senha | "Teste@123" |
      | Confirmar Senha | "Teste@123" |
    And clico em "Criar Conta"
    Then devo ver mensagem "Cadastro realizado com sucesso! Redirecionando..."
    And devo ser redirecionado para página de login após 2 segundos
    And os campos devem ficar com borda normal
```

---

**Prioridade:** Alta  
**Complexidade:** Média  
**Tempo Estimado:** 3-4 dias  
**Dependencies:** API de cadastro funcional, Toast configurado
