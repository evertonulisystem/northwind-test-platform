// app/login/page.js
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QA Automation Shop</h1>
          <p className="text-pink-100">Plataforma de Testes</p>
        </div>

        <form action="/api/auth/login" method="POST" className="space-y-6">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              name="email"
              type="email"
              defaultValue="admin@qatest.com"
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Senha</label>
            <input
              name="password"
              type="password"
              defaultValue="Teste@123"
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-pink-50 transition transform hover:scale-105"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-pink-200 mt-6 text-sm">
          Não tem conta? <a href="/register" className="text-white underline">Cadastre-se</a>
        </p>

        <div className="mt-8 p-4 bg-white/10 rounded-xl text-sm text-pink-100">
          <p className="font-semibold">Credenciais de Teste:</p>
          <p>Email: admin@qatest.com</p>
          <p>Senha: Teste@123</p>
        </div>
      </div>
    </div>
  );
}