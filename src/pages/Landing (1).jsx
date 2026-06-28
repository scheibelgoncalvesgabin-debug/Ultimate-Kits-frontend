import { useNavigate } from 'react-router-dom';
import { Package, Shield, Zap, Users, BarChart2, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: <Package className="w-6 h-6"/>, title: 'Kits illimités', desc: 'Crée autant de kits que tu veux, avec items, enchants, potions et custom model data.' },
  { icon: <Shield className="w-6 h-6"/>, title: 'Accès avancé', desc: 'Filtre par groupe LuckPerms, permission spécifique, joueur UUID ou monde.' },
  { icon: <Zap className="w-6 h-6"/>, title: 'Actions puissantes', desc: 'Son, particule, broadcast, commande console et message custom à la réception.' },
  { icon: <Users className="w-6 h-6"/>, title: 'Multi-admin', desc: 'Invite des co-gérants avec des rôles différents (admin, éditeur, viewer).' },
  { icon: <BarChart2 className="w-6 h-6"/>, title: 'Statistiques', desc: 'Suis les kits donnés par joueur, par jour, exporte en CSV.' },
  { icon: <Shield className="w-6 h-6"/>, title: 'Placeholder check', desc: 'Vérifie n\'importe quelle valeur PAPI avant de donner un kit (%vault_balance% ≥ 1000).' },
];

export default function Landing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('pk_token');

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1e1e2e] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5"/>
          </div>
          <span className="font-bold text-lg">PremiumKits</span>
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <button onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              Dashboard <ArrowRight className="w-4 h-4"/>
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                Connexion
              </button>
              <button onClick={() => navigate('/login')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all">
                Commencer
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 text-xs px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
          Plugin Paper 1.21 · Panel web · Render + Vercel + Neon
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Gère tes kits Minecraft
          <br/>
          <span className="text-indigo-400">depuis le web</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Crée, configure et push tes kits en temps réel sur ton serveur Minecraft
          sans redémarrer, sans fichier de config complexe.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40">
            Créer un compte gratuit <ArrowRight className="w-5 h-5"/>
          </button>
          <button onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2a2a3e] border border-[#373750] rounded-xl text-base font-medium transition-all">
            Se connecter
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#1e1e2e] border border-[#373750] hover:border-indigo-800 rounded-xl p-5 transition-all">
              <div className="text-indigo-400 mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e1e2e] py-6 text-center text-xs text-gray-600">
        PremiumKits v2.0 — Fait avec ❤️ pour les serveurs Minecraft
      </div>
    </div>
  );
}
