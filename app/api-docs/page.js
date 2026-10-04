'use client';

import SwaggerUI from 'swagger-ui-react';
import { useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

const demoAccounts = [
  { label: 'Administrador', email: 'admin@qatest.com', password: 'Teste@123' },
  { label: 'Usuário 01', email: 'usuario01@qatest.com', password: 'Teste@1234' },
  { label: 'Usuário 02', email: 'usuario02@qatest.com', password: 'Teste@12345' },
  { label: 'Outro usuário', email: '', password: '' },
];

function LoginRequestBody({ Original, ...props }) {
  const [selected, setSelected] = useState('');
  const isLogin = props.specPath?.get(0) === 'paths'
    && props.specPath.get(1) === '/api/v1/auth/login'
    && props.specPath.get(2) === 'post';

  return (
    <>
      {isLogin && props.isExecute && (
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="login-demo-account">Conta de demonstração</label>
          <select
            id="login-demo-account"
            value={selected}
            style={{ display: 'block', marginTop: 8 }}
            onChange={(event) => {
              const index = event.target.value;
              setSelected(index);
              const { email, password } = demoAccounts[Number(index)];
              props.onChange(JSON.stringify({ email, password }, null, 2));
            }}
          >
            <option value="" disabled>Selecione uma conta</option>
            {demoAccounts.map((account, index) => (
              <option key={account.label} value={index}>
                {account.label}{account.email ? `: ${account.email}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      <Original {...props} />
    </>
  );
}

const loginDemoPlugin = () => ({
  wrapComponents: {
    RequestBody: (Original) => function DemoRequestBody(props) {
      return <LoginRequestBody Original={Original} {...props} />;
    },
  },
});

const swaggerPlugins = [loginDemoPlugin];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI 
        url="/api/v1/swagger.json"
        persistAuthorization={false}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration={true}
        tryItOutEnabled={true}
        plugins={swaggerPlugins}
      />
    </div>
  );
}
