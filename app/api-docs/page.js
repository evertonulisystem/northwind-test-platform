'use client';

import { useEffect, useMemo, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const specUrl = useMemo(() => {
    if (!origin) return '/api/swagger.json';
    return `${origin}/api/swagger.json`;
  }, [origin]);

  return (
    <div>
      <div className="px-6 py-4 border-b bg-white">
        <div className="text-sm text-slate-700">
          [ Base URL: {origin ? new URL(origin).host : 'localhost'} ]
        </div>
        <a
          href={specUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-700 underline"
        >
          {specUrl}
        </a>
      </div>

      <SwaggerUI
        url="/api/swagger.json"
        requestInterceptor={(request) => {
          const token = localStorage.getItem('swagger_token');
          if (token) {
            request.headers.Authorization = `Bearer ${token}`;
          }
          return request;
        }}
      />
    </div>
  );
}
