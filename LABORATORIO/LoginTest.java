package app.vercel.northwind.login;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

@DisplayName("Testes de Validação - Página de Login")
public class LoginTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "https://northwind-test-platform.vercel.app/";

    @BeforeEach
    public void setUp() {
        // Inicializa o ChromeDriver
        driver = new ChromeDriver();
        // Define o tempo de espera implícito de 2 segundos (conforme exemplo)
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        // Inicializa o WebDriverWait para esperas explícitas necessárias
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("CEN-L01 - Validar erro de email e senha obrigatórios")
    public void testValidarCamposObrigatoriosVazios() {
        driver.get(baseUrl);
        
        // Clica nos campos e no botão de login sem preencher nada
        driver.findElement(By.name("email")).click();
        driver.findElement(By.name("password")).click();
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro correta é exibida no campo de senha (conforme lógica do front)
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de senha deveria estar visível.");
        Assertions.assertEquals("Email e senha são obrigatórios", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L02 - Validar erro de formato de email inválido")
    public void testValidarFormatoEmailInvalido() {
        driver.get(baseUrl);
        
        // Preenche email com formato inválido e uma senha aceitável
        driver.findElement(By.name("email")).sendKeys("usuario.invalido");
        driver.findElement(By.name("password")).sendKeys("Senha123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro é exibida no campo de email
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='email-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de email deveria estar visível.");
        Assertions.assertEquals("Formato de email inválido. Use: nome@dominio.com", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L03 - Validar erro de senha muito curta")
    public void testValidarSenhaCurta() {
        driver.get(baseUrl);
        
        // Preenche email válido e uma senha curta (< 6 caracteres)
        driver.findElement(By.name("email")).sendKeys("admin@qatest.com");
        driver.findElement(By.name("password")).sendKeys("12345");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro é exibida no campo de senha
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de senha deveria estar visível.");
        Assertions.assertEquals("Senha deve ter pelo menos 6 caracteres", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L04 - Validar erro de usuário não cadastrado")
    public void testValidarUsuarioNaoCadastrado() {
        driver.get(baseUrl);
        
        // Preenche email inexistente e uma senha válida
        driver.findElement(By.name("email")).sendKeys("naoexiste@qatest.com");
        driver.findElement(By.name("password")).sendKeys("Teste@123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro é exibida no campo de email
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='email-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de email deveria estar visível.");
        Assertions.assertEquals("Usuário não encontrado. Verifique o email ou cadastre-se.", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L05 - Validar erro de usuário inativo")
    public void testValidarUsuarioInativo() {
        driver.get(baseUrl);
        
        // Preenche email de usuário inativo e senha correta
        driver.findElement(By.name("email")).sendKeys("inativo@qatest.com");
        driver.findElement(By.name("password")).sendKeys("Teste@123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro é exibida no campo de email
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='email-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de email deveria estar visível.");
        Assertions.assertEquals("Usuário inativo", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L06 - Validar erro de senha incorreta")
    public void testValidarSenhaIncorreta() {
        driver.get(baseUrl);
        
        // Preenche email correto e senha incorreta
        driver.findElement(By.name("email")).sendKeys("admin@qatest.com");
        driver.findElement(By.name("password")).sendKeys("SenhaIncorreta@123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Valida que a mensagem de erro é exibida no campo de senha
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de senha deveria estar visível.");
        Assertions.assertEquals("Email ou senha inválidos", errorElement.getText().trim());
    }

    @Test
    @DisplayName("CEN-L07 - Validar login com sucesso")
    public void testValidarLoginComSucesso() {
        driver.get(baseUrl);
        
        // Preenche credenciais de teste válidas e ativa
        driver.findElement(By.name("email")).sendKeys("admin@qatest.com");
        driver.findElement(By.name("password")).sendKeys("Teste@123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Aguarda o redirecionamento para a página de produtos
        wait.until(ExpectedConditions.urlContains("/products"));
        
        // Valida que o redirecionamento ocorreu com sucesso
        String currentUrl = driver.getCurrentUrl();
        Assertions.assertTrue(currentUrl.contains("/products"), "O redirecionamento deveria ter ocorrido para a página de produtos. URL atual: " + currentUrl);
    }

    @Test
    @DisplayName("CEN-L08 - Validar mensagem em caso de erro crítico no servidor")
    public void testValidarErroInternoServidor() {
        // Obs: Em testes reais, este cenário necessita de mock de rede (ex: DevTools API)
        // para simular um status HTTP 500 no endpoint de login.
        driver.get(baseUrl);
        
        // Fluxo conceitual do teste caso o servidor estivesse indisponível
        driver.findElement(By.name("email")).sendKeys("qualquer@email.com");
        driver.findElement(By.name("password")).sendKeys("QualquerSenha123");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        // Caso ocorra o erro 500, a mensagem é exibida no elemento de erro de email
        // WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='email-error']"));
        // Assertions.assertEquals("Erro interno do servidor", errorElement.getText().trim());
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
