
# 03 - Padronização de Mensagens e Problemas Identificados

> Relatório de inconsistências na padronização de mensagens no sistema

---

## 1. Variações na Mesma Mensagem

| Mensagem 1 | Mensagem 2 | Recomendação |
|------------|------------|--------------|
| "Já existe um produto com esse nome/slug." | "Já existe outro produto com esse nome/slug." | Padronizar para "Já existe um produto com esse nome/slug." (remover "outro") |
| "Já existe um produto com esse SKU." | "Já existe outro produto com esse SKU." | Padronizar para "Já existe um produto com esse SKU." |
| "Token inválido" | "Token não fornecido." | Padronizar prefixo/sufixo |
| "ID do produto inválido." | "ID do produto inválido. Deve ser um número positivo." | Padronizar para mensagem mais completa com detalhe |
| "Erro ao carregar categorias" | "Erro ao carregar categorias." | Padronizar pontuação final |
| "Item removido" | "Produto excluído com sucesso!" | Padronizar formato de sucesso (usar "com sucesso!" para ações concluídas) |

---

## 2. Pontuação e Maiúsculas

| Problema | Exemplo |
|----------|---------|
| Inconsistência no uso de ponto final | Algumas mensagens terminam com ponto (".") e outras não |
| Inconsistência em maiúsculas/minúsculas | "Campo de ordenação ..." vs "ID do produto ..." (algumas começam com maiúsculas, outras são consistentes) |

---

## 3. Recomendações de Padronização

1. **Todas as mensagens devem terminar com ponto (".")**
2. **Manter linguagem consistente** (formalidade/colquialidade uniforme)
3. **Padronizar formatação de mensagens de erro vs sucesso**
   - Sucesso: "Ação realizada com sucesso!"
   - Erro: "X não pode ser feito. Y."
4. **Usar o mesmo prefixo para mensagens relacionadas**
   - Autenticação: "Você precisa..."
   - Validação: "X é obrigatório." / "X deve ter..."
