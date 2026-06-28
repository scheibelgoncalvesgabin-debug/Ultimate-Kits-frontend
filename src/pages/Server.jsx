import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, Package, Users, Settings, BarChart2, Wifi, WifiOff, Copy, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import McItem from '../components/McItem.jsx';
import KitEditor from '../components/kit/KitEditor.jsx';
import api from '../lib/api.js';

export default function Server() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState('kits');       // kits | players | settings
  const [selectedKit, setSelectedKit] = useState(null); // null = list, 'new' = create, kit obj = edit
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  // Server info
  const { data: serverData } = useQuery({
    queryKey: ['server', serverId],
    queryFn: () => api.get(`/servers/${serverId}`).then(r => r.data.server),
    refetchInterval: 30000,
  });

  // Kits list
  const { data: kitsData, isLoading: kitsLoading } = useQuery({
    queryKey: ['kits', serverId],
    queryFn: () => api.get(`/servers/${serverId}/kits`).then(r => r.data.kits),
  });

  const server = serverData;
  const kits = kitsData || [];
  const isOnline = server?.online;

  const revealKey = async () => {
    if (apiKey) { setShowApiKey(true); return; }
    try {
      const { data } = await api.get(`/servers/${serverId}/apikey`);
      setApiKey(data.apiKey);
      setShowApiKey(true);
    } catch { toast.error('Failed to reveal key'); }
  };

  const regenKey = async () => {
    if (!confirm('Regenerate API key? Your server will disconnect until you update config.yml.')) return;
    try {
      const { data } = await api.post(`/servers/${serverId}/apikey/regenerate`);
      setApiKey(data.apiKey);
      setShowApiKey(true);
      toast.success('API key regenerated!');
    } catch { toast.error('Failed'); }
  };

  const toggleKitMutation = useMutation({
    mutationFn: (kitId) => api.patch(`/servers/${serverId}/kits/${kitId}/toggle`),
    onSuccess: () => qc.invalidateQueries(['kits', serverId]),
  });

  const deleteKitMutation = useMutation({
    mutationFn: (kitId) => api.delete(`/servers/${serverId}/kits/${kitId}`),
    onSuccess: () => { qc.invalidateQueries(['kits', serverId]); toast.success('Kit deleted'); },
  });

  const cloneKitMutation = useMutation({
    mutationFn: ({ kitId, newKitId, newName }) => api.post(`/servers/${serverId}/kits/${kitId}/clone`, { newKitId, newName }),
    onSuccess: () => { qc.invalidateQueries(['kits', serverId]); toast.success('Kit cloned!'); },
  });

  const accessLabel = (access) => {
    if (!access) return 'Everyone';
    switch (access.type) {
      case 'GROUP':      return `👥 ${access.group || 'group'}`;
      case 'PERMISSION': return `🔑 ${access.permission || 'permission'}`;
      case 'PLAYER':     return `👤 Player`;
      case 'WORLD':      return `🌍 ${(access.worlds||[]).join(', ')||'worlds'}`;
      default:           return '👥 Everyone';
    }
  };

  if (selectedKit !== null) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        {/* Back bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#373750] bg-[#1e1e2e]">
          <button onClick={() => setSelectedKit(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4"/> {server?.name || 'Back'}
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-300">{selectedKit === 'new' ? 'New Kit' : selectedKit.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <KitEditor
            kit={selectedKit === 'new' ? null : selectedKit}
            serverId={serverId}
            onClose={() => setSelectedKit(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isOnline?'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]':'bg-gray-600'}`}/>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{server?.name || '...'}</h1>
              {server?.description && <p className="text-xs text-gray-500 truncate">{server.description}</p>}
            </div>
            {isOnline
              ? <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0"><Wifi className="w-3 h-3"/>Online</span>
              : <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0"><WifiOff className="w-3 h-3"/>Offline</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#373750]">
          {[
            {id:'kits',   icon:<Package className="w-4 h-4"/>,  label:'Kits'},
            {id:'players',icon:<Users className="w-4 h-4"/>,   label:'Players'},
            {id:'settings',icon:<Settings className="w-4 h-4"/>,label:'Settings'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t border-b-2 -mb-px transition-all
                ${tab===t.id?'border-indigo-500 text-white':'border-transparent text-gray-400 hover:text-white'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── KITS TAB ── */}
        {tab === 'kits' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{kits.length} kit{kits.length!==1?'s':''}</p>
              <button onClick={() => setSelectedKit('new')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all">
                <Plus className="w-4 h-4"/> New Kit
              </button>
            </div>

            {kitsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading kits...</div>
            ) : kits.length === 0 ? (
              <div className="text-center py-16 bg-[#1e1e2e] border border-[#373750] rounded-xl">
                <Package className="w-12 h-12 text-gray-700 mx-auto mb-3"/>
                <p className="text-gray-400 mb-2">No kits yet</p>
                <p className="text-gray-600 text-sm mb-4">Create your first kit and push it to your server</p>
                <button onClick={() => setSelectedKit('new')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all">
                  Create First Kit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {kits.map(kit => (
                  <div key={kit.kit_id}
                    className={`bg-[#1e1e2e] border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-700 transition-all group
                      ${kit.enabled ? 'border-[#373750]' : 'border-[#2a2a3e] opacity-60'}`}
                    onClick={() => setSelectedKit(kit)}>
                    {/* Icon */}
                    <McItem materialId={kit.icon || Object.values(kit.items||{})[0]?.type || 'CHEST'} size={36} className="flex-shrink-0"/>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{kit.name}</span>
                        {!kit.enabled && <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">Disabled</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{accessLabel(kit.access)}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{Object.keys(kit.items||{}).length} items</span>
                        {kit.conditions?.cooldownSeconds > 0 && (
                          <>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-500">⏱ {fmtCD(kit.conditions.cooldownSeconds)}</span>
                          </>
                        )}
                        {(kit.total_gives || 0) > 0 && (
                          <>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-indigo-400">📦 {kit.total_gives} gives</span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Priority badge */}
                    {kit.priority > 0 && (
                      <span className="text-xs bg-purple-900/40 text-purple-300 border border-purple-800 px-2 py-0.5 rounded flex-shrink-0">P{kit.priority}</span>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e=>e.stopPropagation()}>
                      <button title={kit.enabled?'Disable':'Enable'}
                        className={`p-1.5 rounded transition-all ${kit.enabled?'text-green-400 hover:bg-green-900/20':'text-gray-500 hover:bg-gray-800'}`}
                        onClick={()=>toggleKitMutation.mutate(kit.kit_id)}>
                        {kit.enabled ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
                      </button>
                      <button title="Clone"
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-all"
                        onClick={()=>{const id=`${kit.kit_id}_copy_${Date.now()}`;cloneKitMutation.mutate({kitId:kit.kit_id,newKitId:id,newName:kit.name+' (copy)'})}}>
                        <Copy className="w-4 h-4"/>
                      </button>
                      <button title="Delete"
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all"
                        onClick={()=>{if(confirm(`Delete "${kit.name}"?`))deleteKitMutation.mutate(kit.kit_id)}}>
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLAYERS TAB ── */}
        {tab === 'players' && <PlayersTab serverId={serverId}/>}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="max-w-lg space-y-6">
            <div className="bg-[#1e1e2e] border border-[#373750] rounded-xl p-5">
              <h3 className="font-semibold mb-3">🔑 API Key</h3>
              <div className="font-mono text-sm bg-[#0d0d1a] border border-[#2a2a3e] rounded p-3 break-all text-gray-300 mb-3">
                {showApiKey && apiKey ? apiKey : (server?.api_key_preview || '••••••••••••••••')}
              </div>
              <div className="flex gap-2">
                <button onClick={revealKey} className="flex-1 px-3 py-2 bg-[#2a2a3e] hover:bg-[#353550] border border-[#373750] text-sm text-gray-300 rounded transition-all">
                  {showApiKey ? '🙈 Hide' : '👁️ Reveal'}
                </button>
                {showApiKey && apiKey && (
                  <button onClick={()=>{navigator.clipboard.writeText(apiKey);toast.success('Copied!')}}
                    className="px-3 py-2 bg-[#2a2a3e] hover:bg-[#353550] border border-[#373750] text-sm text-gray-300 rounded transition-all">
                    <Copy className="w-4 h-4"/>
                  </button>
                )}
                <button onClick={regenKey} className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-sm text-red-300 rounded transition-all flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5"/> Regenerate
                </button>
              </div>
              <div className="mt-4 p-3 bg-[#0d0d1a] rounded-lg border border-[#2a2a3e]">
                <p className="text-xs text-gray-500 mb-2 font-medium">config.yml</p>
                <pre className="text-xs text-indigo-300 font-mono whitespace-pre-wrap">{`premiumkits:
  enabled: true
  api-key: "${showApiKey&&apiKey ? apiKey : (server?.api_key_preview || 'YOUR_API_KEY')}"
  url: "https://vertex-panel-kits.onrender.com"`}</pre>
              </div>
            </div>

            <TeamSection serverId={serverId}/>

            {/* Discord Webhook */}
            <DiscordWebhookSection serverId={serverId}/>

            {/* Danger zone */}
            <div className="bg-[#1e1e2e] border border-red-900/50 rounded-xl p-5">
              <h3 className="font-semibold text-red-400 mb-3">⚠️ Zone de danger</h3>
              <p className="text-sm text-gray-400 mb-4">La suppression du serveur est irréversible. Tous les kits et données seront perdus.</p>
              <button
                onClick={async () => {
                  if (!confirm(`Supprimer définitivement "${server?.name}" ? Cette action est irréversible.`)) return;
                  try {
                    await api.delete(`/servers/${serverId}`);
                    toast.success('Serveur supprimé');
                    navigate('/');
                  } catch (e) {
                    toast.error(e.response?.data?.error || 'Échec de la suppression');
                  }
                }}
                className="px-4 py-2 bg-red-900/30 hover:bg-red-900/60 border border-red-700 text-red-300 rounded-lg text-sm font-medium transition-all">
                🗑️ Supprimer ce serveur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtCD(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h>0) return `${h}h ${m}m`; if (m>0) return `${m}m ${sec}s`; return `${sec}s`;
}

// ─── Players tab ──────────────────────────────────────────────────────────────
function PlayersTab({ serverId }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ['players', serverId, page, search],
    queryFn: () => api.get(`/servers/${serverId}/players`, {params:{page,limit:20,search}}).then(r=>r.data),
    keepPreviousData: true,
  });
  const players = data?.players || [];

  const resetCooldown = async (uuid) => {
    try { await api.post(`/servers/${serverId}/players/${uuid}/reset-cooldown`, {}); toast.success('Cooldown reset!'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input className="flex-1 bg-[#1e1e2e] border border-[#373750] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="Search player..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <button onClick={()=>window.open(`/api/servers/${serverId}/players/export/csv`,'_blank')}
          className="px-3 py-2 bg-[#1e1e2e] border border-[#373750] rounded-lg text-sm text-gray-400 hover:text-white transition-all text-nowrap">
          Export CSV
        </button>
      </div>
      {players.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No players yet</div>
      ) : (
        <div className="space-y-1">
          {players.map(p=>(
            <div key={p.uuid} className="flex items-center gap-3 px-4 py-3 bg-[#1e1e2e] border border-[#373750] rounded-lg text-sm group">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-white">{p.username || p.uuid.substring(0,8)+'...'}</span>
                <span className="text-gray-500 text-xs ml-2">{p.uuid}</span>
              </div>
              <span className="text-gray-400 flex-shrink-0">📦 {p.total_kits}</span>
              <button className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 bg-red-900/30 border border-red-800 text-red-300 rounded transition-all"
                onClick={()=>resetCooldown(p.uuid)}>
                Reset Cooldown
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Team section ─────────────────────────────────────────────────────────────
function TeamSection({ serverId }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const { data } = useQuery({
    queryKey: ['team', serverId],
    queryFn: () => api.get(`/servers/${serverId}/team`).then(r=>r.data.members),
  });
  const invite = useMutation({
    mutationFn: () => api.post(`/servers/${serverId}/team/invite`, {email, role}),
    onSuccess: () => { qc.invalidateQueries(['team', serverId]); toast.success('Member added!'); setEmail(''); },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/servers/${serverId}/team/${id}`),
    onSuccess: () => qc.invalidateQueries(['team', serverId]),
  });

  return (
    <div className="bg-[#1e1e2e] border border-[#373750] rounded-xl p-5">
      <h3 className="font-semibold mb-3">👥 Team</h3>
      {(data||[]).map(m=>(
        <div key={m.id} className="flex items-center gap-3 py-2 border-b border-[#2a2a3e] last:border-0 group">
          <div className="flex-1">
            <span className="text-sm text-white">{m.username}</span>
            <span className="text-xs text-gray-500 ml-2">{m.email}</span>
          </div>
          <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">{m.role}</span>
          <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-all"
            onClick={()=>remove.mutate(m.id)}>Remove</button>
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <input className="flex-1 bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
        <select className="bg-[#2a2a3e] border border-[#373750] rounded px-2 py-2 text-sm text-white focus:outline-none"
          value={role} onChange={e=>setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button onClick={()=>email&&invite.mutate()} disabled={!email||invite.isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-all disabled:opacity-50">
          Invite
        </button>
      </div>
    </div>
  );
}

// ─── Discord Webhook ──────────────────────────────────────────────────────────
function DiscordWebhookSection({ serverId }) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState(['kit_given']);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await api.post(`/servers/${serverId}/webhook/discord`, { webhookUrl: url, events });
      setSaved(true);
      toast.success('Webhook Discord sauvegardé!');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { toast.error(e.response?.data?.error || 'Échec'); }
  };

  const toggleEvent = (ev) =>
    setEvents(prev => prev.includes(ev) ? prev.filter(e=>e!==ev) : [...prev,ev]);

  return (
    <div className="bg-[#1e1e2e] border border-[#373750] rounded-xl p-5">
      <h3 className="font-semibold mb-1">🔔 Discord Webhook</h3>
      <p className="text-xs text-gray-500 mb-3">Reçois des notifications Discord quand des kits sont donnés.</p>
      <input
        className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500 mb-3"
        placeholder="https://discord.com/api/webhooks/..."
        value={url} onChange={e=>setUrl(e.target.value)}/>
      <div className="flex gap-2 flex-wrap mb-3">
        {['kit_given','server_status'].map(ev=>(
          <button key={ev}
            className={`text-xs px-2 py-1 rounded border transition-all ${events.includes(ev)?'bg-indigo-900/40 border-indigo-700 text-indigo-300':'bg-[#2a2a3e] border-[#373750] text-gray-500'}`}
            onClick={()=>toggleEvent(ev)}>
            {ev==='kit_given'?'🎁 Kit donné':'🟢 Statut serveur'}
          </button>
        ))}
      </div>
      <button onClick={save} disabled={!url}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-sm font-medium transition-all">
        {saved?'✅ Sauvegardé':'Sauvegarder'}
      </button>
    </div>
  );
}
