// ============================================================
// 🆕 NOVA FUNCIONALIDADE — Detalhamento de Pedido Completo
// Módulo: Pagamentos | Rota: GET /api/v1/orders/[id]/payments
// Tabela usada: payments (order_id, payment_method, payment_status,
//               amount, transaction_id, payment_date, card_last_digits, installments)
// Adicionado em: agosto/2026
// ============================================================

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/v1/orders/{id}/payments:
 *   get:
 *     summary: Retorna os dados de pagamento de um pedido específico
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Dados de pagamento do pedido
 *       404:
 *         description: Pagamento não encontrado para este pedido
 */
async function getOrderPayments(request, { params, user }) {
  try {
    const { id } = await params;

    // 1. Verificar se o pedido pertence ao usuário autenticado (segurança)
    const orderQuery = supabase.from("orders").select("id").eq("id", id);

    if (user.role !== "admin") {
      orderQuery.eq("user_id", user.id);
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { data: null, mensagens: ["Pedido não encontrado ou sem permissão."] },
        { status: 404 },
      );
    }

    // 2. Buscar pagamentos deste pedido
    // A tabela payments armazena: método, status, valor, parcelas, últimos dígitos do cartão, etc.
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(
        `
        id,
        order_id,
        payment_method,
        payment_status,
        amount,
        transaction_id,
        payment_date,
        card_last_digits,
        installments,
        notes,
        created_at
      `,
      )
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    if (paymentsError) throw paymentsError;

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        {
          data: [],
          mensagens: ["Nenhum pagamento encontrado para este pedido."],
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: payments,
      mensagens: ["Pagamentos carregados com sucesso."],
    });
  } catch (error) {
    console.error("Erro ao buscar pagamentos do pedido:", error);
    return NextResponse.json(
      { data: null, mensagens: ["Erro interno ao buscar pagamentos."] },
      { status: 500 },
    );
  }
}

export const GET = requireAuth(getOrderPayments);
