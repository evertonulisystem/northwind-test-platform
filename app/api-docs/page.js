'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/swagger.json')
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
        const token = localStorage.getItem('swagger_token');
        if (token) {
          request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
      }}
    />
  );
}
