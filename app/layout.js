// app/layout.js
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'QA Automation Shop',
  description: 'Plataforma de testes automatizados',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(236, 72, 153, 0.9))',
            color: 'white',
            fontWeight: '600',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          successStyle={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          errorStyle={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />
      </body>
    </html>
  );
}