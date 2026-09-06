# Roteiro de Aula Didático: Aula 24 (Estrutura Base Usando Herança)

> [!NOTE]
> **Foco Pedagógico:** Este roteiro foi desenhado para alunos que **não dominam Java**. As explicações de sintaxe de Java e o passo a passo no **IntelliJ** são autoexplicativos para evitar que o aluno precise pesquisar conceitos na internet. 
> A aula foi estruturada para ser gravada em **menos de 10 minutos**.

---

## 📅 Cronograma de Gravação (Máximo 10 Minutos)
*   **Minuto 0:00 a 1:30 (Introdução):** Apresentação do problema (código duplicado) e o conceito de Herança.
*   **Minuto 1:30 a 4:30 (Prática no IntelliJ - BaseTest):** Criando o pacote `base`, a classe `BaseTest` e explicando modificadores de acesso e imports.
*   **Minuto 4:30 a 6:00 (Prática - Métodos Auxiliares):** Criando atalhos de digitação e clique, explicando parâmetros.
*   **Minuto 6:00 a 8:30 (Refatoração - LoginTest):** Modificando `LoginTest` para usar herança, deletando código antigo e explicando o `extends`.
*   **Minuto 8:30 a 10:00 (Execução & Conclusão):** Rodando o teste no IntelliJ e preparando a mente do aluno para a próxima aula.

---

## 1. Roteiro Passo a Passo de Gravação (Script do Professor)

### Bloco 1: O Problema e a Solução Conceitual (Tempo: 1m30s)
*   **Ação na Tela:** Abra a classe `LoginTest` criada na aula anterior no IntelliJ. Destaque com o cursor do mouse os blocos `@BeforeEach` e `@AfterEach`.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Se olharmos para nossa classe de teste atual, temos várias linhas de código dedicadas apenas a 'abrir o navegador' e 'fechar o navegador'. Imagine que na próxima aula vamos criar testes para as 'Categorias' do site. Teríamos que copiar todo esse bloco de setup e colar lá.*
    >
    > *Em Java, quando queremos compartilhar códigos comuns entre arquivos diferentes sem precisar copiá-los, usamos um conceito chamado **Herança**. Vamos criar uma classe mãe que sabe gerenciar o navegador, e a nossa classe de teste simplesmente herdará esse superpoder. Vamos fazer isso agora."*

---

### Bloco 2: Criando a Estrutura no IntelliJ (Tempo: 3m00s)
*   **Ação na Tela:** 
    1. Vá na aba lateral esquerda (*Project*).
    2. Clique com o botão direito sobre a pasta `northwind` -> **New** -> **Package**.
    3. Digite `base` e aperte Enter.
    4. Clique com o botão direito sobre o novo pacote `base` -> **New** -> **Java Class**.
    5. Digite `BaseTest` e aperte Enter.
*   **Fala do Instrutor (Explicando o Java na Prática):**
    > *"No IntelliJ, organizamos arquivos em pastas chamadas **pacotes (packages)**. Criamos o pacote `base` para separar as configurações dos testes reais. Vamos digitar a estrutura da nossa classe base."*

*(Digite ou mostre o código abaixo)*:
```java
package app.vercel.northwind.base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;
    protected final String baseUrl = "https://northwind-test-platform.vercel.app/";
```

*   **Explicação Didática de Java para os Alunos:**
    *   **`import`**: *"O Java não carrega tudo de uma vez para não ficar pesado. O `import` avisa ao compilador: 'Vou usar peças do Selenium e do JUnit que estão guardadas na biblioteca externa'."*
    *   **`protected` vs `private`**: *"Nas aulas anteriores usamos `private` (privado), o que trancava o navegador dentro daquela classe. Agora usamos `protected` (protegido). Isso significa que as nossas classes de teste (classes filhas) poderão usar o `driver` e o `wait` livremente, mas classes estranhas de fora não."*
    *   **`final`**: *"A palavra `final` no Java diz que essa URL é uma constante. Ninguém pode alterar o valor de `baseUrl` por acidente durante o teste."*

---

### Bloco 3: Movendo as Configurações e Criando Métodos Auxiliares (Tempo: 2m30s)
*   **Ação na Tela:** Complete a classe `BaseTest` com o setup, cleanup e os métodos utilitários.
*   **Código a ser inserido:**
```java
    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    // --- MÉTODOS ATALHOS / AUXILIARES ---
    protected void escrever(org.openqa.selenium.By localizador, String texto) {
        driver.findElement(localizador).sendKeys(texto);
    }

    protected void clicar(org.openqa.selenium.By localizador) {
        driver.findElement(localizador).click();
    }

    protected String obterTexto(org.openqa.selenium.By localizador) {
        return driver.findElement(localizador).getText().trim();
    }
}
```

*   **Explicação Didática de Java para os Alunos:**
    *   **Parâmetros `(By localizador, String texto)`**: *"Para ensinar nosso código a escrever, criamos um método chamado `escrever`. Entre os parênteses, definimos as variáveis de entrada. Ele precisa de duas coisas: saber onde clicar (`By localizador`) e o que digitar (`String texto`). É como uma receita: você passa os ingredientes e o método executa a tarefa."*
    *   **`return ... .trim()`**: *"O método `obterTexto` começa com a palavra `String` porque ele promete **retornar (devolver)** uma palavra/texto extraído da tela. Usamos o `.trim()` no final para limpar qualquer espaço em branco bobo que o HTML venha a trazer nas pontas."*

---

### Bloco 4: Refatorando o `LoginTest` com a Herança (Tempo: 1m30s)
*   **Ação na Tela:** Abra a classe `LoginTest` no IntelliJ. Modifique a assinatura da classe para usar `extends BaseTest`. Apague os atributos `driver`, `wait`, `baseUrl`, e os métodos `@BeforeEach` e `@AfterEach`. Reescreva os testes usando os novos métodos auxiliares.
*   **Fala do Instrutor:**
    > *"Agora vamos na nossa classe `LoginTest`. Vamos usar a palavra-chave **`extends`** do Java, que traduzindo significa 'estende' ou 'herda de'. Ao fazermos `LoginTest extends BaseTest`, nossa classe de teste ganha automaticamente tudo o que a classe base possui."*

*(Mostre o código limpo)*:
```java
package app.vercel.northwind.login;

import app.vercel.northwind.base.BaseTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

@DisplayName("Testes de Validação - Página de Login")
public class LoginTest extends BaseTest {

    @Test
    @DisplayName("CEN-L01 - Validar erro de email e senha obrigatórios")
    public void testValidarCamposObrigatoriosVazios() {
        driver.get(baseUrl);
        
        // Chamamos diretamente os métodos herdados da BaseTest
        clicar(By.name("email"));
        clicar(By.name("password"));
        clicar(By.cssSelector("[data-testid='login-button']"));
        
        String erro = obterTexto(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertEquals("Email e senha são obrigatórios", erro);
    }
}
```

*   **Explicação Didática de Java para os Alunos:**
    *   **Imports de Pacotes Diferentes**: *"Como a nossa classe `BaseTest` está em outro pacote (no pacote `base`), o Java precisa de um import explícito: `import app.vercel.northwind.base.BaseTest;` para saber de onde essa classe mãe está vindo. O IntelliJ faz isso sozinho se você começar a digitar e apertar Enter."*
    *   **O que mudou?**: *"Vejam como nosso teste ficou enxuto. Não precisamos abrir driver nem fechá-lo. O JUnit executa isso nos bastidores porque a classe mãe mandou."*

---

### Bloco 5: Execução e Fechamento da Aula (Tempo: 1m30s)
*   **Ação na Tela:** Clique na setinha verde ao lado esquerdo de `testValidarCamposObrigatoriosVazios` no IntelliJ e selecione **Run**. Mostre o teste passando no painel inferior do IntelliJ.
*   **Fala do Instrutor:**
    > *"Vejam só! O navegador abriu, executou e fechou sozinho. E no painel do JUnit no IntelliJ, temos o nosso teste com o nome amigável que colocamos no `@DisplayName`. 
    >
    > *Na próxima aula, vamos criar os testes para a área de 'Categorias' do site. E vocês vão ver como será rápido: vamos herdar a `BaseTest` e escreveremos os testes de categorias em poucos segundos sem digitar uma única linha de configuração de navegador. Até a próxima aula!"*
