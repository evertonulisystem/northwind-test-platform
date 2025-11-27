// app/layout.js
import './globals.css';

export const metadata = {
  title: 'QA Automation Shop',
  description: 'Plataforma de testes automatizados',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}