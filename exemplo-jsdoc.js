// Exemplo de como adicionar JSDoc automático
/**
 * @swagger
 * /api/novo-endpoint:
 *   post:
 *     summary: Descrição do endpoint
 *     tags: [Categoria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export async function POST(request) {
  // seu código aqui
}
