import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Server, Wifi, WifiOff, Package, BarChart2, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useTheme } from '../hooks/useTheme.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.get('/servers').then(r => r.data.servers),
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/servers', { name, description: desc }),
    onSuccess: ({ data }) => {
      qc.invalidateQueries(['servers']);
      toast.success(`Server created! API key: ${data.apiKey?.substring(0,16)}...`);
      setShowCreate(false);
      setName(''); setDesc('');
      navigate(`/server/${data.server.id}`);
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  });

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">PremiumKits Panel</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your Minecraft kit servers</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3e] border border-[#373750] rounded-lg text-gray-400 hover:text-white transition-all"
              title={theme==='dark'?'Mode clair':'Mode sombre'}>
              {theme==='dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all">
              <Plus className="w-4 h-4"/> Add Server
            </button>
            <button onClick={() => {
                localStorage.removeItem('pk_token');
                localStorage.removeItem('pk_refresh');
                navigate('/welcome');
              }}
              className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2a2a3e] border border-[#373750] text-gray-400 hover:text-white rounded-lg text-sm transition-all">
              Déconnexion
            </button>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e2e] border border-[#373750] rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add New Server</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Server Name *</label>
                  <input autoFocus className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="My FFA Server" value={name} onChange={e=>setName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&name.trim()&&createMutation.mutate()}/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Description</label>
                  <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Dangerous FFA server..." value={desc} onChange={e=>setDesc(e.target.value)}/>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setShowCreate(false)} className="flex-1 py-2 bg-[#2a2a3e] hover:bg-[#353550] rounded text-sm transition-all">Cancel</button>
                <button onClick={()=>name.trim()&&createMutation.mutate()} disabled={!name.trim()||createMutation.isPending}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-all disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create Server'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Servers */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : data?.length === 0 ? (
          <div className="text-center py-16">
            <Server className="w-12 h-12 text-gray-700 mx-auto mb-3"/>
            <p className="text-gray-400">No servers yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {data?.map(server => (
              <div key={server.id}
                className="bg-[#1e1e2e] border border-[#373750] hover:border-indigo-700 rounded-xl p-5 cursor-pointer transition-all group"
                onClick={() => navigate(`/server/${server.id}`)}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${server.online ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{server.name}</h3>
                      {server.online
                        ? <span className="text-xs text-green-400 flex items-center gap-1"><Wifi className="w-3 h-3"/>Online</span>
                        : <span className="text-xs text-gray-500 flex items-center gap-1"><WifiOff className="w-3 h-3"/>Offline</span>}
                    </div>
                    {server.description && <p className="text-xs text-gray-500 truncate mt-0.5">{server.description}</p>}
                  </div>
                  <div className="flex items-center gap-6 text-right flex-shrink-0">
                    <div>
                      <p className="text-lg font-bold text-white">{server.kit_count || 0}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Package className="w-3 h-3"/>Kits</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{server.total_gives || 0}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><BarChart2 className="w-3 h-3"/>Gives</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
