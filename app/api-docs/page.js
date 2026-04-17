'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI 
        url="/api/v1/swagger.json"
        persistAuthorization={true}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration={true}
        tryItOutEnabled={true}
      />
    </div>
  );
}
