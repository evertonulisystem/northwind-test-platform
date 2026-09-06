# Roteiro de Aula Didático: Aula 23 (Cenários Negativos de Login e Organização)

> [!NOTE]
> **Foco Pedagógico:** Esta aula apresenta aos alunos que **não dominam Java** a lógica de testes negativos e a validação de mensagens de erro. Explicamos a sintaxe básica de classes Java, o ciclo de vida do JUnit 5 (`@BeforeEach`/`@AfterEach`), o papel do `WebElement` e a importância das asserções, tudo dentro do **IntelliJ**.
> A gravação deve durar **menos de 10 minutos**.

---

## 📅 Cronograma de Gravação (Máximo 10 Minutos)
*   **Minuto 0:00 a 1:30 (Introdução):** O que são testes negativos e por que precisamos validar se as mensagens de erro corretas estão aparecendo no front-end.
*   **Minuto 1:30 a 4:30 (Prática no IntelliJ - Estrutura e JUnit):** Escrevendo a classe `LoginTest`, explicando `@BeforeEach`, `@AfterEach` e variáveis privadas.
*   **Minuto 4:30 a 7:30 (O que é WebElement e Asserções):** Criando o teste de senha curta, explicando como guardar o elemento da tela (`WebElement`) e usar asserções.
*   **Minuto 7:30 a 9:00 (O Problema do 'Copiar e Colar'):** Mostrando que se continuarmos escrevendo todos os 8 cenários copiando o driver e setup, nosso código ficará gigante (introduzindo a necessidade da Aula 24).
*   **Minuto 9:00 a 10:00 (Execução & Conclusão):** Rodando o teste de validação no IntelliJ.

---

## 1. Roteiro Passo a Passo de Gravação (Script do Professor)

### Bloco 1: O Que São Testes Negativos? (Tempo: 1m30s)
*   **Ação na Tela:** Abra a página de login no navegador. Tente digitar dados errados e clique em "Entrar". Destaque as mensagens de erro vermelhas que aparecem nos campos.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Na aula anterior (Aula 22), rodamos nosso primeiro teste de sucesso. Mas na vida real, os usuários cometem erros: digitam senhas curtas, e-mails inválidos ou tentam logar sem preencher nada.*
    >
    > *Hoje, vamos criar os **Testes Negativos**. Eles servem para garantir que o nosso sistema se comporte de forma segura, exibindo os alertas corretos e bloqueando acessos indevidos. Vamos criar essa automação no IntelliJ."*

---

### Bloco 2: Estrutura do Teste e Ciclo de Vida do JUnit 5 (Tempo: 3m00s)
*   **Ação na Tela:** Abra o IntelliJ e posicione o cursor na classe `LoginTest.java`. Mostre as variáveis privadas no topo e os métodos anotados.
*   **Código a ser apresentado/digitado:**
```java
package app.vercel.northwind.login;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import java.time.Duration;

@DisplayName("Testes de Validação - Página de Login")
public class LoginTest {
    private WebDriver driver;

    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
```

*   **Explicação Didática de Java para os Alunos (Sem mistérios):**
    *   **`private WebDriver driver;`**: *"O `WebDriver` é o 'motorista' do Chrome. Declaramos ele como `private` (privado) para que nenhuma outra parte do projeto mexa no nosso navegador a não ser os testes dentro deste arquivo."*
    *   **`@BeforeEach`**: *"Esta anotação diz ao JUnit: 'Antes de rodar cada caso de teste individual, execute o método `setUp()`'. Ele serve para abrir uma janela limpa do Google Chrome e configurar uma espera implícita de até 2 segundos (`implicitlyWait`) para os elementos da página carregarem."*
    *   **`@AfterEach` e `driver.quit()`**: *"Diz ao JUnit para rodar o `tearDown()` no final de cada teste, fechando o navegador com o `driver.quit()`. É muito importante sempre fechar o navegador para não travar a memória do seu computador com dezenas de janelas abertas!"*

---

### Bloco 3: Escrevendo um Teste Negativo e Validando Erros (Tempo: 3m00s)
*   **Ação na Tela:** Escreva o teste de validação de senha curta (`testValidarSenhaCurta`).
*   **Código a ser digitado:**
```java
    @Test
    @DisplayName("CEN-L03 - Validar erro de senha muito curta")
    public void testValidarSenhaCurta() {
        driver.get("https://northwind-test-platform.vercel.app/");
        
        // 1. Preencher e-mail válido e senha com menos de 6 caracteres
        driver.findElement(org.openqa.selenium.By.name("email")).sendKeys("admin@qatest.com");
        driver.findElement(org.openqa.selenium.By.name("password")).sendKeys("12345");
        driver.findElement(org.openqa.selenium.By.cssSelector("[data-testid='login-button']")).click();
        
        // 2. Localizar o elemento de erro de senha na tela
        org.openqa.selenium.WebElement errorElement = driver.findElement(org.openqa.selenium.By.cssSelector("[data-testid='password-error']"));
        
        // 3. Asserções (Validação)
        org.junit.jupiter.api.Assertions.assertTrue(errorElement.isDisplayed(), "Mensagem de erro deveria estar visível.");
        org.junit.jupiter.api.Assertions.assertEquals("Senha deve ter pelo menos 6 caracteres", errorElement.getText().trim());
    }
```

*   **Explicação Didática de Java para os Alunos:**
    *   **`WebElement`**: *"O `WebElement` é uma variável especial do Selenium usada para representar qualquer componente físico do HTML da página web (uma caixa de texto, um botão, ou um texto de erro vermelho). Guardamos a referência do balão de erro na variável `errorElement` para poder fazer perguntas sobre ele."*
    *   **`Assertions.assertTrue`**: *"É uma validação lógica. O teste só passará se a expressão dentro dos parênteses for verdadeira. Perguntamos se o elemento está sendo exibido na tela (`isDisplayed()`). Se não estiver, o teste falha."*
    *   **`errorElement.getText().trim()`**: *"O `getText()` lê o texto escrito no balão de erro na tela. E o `.trim()` é um comando do Java para limpar qualquer espaço em branco invisível nas pontas da frase (o que evita falsos-negativos nos testes)."*
    *   **`Assertions.assertEquals`**: *"Garante que o texto lido da tela seja exatamente idêntico ao texto que esperávamos. Se for diferente, o JUnit interrompe a execução e aponta o erro."*

---

### Bloco 4: O Problema do Código Duplicado (Tempo: 1m30s)
*   **Ação na Tela:** Role o código no IntelliJ mostrando que se precisarmos criar mais 7 testes de validação (para usuário inativo, e-mail inválido, credenciais erradas, etc.), o arquivo ficará gigante e com os mesmos comandos de abrir e fechar navegador copiados.
*   **Fala do Instrutor:**
    > *"Vejam só, alunos! Nosso teste de senha curta está funcionando. Mas temos outros 7 cenários de erro para testar. Se a gente copiar e colar esse bloco inteiro de configuração de navegador para cada um dos 8 testes, nosso arquivo ficará com centenas de linhas de código repetido e de difícil manutenção.*
    >
    > *Por isso, na próxima aula (Aula 24), vamos refatorar o nosso projeto. Vamos criar uma classe base com toda essa configuração inicial e faremos com que nossas classes de teste apenas herdem o navegador pronto usando herança do Java. Vejo vocês na próxima aula!"*

---

### Bloco 5: Execução do Teste no IntelliJ (Tempo: 1m00s)
*   **Ação na Tela:** Clique na setinha verde de play no IntelliJ e selecione **Run**. Mostre o navegador se abrindo, digitando e o JUnit acusando o status verde de sucesso.
*   **Fala do Instrutor:**
    > *"Testes rodando e passando com sucesso! O erro de senha curta foi capturado e validado com precisão. Até a próxima aula!"*
