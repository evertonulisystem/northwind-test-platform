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
    <div className="min-h-screen bg-gray-100">
      <style jsx global>{`
        /* THEME: CORPORATE CLEAN (ALTO CONTRASTE E LEGÍVEL) */

        .swagger-ui {
          font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
          color: #0f172a; /* Slate-900 */
        }

        /* Container */
        .swagger-ui .wrapper {
          padding: 0;
          max-width: 100%;
        }

        /* Header / Info Card */
        .swagger-ui .info {
          margin: 24px 0;
          padding: 32px;
          background: #ffffff;
          border: 1px solid #e5e7eb; /* Gray-200 */
          border-radius: 12px;
          color: #0f172a;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .swagger-ui .info .title {
          color: #0f172a;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: -0.02em;
        }
        
        .swagger-ui .info .title small {
          background: #84aad1ff; /* Slate-100 */
          padding: 4px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          font-size: 12px;
          color: #334155; /* Slate-700 */
        }

        .swagger-ui .info p,
        .swagger-ui .info li,
        .swagger-ui .info table {
          color: #334155; /* Slate-700 */
        }

        .swagger-ui .info a {
          color: #0ea5e9; /* Sky-500 */
          font-weight: 600;
          text-decoration: none;
        }
        .swagger-ui .info a:hover {
          text-decoration: underline;
        }

        /* Schemes / Servers */
        .swagger-ui .scheme-container {
          background: transparent;
          box-shadow: none;
          padding: 16px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .swagger-ui .servers > label select {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1; /* Slate-300 */
          border-radius: 8px;
          padding: 8px;
          font-size: 14px;
        }

        /* Authorize Button */
        .swagger-ui .btn.authorize {
          background: #ffffff;
          color: #0f766e; /* Teal-800 */
          border-color: #14b8a6; /* Teal-500 */
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .swagger-ui .btn.authorize:hover {
          background: #14b8a6;
          color: #ffffff;
        }
        .swagger-ui .btn.authorize svg {
          fill: currentColor;
        }

        /* Operation Blocks (Clean) */
        .swagger-ui .opblock {
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          margin: 0 0 16px;
        }

        /* Método — cores sólidas profissionais */
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #1d4ed8; } /* Indigo-700 */
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #16a34a; } /* Green-600 */
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #ca8a04; }  /* Amber-600 */
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626; } /* Red-600 */
        .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #7c3aed; } /* Violet-600 */

        .swagger-ui .opblock .opblock-summary {
          border-bottom: 1px solid #f1f5f9;
          padding: 14px;
        }
        .swagger-ui .opblock .opblock-summary-path {
          color: #0f172a;
          font-weight: 600;
          font-size: 15px;
        }
        .swagger-ui .opblock .opblock-summary-description {
          color: #475569; /* Slate-600 */
        }

        .swagger-ui .opblock-tag {
          color: #0f172a;
          font-size: 18px;
          border-bottom: 1px solid #e5e7eb;
          margin-top: 28px;
          font-weight: 700;
        }
        .swagger-ui .opblock-tag small {
          color: #64748b; /* Slate-500 */
        }

        /* Models */
        .swagger-ui section.models {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          margin-top: 28px;
        }
        .swagger-ui section.models h4 {
          color: #0f172a;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .model-box {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }
        .swagger-ui .model,
        .swagger-ui .model-title {
          color: #0f172a;
        }
        .swagger-ui .prop-type {
          color: #1d4ed8; /* Indigo-700 */
        }

        /* Parameters & Responses */
        .swagger-ui .opblock-body {
          background: #ffffff;
          border-radius: 0 0 10px 10px;
        }
        .swagger-ui table thead tr th,
        .swagger-ui table thead tr td {
          color: #0f172a;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }
        .swagger-ui .parameter__name { color: #0f172a; }
        .swagger-ui .parameter__type { color: #1d4ed8; }
        .swagger-ui .tab li { color: #0f172a; }
        .swagger-ui .response-col_status { color: #0f172a; }
        .swagger-ui .responses-inner h4,
        .swagger-ui .responses-inner h5 { color: #0f172a; }

        /* Actions */
        .swagger-ui .btn.execute {
          background-color: #2563eb; /* Blue-600 */
          border-color: #2563eb;
          color: #ffffff;
          width: 100%;
          border-radius: 8px;
          padding: 10px;
          font-weight: 700;
        }
        .swagger-ui .btn.execute:hover { background-color: #1d4ed8; }

        .swagger-ui .btn.try-out__btn {
          color: #0f172a;
          border-color: #cbd5e1;
          background: #ffffff;
        }
        .swagger-ui .btn.try-out__btn:hover {
          background: #f1f5f9;
        }

        /* Inputs */
        .swagger-ui input[type=text],
        .swagger-ui input[type=password],
        .swagger-ui textarea,
        .swagger-ui select {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1; /* Slate-300 */
          border-radius: 6px;
        }

        /* Modals */
        .swagger-ui .dialog-ux .modal-ux {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .swagger-ui .dialog-ux .modal-ux-header { border-bottom: 1px solid #e5e7eb; }
        .swagger-ui .dialog-ux .modal-ux-content { background: #ffffff; }

      `}</style>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Configurações Rápidas</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition text-sm font-bold"
            >
              Recarregar
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition text-sm font-bold"
            >
              Limpar Tokens (Zerar Login)
            </button>
          </div>
        </div>
        <div className="swagger-container-fix">
          <SwaggerUI
          url="/api/swagger.json"
          requestInterceptor={(request) => {
            const token = localStorage.getItem('token');
            request.credentials = 'omit';
            
            // Log para debug no console do navegador do usuário
            if (token) {
              console.log('📄 Swagger Interceptor: Token encontrado no localStorage');
            }

            // Se o usuário já usou o botão "Authorize" do Swagger, respeitamos esse token.
            // Caso contrário, tentamos pegar o do localStorage (login do app).
            if (!request.headers.Authorization && token) {
              request.headers.Authorization = `Bearer ${token}`;
            }
            
            return request;
          }}
          persistAuthorization={true}
        />
        </div>
      </div>
    </div>
  );
}
