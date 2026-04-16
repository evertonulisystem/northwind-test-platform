# Como Limpar Cache na Vercel

## Método 1: Dashboard Vercel (Recomendado)

### 1. Acessar Dashboard
```
https://vercel.com/dashboard
```

### 2. Selecionar Projeto
- `northwind-test-platform`

### 3. Limpar Cache
- **Tab "Settings"**
- **Section "Build & Development Settings"**
- **Botão "Redeploy"** ou "Clear Cache"

### 4. Forçar Redeploy
- **Tab "Deployments"**
- **Clique nos 3 pontos** do deployment mais recente
- **"Redeploy"**

---

## Método 2: API Vercel

### Limpar Cache via API
```bash
curl -X POST "https://api.vercel.com/v1/integrations/webhooks/PROJECT_ID/deploy" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Método 3: Headers Anti-Cache

### Adicionar no next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          // CORS existentes
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },
};
```

---

## Método 4: Headers nos Endpoints

### Adicionar nos responses
```javascript
return NextResponse.json(
  { data, mensagens: ['Sucesso'] },
  { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
);
```

---

## Método 5: URL com Cache Buster

### Forçar nova versão
```bash
# Adicionar timestamp ou version
https://northwind-test-platform.vercel.app/api/categories?v=123456789
```

---

## Verificação de Cache

### 1. Verificar Headers de Response
```bash
curl -I "https://northwind-test-platform.vercel.app/api/categories"
```

### 2. Verificar se tem Cache-Control
```
cache-control: max-age=0, private, must-revalidate
```

### 3. Verificar ETag
```
etag: "abc123"
```

---

## Problemas Comuns de Cache

### 1. Edge Cache (Vercel)
- **Sintoma:** Respostas diferentes entre regiões
- **Solução:** Limpar cache via dashboard

### 2. Browser Cache
- **Sintoma:** Funciona em aba anônima
- **Solução:** Limpar cache do navegador

### 3. API Cache
- **Sintoma:** Mudanças não refletem imediatamente
- **Solução:** Adicionar headers anti-cache

---

## Recomendação Final

### Para Produção:
1. **Limpar cache via Dashboard Vercel**
2. **Adicionar headers anti-cache em APIs**
3. **Forçar redeploy completo**

### Para Desenvolvimento:
1. **Usar `?v=timestamp` nas URLs**
2. **Desabilitar cache no navegador**
3. **Usar aba anônima**
