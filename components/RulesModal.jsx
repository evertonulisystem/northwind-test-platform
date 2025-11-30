// components/RulesModal.jsx
'use client';

import { AlertTriangle, Users, Bomb, Clock, Target, Brain } from 'lucide-react';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full border-4 border-yellow-400">
        {/* TÍTULO COM ÍCONE */}
        <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
          <AlertTriangle className="w-10 h-10 text-yellow-300" />
          PLAYGROUND PÚBLICO — REGRAS DO JOGO
        </h2>
        
        {/* LISTA COM ÍCONES */}
        <ul className="space-y-5 text-lg mb-8">
          <li className="flex items-center gap-4">
            <Users className="w-9 h-9 text-cyan-300 flex-shrink-0" />
            <span><strong>API COMPARTILHADA:</strong> Todos os alunos usam o mesmo banco.</span>
          </li>
          
          <li className="flex items-center gap-4">
            <Bomb className="w-9 h-9 text-red-400 flex-shrink-0" />
            <span><strong>DADOS PODEM SUMIR:</strong> Outro aluno pode apagar tudo a qualquer momento.</span>
          </li>
          
          <li className="flex items-center gap-4">
            <Clock className="w-9 h-9 text-blue-300 flex-shrink-0" />
            <span><strong>RESET DIÁRIO ÀS 00:00:</strong> Amanhã será outro dia. Outros testes. Outros dados.</span>
          </li>
          
          <li className="flex items-center gap-4">
            <Target className="w-9 h-9 text-green-300 flex-shrink-0" />
            <span><strong>NÃO SALVE NADA IMPORTANTE AQUI.</strong> É um playground.</span>
          </li>
          
          <li className="flex items-center gap-4">
            <Brain className="w-9 h-9 text-purple-300 flex-shrink-0" />
            <span><strong>APRENDA COM O CAOS:</strong> Quebre. Perca. Recomece. É assim que se aprende de verdade.</span>
          </li>
        </ul>

        {/* FRASE FINAL */}
        <p className="text-center mb-8 font-bold text-yellow-300 text-xl">
          Quebre tudo. Aprenda tudo. Amanhã tem mais.
        </p>

        {/* BOTÃO FECHAR */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl text-xl transition transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            ENTENDI! VAMOS QUEBRAR TUDO
          </button>
        </div>
      </div>
    </div>
  );
}