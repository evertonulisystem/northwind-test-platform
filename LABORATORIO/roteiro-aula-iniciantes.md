# Roteiro de Aula: Desmistificando o Selenium com JUnit 5 (Passo a Passo)

Este guia foi elaborado para auxiliar na explicação detalhada de cada linha de código do arquivo de testes [LoginTest.java](file:///h:/windsurfProjects/app-northwind-test-platform/northwind-test-platform/LABORATORIO/LoginTest.java). Ele está estruturado em blocos lógicos para facilitar a didática com alunos iniciantes em automação de testes.

---

## Bloco 1: A Estrutura da Classe e Variáveis Globais

No início do arquivo, definimos as propriedades fundamentais que toda a nossa classe de teste usará.

```java
@DisplayName("Testes de Validação - Página de Login")
public class LoginTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "https://northwind-test-platform.vercel.app/";
```

### O que cada linha faz e por que foi usada?

*   **`@DisplayName("...")`**: É uma anotação do JUnit 5. Ela serve para dar um "nome amigável" para a nossa classe nos relatórios de execução. Em vez de aparecer o nome técnico `LoginTest`, aparecerá um título em português legível.
*   **`public class LoginTest`**: Declaração da nossa classe em Java. Todo o código de teste de login ficará dentro destas chaves `{}`.
*   **`private WebDriver driver;`**:
    *   **O que é**: `WebDriver` é a interface do Selenium que atua como o "motorista" do navegador. É ela que envia comandos como "clique", "digite" ou "abra o link".
    *   **Por que `private`?**: O modificador `private` garante que apenas os métodos dentro desta classe `LoginTest` possam mexer diretamente nessa instância do navegador, evitando interferências externas.
*   **`private WebDriverWait wait;`**:
    *   **O que é**: É o mecanismo do Selenium para criar **esperas explícitas**.
    *   **Por que usamos**: Sistemas modernos carregam elementos de forma assíncrona. O `WebDriverWait` serve para dizer ao Selenium: *"Espere até que determinada condição aconteça (como um botão carregar) antes de dar erro"*.
*   **`private final String baseUrl = "..."`**: Uma constante que armazena o endereço web do site que vamos testar. Evita termos que digitar a URL inteira em todos os métodos de teste.

---

## Bloco 2: O Ciclo de Vida do Teste (Preparação e Limpeza)

Para que cada cenário de teste rode de forma limpa e isolada, precisamos preparar o ambiente antes de cada um, e limpá-lo depois que terminarem.

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
```

### O que cada linha faz e por que foi usada?

*   **`@BeforeEach`**: Esta anotação diz ao JUnit: *"Execute este método `setUp()` ANTES de iniciar cada teste individual da classe"*. Se tivermos 8 testes, o `setUp()` rodará 8 vezes. Isso garante que cada teste comece com um navegador zerado.
*   **`driver = new ChromeDriver();`**: Instancia (cria na memória) o navegador Google Chrome controlado por código. É aqui que a mágica começa e a janela do navegador abre.
*   **`driver.manage().timeouts().implicitlyWait(...)`**:
    *   **O que é**: Configura uma **espera implícita**.
    *   **Por que usamos**: É uma tolerância padrão de tempo. Se o Selenium tentar interagir com um elemento e ele não estiver na tela no milissegundo exato, o Selenium continuará tentando procurá-lo na página por até **2 segundos** antes de falhar.
*   **`wait = new WebDriverWait(driver, Duration.ofSeconds(5));`**: Configura a nossa ferramenta de **espera explícita** para tolerar até **5 segundos** em condições específicas (usada no teste de login com sucesso para aguardar o redirecionamento de tela).
*   **`@AfterEach`**: Diz ao JUnit: *"Execute este método `tearDown()` DEPOIS que cada teste terminar, não importa se ele passou ou falhou"*.
*   **`driver.quit();`**: Fecha a janela do navegador e encerra o processo do driver na memória do computador. **Dica didática**: Se esquecermos de colocar o `driver.quit()`, o computador do aluno ficará lento rapidamente porque dezenas de processos do Chrome invisíveis continuarão abertos em segundo plano!

---

## Bloco 3: Escrevendo um Método de Teste (Exemplo Prático)

Vamos analisar detalhadamente o método de teste de senha curta:

```java
    @Test
    @DisplayName("CEN-L03 - Validar erro de senha muito curta")
    public void testValidarSenhaCurta() {
        driver.get(baseUrl);
        
        driver.findElement(By.name("email")).sendKeys("admin@qatest.com");
        driver.findElement(By.name("password")).sendKeys("12345");
        driver.findElement(By.cssSelector("[data-testid='login-button']")).click();
        
        WebElement errorElement = driver.findElement(By.cssSelector("[data-testid='password-error']"));
        Assertions.assertTrue(errorElement.isDisplayed(), "O elemento de erro de senha deveria estar visível.");
        Assertions.assertEquals("Senha deve ter pelo menos 6 caracteres", errorElement.getText().trim());
    }
```

### Anotações e Nome do Método
*   **`@Test`**: Identifica este método para o JUnit 5 como um teste executável. Sem esta anotação, o JUnit ignora o método e não o executa.
*   **`@DisplayName("CEN-L03 - ...")`**: Dá o nome descritivo do caso de teste para o relatório de execução do JUnit.
*   **`public void testValidarSenhaCurta()`**:
    *   `public`: Permite que o JUnit acesse o método.
    *   `void`: Significa que o método realiza ações, mas não devolve nenhum resultado de volta para quem o chamou.
    *   `testValidarSenhaCurta`: Nome do teste seguindo a convenção **camelCase** (começa com letra minúscula e cada nova palavra inicia com maiúscula).

### Ações de Navegação e Interação
*   **`driver.get(baseUrl);`**: Comanda o navegador para abrir a URL base da nossa loja virtual de testes.
*   **`driver.findElement(By.name("email")).sendKeys("...")`**:
    *   `driver.findElement()`: Pede ao Selenium para buscar um componente na tela.
    *   `By.name("email")`: É a estratégia de localização. Procura um elemento HTML que tenha o atributo `name="email"`.
    *   `.sendKeys("...")`: Simula o ato de digitar no teclado o texto fornecido dentro do input selecionado.
*   **`driver.findElement(By.cssSelector("[data-testid='login-button']")).click()`**:
    *   `By.cssSelector("[data-testid='login-button']")`: Procura o botão usando um seletor CSS específico que busca o atributo customizado `data-testid` (altamente recomendado em QA).
    *   `.click()`: Clica com o mouse no botão para enviar o formulário.

### Validações e Captura do Elemento (O que é WebElement?)
*   **`WebElement errorElement = driver.findElement(...)`**:
    *   **O que é `WebElement`?**: É a representação em código de uma tag HTML da página web (neste caso, a tag `<p>` que mostra a mensagem de erro vermelha). Nós criamos uma variável do tipo `WebElement` chamada `errorElement` para guardar a referência a esse elemento.
    *   **Por que criar essa variável em vez de usar `driver.findElement` direto nas validações?**
        1.  **Performance**: Evitamos que o Selenium procure o mesmo elemento duas vezes na página (o que exige processamento do navegador).
        2.  **Organização e Limpeza**: O código fica limpo, evitando linhas gigantescas difíceis de ler.
*   **`Assertions.assertTrue(errorElement.isDisplayed(), "...")`**:
    *   **`Assertions.assertTrue`**: Validação matemática. Exige que o valor dentro dos parênteses seja **verdadeiro (`true`)** para o teste passar.
    *   `errorElement.isDisplayed()`: Verifica se o balão de erro está fisicamente visível na tela para o usuário final.
    *   O texto após a vírgula (`"O elemento..."`) é a mensagem personalizada que o JUnit exibirá no terminal **apenas se o teste falhar** (útil para explicar o erro).
*   **`Assertions.assertEquals("Senha deve ter...", errorElement.getText().trim())`**:
    *   **`Assertions.assertEquals(esperado, obtido)`**: Garante que o texto obtido da tela seja idêntico ao texto que estávamos esperando.
    *   `errorElement.getText()`: Extrai apenas o texto escrito dentro da tag HTML.
    *   `.trim()`: Remove quaisquer espaços vazios acidentais no início ou no fim do texto (ex: `" texto "` vira `"texto"`). Usar `.trim()` é uma excelente prática em testes para evitar falsos-negativos causados por espaços em branco invisíveis no HTML.
