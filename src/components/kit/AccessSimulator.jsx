import { useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../lib/api.js';

/**
 * Local simulator — evaluates access rules client-side based on
 * a manually entered list of groups/permissions for a hypothetical player.
 * (Does not require live plugin connection.)
 */
export default function AccessSimulator({ kit }) {
  const [playerGroups, setPlayerGroups] = useState('');
  const [playerPerms, setPlayerPerms] = useState('');
  const [result, setResult] = useState(null);

  const simulate = () => {
    const groups = playerGroups.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const perms  = playerPerms.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const access = kit.access || { type: 'EVERYONE' };

    let allowed = true;
    let reason = '';

    switch (access.type) {
      case 'EVERYONE':
        allowed = true;
        reason = 'Accessible à tous les joueurs';
        break;
      case 'GROUP': {
        const required = access.groups?.length ? access.groups : [access.group].filter(Boolean);
        if (!required.length) { allowed = true; reason = 'Aucun groupe configuré'; break; }
        const logic = access.groupLogic || 'OR';
        allowed = logic === 'AND'
          ? required.every(g => groups.includes(g.toLowerCase()))
          : required.some(g => groups.includes(g.toLowerCase()));
        reason = `Requiert ${logic === 'AND' ? 'TOUS' : 'UN'} de: ${required.join(', ')}`;
        break;
      }
      case 'PERMISSION': {
        const required = access.permissions?.length ? access.permissions : [access.permission].filter(Boolean);
        if (!required.length) { allowed = true; reason = 'Aucune permission configurée'; break; }
        const logic = access.permLogic || 'AND';
        allowed = logic === 'OR'
          ? required.some(p => perms.includes(p.toLowerCase()))
          : required.every(p => perms.includes(p.toLowerCase()));
        reason = `Requiert ${logic === 'AND' ? 'TOUTES' : 'UNE'} de: ${required.join(', ')}`;
        break;
      }
      case 'PLAYER':
        allowed = false;
        reason = 'Restreint à un joueur spécifique (UUID) — non simulable ici';
        break;
      case 'WORLD':
        allowed = true;
        reason = `Restreint aux mondes: ${(access.worlds||[]).join(', ')||'aucun'}`;
        break;
    }

    setResult({ allowed, reason });
  };

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3 space-y-3">
      <p className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5"/> Simulateur d'accès
      </p>
      <p className="text-[10px] text-gray-600">Entre les groupes/permissions d'un joueur hypothétique pour tester l'accès.</p>
      <div>
        <label className="text-[10px] text-gray-500 block mb-1">Groupes du joueur (séparés par virgule)</label>
        <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
          placeholder="vip, default"
          value={playerGroups} onChange={e=>setPlayerGroups(e.target.value)}/>
      </div>
      <div>
        <label className="text-[10px] text-gray-500 block mb-1">Permissions du joueur (séparées par virgule)</label>
        <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
          placeholder="premiumkits.kit.vip"
          value={playerPerms} onChange={e=>setPlayerPerms(e.target.value)}/>
      </div>
      <button onClick={simulate}
        className="w-full px-3 py-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-800 text-cyan-300 rounded text-xs font-medium transition-all">
        Tester l'accès
      </button>
      {result && (
        <div className={`flex items-start gap-2 p-2 rounded border ${result.allowed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
          {result.allowed
            ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"/>
            : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"/>}
          <div>
            <p className={`text-xs font-medium ${result.allowed ? 'text-green-300' : 'text-red-300'}`}>
              {result.allowed ? 'Accès autorisé' : 'Accès refusé'}
            </p>
            <p className="text-[10px] text-gray-500">{result.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
