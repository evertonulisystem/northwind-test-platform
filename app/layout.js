// app/layout.js
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'QA Automation Shop',
  description: 'Plataforma de testes automatizados',
};

// export default function RootLayout({ children }) {
//   return (
//     <html lang="pt-BR">
//       <body className="antialiased">
//         {children}
//       </body>
//     </html>
//   );
// }

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
              fontWeight: 'bold',
            },
          }}
        />
      </body>
    </html>
  );
}