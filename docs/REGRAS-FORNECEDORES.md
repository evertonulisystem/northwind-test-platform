# Fornecedores

- O botão **Desvincular** permanece visível e usa `data-testid="unlink-supplier-{id}"`.
- Fica desabilitado quando o fornecedor não possui produtos vinculados ou a contagem ainda não está disponível.
- Fica habilitado quando `product_count > 0`.
- Após desvincular, a lista é recarregada para atualizar o estado do botão.
- A tela solicita `GET /api/v1/suppliers?include_product_count=true` para obter a contagem no banco. Sem esse parâmetro, o formato da resposta permanece igual.
