export const metadata = {
  title: 'QA Automation Shop',
  description: 'Plataforma de testes para automação QA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}