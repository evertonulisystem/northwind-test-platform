# Roteiro de Aula Didático: Aula 27 (Relatórios e Maven Surefire)

> [!NOTE]
> **Foco Pedagógico:** Esta aula consolida a seção de testes conectando a programação local com as esteiras profissionais de CI/CD (Azure DevOps). Explicamos o que é o **Maven**, a função do arquivo **pom.xml** (fazendo paralelos com outras linguagens) e como rodar comandos no terminal do **IntelliJ**.
> A gravação deve durar **menos de 10 minutos**.

---

## 📅 Cronograma de Gravação (Máximo 10 Minutos)
*   **Minuto 0:00 a 1:30 (Introdução):** O que é gerenciamento de build, por que usar terminal em vez de clicar no play e a necessidade de relatórios para o Azure DevOps.
*   **Minuto 1:30 a 4:30 (Configuração no pom.xml):** Abrindo o `pom.xml` no IntelliJ, explicando o arquivo e configurando o plugin do Maven Surefire.
*   **Minuto 4:30 a 7:30 (Rodando no Terminal):** Abrindo o terminal do IntelliJ, executando `mvn clean test` (ou usando a barra lateral Maven) e acompanhando a execução.
*   **Minuto 7:30 a 9:00 (Análise dos Relatórios):** Entrando na pasta `target/surefire-reports/`, mostrando os relatórios XML e HTML, e explicando como o Azure DevOps lê estes arquivos.
*   **Minuto 9:00 a 10:00 (Encerramento da Seção):** Parabéns aos alunos e fechamento da jornada prática.

---

## 1. Roteiro Passo a Passo de Gravação (Script do Professor)

### Bloco 1: Por que usar Terminal e Relatórios? (Tempo: 1m30s)
*   **Ação na Tela:** Abra o IntelliJ e posicione o mouse na barra inferior, sobre a aba **Terminal**.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Até agora, nós rodamos os nossos testes clicando nos botões de 'play' verdes dentro do IntelliJ. Mas na vida real, em uma empresa, os testes rodam sozinhos de madrugada em servidores em nuvem. Esses servidores não têm tela ou o IntelliJ instalado para clicar no play.*
    >
    > *Tudo é controlado por comandos de terminal. E hoje, vamos aprender como rodar nossos testes digitando um único comando e como o Java gera relatórios automáticos em formato XML e HTML que o Azure DevOps lê e exibe em gráficos lindíssimos. Vamos lá!"*

---

### Bloco 2: Entendendo o Maven e o `pom.xml` (Tempo: 3m00s)
*   **Ação na Tela:** Clique na barra lateral no arquivo `pom.xml`. Role até a seção de `<build>` e `<plugins>`.
*   **Fala do Instrutor (Conceitos de Build para os Alunos):**
    > *"Se você já mexeu com JavaScript ou Python, deve conhecer o `package.json` ou `requirements.txt`. No Java, o nosso gerenciador de dependências e construtor de projetos é o **Maven**, e toda a sua configuração fica descrita nesse arquivo chamado **`pom.xml`**.*
    >
    > *Para rodar os testes via terminal e gerar relatórios, precisamos de um plugin oficial chamado **Maven Surefire Plugin**. Vamos verificar se ele está configurado nas nossas tags `<plugins>`."*

*(Mostre ou adicione a configuração abaixo no `pom.xml`)*:
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.5</version>
    <configuration>
        <!-- Permite configurar padrões extras de relatórios se desejar -->
    </configuration>
</plugin>
```

*   **Explicação Didática de Java para os Alunos:**
    *   **Maven Surefire**: *"Esse plugin é o encarregado de pegar todos os testes anotados com `@Test` do JUnit, compilar os arquivos Java e executá-los em lote, gerando arquivos de relatórios no final. É o coração da automação via console."*

---

### Bloco 3: Executando os Testes via Terminal (Tempo: 3m00s)
*   **Ação na Tela:**
    1. Clique na aba **Terminal** na barra inferior do IntelliJ.
    2. Digite `mvn clean test` e aperte Enter.
    *(Se o aluno não tiver o Maven instalado nas variáveis de ambiente globais, mostre que ele pode usar o comando `./mvnw clean test` caso o projeto tenha o wrapper do Maven, ou usar a barra lateral **Maven** do IntelliJ na direita clicando em `Lifecycle` -> `clean` e depois `test`)*.
*   **Fala do Instrutor:**
    > *"Agora, vamos abrir o painel do **Terminal** do IntelliJ. Nós vamos digitar o comando de build padrão do Maven:*
    >
    > `mvn clean test`
    >
    > *O comando `clean` serve para limpar qualquer lixo ou builds velhos da pasta `target`, garantindo um teste limpo. E o comando `test` roda os testes de fato. Vamos dar Enter."*

*(Deixe rodar na tela. O console mostrará o download de recursos, compilação e o navegador abrindo e rodando os testes automaticamente).*

*   **Explicação Didática de Java para os Alunos:**
    *   **Resultado no Terminal**: *"Olhem o console! Ele roda todos os arquivos de testes sequencialmente e no final exibe um resumo: `Tests run: 9, Failures: 1, Errors: 0, Skipped: 0` (ele acusou 1 falha porque deixamos o teste de login falhando de propósito na aula anterior)."*

---

### Bloco 4: Acessando os Relatórios gerados (Tempo: 1m30s)
*   **Ação na Tela:**
    1. Vá na aba lateral (*Project*), expanda a pasta `target/`.
    2. Localize a pasta `surefire-reports/`.
    3. Mostre o arquivo `.xml` (ex: `TEST-app.vercel.northwind.login.LoginTest.xml`).
    4. Mostre o arquivo `.txt` contendo os logs.
*   **Fala do Instrutor:**
    > *"Após a execução, o Maven cria essa pasta chamada `surefire-reports` dentro de `target`. É aqui que a mágica para o Azure DevOps acontece.*
    >
    > *Este arquivo XML contém o resultado de cada teste estruturado em código. Ferramentas de CI/CD como o Azure DevOps possuem tarefas nativas chamadas 'Publish Test Results'. Nós apenas apontamos essa tarefa para este arquivo XML e o Azure DevOps se encarrega de ler e gerar gráficos de performance, porcentagem de sucesso e histórico de execução automaticamente na tela do pipeline!*
    >
    > *Isso significa que você tem agora uma esteira completa: testes em BDD integrados, execução de navegador automatizada com herança, capturas de tela inteligentes gravando evidências físicas de erros e relatórios unificados gerados via terminal prontos para DevOps!"*

---

### Bloco 5: Encerramento da Seção (Tempo: 1m00s)
*   **Ação na Tela:** Exiba na tela a classe `LoginTest` e `CategoriasTest` organizadas no IntelliJ.
*   **Fala do Instrutor:**
    > *"Parabéns, alunos! Chegamos ao final desta seção sobre Selenium na Prática. Vocês aprenderam desde a abertura do navegador, passando pelas validações negativas, organização de arquitetura base usando herança sem complicação, registro de evidências visuais de erros e, finalmente, a geração de relatórios de mercado.*
    >
    > *Agora vocês têm em mãos as ferramentas que os profissionais de QA utilizam no dia a dia. Continuem praticando e nos vemos na próxima seção!"*
