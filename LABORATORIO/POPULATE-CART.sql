-- LABORATORIO/POPULATE-CART.sql
-- Este script popula o carrinho do usuário 'admin@qatest.com' usando subconsultas simples.

-- 1. Limpar carrinho atual do admin
DELETE FROM cart_items 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@qatest.com' LIMIT 1);

-- 2. Inserir Item 1 (Primeiro produto com estoque > 10)
INSERT INTO cart_items (user_id, product_id, quantity)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@qatest.com' LIMIT 1),
    id,
    2
FROM products 
WHERE stock_quantity > 10 
ORDER BY id ASC
LIMIT 1;

-- 3. Inserir Item 2 (Segundo produto diferente com estoque > 10)
INSERT INTO cart_items (user_id, product_id, quantity)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@qatest.com' LIMIT 1),
    id,
    1
FROM products 
WHERE stock_quantity > 10 
AND id NOT IN (
    SELECT product_id FROM cart_items 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@qatest.com' LIMIT 1)
)
ORDER BY id DESC
LIMIT 1;
