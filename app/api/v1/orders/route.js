// app/api/v1/orders/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function parsePositiveInteger(value, fallback) {
  const parsed = parseInt(value || "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function parseDateOnly(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function getTodayUtcDateOnly() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Lista o histórico de pedidos do usuário (ou todos, se for admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
async function getOrders(request, { user }) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const shipper = searchParams.get("shipper");
    const minTotalRaw = searchParams.get("min_total");
    const maxTotalRaw = searchParams.get("max_total");
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const limit = parsePositiveInteger(searchParams.get("limit"), 10);
    const start = (page - 1) * limit;

    if (status && !ALLOWED_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { data: null, mensagens: ["Status de pedido inválido."] },
        { status: 400 },
      );
    }

    // Validações simples para filtros numéricos
    const minTotal = minTotalRaw ? Number(minTotalRaw) : null;
    const maxTotal = maxTotalRaw ? Number(maxTotalRaw) : null;
    if (
      (minTotalRaw && Number.isNaN(minTotal)) ||
      (maxTotalRaw && Number.isNaN(maxTotal))
    ) {
      return NextResponse.json(
        {
          data: null,
          mensagens: [
            "Filtro de valor inválido. Use números para min_total/max_total.",
          ],
        },
        { status: 400 },
      );
    }

    const hasFrom = Boolean(from);
    const hasTo = Boolean(to);

    if (hasFrom !== hasTo) {
      return NextResponse.json(
        {
          data: null,
          mensagens: ["Preencha as duas datas para filtrar por período."],
        },
        { status: 400 },
      );
    }

    const fromDate = hasFrom ? parseDateOnly(from) : null;
    const toDate = hasTo ? parseDateOnly(to) : null;
    const today = getTodayUtcDateOnly();

    if ((hasFrom && !fromDate) || (hasTo && !toDate)) {
      return NextResponse.json(
        { data: null, mensagens: ["Data inválida informada para o filtro."] },
        { status: 400 },
      );
    }

    if (fromDate && fromDate.getTime() > today.getTime()) {
      return NextResponse.json(
        { data: null, mensagens: ["A data não pode ser maior que hoje."] },
        { status: 400 },
      );
    }

    if (toDate && toDate.getTime() > today.getTime()) {
      return NextResponse.json(
        { data: null, mensagens: ["A data não pode ser maior que hoje."] },
        { status: 400 },
      );
    }

    if (fromDate && toDate && toDate.getTime() < fromDate.getTime()) {
      return NextResponse.json(
        {
          data: null,
          mensagens: ["A data final não pode ser anterior à data inicial."],
        },
        { status: 400 },
      );
    }

    // 👇 ÚNICA MUDANÇA REAL: monta a query SEM o .eq('user_id', ...) fixo,
    // e só filtra por dono do pedido se o usuário NÃO for admin.
    // Também trouxe o nome/e-mail do dono via join, pra exibir na tela quando for admin.
    let query = supabase.from("orders").select(
      `
        id,
        user_id,
        order_number,
        status,
        total_amount,
        created_at,
        shippers (company_name),
        users (full_name, email)
      `,
      { count: "exact" },
    );

    if (user.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (from) {
      query = query.gte("created_at", `${from}T00:00:00.000`);
    }

    if (to) {
      query = query.lte("created_at", `${to}T23:59:59.999`);
    }

    // Filtrar por transportadora (shipper_id) se fornecido
    if (shipper) {
      const shipperId = parseInt(shipper, 10);
      if (!Number.isNaN(shipperId)) {
        query = query.eq("shipper_id", shipperId);
      }
    }

    // Filtrar por intervalo de valor
    if (minTotal !== null) {
      query = query.gte("total_amount", minTotal);
    }

    if (maxTotal !== null) {
      query = query.lte("total_amount", maxTotal);
    }

    const { data, error, count } = await query
      .range(start, start + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      const noFilterMessage =
        hasFrom || hasTo || status
          ? "Nenhum pedido encontrado para os filtros aplicados."
          : "Você ainda não possui pedidos.";

      return NextResponse.json(
        {
          data: [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
          mensagens: [noFilterMessage],
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      data: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      mensagens: ["Histórico de pedidos carregado."],
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json(
      {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        mensagens: ["Erro ao buscar histórico de pedidos."],
      },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Realiza o checkout (converte carrinho em pedido)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipper_id:
 *                 type: integer
 *               address_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Carrinho vazio ou estoque insuficiente
 */
async function checkout(request, { user }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { shipper_id = 1, address_id, notes } = body;

    // 1. Buscar itens do carrinho
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          stock_quantity
        )
      `,
      )
      .eq("user_id", user.id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { data: null, mensagens: ["Seu carrinho está vazio."] },
        { status: 400 },
      );
    }

    // 2. Validar estoque e calcular totais
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.products.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            data: null,
            mensagens: [
              `Estoque insuficiente para o produto: ${item.products.name}. Disponível: ${item.products.stock_quantity}`,
            ],
          },
          { status: 400 },
        );
      }
      subtotal += item.products.price * item.quantity;
    }

    const shippingCost = subtotal > 200 ? 0 : 25.0; // Frete grátis acima de 200
    const totalAmount = subtotal + shippingCost;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Criar Pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        shipper_id: shipper_id || 1,
        shipping_address_id: address_id || null,
        notes: notes || "",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Erro detalhado do Supabase (Orders):", orderError);
      throw new Error(`Erro ao criar pedido no banco: ${orderError.message}`);
    }

    // 4. Criar Itens do Pedido e Atualizar Estoque (Simulado Sequencial)
    for (const item of cartItems) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products.price,
        subtotal: item.products.price * item.quantity,
      });

      await supabase
        .from("products")
        .update({
          stock_quantity: item.products.stock_quantity - item.quantity,
        })
        .eq("id", item.product_id);
    }

    // 5. Limpar carrinho
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    return NextResponse.json(
      {
        data: {
          id: order.id,
          order_number: order.order_number,
          total: totalAmount,
        },
        mensagens: ["Pedido realizado com sucesso!"],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json(
      {
        data: null,
        mensagens: [
          "Erro ao processar pedido.",
          error.message || "Erro desconhecido",
        ],
        debug: error,
      },
      { status: 500 },
    );
  }
}

export const GET = requireAuth(getOrders);
export const POST = requireAuth(checkout);
