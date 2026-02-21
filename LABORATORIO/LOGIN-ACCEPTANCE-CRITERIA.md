# Login - Critérios de Aceite (BDD Format)

## **Critério 1 – Campos Vazios**

**DADO QUE** o usuário está na página de login  
**QUANDO** deixa ambos os campos vazios e clica em "Entrar"  
**ENTÃO** o sistema deve mostrar:
- "Email é obrigatório" 
- "Senha é obrigatória"
- Não deve redirecionar

---

## **Critério 2 – Email Inválido**

**DADO QUE** o usuário está na página de login  
**QUANDO** digita "test" sem @ e sai do campo  
**ENTÃO** o sistema deve mostrar:
- "Formato de email inválido"

---

## **Critério 3 – Senha Curta**

**DADO QUE** o usuário está na página de login  
**QUANDO** digita "123" e sai do campo  
**ENTÃO** o sistema deve mostrar:
- "Senha deve ter pelo menos 6 caracteres"

---

## **Critério 5 – Usuário Não Cadastrado**

**DADO QUE** o usuário está na página de login  
**QUANDO** digita um email não cadastrado e clica em "Entrar"  
**ENTÃO** o sistema deve mostrar:
- "Usuário não encontrado. Verifique o email ou cadastre-se."
- Não deve redirecionar

---

## **Critério 6 – Login Inválido (Senha Errada)**

**DADO QUE** o usuário está na página de login  
**QUANDO** digita email cadastrado mas senha errada e clica em "Entrar"  
**ENTÃO** o sistema deve mostrar:
- "Email ou senha inválidos"
- Não deve redirecionar

---

## **Critério 7 – Login Válido**

**DADO QUE** o usuário está na página de login  
**QUANDO** digita "admin@qatest.com" / "Teste@123" e clica em "Entrar"  
**ENTÃO** o sistema deve:
- Autenticar com sucesso
- Redirecionar para /products
- Mostrar "Login realizado com sucesso!"

---

## **Validação via API (/api/auth/validate)**

### **Email:**
- Vazio → "Email é obrigatório"
- Inválido → "Formato de email inválido"
- Válido → Limpa erro

### **Senha:**
- Vazia → "Senha é obrigatória" 
- Curta → "Senha deve ter pelo menos 6 caracteres"
- Válida → Limpa erro

---

## **Login via API (/api/auth/login)**

### **Sucesso:**
- Token gerado
- Usuário salvo no localStorage
- Redirecionamento para /products
- Toast "Login realizado com sucesso!"

### **Falha:**
- **Usuário não encontrado:** "Usuário não encontrado. Verifique o email ou cadastre-se." (Status 404)
- **Senha errada:** "Email ou senha inválidos" (Status 401)
- **Usuário inativo:** "Usuário inativo" (Status 403)
- Sem token
- Sem redirecionamento
- Toast de erro

---

## **Cobertura Esperada: 100%**

Todos os critérios acima devem ser validados com testes automatizados para garantir cobertura completa da funcionalidade de login.
