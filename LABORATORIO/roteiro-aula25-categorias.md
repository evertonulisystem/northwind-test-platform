# Roteiro de Aula Didático: Aula 25 (Reuso em Nova Entidade — Categorias)

> [!NOTE]
> **Foco Pedagógico:** Esta aula demonstra aos alunos iniciantes o **verdadeiro poder do reuso** e da Herança. Em poucos minutos, criaremos uma suíte de testes completa para outra tela da aplicação (Categorias) sem precisar reescrever nenhuma linha de configuração de navegador.
> A gravação deve durar **menos de 10 minutos**.

---

## 📅 Cronograma de Gravação (Máximo 10 Minutos)
*   **Minuto 0:00 a 1:30 (Conceito):** Apresentando a nova tela de Categorias e mostrando como ela se assemelha ao login em termos de formulários.
*   **Minuto 1:30 a 3:30 (Criação no IntelliJ):** Criando a classe `CategoriasTest` no IntelliJ, explicando o pacote e a herança.
*   **Minuto 3:30 a 5:30 (Login de Suporte):** Como os testes de outras telas precisam de autenticação, mostrando como fazer login rápido.
*   **Minuto 5:30 a 8:30 (Escrita dos Testes):** Criando o teste de validação de campos obrigatórios da categoria com nossos métodos `clicar` e `escrever`.
*   **Minuto 8:30 a 10:00 (Execução & Retrospectiva):** Rodando o teste e consolidando o aprendizado sobre o ganho de produtividade.

---

## 1. Roteiro Passo a Passo de Gravação (Script do Professor)

### Bloco 1: Apresentando a tela de Categorias (Tempo: 1m30s)
*   **Ação na Tela:** Abra o navegador na página de Login, faça login com as credenciais `admin@qatest.com` / `Teste@123` e clique em navegar para a URL `/categories`. Mostre a tela de Gestão de Categorias, clique no botão "Nova Categoria" para abrir o modal.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Agora que temos a nossa estrutura base organizada, vamos ver como é rápido criar testes para outras partes do nosso sistema. 
    >
    > *Hoje, vamos testar a tela de **Gestão de Categorias**. Para criar uma categoria, nós clicamos no botão 'Nova Categoria', o que abre um modal com os campos 'Nome' e 'Descrição'. Se tentarmos salvar sem preencher nada, o sistema exibe mensagens de erro dizendo que eles são obrigatórios. Vamos automatizar esse teste de forma ultra rápida usando a nossa base."*

---

### Bloco 2: Criando a Classe no IntelliJ (Tempo: 2m00s)
*   **Ação na Tela:**
    1. Vá na aba lateral esquerda (*Project*).
    2. Clique com o botão direito sobre a pasta `northwind` -> **New** -> **Package**.
    3. Digite `categories` e aperte Enter.
    4. Clique com o botão direito sobre o novo pacote `categories` -> **New** -> **Java Class**.
    5. Digite `CategoriasTest` e aperte Enter.
*   **Fala do Instrutor (Conceitos Java na Prática):**
    > *"Criamos um pacote separado chamado `categories` para manter nosso projeto organizado. Nossa classe `CategoriasTest` vai herdar tudo da classe base usando a herança do Java. Vamos começar escrevendo a assinatura dela."*

*(Digite ou mostre o código inicial)*:
```java
package app.vercel.northwind.categories;

import app.vercel.northwind.base.BaseTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

@DisplayName("Testes de Validação - Gestão de Categorias")
public class CategoriasTest extends BaseTest {
```

*   **Explicação Didática de Java para os Alunos:**
    *   **Reuso automático**: *"Observem que não digitamos `@BeforeEach`, `@AfterEach` nem criamos o `ChromeDriver`. Fazendo apenas o `extends BaseTest`, o Java se encarrega de preparar e fechar o navegador para nós antes e depois de cada teste."*

---

### Bloco 3: Efetuando Login como Pré-Requisito (Tempo: 2m00s)
*   **Ação na Tela:** Comece a escrever o método de teste. Explique por que precisamos fazer login no início do teste.
*   **Código a ser inserido:**
```java
    @Test
    @DisplayName("CEN-C01 - Validar erros de campos obrigatórios no cadastro de categoria")
    public void testValidarCamposObrigatoriosCadastroCategoria() {
        // 1. Acessar a tela inicial de login
        driver.get(baseUrl);
        
        // 2. Realizar login para conseguir acesso
        escrever(By.name("email"), "admin@qatest.com");
        escrever(By.name("password"), "Teste@123");
        clicar(By.cssSelector("[data-testid='login-button']"));
        
        // 3. Navegar para a página de Categorias
        driver.get(baseUrl + "categories");
```
*   **Explicação Didática de Java para os Alunos:**
    *   **Fluxo End-to-End**: *"Para testar as categorias, precisamos estar logados, pois o sistema protege as páginas internas. Por isso, começamos o teste fazendo o login completo e depois mandamos o navegador ir para a URL de categorias (`baseUrl + "categories"`)."*

---

### Bloco 4: Escrevendo as Validações do Formulário (Tempo: 3m00s)
*   **Ação na Tela:** Complete o método de teste interagindo com o modal de categorias e validando as mensagens de erro nos seletores `error-category-name` e `error-category-description`.
*   **Código a ser inserido:**
```java
        // 4. Clicar no botão 'Nova Categoria' para abrir o modal
        clicar(By.cssSelector("[data-testid='add-category-btn']"));
        
        // 5. Clicar em 'Salvar' diretamente sem preencher nada
        clicar(By.cssSelector("[data-testid='save-category-btn']"));
        
        // 6. Capturar e validar as mensagens de erro exibidas nos campos
        String erroNome = obterTexto(By.cssSelector("[data-testid='error-category-name']"));
        String erroDescricao = obterTexto(By.cssSelector("[data-testid='error-category-description']"));
        
        Assertions.assertEquals("Nome da categoria é obrigatório", erroNome);
        Assertions.assertEquals("Descrição é obrigatória", erroDescricao);
    }
}
```

*   **Explicação Didática de Java para os Alunos:**
    *   **Identificação via data-testid**: *"Usamos seletores CSS baseados em `data-testid` (como `[data-testid='error-category-name']`). Isso é uma excelente prática na indústria de testes. Os desenvolvedores colocam esses identificadores de teste especialmente para nós, garantindo que nossos testes não quebrem se mudarem o visual da página."*
    *   **Facilidade de leitura**: *"Vejam como a escrita do teste ficou simples de ler. Qualquer pessoa, mesmo sem saber programar, consegue entender o que está acontecendo por causa das funções de atalho `clicar` e `obterTexto` que criamos na classe base."*

---

### Bloco 5: Rodando o Teste no IntelliJ (Tempo: 1m30s)
*   **Ação na Tela:** Clique no botão verde de play no IntelliJ do lado esquerdo do teste de categorias e selecione **Run**. Mostre o navegador se abrindo, fazendo o login, navegando até as categorias, abrindo o modal, tentando salvar e o JUnit sinalizando sucesso (verdinho).
*   **Fala do Instrutor:**
    > *"Prontinho! Rodou perfeitamente. Em poucos minutos, criamos uma nova classe de testes, automatizamos um formulário completo em outra tela, validamos duas mensagens de erro diferentes e tudo isso escrevendo pouquíssimas linhas de código, graças à nossa herança.*
    >
    > *Na próxima aula, vamos aprender sobre como registrar evidências visuais de bugs: vamos fazer com que o Selenium tire um print da tela (screenshot) automaticamente toda vez que um teste falhar na nossa esteira. Até lá!"*
