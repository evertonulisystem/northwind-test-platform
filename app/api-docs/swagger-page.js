// app/api-docs/swagger-page.js
'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Forçar reload com timestamp para evitar cache
    const timestamp = Date.now();
    fetch(`/api/swagger.json?t=${timestamp}`)
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch(() => console.error('Erro ao carregar Swagger'));
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-600">Carregando documentação da API...</p>
      </div>
    );
  }

  return (
    <SwaggerUI 
      spec={spec}
      requestInterceptor={(request) => {
        // Adiciona automaticamente o token se estiver no localStorage
        const token = localStorage.getItem('swagger_token');
        if (token) {
          request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
      }}
      tryItOutEnabled={true}
      docExpansion="list"
      defaultModelsExpandDepth={2}
      displayRequestDuration={true}
      filter={true}
      persistAuthorization={false}
      withCredentials={false}
    />
  );
}