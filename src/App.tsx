/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl shadow-xl p-8 text-center border border-zinc-800">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M14.4 14.4 9.6 9.6M14.4 9.6l-4.8 4.8M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10S2 17.5 2 12Z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Cassino Bot</h1>
        <p className="text-zinc-400 mb-8">
          O bot do Discord está rodando no servidor. Para interagir com ele, adicione-o ao seu servidor e use os comandos de barra (/).
        </p>
        
        <div className="space-y-6 text-left">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2 flex items-center gap-2">
              💰 Economia
            </h2>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/balance</span> Ver saldo</li>
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/deposit</span> Adicionar fichas (Admin)</li>
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/withdraw</span> Remover fichas (Admin)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2 flex items-center gap-2">
              🎮 Jogos
            </h2>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/blackjack</span> Jogar 21</li>
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/slots</span> Caça-níqueis</li>
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/roleta</span> Roleta Europeia</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2 flex items-center gap-2">
              ℹ️ Utilidades
            </h2>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="bg-zinc-800 px-2 py-1 rounded text-indigo-400 font-mono">/help</span> Ver todos os comandos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
