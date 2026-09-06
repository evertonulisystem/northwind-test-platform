# Roteiro de Aula: Seção 7 — Portfólio e Encerramento

> [!NOTE]
> **Foco Pedagógico:** Esta seção encerra o curso ensinando o aluno a valorizar o que aprendeu. Mostramos como estruturar um **README.md** no GitHub de nível sênior que destaca a compatibilidade com DevOps e o uso de IA. Além disso, traçamos uma trilha de estudos avançada para mantê-los motivados a continuar estudando.
> Cada aula foi projetada para ter **menos de 10 minutos** de duração.

---

## 📅 Aula 30: README Profissional — O que o Recrutador quer ver
*   **Subtítulo:** *Estruturando um portfólio no GitHub que demonstre testes em BDD, automação profissional e DevOps.*
*   **Duração Máxima:** 9 minutos.

### ⏱️ Cronograma da Gravação
*   **Minuto 0:00 a 1:30 (Conceito):** O que os recrutadores analisam em um portfólio de automação de testes no GitHub.
*   **Minuto 1:30 a 5:30 (Estrutura do README):** Apresentando o modelo ideal de README e preenchendo as seções de ferramentas, execução e DevOps.
*   **Minuto 5:30 a 7:30 (Destacando as Evidências):** Como anexar os prints de erros automáticos (screenshots) e falar sobre relatórios XML.
*   **Minuto 7:30 a 9:00 (Conclusão do GitHub):** Fazendo o push para o repositório e visualizando o resultado.

### 📝 Script de Gravação (Passo a Passo)

#### Bloco 1: O Que Chama a Atenção do Recrutador? (Tempo: 1m30s)
*   **Ação na Tela:** Abra o navegador em um repositório qualquer do GitHub com um README simples e depois mude para o editor de texto.
*   **Fala do Instrutor:**
    > *"Olá, alunos! Parabéns por terem criado nossa suíte de testes. Mas de nada adianta ter um código excelente se ele ficar escondido na sua máquina local.*
    >
    > *Os recrutadores recebem dezenas de portfólios no LinkedIn. O que diferencia um júnior de um profissional é a capacidade de documentar como o projeto funciona. Hoje, vamos criar um arquivo **README.md** profissional para o seu GitHub, detalhando a nossa arquitetura, como rodar o projeto pelo terminal e como integramos evidências de testes para DevOps."*

#### Bloco 2: O Template Ideal de README (Tempo: 4m00s)
*   **Ação na Tela:** Crie o arquivo `README.md` na raiz do projeto no IntelliJ e digite a estrutura.
*   **Código/Template a ser apresentado aos alunos:**
```markdown
# 🧪 Northwind Shop - Automação de Testes E2E com Selenium & Java

Este repositório contém a suíte de testes automatizados End-to-End (E2E) para a plataforma **Northwind Shop**. O projeto foi desenhado sob conceitos de arquitetura limpa, reuso via herança e está totalmente integrado a ferramentas de CI/CD (DevOps).

## 🛠️ Tecnologias Utilizadas
- **Linguagem:** Java 17
- **Framework de Testes:** JUnit 5 (Jupiter)
- **Automação Web:** Selenium WebDriver (ChromeDriver)
- **Gerenciador de Build:** Maven
- **Assistente de IA:** Codeium (para aceleração de escrita de testes de produtos)

## 🏗️ Estrutura do Projeto
- `app.vercel.northwind.base`: Contém a classe `BaseTest` de setup/cleanup e métodos utilitários de click/sendKeys.
- `app.vercel.northwind.login`: Validações de cenários de login (campos obrigatórios, e-mail inválido, senha curta).
- `app.vercel.northwind.categories`: Testes funcionais do modal de gestão de categorias.
- `app.vercel.northwind.products`: Automação acelerada por IA do cadastro de produtos.

## 🚀 Como Executar os Testes
### Pré-requisitos
- JDK 17 instalado
- Maven 3.8+ instalado
- Google Chrome instalado

### Executando via Terminal
Para rodar toda a suíte de testes e gerar relatórios:
```bash
mvn clean test
```

## 📸 Evidências de Teste e DevOps
- **Screenshots Automáticos:** O projeto utiliza o JUnit 5 `TestWatcher` (`ScreenshotExtension.java`) para capturar screenshots automáticos da tela apenas quando os testes falham, salvando-as em `target/screenshots/`.
- **Compatibilidade CI/CD:** Os relatórios XML gerados pelo Maven Surefire em `target/surefire-reports/` são compatíveis com tarefas nativas de publicação de resultados em pipelines do **Azure DevOps** e **GitHub Actions**.
```

*   **Explicação Didática para os Alunos:**
    *   **Execução via terminal**: *"Sempre mostre como rodar o projeto via terminal (`mvn clean test`). Isso prova ao recrutador que seu projeto pode rodar de forma invisível em servidores Linux ou Windows de nuvem."*
    *   **Evidências de Testes**: *"Destacar que você implementou captura de screenshots sob falhas mostra que você entende o fluxo de depuração e entrega valor para o time de desenvolvimento."*

---

## 📅 Aula 31: Próximos Passos — O que vem no Nível Avançado
*   **Subtítulo:** *Traçando uma rota profissional de estudos em QA: Page Objects, Testes de API com RestAssured e Banco de Dados.*
*   **Duração Máxima:** 6 minutos.

### ⏱️ Cronograma da Gravação
*   **Minuto 0:00 a 1:30 (Encerramento):** Agradecimento aos alunos e retrospectiva de tudo o que aprenderam.
*   **Minuto 1:30 a 4:30 (Roadmap Avançado):** Apresentando o roteiro detalhado do que o mercado exige no nível pleno/sênior.
*   **Minuto 4:30 a 6:00 (Mensagem Final):** Encorajamento final e encerramento oficial do curso.

### 📝 Script de Gravação (Passo a Passo)

#### Bloco 1: A Jornada até aqui (Tempo: 1m30s)
*   **Ação na Tela:** Abra os arquivos de teste no IntelliJ para mostrar o progresso.
*   **Fala do Instrutor:**
    > *"Parabéns, alunos! Chegamos à última aula do nosso curso. Olhem para o que vocês construíram: vocês saíram da instalação do driver básico do Selenium para um framework estruturado em herança, tirando prints automáticos em falhas, gerando relatórios de console e documentando tudo de forma profissional.*
    >
    > *Mas a área de Qualidade de Software não para. Para vocês continuarem se destacando e conquistando vagas melhores, preparei uma trilha do que vocês devem estudar a partir de agora no nível avançado."*

#### Bloco 2: A Trilha do Nível Avançado (Tempo: 3m00s)
*   **Ação na Tela:** Mostre os tópicos principais em slides ou no próprio bloco de notas do IntelliJ.
*   **Tópicos a serem detalhados aos alunos:**
    1.  **Padrão Page Object Model (POM):** *"Embora a herança na classe Base funcione muito bem para projetos de pequeno e médio porte, projetos gigantes exigem o Page Object Model para separar ainda mais a lógica de tela da lógica de testes."*
    2.  **Automação de APIs com RestAssured:** *"Mais de 70% dos testes de uma empresa devem rodar no backend (APIs), sem interface gráfica. Aprender a testar endpoints HTTP com RestAssured em Java é o próximo passo obrigatório."*
    3.  **Consultas a Banco de Dados (SQL):** *"Um bom analista de testes sabe rodar queries SQL para criar usuários de testes direto no banco ou limpar dados de testes antigos sem passar pelo navegador."*
    4.  **Pipelines de CI/CD:** *"Configurar o Azure DevOps ou GitHub Actions para rodar seus testes de forma 100% autônoma a cada alteração que os programadores fizerem no código."*

#### Bloco 3: Despedida (Tempo: 1m30s)
*   **Ação na Tela:** Abra a câmera do instrutor (se houver) ou mostre os contatos (LinkedIn/GitHub).
*   **Fala do Instrutor:**
    > *"Estudar automação é uma maratona, não um sprint. Vocês deram o primeiro e mais importante passo, que é construir uma base sólida de conceitos e lógica de testes.*
    >
    > *Desejo muito sucesso na carreira de cada um de vocês. Compartilhem o projeto no LinkedIn, marquem o meu perfil e nos vemos nos próximos treinamentos. Um grande abraço e até a próxima!"*
