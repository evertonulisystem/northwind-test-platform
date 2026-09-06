# Guia de Melhorias para Escalabilidade de Testes Automatizados (Selenium + Java)

Este documento descreve as limitações de arquitetura de um arquivo de testes unificado (como o `LoginTest.java`) e propõe melhorias estruturais indispensáveis para tornar a suíte de testes corporativa, escalável e de fácil manutenção para o Azure DevOps.

---

## 1. Padrão Page Object Model (POM)
### O Problema
No modelo de arquivo único, os localizadores (seletores CSS, XPath, etc.) e as asserções estão misturados dentro do método de teste. Se um desenvolvedor alterar o `data-testid` de um campo de email no front-end, você precisará editar manualmente todos os testes que interagem com o login.

### A Solução
Criar uma classe separada para representar a página de login. Ela contém apenas os seletores e os métodos de ação (ex: `preencherEmail()`, `clicarEntrar()`). O arquivo de teste apenas consome essa classe.

```java
// Exemplo de Page Object: LoginPage.java
public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Seletores encapsulados
    private By emailInput = By.name("email");
    private By passwordInput = By.name("password");
    private By loginButton = By.cssSelector("[data-testid='login-button']");
    private By emailError = By.cssSelector("[data-testid='email-error']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(5));
    }

    public void realizarLogin(String email, String password) {
        driver.findElement(emailInput).sendKeys(email);
        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(loginButton).click();
    }

    public String obterErroEmail() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(emailError)).getText();
    }
}
```

---

## 2. Gerenciamento do WebDriver com ThreadLocal (Execução Paralela)
### O Problema
A instanciação direta do `ChromeDriver` dentro do `@BeforeEach` impede que testes rodem em paralelo na mesma máquina sem causar conflitos de foco e sessões sobrepostas.

### A Solução
Implementar uma classe `DriverFactory` utilizando `ThreadLocal`. Isso garante que cada teste em execução paralela tenha sua própria instância isolada do navegador.

```java
public class DriverFactory {
    private static ThreadLocal<WebDriver> threadDriver = new ThreadLocal<>();

    public static WebDriver getDriver() {
        if (threadDriver.get() == null) {
            threadDriver.set(new ChromeDriver());
        }
        return threadDriver.get();
    }

    public static void quitDriver() {
        if (threadDriver.get() != null) {
            threadDriver.get().quit();
            threadDriver.remove();
        }
    }
}
```

---

## 3. Substituição de Esperas Implícitas por Explícitas (Waits)
### O Problema
O uso do `implicitlyWait(Duration.ofSeconds(2))` faz com que o Selenium espere por qualquer elemento que não seja encontrado na página por até 2 segundos, o que atrasa a execução de testes negativos intencionais e torna o framework lento.

### A Solução
Desativar esperas implícitas e utilizar o `WebDriverWait` (espera explícita) apenas quando necessário (ex: aguardar um botão ficar clicável ou um redirecionamento de URL terminar).
```java
// Boa prática: Esperar até que a URL mude
wait.until(ExpectedConditions.urlContains("/products"));
```

---

## 4. Separação de Dados de Teste e Configurações (Properties/JSON)
### O Problema
URLs de ambientes (`https://northwind-test-platform.vercel.app/`) e credenciais de teste (`admin@qatest.com`) estão gravados diretamente no código (hardcoded). Se o ambiente mudar ou a senha expirar, o código quebra.

### A Solução
Utilizar arquivos `.properties` ou variáveis de ambiente do sistema operacional para carregar dinamicamente as configurações.
```java
// Exemplo de leitura de propriedades
Properties prop = new Properties();
prop.load(new FileInputStream("src/test/resources/config.properties"));
String baseUrl = prop.getProperty("url.base");
```
No Azure DevOps Pipelines, esses dados podem ser injetados como variáveis secretas protegidas.

---

## 5. Captura automática de Screenshots em caso de falhas
### O Problema
Quando um teste falha na esteira de CI/CD (Pipeline), o desenvolvedor só tem acesso ao log de texto da pilha de erro (stacktrace), dificultando a depuração visual do estado exato da aplicação.

### A Solução
Adicionar uma extensão JUnit 5 (`TestWatcher`) ou um bloco no `@AfterEach` que detecta a falha e tira uma foto da tela (screenshot), salvando-a como artefato da execução do pipeline.

```java
@AfterEach
public void tearDown(TestInfo testInfo) {
    // Código conceitual para tirar print em caso de falha:
    File srcFile = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
    FileUtils.copyFile(srcFile, new File("target/screenshots/" + testInfo.getDisplayName() + ".png"));
    driver.quit();
}
```

---

## 6. Geração de Relatórios Ricos (Allure Report / ExtentReports)
### O Problema
Os relatórios nativos do JUnit (arquivos XML/HTML simples) são limitados e difíceis de interpretar para stakeholders não técnicos.

### A Solução
Integrar o **Allure Report** no projeto (via dependência Maven/Gradle). O Allure gera gráficos, separa testes por comportamento (Epics/Features) e anexa automaticamente as capturas de tela das falhas do Selenium.

---

## 7. Execução Headless na Esteira de CI/CD (Azure DevOps)
### O Problema
Máquinas virtuais (Agents) rodando pipelines no Azure DevOps geralmente não possuem interface gráfica (GUI). Rodar testes que tentam abrir uma janela visível do Chrome resultará em erro.

### A Solução
Configurar o ChromeOptions para iniciar o navegador no modo **Headless** (invisível) e sem privilégios extras (necessário para conteinerização com Docker).

```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless=new"); // Executa sem abrir interface gráfica
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
WebDriver driver = new ChromeDriver(options);
```
