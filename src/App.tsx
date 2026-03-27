import { 
  Coins, 
  Gamepad2, 
  Info, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Users, 
  LayoutDashboard,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Activity,
  Dices,
  Rocket,
  Bomb,
  RotateCcw,
  Swords,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex items-center gap-4">
    <div className={`p-3 rounded-2xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  </div>
);

const GameItem = ({ icon: Icon, name, description, multiplier, difficulty }: any) => (
  <div className="group bg-white p-5 rounded-3xl border border-black/5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
        difficulty === 'Alta' ? 'bg-red-50 text-red-600' : 
        difficulty === 'Média' ? 'bg-orange-50 text-orange-600' : 
        'bg-green-50 text-green-600'
      }`}>
        {difficulty}
      </span>
    </div>
    <h3 className="font-semibold text-lg mb-1">{name}</h3>
    <p className="text-gray-500 text-xs leading-relaxed mb-4">{description}</p>
    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <span className="text-xs font-mono text-indigo-600 font-bold">{multiplier}</span>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </div>
  </div>
);

const CommandRow = ({ cmd, desc }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
    <div className="flex items-center gap-3">
      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        /{cmd}
      </code>
      <span className="text-sm text-gray-600">{desc}</span>
    </div>
    <ExternalLink size={14} className="text-gray-200 group-hover:text-indigo-400 transition-colors" />
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Dices size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Odiondos Bot</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online & Operacional</span>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#dashboard" className="text-indigo-600">Dashboard</a>
            <a href="#games" className="hover:text-indigo-600 transition-colors">Minigames</a>
            <a href="#commands" className="hover:text-indigo-600 transition-colors">Comandos</a>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
              Adicionar ao Discord
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <span className="bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full">
              O Futuro dos Cassinos no Discord
            </span>
            <h2 className="text-6xl font-bold tracking-tighter leading-[0.9] text-gray-900">
              Aposte, Ganhe e <br />
              <span className="text-indigo-600">Domine</span> a Economia.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              O Odiondos Bot traz a experiência completa de um cassino de luxo para o seu servidor. Com gráficos em tempo real, sistema de níveis e conquistas.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button className="bg-gray-900 text-white px-8 py-4 rounded-3xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2">
                Começar Agora <ChevronRight size={20} />
              </button>
              <button className="bg-white text-gray-900 border border-black/5 px-8 py-4 rounded-3xl font-bold hover:bg-gray-50 transition-all">
                Ver Documentação
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            <StatCard icon={Users} label="Usuários Ativos" value="12.4k+" color="bg-blue-500" />
            <StatCard icon={Coins} label="Odiondos em Jogo" value="4.2M" color="bg-amber-500" />
            <StatCard icon={Activity} label="Apostas/Min" value="142" color="bg-emerald-500" />
            <StatCard icon={Trophy} label="Jackpots Hoje" value="28" color="bg-purple-500" />
          </motion.div>
        </section>

        {/* Games Grid */}
        <section id="games" className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Minigames de Elite</h2>
              <p className="text-gray-500">Jogos otimizados para máxima fluidez e diversão.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">
                <ChevronRight size={20} className="rotate-180" />
              </div>
              <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GameItem 
              icon={Zap} 
              name="Blackjack" 
              description="Vença o dealer chegando o mais próximo de 21 sem estourar." 
              multiplier="Até 2.5x" 
              difficulty="Média" 
            />
            <GameItem 
              icon={RotateCcw} 
              name="Roleta" 
              description="Aposte em cores, números ou grupos na clássica roleta europeia." 
              multiplier="Até 36x" 
              difficulty="Baixa" 
            />
            <GameItem 
              icon={LayoutGrid} 
              name="Slots" 
              description="Tente a sorte nos rolos e ganhe jackpots incríveis." 
              multiplier="Até 50x" 
              difficulty="Baixa" 
            />
            <GameItem 
              icon={Rocket} 
              name="Crash" 
              description="O multiplicador sobe rápido. Saia antes que tudo exploda!" 
              multiplier="Até 100x" 
              difficulty="Alta" 
            />
            <GameItem 
              icon={Bomb} 
              name="Mines" 
              description="Encontre os diamantes escondidos e evite as bombas fatais." 
              multiplier="Até 20x+" 
              difficulty="Média" 
            />
            <GameItem 
              icon={Coins} 
              name="Coinflip" 
              description="O clássico 50/50. Cara ou coroa para dobrar seus Odiondos." 
              multiplier="2.0x" 
              difficulty="Baixa" 
            />
            <GameItem 
              icon={Swords} 
              name="Duelo" 
              description="Desafie outros jogadores em uma disputa direta de dados." 
              multiplier="1.9x" 
              difficulty="Baixa" 
            />
            <div className="bg-indigo-600 p-6 rounded-3xl flex flex-col justify-between text-white shadow-xl shadow-indigo-600/20">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Lobby Central</h3>
                <p className="text-indigo-100 text-xs mb-4">Acesse todos os jogos em um único menu visual.</p>
                <code className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">/casino</code>
              </div>
            </div>
          </div>
        </section>

        {/* Commands & Info */}
        <section id="commands" className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 rounded-2xl text-white">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Comandos do Sistema</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Economia & Perfil</h3>
                <CommandRow cmd="profile" desc="Veja seu saldo, nível e conquistas" />
                <CommandRow cmd="daily" desc="Resgata sua recompensa diária" />
                <CommandRow cmd="leaderboard" desc="Veja os mais ricos do servidor" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Administração</h3>
                <CommandRow cmd="deposit" desc="Adiciona Odiondos a um usuário" />
                <CommandRow cmd="withdraw" desc="Remove Odiondos de um usuário" />
                <CommandRow cmd="setlevel" desc="Altera o nível de um jogador" />
                <CommandRow cmd="reset" desc="Reseta o banco de dados" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="p-3 bg-indigo-600 rounded-2xl w-fit">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Segurança & <br />Transparência</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nosso sistema utiliza algoritmos de geração aleatória verificáveis. A margem da casa é ajustada para garantir uma economia sustentável e justa para todos os jogadores.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Dados 100% Criptografados</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Logs de Grandes Vitórias</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span>Proteção contra Spam</span>
                </li>
              </ul>
            </div>
            {/* Abstract background element */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <Dices size={14} className="text-gray-500" />
          </div>
          <span>© 2026 Odiondos Bot. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-indigo-600 transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Suporte</a>
        </div>
      </footer>
    </div>
  );
}
