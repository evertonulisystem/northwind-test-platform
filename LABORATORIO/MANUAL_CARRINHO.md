# Manual de Uso: Carrinho de Compras e Checkout Premium

Este documento explica como utilizar, testar e interagir com o fluxo completo do **Carrinho de Compras** (`/cart`) e do **Checkout** do QA Automation Shop.

---

## 🛒 Fluxo de Navegação e Funcionalidades

### 1. Adicionando Itens ao Carrinho
1. Na vitrine de produtos (`/products`), clique em qualquer produto no botão **"Detalhes"**.
2. No modal que abrir, selecione a quantidade desejada utilizando os botões `+` e `-`.
3. Clique em **"Adicionar ao Carrinho"** (botão verde). O sistema exibirá uma notificação toast confirmando a inclusão do item.

### 2. Acessando o Carrinho
* No topo direito da vitrine de produtos, clique no botão **"Ver Carrinho"**.
* Você será redirecionado para a página `/cart`.

### 3. Gerenciamento do Carrinho
Na página do carrinho, você poderá:
* **Alterar a quantidade de itens**: Clique nos botões `+` e `-` em cada produto. A interface atualiza o preço total do produto e o resumo do pedido de forma otimista imediata.
* **Excluir itens**: Clique no ícone de **lixeira (vermelho)** ao lado da quantidade para remover o item do seu carrinho.
* **Ganhar Frete Grátis**: O frete padrão é de **R$ 25,00**. Caso o subtotal do seu carrinho ultrapasse **R$ 200,00**, o frete é automaticamente convertido para **GRÁTIS**.

### 4. Fechamento de Pedido (Checkout)
1. No painel de **Resumo** à direita, confira os valores totais.
2. O sistema seleciona automaticamente uma transportadora ativa vinculada à sua entrega (ex: *Entrega Express*).
3. Clique em **"Finalizar Pedido"**.
4. Uma animação de processamento será exibida e, após o sucesso, os itens do carrinho serão convertidos em um pedido real no banco de dados, limpando o carrinho em seguida.

---

## 💻 Integração Técnica (Endpoints da API)

Se você estiver construindo automações de testes (QA Automation), pode se integrar diretamente com a API utilizando o token JWT no cabeçalho `Authorization: Bearer <TOKEN>`:

### 🎒 Endpoints do Carrinho (`/api/v1/cart`)
* **Listar Carrinho**: `GET /api/v1/cart`
* **Adicionar/Atualizar Item**: `POST /api/v1/cart`
  - Body: `{ "product_id": <INT>, "quantity": <INT> }`
* **Atualizar Quantidade de um Item Específico**: `PATCH /api/v1/cart/{id}`
  - Body: `{ "quantity": <INT> }`
* **Remover um Item Específico**: `DELETE /api/v1/cart/{id}`
* **Limpar Carrinho Inteiro**: `DELETE /api/v1/cart`

### 📦 Endpoints de Pedidos/Checkout (`/api/v1/orders`)
* **Finalizar Checkout**: `POST /api/v1/orders`
  - Body: `{ "shipper_id": <INT> }` (opcional, padrão: 1)
* **Obter Detalhes do Pedido**: `GET /api/v1/orders/{id}`

---

## 🛠️ Notas de Resolução de Problemas
* **Params assíncronos (Next.js 15+)**: As rotas dinâmicas `/api/v1/cart/[id]` e `/api/v1/orders/[id]` resolvem os parâmetros assincronamente através de `await params` para compatibilidade total com o compilador Turbopack do Next.js.
* **Toasts**: A interface utiliza o container global do `react-toastify` configurado em `layout.js`, garantindo animações consistentes e de alta fidelidade visual.
