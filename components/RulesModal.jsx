// components/RulesModal.jsx
'use client';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full border-4 border-yellow-400">
        <h2 className="text-3xl font-bold mb-6 text-center">PLAYGROUND PÚBLICO — REGRAS DO JOGO</h2>
        
        <ul className="space-y-4 text-lg mb-8">
          <li className="flex items-center gap-3">
            <span className="text-2xl">Shared</span>
            <span><strong>API COMPARTILHADA:</strong> Todos os alunos usam o mesmo banco.</span>
          </li>
          
          <li className="flex items-center gap-3">
            <span className="text-2xl">Bomb</span>
            <span><strong>DADOS PODEM SUMIR:</strong> Outro aluno pode apagar tudo a qualquer momento.</span>
          </li>
          
          <li className="flex items-center gap-3">
            <span className="text-2xl">Clock</span>
            <span><strong>RESET DIÁRIO ÀS 00:00:</strong> Amanhã será outro dia. Outros testes. Outros dados.</span>
          </li>
          
          <li className="flex items-center gap-3">
            <span className="text-2xl">Target</span>
            <span><strong>NÃO SALVE NADA IMPORTANTE AQUI.</strong> É um playground.</span>
          </li>
          
          <li className="flex items-center gap-3">
            <span className="text-2xl">Brain</span>
            <span><strong>APRENDA COM O CAOS:</strong> Quebre. Perca. Recomece. É assim que se aprende de verdade.</span>
          </li>
        </ul>

        <p className="text-center mb-8 font-bold text-yellow-300 text-xl">
          Quebre tudo. Aprenda tudo. Amanhã tem mais.
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-xl transition transform hover:scale-105 shadow-lg"
          >
            ENTENDI! VAMOS QUEBRAR TUDO
          </button>
        </div>
      </div>
    </div>
  );
}