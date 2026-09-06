# Roteiro de Aula: Seção 6 — IA Aplicada à Automação de Testes

> [!NOTE]
> **Foco Pedagógico:** Esta seção ensina os alunos a utilizarem Inteligência Artificial de forma prática e ética no desenvolvimento de testes. Como a IA oficial do IntelliJ é paga, recomendamos a ferramenta **Codeium**, que possui plano individual **100% gratuito e ilimitado**.
> Cada aula foi projetada para ter **menos de 10 minutos** de duração.

---

## 📅 Aula 28: Configurando um Assistente de IA na IDE
*   **Subtítulo:** *Instalando e ativando o plugin gratuito Codeium no IntelliJ para automação de testes.*
*   **Duração Máxima:** 8 minutos.

### ⏱️ Cronograma da Gravação
*   **Minuto 0:00 a 1:30 (Conceito):** O que são assistentes de código e por que escolhemos o **Codeium** como alternativa gratuita e ilimitada.
*   **Minuto 1:30 a 4:30 (Instalação no IntelliJ):** Mostrando passo a passo como instalar o plugin através do Marketplace de plugins do IntelliJ.
*   **Minuto 4:30 a 6:30 (Configuração da Conta):** Fazendo login gratuito e configurando o painel lateral de chat.
*   **Minuto 6:30 a 8:00 (Primeiro Teste da IA):** Mostrando a IA sugerindo autocompletes básicos na tela.

### 📝 Script de Gravação (Passo a Passo)

#### Bloco 1: Por que usar IA em Automação? (Tempo: 1m30s)
*   **Ação na Tela:** Abra o IntelliJ com a classe `BaseTest` aberta.
*   **Fala do Instrutor:**
    > *"Olá, alunos! A Inteligência Artificial está transformando a forma como escrevemos testes. Hoje, um bom analista de testes não decora seletores; ele usa a IA para acelerar a escrita do código repetitivo e foca no design e na estratégia de testes.*
    >
    > *Como o assistente nativo da JetBrains é pago, nós vamos utilizar o **Codeium**, um assistente de IA focado em código que é **100% gratuito para sempre** e integra muito bem no IntelliJ. Vamos instalá-lo agora."*

#### Bloco 2: Instalando o Codeium no IntelliJ (Tempo: 3m00s)
*   **Ação na Tela:**
    1. No menu superior, clique em **File** -> **Settings** (ou `Ctrl + Alt + S`).
    2. Vá em **Plugins**.
    3. Na aba **Marketplace**, digite `Codeium` na barra de pesquisa.
    4. Clique em **Install** no plugin do Codeium (ícone azul e rosa de cubo estilizado).
    5. Clique em **Restart IDE** quando o download concluir para reiniciar o IntelliJ.
*   **Fala do Instrutor:**
    > *"A instalação no IntelliJ é muito simples. Após reiniciar, você verá o ícone do Codeium no canto inferior direito e uma nova aba lateral chamada 'Codeium Chat'."*

#### Bloco 3: Ativando a Conta (Tempo: 2m00s)
*   **Ação na Tela:** Mostre a janela do navegador se abrindo ao clicar para fazer login no Codeium. Complete o cadastro com a conta do Google e mostre o token de autorização sendo colado ou ativado na IDE.
*   **Fala do Instrutor:**
    > *"Ao clicar no ícone do Codeium na IDE pela primeira vez, ele solicitará que você faça login no site deles para criar sua conta gratuita. O processo leva menos de 1 minuto."*

#### Bloco 4: Entendendo o Autocomplete e Conclusão (Tempo: 1m30s)
*   **Ação na Tela:** Digite o início de um método de teste em qualquer classe e mostre a sugestão de código em cinza claro sendo exibida pelo Codeium. Aperte **Tab** para aceitar.
*   **Fala do Instrutor:**
    > *"Pronto! Agora que o plugin está ativo, conforme você digita seu código, a IA tenta antecipar o restante das linhas exibindo sugestões em cinza. Para aceitar a sugestão, basta apertar a tecla **Tab**. Na próxima aula, vamos usar o chat do Codeium para ler a nossa estrutura base e escrever um teste completo de cadastro de produtos em segundos. Até lá!"*

---

## 📅 Aula 29: Usando IA para Acelerar a Escrita de Testes
*   **Subtítulo:** *Escrevendo o teste de Cadastro de Produtos usando prompts contextualizados e revisando o código gerado.*
*   **Duração Máxima:** 10 minutos.

### ⏱️ Cronograma da Gravação
*   **Minuto 0:00 a 2:00 (Contexto):** Explicando a tela de cadastro de produtos da aplicação e os seletores necessários.
*   **Minuto 2:00 a 5:00 (Criando o Prompt no Chat):** Escrevendo um prompt detalhado no Codeium Chat fornecendo a classe `BaseTest` como referência e as especificações de campos.
*   **Minuto 5:00 a 7:30 (Revisão do Código Gerado):** Analisando o código Java gerado, identificando se ele herdou a `BaseTest` e usou os métodos atalhos (`escrever`, `clicar`).
*   **Minuto 7:30 a 10:00 (Execução):** Criando o arquivo `ProdutosTest.java`, colando o código e rodando o teste no IntelliJ.

### 📝 Script de Gravação (Passo a Passo)

#### Bloco 1: O Desafio — Testar o Cadastro de Produtos (Tempo: 2m00s)
*   **Ação na Tela:** Acesse a tela de produtos no navegador. Abra o modal "Adicionar Produto" e mostre os campos: Nome, Preço, Estoque, SKU, Categoria e Fornecedor.
*   **Fala do Instrutor:**
    > *"Bem-vindos! Nesta aula, vamos usar o nosso assistente de IA para escrever a automação da tela de **Cadastro de Produtos**.
    >
    > *Os campos de cadastro têm IDs específicos para o nosso teste, por exemplo, o campo Nome é `add-product-name`, o Preço é `edit-product-price` e o botão de salvar é `add-product-submit`. Vamos pedir para o Codeium escrever os testes de validação negativa de forma inteligente, reaproveitando os atalhos da nossa classe `BaseTest`."*

#### Bloco 2: Mandando o Prompt Contextualizado (Tempo: 3m00s)
*   **Ação na Tela:** Clique na aba do **Codeium Chat** à direita no IntelliJ. Digite o seguinte prompt:
    > *"Considere a minha classe BaseTest.java. Crie uma classe de teste JUnit 5 com Selenium chamada ProdutosTest que estende BaseTest. Escreva um teste chamado testValidarCamposObrigatoriosCadastroProduto que: 
    > 1. Faça login na aplicação (url base) com admin@qatest.com / Teste@123.
    > 2. Clique no botão de adicionar produto usando By.cssSelector("[data-testid='add-product-submit']") (para abrir o modal).
    > 3. Clique no botão de enviar By.cssSelector("[data-testid='add-product-submit']") sem preencher nada.
    > 4. Valide as mensagens de erro nos seletores:
    > - Nome: [data-testid='error-name'] -> 'Nome é obrigatório'
    > - Preço: [data-testid='error-price'] -> 'Preço é obrigatório'
    > - Estoque: [data-testid='error-stock'] -> 'Estoque é obrigatório'
    > - SKU: [data-testid='error-sku'] -> 'SKU é obrigatório'
    > Utilize obrigatoriamente os métodos atalhos herdados da BaseTest como escrever(), clicar() e obterTexto(). Adicione o @DisplayName do JUnit 5."*
*   **Fala do Instrutor:**
    > *"O grande segredo ao trabalhar com IAs é dar o contexto correto. Fornecer a classe base de referência e passar a lista de seletores do front-end garante que a IA não invente códigos falsos."*

#### Bloco 3: Revisando e Colando o Código na IDE (Tempo: 3m00s)
*   **Ação na Tela:**
    1. Crie o pacote `products` e o arquivo `ProdutosTest.java` no IntelliJ.
    2. Copie o código gerado pelo Codeium e cole no arquivo.
    3. Mostre a revisão do código (verifique imports, chaves e chamadas de métodos).
*   **Fala do Instrutor (Revisando o código gerado):**
    > *"Nunca confie cegamente no código gerado pela IA sem revisá-lo. Vejam que o Codeium gerou a classe estendendo corretamente o `BaseTest` e usou perfeitamente nossos métodos auxiliares `clicar` e `obterTexto`. Vamos colar esse código e importar qualquer pacote que o IntelliJ apontar em vermelho usando `Alt + Enter`."*

#### Bloco 4: Executando o Teste da IA (Tempo: 2m00s)
*   **Ação na Tela:** Clique no botão de executar o teste `ProdutosTest`. Deixe o navegador abrir, fazer login, abrir o modal de produtos, disparar as validações e o teste ficar verde.
*   **Fala do Instrutor:**
    > *"Excelente! O teste rodou, abriu o modal de produtos, acionou os erros e passou de primeira. A IA nos poupou de digitar cerca de 40 linhas de código repetitivo de Selenium, permitindo que a gente crie testes dez vezes mais rápido.*
    >
    > *Na próxima seção, vamos aprender como expor toda essa nossa suíte de testes em um README profissional no GitHub para chamar a atenção dos recrutadores. Até lá!"*
