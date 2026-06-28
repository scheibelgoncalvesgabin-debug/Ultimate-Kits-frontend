export default function KitTags({ tags = {}, onChange }) {
  const set = (key, val) => onChange({ ...tags, [key]: val });

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 mb-3">Les tags configurent des comportements spéciaux du kit.</p>

      {/* Auto-join */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg">
        <div>
          <p className="text-sm text-gray-300">🚀 Auto-join</p>
          <p className="text-xs text-gray-600">Donné automatiquement à la connexion</p>
        </div>
        <Toggle val={!!tags['auto-join']} onChange={v => set('auto-join', v)}/>
      </div>

      {/* Auto-region */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg">
        <div>
          <p className="text-sm text-gray-300">🗺️ Auto-région</p>
          <p className="text-xs text-gray-600">Donné quand le joueur entre dans la région WorldGuard configurée</p>
        </div>
        <Toggle val={!!tags['auto-region']} onChange={v => set('auto-region', v)}/>
      </div>

      {/* Random weight */}
      <div className="p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-300">🎲 Poids (/kit random)</p>
            <p className="text-xs text-gray-600">Probabilité relative dans les kits aléatoires</p>
          </div>
        </div>
        <input type="number" min="1" max="1000"
          className="w-24 bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          value={tags['weight'] || 100}
          onChange={e => set('weight', +e.target.value)}/>
        <p className="text-xs text-gray-600 mt-1">Défaut: 100. Plus élevé = plus de chances.</p>
      </div>

      {/* No-random */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg">
        <div>
          <p className="text-sm text-gray-300">🚫 Exclure de /kit random</p>
          <p className="text-xs text-gray-600">Ce kit ne sera jamais donné aléatoirement</p>
        </div>
        <Toggle val={!!tags['no-random']} onChange={v => set('no-random', v)}/>
      </div>

      {/* Mystery */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg">
        <div>
          <p className="text-sm text-gray-300">❓ Kit mystère</p>
          <p className="text-xs text-gray-600">Les items sont cachés dans le menu avant réception</p>
        </div>
        <Toggle val={!!tags['mystery']} onChange={v => set('mystery', v)}/>
      </div>
    </div>
  );
}

function Toggle({ val, onChange }) {
  return (
    <button
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${val ? 'bg-indigo-600' : 'bg-[#2a2a3e]'}`}
      onClick={() => onChange(!val)}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${val ? 'left-5' : 'left-0.5'}`}/>
    </button>
  );
}
