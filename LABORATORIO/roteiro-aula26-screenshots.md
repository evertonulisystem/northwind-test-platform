# Roteiro de Aula Didático: Aula 26 (Evidências Automáticas com Screenshot)

> [!NOTE]
> **Foco Pedagógico:** Esta aula ensina como tirar "fotos" (screenshots) da tela de forma inteligente: **apenas quando o teste falha**. Apresentamos a extensão do JUnit 5 `TestWatcher` e explicamos como converter tipos em Java (Type Casting) de maneira muito acessível para iniciantes.
> A gravação deve durar **menos de 10 minutos**.

---

## 📅 Cronograma de Gravação (Máximo 10 Minutos)
*   **Minuto 0:00 a 1:30 (Introdução):** Por que tirar prints manuais é ruim e como o JUnit 5 pode automatizar fotos de falhas em esteiras de CI/CD (Azure DevOps).
*   **Minuto 1:30 a 4:30 (Criando a Extensão no IntelliJ):** Criando a classe `ScreenshotExtension` no pacote `base` e explicando o `TestWatcher`.
*   **Minuto 4:30 a 6:30 (Programando a Captura):** Escrevendo a conversão do driver (`TakesScreenshot`) e a cópia do arquivo de imagem.
*   **Minuto 6:30 a 8:00 (Habilitando a Extensão):** Usando `@ExtendWith` no `BaseTest`.
*   **Minuto 8:00 a 10:00 (Forçando uma Falha & Teste Prático):** Alterando um teste para falhar de propósito, rodando-o e abrindo a imagem gravada na pasta `target/screenshots`.

---

## 1. Roteiro Passo a Passo de Gravação (Script do Professor)

### Bloco 1: O Conceito de Evidência sob Falha (Tempo: 1m30s)
*   **Ação na Tela:** Abra a aba `target` vazia no IntelliJ e comente sobre relatórios.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Quando rodamos nossos testes localmente, nós vemos os erros acontecerem em tempo real. Mas na nuvem, rodando no Azure DevOps, não temos tela para assistir. Se um teste falhar, precisamos de uma foto da tela no exato segundo da falha para sabermos o que deu de errado.*
    >
    > *Hoje, vamos criar uma extensão que monitora os testes. Se o teste passar, ela não faz nada. Se o teste falhar, ela saca a câmera do Selenium, tira um print e salva na pasta do projeto. Vamos construir essa inteligência."*

---

### Bloco 2: Criando a Extensão de Captura no IntelliJ (Tempo: 3m00s)
*   **Ação na Tela:**
    1. Vá na aba lateral (*Project*), clique com o botão direito sobre o pacote `base` -> **New** -> **Java Class**.
    2. Nomeie como `ScreenshotExtension` e aperte Enter.
*   **Código a ser inserido:**
```java
package app.vercel.northwind.base;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ScreenshotExtension implements TestWatcher {

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        Object testInstance = context.getRequiredTestInstance();
        
        if (testInstance instanceof BaseTest) {
            BaseTest baseTest = (BaseTest) testInstance;
            
            if (baseTest.driver != null) {
                // Tirar print
                File screenshot = ((TakesScreenshot) baseTest.driver).getScreenshotAs(OutputType.FILE);
                
                try {
                    Path directory = Paths.get("target", "screenshots");
                    if (!Files.exists(directory)) {
                        Files.createDirectories(directory);
                    }
                    
                    String fileName = context.getRequiredTestMethod().getName() + ".png";
                    Path destination = directory.resolve(fileName);
                    Files.copy(screenshot.toPath(), destination);
                    System.out.println("📸 Screenshot da falha salvo em: " + destination.toAbsolutePath());
                    
                } catch (IOException e) {
                    System.err.println("Falha ao salvar print: " + e.getMessage());
                }
            }
        }
    }
}
```

*   **Explicação Didática de Java para os Alunos:**
    *   **`implements TestWatcher`**: *"A palavra `implements` (implementa) serve para dizer que nossa classe seguirá um contrato de regras do JUnit 5 chamado `TestWatcher` (Observador de Testes). Esse contrato nos dá o método `testFailed` que o JUnit chama automaticamente sempre que um teste falha."*
    *   **`testInstance instanceof BaseTest`**: *"Verificamos se o teste que falhou veio da nossa estrutura `BaseTest`. Se sim, fazemos um **Type Casting (conversão)** de tipo: dizemos ao Java que trate a variável genérica `testInstance` como a nossa `BaseTest` para que possamos acessar o seu `driver`."*
    *   **`((TakesScreenshot) driver)`**: *"O Selenium controla navegadores normais, mas nem todo navegador tira prints. Por isso, fazemos uma conversão temporária de tipo dizendo ao Java: 'Trate temporariamente este `driver` como uma câmera fotográfica (`TakesScreenshot`) e execute o método `getScreenshotAs` para salvar como um arquivo físico (FILE)'."*

---

### Bloco 3: Habilitando a Extensão Globalmente (Tempo: 1m30s)
*   **Ação na Tela:** Abra a classe `BaseTest.java`. Logo acima do nome da classe (`public class BaseTest`), adicione a anotação `@ExtendWith`.
*   **Código a ser inserido:**
```java
// Adicionar este import:
import org.junit.jupiter.api.extension.ExtendWith;

// Adicionar a anotação acima da classe:
@ExtendWith(ScreenshotExtension.class)
public class BaseTest {
    // ... restante do código permanece igual
```
*   **Explicação Didática de Java para os Alunos:**
    *   **`@ExtendWith`**: *"Esta anotação diz ao JUnit 5: 'Sempre que rodar essa classe e suas classes filhas, use a nossa extensão `ScreenshotExtension` de vigilância'. E pronto! Como usamos herança, todos os testes de login e categorias ganharam essa capacidade de forma automática!"*

---

### Bloco 4: Forçando uma Falha e Validando a Foto (Tempo: 2m00s)
*   **Ação na Tela:**
    1. Abra `LoginTest.java`.
    2. Altere a verificação de erro do CEN-L01 de `"Email e senha são obrigatórios"` para `"Texto Incorreto que vai falhar"` de propósito.
    3. Clique no botão de rodar o teste.
    4. Mostre o JUnit exibindo a falha (vermelho).
    5. Vá no painel lateral do IntelliJ, navegue até a pasta `target/` -> `screenshots/` -> abra o arquivo `testValidarCamposObrigatoriosVazios.png`.
*   **Fala do Instrutor:**
    > *"Vejam só! O teste falhou no JUnit porque o texto esperado era diferente. Mas olhem o terminal: ele imprimiu a mensagem avisando que tirou o print!*
    >
    > *Se abrirmos a pasta `target` (que é a pasta padrão de arquivos gerados no IntelliJ) e entrarmos em `screenshots`, a foto da tela exata da falha está gravada aqui, mostrando os campos vermelhos na tela! Isso é fantástico para quem precisa rodar testes em pipelines integrados e analisar bugs no dia seguinte!*
    >
    > *Na próxima e última aula da seção, vamos aprender como consolidar os resultados de sucesso e falhas em relatórios executáveis pelo console com o Maven Surefire. Até lá!"*
