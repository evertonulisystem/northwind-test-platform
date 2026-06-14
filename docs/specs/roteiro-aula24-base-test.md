# Planejamento de Curso & Roteiro: Aula 24 (Estrutura Base Sem Page Objects)

Este documento contém a idealização das aulas finais da seção e o roteiro passo a passo para a **Aula 24**, mostrando como criar um pacote de base para reuso do Selenium usando herança, sem introduzir o padrão Page Object.

---

## 1. Grade de Aulas Sugerida (Seção 5 - Finais)

Aqui está a ementa detalhada com os nomes e subtítulos para as aulas 24 a 27:

*   **Aula 22: Primeiro Teste Rodando — Selenium em Ação**
    *   *Subtítulo*: Criando o primeiro script de teste para validar a abertura do navegador e a interação básica de campos.
*   **Aula 23: Cenários Negativos de Login — A Necessidade de Organização**
    *   *Subtítulo*: Expandindo a suíte de testes com validações de dados inválidos e tratando as mensagens de erro do front-end.
*   **Aula 24: Refatorando para Reuso — Criando Nossa Classe Base de Testes**
    *   *Subtítulo*: Como centralizar o setup, cleanup e criar métodos atalhos de interação usando herança, sem complicar com Page Objects.
*   **Aula 25: Replicando Testes em Outra Entidade — Validação de Categorias**
    *   *Subtítulo*: Aplicando a nossa estrutura base para testar a criação de categorias com novos formulários de forma rápida e limpa.
*   **Aula 26: Evidências Automáticas — Tirando Screenshots em Caso de Falha**
    *   *Subtítulo*: Capturando imagens da tela do navegador automaticamente pelo Selenium quando um teste falha na execução.
*   **Aula 27: Relatórios de Execução — Integrando JUnit 5 e Maven Surefire**
    *   *Subtítulo*: Executando os testes via linha de comando e gerando relatórios consolidados prontos para o Azure DevOps.

---

## 2. Roteiro da Aula 24: Refatorando para Reuso (Sem Page Object)

Nesta aula, explicaremos como remover a duplicação do código de inicialização e finalização do WebDriver. Em vez de usar Page Objects, usaremos **Herança em Java** (`extends`) e criaremos **métodos de atalho** na classe base.

### Estrutura de Pastas Proposta:
```text
src/test/java/
└── app/
    └── vercel/
        └── northwind/
            ├── base/
            │   └── BaseTest.java   <-- Nova Classe Mãe (Setup, Cleanup e Helpers)
            └── login/
                └── LoginTest.java  <-- Classe Filha (Apenas os cenários de teste)
```

---

## Bloco 1: O Conceito do Pacote `base` (Explicação Didática)

### Roteiro para o Instrutor:
> *"Alunos, na aula anterior nós criamos 8 testes na nossa classe `LoginTest`. Mas percebam: se criarmos uma nova classe chamada `CategoriasTest` ou `ProdutosTest`, teremos que copiar e colar todo o bloco `@BeforeEach` e `@AfterEach` novamente. E se amanhã precisarmos trocar o Chrome pelo Firefox? Teremos que alterar todos os arquivos!*
>
> *Para resolver isso sem precisar de arquiteturas complexas como Page Objects, vamos criar uma **Classe Mãe** chamada `BaseTest` dentro de um pacote chamado `base`. Ela guardará todo o comportamento que se repete e as outras classes de teste vão simplesmente herdá-lo."*

---

## Bloco 2: Criando a Classe Mãe (`BaseTest.java`)

Apresente o código abaixo aos alunos. Ele ficará no pacote `app.vercel.northwind.base`.

```java
package app.vercel.northwind.base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;
    protected final String baseUrl = "https://northwind-test-platform.vercel.app/";

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

    // --- MÉTODOS ATALHOS / AUXILIARES PARA FACILITAR OS TESTES ---

    /**
     * Atalho para digitar em um campo de texto.
     */
    protected void escrever(By localizador, String texto) {
        driver.findElement(localizador).sendKeys(texto);
    }

    /**
     * Atalho para clicar em um botão ou link.
     */
    protected void clicar(By localizador) {
        driver.findElement(localizador).click();
    }

    /**
     * Atalho para capturar um texto de um elemento.
     */
    protected String obterTexto(By localizador) {
        return driver.findElement(localizador).getText().trim();
    }
}
```

### O que explicar sobre o `BaseTest`:
1.  **Atributos `protected`**: Explicar que usamos `protected` (protegido) em vez de `private` para que as classes filhas (como `LoginTest`) possam acessar o `driver` e o `wait` diretamente. Se fosse `private`, as classes filhas não conseguiriam utilizá-los.
2.  **Métodos Auxiliares (`escrever`, `clicar`, `obterTexto`)**: Explicar aos alunos que, para não ficar repetindo `driver.findElement(...)` toda hora nos testes, criamos pequenos métodos atalhos que recebem o `By` (seletor) e fazem a ação. Isso deixa a escrita dos testes muito mais intuitiva.

---

## Bloco 3: Refatorando a Classe Filha (`LoginTest.java`)

Agora, mostre como a classe de teste fica extremamente enxuta. Ela deve herdar de `BaseTest` usando a palavra-chave **`extends`**.

```java
package app.vercel.northwind.login;

import app.vercel.northwind.base.BaseTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

@DisplayName("Testes de Validação - Página de Login (Refatorado)")
public class LoginTest extends BaseTest {

    @Test
    @DisplayName("CEN-L01 - Validar erro de email e senha obrigatórios")
    public void testValidarCamposObrigatoriosVazios() {
        driver.get(baseUrl);
        
        // Clica nos campos usando os métodos auxiliares herdados da classe mãe
        clicar(By.name("email"));
        clicar(By.name("password"));
        clicar(By.cssSelector("[data-testid='login-button']"));
        
        // Valida que a mensagem de erro correta é exibida
        String erro = obterTexto(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertEquals("Email e senha são obrigatórios", erro);
    }

    @Test
    @DisplayName("CEN-L03 - Validar erro de senha muito curta")
    public void testValidarSenhaCurta() {
        driver.get(baseUrl);
        
        // Escreve e clica usando os métodos auxiliares
        escrever(By.name("email"), "admin@qatest.com");
        escrever(By.name("password"), "12345");
        clicar(By.cssSelector("[data-testid='login-button']"));
        
        // Valida a mensagem de erro na tela
        String erro = obterTexto(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertEquals("Senha deve ter pelo menos 6 caracteres", erro);
    }
}
```

### O que explicar sobre o `LoginTest` refatorado:
1.  **`extends BaseTest`**: É a herança. Significa que a classe `LoginTest` agora possui automaticamente tudo o que a `BaseTest` tem (o `driver`, o `@BeforeEach`, o `@AfterEach` e os métodos de atalho).
2.  **Onde sumiu o `@BeforeEach` e `@AfterEach`?**: Explique que o JUnit 5 vasculha a classe mãe e executa o `@BeforeEach` e `@AfterEach` de lá automaticamente. O aluno não precisa reescrevê-los.
3.  **Legibilidade**: Mostre como o teste antes precisava de 3 linhas complexas do Selenium para validar um texto e agora faz com apenas 2 linhas limpas (`obterTexto` + `assertEquals`).

---

## Bloco 4: Preparação para a Próxima Aula (Visualização de Categorias)

### Roteiro para o Instrutor:
> *"Vejam como ficou simples! Na próxima aula (Aula 25), vamos criar os testes da tela de Categorias. E adivinhem? Bastará criar uma classe `CategoriasTest` que também faz `extends BaseTest`. Teremos o navegador configurado e todas as funções de clique e digitação prontas para uso em menos de 10 segundos!"*
