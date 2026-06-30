import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trash2, Copy, ToggleLeft, ToggleRight, X, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import McItem from '../McItem.jsx';
import MC_ITEMS from '../../lib/mcItems.js';
import KitTags from './KitTags.jsx';
import AccessSimulator from './AccessSimulator.jsx';
import api from '../../lib/api.js';

// ─── Enchantments list ────────────────────────────────────────────────────────
const ENCHANTS = [
  {id:'sharpness',label:'Sharpness',max:5},{id:'smite',label:'Smite',max:5},{id:'bane_of_arthropods',label:'Bane of Arthropods',max:5},
  {id:'knockback',label:'Knockback',max:2},{id:'fire_aspect',label:'Fire Aspect',max:2},{id:'looting',label:'Looting',max:3},
  {id:'sweeping_edge',label:'Sweeping Edge',max:3},{id:'density',label:'Density',max:5},{id:'breach',label:'Breach',max:4},
  {id:'power',label:'Power',max:5},{id:'punch',label:'Punch',max:2},{id:'flame',label:'Flame',max:1},{id:'infinity',label:'Infinity',max:1},
  {id:'multishot',label:'Multishot',max:1},{id:'quick_charge',label:'Quick Charge',max:3},{id:'piercing',label:'Piercing',max:4},
  {id:'protection',label:'Protection',max:4},{id:'fire_protection',label:'Fire Protection',max:4},
  {id:'blast_protection',label:'Blast Protection',max:4},{id:'projectile_protection',label:'Projectile Protection',max:4},
  {id:'thorns',label:'Thorns',max:3},{id:'feather_falling',label:'Feather Falling',max:4},
  {id:'depth_strider',label:'Depth Strider',max:3},{id:'frost_walker',label:'Frost Walker',max:2},
  {id:'soul_speed',label:'Soul Speed',max:3},{id:'swift_sneak',label:'Swift Sneak',max:3},
  {id:'aqua_affinity',label:'Aqua Affinity',max:1},{id:'respiration',label:'Respiration',max:3},
  {id:'efficiency',label:'Efficiency',max:5},{id:'silk_touch',label:'Silk Touch',max:1},{id:'fortune',label:'Fortune',max:3},
  {id:'luck_of_the_sea',label:'Luck of the Sea',max:3},{id:'lure',label:'Lure',max:3},
  {id:'channeling',label:'Channeling',max:1},{id:'riptide',label:'Riptide',max:3},
  {id:'loyalty',label:'Loyalty',max:3},{id:'impaling',label:'Impaling',max:5},
  {id:'unbreaking',label:'Unbreaking',max:3},{id:'mending',label:'Mending',max:1},
  {id:'curse_of_vanishing',label:'Curse of Vanishing',max:1},{id:'curse_of_binding',label:'Curse of Binding',max:1},
  {id:'wind_burst',label:'Wind Burst',max:3},
];

const POTION_EFFECTS = [
  'SPEED','SLOWNESS','HASTE','MINING_FATIGUE','STRENGTH','INSTANT_HEALTH','INSTANT_DAMAGE',
  'JUMP_BOOST','NAUSEA','REGENERATION','RESISTANCE','FIRE_RESISTANCE','WATER_BREATHING',
  'INVISIBILITY','BLINDNESS','NIGHT_VISION','HUNGER','WEAKNESS','POISON','WITHER',
  'HEALTH_BOOST','ABSORPTION','SATURATION','GLOWING','LEVITATION','LUCK','UNLUCK',
  'SLOW_FALLING','CONDUIT_POWER','DOLPHINS_GRACE','BAD_OMEN','HERO_OF_THE_VILLAGE','DARKNESS',
];

const SOUNDS = [
  'ENTITY_PLAYER_LEVELUP','ENTITY_EXPERIENCE_ORB_PICKUP','ENTITY_FIREWORK_ROCKET_BLAST',
  'BLOCK_ENDER_CHEST_OPEN','ENTITY_ENDER_DRAGON_GROWL','BLOCK_NOTE_BLOCK_BELL',
  'ENTITY_LIGHTNING_BOLT_THUNDER','ENTITY_VILLAGER_YES','ITEM_SHIELD_BLOCK',
  'ENTITY_GHAST_SCREAM','ENTITY_WITHER_SPAWN','BLOCK_ANVIL_USE',
];
const PARTICLES = [
  'FLAME','HEART','VILLAGER_HAPPY','EXPLOSION_LARGE','FIREWORKS_SPARK','SPELL_WITCH',
  'ENCHANTMENT_TABLE','TOTEM','DRAGON_BREATH','PORTAL','CLOUD','CRIT','DUST',
];

// Slot layout
const ARMOR_SLOTS = [
  {slot:39,label:'Helmet'},
  {slot:38,label:'Chestplate'},
  {slot:37,label:'Leggings'},
  {slot:36,label:'Boots'},
];
const OFFHAND_SLOT = {slot:40,label:'Off-hand'};
const INV_ROWS = [
  [27,28,29,30,31,32,33,34,35],
  [18,19,20,21,22,23,24,25,26],
  [9,10,11,12,13,14,15,16,17],
];
const HOTBAR = [0,1,2,3,4,5,6,7,8];

// ─── ItemModal ────────────────────────────────────────────────────────────────
function ItemModal({ slot, item, onSave, onDelete, onClose }) {
  const [type, setType] = useState(item?.type || 'DIAMOND_SWORD');
  const [amount, setAmount] = useState(item?.amount || 1);
  const [customId, setCustomId] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('item'); // item | meta | enchants | potion
  // Meta
  const [displayName, setDisplayName] = useState(item?.meta?.displayName || '');
  const [lore, setLore] = useState(item?.meta?.lore?.join('\n') || '');
  const [enchantGlow, setEnchantGlow] = useState(item?.meta?.enchantGlow || false);
  const [customModelData, setCustomModelData] = useState(item?.meta?.customModelData || '');
  const [enchants, setEnchants] = useState(item?.meta?.enchants || []);
  const [enchSearch, setEnchSearch] = useState('');
  // External plugin items
  const [mythicId, setMythicId] = useState(item?.meta?.mythicId || '');
  const [itemsAdderId, setItemsAdderId] = useState(item?.meta?.itemsAdderId || '');
  const [oraxenId, setOraxenId] = useState(item?.meta?.oraxenId || '');
  // Potion
  const [potionEffect, setPotionEffect] = useState(item?.meta?.potionEffect || '');
  const [potionAmplifier, setPotionAmplifier] = useState(item?.meta?.potionAmplifier || 0);
  const [potionDuration, setPotionDuration] = useState(item?.meta?.potionDuration ? Math.round(item.meta.potionDuration/20) : 180);
  const [potionParticles, setPotionParticles] = useState(item?.meta?.potionParticles !== false);

  const finalType = customId.trim().toUpperCase() || type;
  const isPotion = ['POTION','SPLASH_POTION','LINGERING_POTION'].includes(finalType);
  const filteredItems = search ? MC_ITEMS.filter(i=>i.toLowerCase().includes(search.toLowerCase())) : MC_ITEMS;

  const handleSave = () => {
    const meta = {};
    if (displayName) meta.displayName = displayName;
    if (lore) meta.lore = lore.split('\n').filter(Boolean);
    if (enchantGlow) meta.enchantGlow = true;
    if (customModelData) meta.customModelData = parseInt(customModelData);
    if (enchants.length) meta.enchants = enchants;
    if (mythicId) meta.mythicId = mythicId;
    if (itemsAdderId) meta.itemsAdderId = itemsAdderId;
    if (oraxenId) meta.oraxenId = oraxenId;
    if (isPotion && potionEffect) {
      meta.potionEffect = potionEffect;
      meta.potionAmplifier = potionAmplifier;
      meta.potionDuration = potionDuration * 20; // seconds → ticks
      meta.potionParticles = potionParticles;
    }
    onSave(slot, { type: finalType, amount, meta: Object.keys(meta).length ? meta : undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-3" onClick={onClose}>
      <div className="bg-[#1e1e2e] border border-[#373750] rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#373750] sticky top-0 bg-[#1e1e2e] z-10">
          <div className="flex items-center gap-3">
            <McItem materialId={finalType} size={32} />
            <div>
              <h3 className="font-bold text-white">Slot {slot} — {item ? 'Edit' : 'Add'} Item</h3>
              <p className="text-xs text-gray-500">{finalType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5"/></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-[#373750]">
          {['item','meta','enchants',isPotion?'potion':null].filter(Boolean).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${tab===t?'bg-indigo-600 text-white':'text-gray-400 hover:text-white'}`}>
              {t==='item'?'📦 Item':t==='meta'?'✏️ Meta':t==='enchants'?'✨ Enchants':'🧪 Potion'}
            </button>
          ))}
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-4">
          {/* ── LEFT: Item picker (always visible) ── */}
          <div className={tab!=='item'?'hidden md:block':''}>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 pl-8 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Search items..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus={tab==='item'}/>
              </div>
            </div>
            {/* Item grid */}
            <div className="grid grid-cols-6 gap-1 h-56 overflow-y-auto p-1 bg-[#0d0d1a] rounded-lg border border-[#373750]">
              {filteredItems.map(id=>(
                <button key={id} title={id}
                  className={`aspect-square rounded border flex items-center justify-center p-0.5 transition-all ${type===id&&!customId?'border-indigo-500 bg-indigo-900/30':'border-transparent hover:border-[#555] bg-[#1a1a2e] hover:bg-[#252540]'}`}
                  onClick={()=>{setType(id);setCustomId('')}}>
                  <McItem materialId={id} size={22}/>
                </button>
              ))}
            </div>
            {/* Custom ID */}
            <div className="mt-2">
              <label className="text-[10px] text-gray-500 block mb-1">Custom item ID (any 1.21.x material)</label>
              <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500"
                placeholder="e.g. DIAMOND_SWORD"
                value={customId} onChange={e=>setCustomId(e.target.value.toUpperCase())}/>
              {customId && <p className="text-[10px] text-orange-400 mt-0.5">Will use: {customId}</p>}
            </div>
            {/* Amount */}
            <div className="mt-2">
              <label className="text-[10px] text-gray-500 block mb-1">Amount (1–64)</label>
              <input type="number" min="1" max="64"
                className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={amount} onChange={e=>setAmount(Math.max(1,Math.min(64,+e.target.value)))}/>
            </div>
          </div>

          {/* ── RIGHT: Meta / Enchants / Potion ── */}
          <div>
            {tab === 'meta' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Display Name <span className="text-gray-600">(&amp;6 color codes)</span></label>
                  <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="&6Legendary Sword" value={displayName} onChange={e=>setDisplayName(e.target.value)}/>
                  {displayName && <p className="text-xs mt-0.5 text-yellow-400">{displayName.replace(/&[0-9a-fk-or]/gi,'')}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Lore (1 line per line, &amp; colors)</label>
                  <textarea rows={3}
                    className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder={"&7A legendary weapon\n&8Forged in hellfire"} value={lore} onChange={e=>setLore(e.target.value)}/>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">🎨 Custom Model Data (resource pack)</label>
                  <input type="number" min="1"
                    className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 1001" value={customModelData} onChange={e=>setCustomModelData(e.target.value)}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">✨ Enchant Glow (visual only)</span>
                  <button className={`relative w-10 h-5 rounded-full transition-colors ${enchantGlow?'bg-indigo-600':'bg-[#2a2a3e]'}`}
                    onClick={()=>setEnchantGlow(!enchantGlow)}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enchantGlow?'left-5':'left-0.5'}`}/>
                  </button>
                </div>

                {/* External item plugins */}
                <div className="pt-2 border-t border-[#373750] space-y-2">
                  <p className="text-xs text-gray-500">External item plugins — fill only one. If set, it overrides the vanilla item above.</p>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">🐉 MythicMobs item ID</label>
                    <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-pink-500"
                      placeholder="ExcaliburSword" value={mythicId} onChange={e=>setMythicId(e.target.value)}/>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">🧩 ItemsAdder item ID</label>
                    <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-green-500"
                      placeholder="namespace:item_id" value={itemsAdderId} onChange={e=>setItemsAdderId(e.target.value)}/>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">🍂 Oraxen item ID</label>
                    <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-yellow-500"
                      placeholder="oraxen_item_id" value={oraxenId} onChange={e=>setOraxenId(e.target.value)}/>
                  </div>
                </div>
              </div>
            )}

            {tab === 'enchants' && (
              <div>
                {/* Active enchants */}
                {enchants.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {enchants.map(e=>(
                      <div key={e.id} className="flex items-center gap-2 bg-purple-900/20 border border-purple-800/40 rounded px-2 py-1.5">
                        <span className="text-purple-300 text-xs flex-1">{ENCHANTS.find(x=>x.id===e.id)?.label||e.id}</span>
                        <input type="number" min="1" max={ENCHANTS.find(x=>x.id===e.id)?.max||255}
                          className="w-12 bg-[#2a2a3e] border border-[#373750] rounded px-1 py-0.5 text-xs text-center text-white"
                          value={e.level} onChange={ev=>setEnchants(en=>en.map(x=>x.id===e.id?{...x,level:+ev.target.value}:x))}/>
                        <button className="text-red-400 text-sm hover:text-red-300" onClick={()=>setEnchants(en=>en.filter(x=>x.id!==e.id))}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 pl-7 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Search enchant..." value={enchSearch} onChange={e=>setEnchSearch(e.target.value)}/>
                </div>
                {/* Enchant picker */}
                <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto">
                  {ENCHANTS.filter(e=>!enchSearch||e.label.toLowerCase().includes(enchSearch.toLowerCase())).map(e=>{
                    const active = enchants.find(x=>x.id===e.id);
                    return (
                      <button key={e.id}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-all ${active?'bg-purple-900/40 border border-purple-700 text-purple-200':'bg-[#2a2a3e] border border-[#373750] text-gray-400 hover:text-white hover:border-[#555]'}`}
                        onClick={()=>active?setEnchants(en=>en.filter(x=>x.id!==e.id)):setEnchants(en=>[...en,{id:e.id,level:1}])}>
                        {active?'✓ ':'+ '}{e.label} <span className="text-gray-600 ml-1">I–{e.max}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'potion' && isPotion && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Effect Type</label>
                  <select className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={potionEffect} onChange={e=>setPotionEffect(e.target.value)}>
                    <option value="">— None (water bottle) —</option>
                    {POTION_EFFECTS.map(e=><option key={e} value={e}>{e.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                {potionEffect && <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Level</label>
                      <select className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-sm text-white focus:outline-none"
                        value={potionAmplifier} onChange={e=>setPotionAmplifier(+e.target.value)}>
                        {[0,1,2,3].map(i=><option key={i} value={i}>{['I','II','III','IV'][i]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Duration (seconds)</label>
                      <input type="number" min="1" max="3600"
                        className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-sm text-white focus:outline-none"
                        value={potionDuration} onChange={e=>setPotionDuration(+e.target.value)}/>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Particles</span>
                    <button className={`relative w-9 h-5 rounded-full transition-colors ${potionParticles?'bg-blue-600':'bg-[#2a2a3e]'}`}
                      onClick={()=>setPotionParticles(!potionParticles)}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${potionParticles?'left-4':'left-0.5'}`}/>
                    </button>
                  </div>
                </>}
              </div>
            )}

            {tab === 'item' && (
              <div className="space-y-3">
                {/* Preview */}
                <div className="bg-[#0d0d1a] border border-[#373750] rounded-lg p-3 flex items-center gap-3">
                  <McItem materialId={finalType} size={40}/>
                  <div>
                    <p className="font-mono text-sm text-white">{finalType}</p>
                    <p className="text-xs text-gray-500">× {amount}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">← Select item from the grid</p>
                <p className="text-xs text-gray-600 text-center">Use tabs above to set name, enchants, potion effect</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#373750] sticky bottom-0 bg-[#1e1e2e]">
          {item && (
            <button className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 rounded text-sm transition-all"
              onClick={()=>onDelete(slot)}>
              <Trash2 className="w-4 h-4"/>
            </button>
          )}
          <button className="flex-1 px-4 py-2 bg-[#2a2a3e] hover:bg-[#353550] border border-[#373750] text-gray-300 rounded text-sm transition-all"
            onClick={onClose}>Cancel</button>
          <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-all flex items-center justify-center gap-2"
            onClick={handleSave}>
            <Save className="w-4 h-4"/> {item ? 'Update' : 'Add'} Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Slot Button ─────────────────────────────────────────────────────
function SlotBtn({ slot, item, label, specialIcon, onClick, onRightClick }) {
  return (
    <button
      title={label||`Slot ${slot}`}
      className={`relative aspect-square rounded border transition-all group select-none
        ${item
          ?'bg-[#8B8B8B]/20 border-[#555] hover:border-indigo-400'
          :'bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#444] hover:bg-[#252540]'}`}
      style={item?{boxShadow:'inset -2px -2px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.1)'}:{}}
      onClick={onClick}
      onContextMenu={e=>{e.preventDefault();onRightClick&&onRightClick();}}>
      {item ? (
        <>
          <McItem materialId={item.type} size="90%" style={{width:'85%',height:'85%',margin:'auto'}}/>
          {item.amount > 1 && (
            <span className="absolute bottom-0 right-0.5 text-[9px] font-bold leading-none text-white"
              style={{textShadow:'1px 1px 0 #000'}}>{item.amount}</span>
          )}
          {item.meta?.enchants?.length > 0 && (
            <div className="absolute inset-0 rounded pointer-events-none"
              style={{background:'linear-gradient(135deg,rgba(138,43,226,0.2),transparent)'}}/>
          )}
          {item.meta?.customModelData && (
            <span className="absolute top-0 right-0.5 text-[6px] text-orange-400 font-bold leading-none">C</span>
          )}
          {item.meta?.potionEffect && (
            <span className="absolute top-0 left-0.5 text-[6px] text-blue-400 leading-none">⚗</span>
          )}
        </>
      ) : (
        <span className="text-[#333] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {specialIcon||'+'}
        </span>
      )}
      {label && (
        <span className="absolute -bottom-4 left-0 right-0 text-[8px] text-gray-600 text-center whitespace-nowrap leading-tight hidden group-hover:block">
          {label}
        </span>
      )}
    </button>
  );
}

// ─── Main KitEditor component ──────────────────────────────────────────────────
export default function KitEditor({ kit, serverId, onClose }) {
  const qc = useQueryClient();

  // Kit state
  const [name, setName] = useState(kit?.name || '');
  const [description, setDescription] = useState(kit?.description || '');
  const [enabled, setEnabled] = useState(kit?.enabled !== false);
  const [icon, setIcon] = useState(kit?.icon || 'CHEST');
  const [items, setItems] = useState(kit?.items || {});
  const [access, setAccess] = useState(kit?.access || {type:'EVERYONE'});
  const [conditions, setConditions] = useState(kit?.conditions || {});
  const [actions, setActions] = useState(kit?.actions || {});
  const [priority, setPriority] = useState(kit?.priority || 0);
  const [tags, setTags] = useState(kit?.tags || {});

  const [activeTab, setActiveTab] = useState('items'); // items | access | conditions | actions
  const [itemModal, setItemModal] = useState(null); // {slot, item}
  const [dirty, setDirty] = useState(false);

  const kitId = kit?.kit_id || `kit_${Date.now()}`;

  const saveMutation = useMutation({
    mutationFn: () => api.put(`/servers/${serverId}/kits/${kitId}`, {
      name, description, enabled, icon, items, access, conditions, actions, priority, tags
    }),
    onSuccess: () => {
      qc.invalidateQueries(['kits', serverId]);
      toast.success('✅ Kit saved & pushed to server!');
      setDirty(false);
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/servers/${serverId}/kits/${kitId}`),
    onSuccess: () => {
      qc.invalidateQueries(['kits', serverId]);
      toast.success('Kit deleted');
      onClose();
    },
  });

  const setItem = useCallback((slot, item) => {
    setItems(prev => {
      const next = {...prev};
      if (item) next[slot] = item;
      else delete next[slot];
      return next;
    });
    setDirty(true);
  }, []);

  const setCond = (key, val) => { setConditions(prev=>({...prev,[key]:val})); setDirty(true); };
  const setAct  = (key, val) => { setActions(prev=>({...prev,[key]:val})); setDirty(true); };
  const setAcc  = (key, val) => { setAccess(prev=>({...prev,[key]:val})); setDirty(true); };

  const itemCount = Object.keys(items).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#373750]">
        <button onClick={()=>setIcon(i=>i)} className="flex-shrink-0">
          <McItem materialId={icon} size={36}/>
        </button>
        <input
          className="flex-1 bg-transparent text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5"
          value={name} onChange={e=>{setName(e.target.value);setDirty(true);}}
          placeholder="Kit name..."/>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">Unsaved</span>}
          <button onClick={()=>setEnabled(!enabled)} className={`p-1.5 rounded transition-all ${enabled?'text-green-400':'text-gray-600'}`}
            title={enabled?'Enabled — click to disable':'Disabled — click to enable'}>
            {enabled ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
          </button>
          <button onClick={()=>{if(confirm('Delete this kit?'))deleteMutation.mutate();}}
            className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-400/10 transition-all">
            <Trash2 className="w-4 h-4"/>
          </button>
          <button onClick={()=>saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-all disabled:opacity-50">
            <Save className="w-4 h-4"/>
            {saveMutation.isPending ? 'Saving...' : 'Save & Push'}
          </button>
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5"/></button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 border-b border-[#373750]">
        {[
          {id:'items',label:`📦 Items (${itemCount})`},
          {id:'access',label:'🔑 Access'},
          {id:'conditions',label:'⚙️ Conditions'},
          {id:'actions',label:'⚡ Actions'},
          {id:'tags',label:'🏷️ Tags'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-all border-b-2 -mb-px ${activeTab===t.id?'border-indigo-500 text-white':'border-transparent text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ── ITEMS TAB ── */}
        {activeTab === 'items' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">Left click = add/edit · Right click = remove · <span className="text-purple-400">✦</span> enchanted · <span className="text-orange-400">C</span> custom model · <span className="text-blue-400">⚗</span> potion</p>

            {/* Minecraft inventory layout */}
            <div className="flex gap-4 p-4 bg-[#0d0d1a] rounded-xl border border-[#2a2a3e]"
              style={{background:'linear-gradient(135deg,#0d0d1a,#111127)'}}>

              {/* Armor column */}
              <div className="flex flex-col gap-1.5" style={{width:'48px'}}>
                <p className="text-[8px] text-gray-600 text-center mb-0.5 uppercase tracking-wider">Armor</p>
                {ARMOR_SLOTS.map(({slot,label})=>(
                  <SlotBtn key={slot} slot={slot} item={items[slot]} label={label}
                    onClick={()=>setItemModal({slot,item:items[slot]})}
                    onRightClick={()=>setItem(slot,null)}/>
                ))}
                <div className="my-1 border-t border-[#2a2a3e]"/>
                <SlotBtn slot={40} item={items[40]} label="Off-hand" specialIcon="🤚"
                  onClick={()=>setItemModal({slot:40,item:items[40]})}
                  onRightClick={()=>setItem(40,null)}/>
              </div>

              {/* Main inventory */}
              <div className="flex-1 flex flex-col gap-1.5">
                {/* 3 rows (slots 27-8) */}
                {INV_ROWS.map((row,ri)=>(
                  <div key={ri} className="grid grid-cols-9 gap-1">
                    {row.map(slot=>(
                      <SlotBtn key={slot} slot={slot} item={items[slot]}
                        onClick={()=>setItemModal({slot,item:items[slot]})}
                        onRightClick={()=>setItem(slot,null)}/>
                    ))}
                  </div>
                ))}

                {/* Hotbar separator */}
                <div className="border-t border-[#2a2a3e] my-0.5"/>

                {/* Hotbar */}
                <div>
                  <p className="text-[8px] text-gray-600 mb-1 uppercase tracking-wider">Hotbar</p>
                  <div className="grid grid-cols-9 gap-1">
                    {HOTBAR.map(slot=>(
                      <SlotBtn key={slot} slot={slot} item={items[slot]}
                        onClick={()=>setItemModal({slot,item:items[slot]})}
                        onRightClick={()=>setItem(slot,null)}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Items summary */}
            {itemCount > 0 && (
              <div className="mt-3 pt-3 border-t border-[#2a2a3e]">
                <p className="text-xs text-gray-500 mb-2">{itemCount} item(s) in kit</p>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {Object.entries(items).sort(([a],[b])=>+a-+b).map(([slot,item])=>(
                    <div key={slot} className="flex items-center gap-1.5 text-xs py-1 px-2 bg-[#1a1a2e] rounded border border-[#2a2a3e] group">
                      <span className="text-gray-600 font-mono w-5">{slot}</span>
                      <McItem materialId={item.type} size={16}/>
                      <span className="text-gray-300 truncate flex-1">{item.type}</span>
                      <span className="text-indigo-400">×{item.amount}</span>
                      {item.meta?.enchants?.length>0&&<span className="text-purple-400">✦{item.meta.enchants.length}</span>}
                      <button className="opacity-0 group-hover:opacity-100 text-red-400 ml-0.5 hover:text-red-300"
                        onClick={()=>setItem(slot,null)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACCESS TAB ── */}
        {activeTab === 'access' && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Who can receive this kit?</label>
              <div className="space-y-2">
                {[
                  {type:'EVERYONE', label:'👥 Everyone', desc:'All players can receive this kit'},
                  {type:'GROUP',    label:'🏷️ LuckPerms Group', desc:'Only players in a specific group'},
                  {type:'PERMISSION', label:'🔑 Permission', desc:'Only players with a specific permission node'},
                  {type:'PLAYER',   label:'👤 Specific Player', desc:'Only one specific player (by UUID)'},
                  {type:'WORLD',    label:'🌍 World Restriction', desc:'Restrict to specific world(s)'},
                ].map(opt=>(
                  <button key={opt.type}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all
                      ${access.type===opt.type?'bg-indigo-900/30 border-indigo-700 text-white':'bg-[#1a1a2e] border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[#444]'}`}
                    onClick={()=>{setAcc('type',opt.type);setDirty(true);}}>
                    <span className="text-lg">{opt.label.split(' ')[0]}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{opt.label.slice(opt.label.indexOf(' ')+1)}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                    {access.type===opt.type&&<div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"/>}
                  </button>
                ))}
              </div>
            </div>

            {access.type === 'GROUP' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Groupes LuckPerms requis</label>
                  <select className="bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1 text-xs text-yellow-300 focus:outline-none"
                    value={access.groupLogic||'OR'} onChange={e=>setAcc('groupLogic',e.target.value)}>
                    <option value="OR">UN PARMI (OU)</option>
                    <option value="AND">TOUS (ET)</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-600 mb-2">
                  {access.groupLogic==='AND'
                    ? 'Le joueur doit être dans TOUS ces groupes.'
                    : 'Le joueur doit être dans AU MOINS UN de ces groupes.'}
                </p>
                <div className="space-y-1.5 mb-2">
                  {(access.groups||[access.group].filter(Boolean)).map((g,i)=>(
                    <div key={i} className="flex gap-2 items-center">
                      <input className="flex-1 bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        placeholder="vip, mvp, admin..."
                        value={g}
                        onChange={e=>{const a=[...(access.groups||[access.group].filter(Boolean))];a[i]=e.target.value;setAcc('groups',a);setAcc('group',a[0]||'')}}/>
                      {(access.groups||[access.group].filter(Boolean)).length > 1 && (
                        <button className="text-red-400 hover:text-red-300 text-sm px-1"
                          onClick={()=>{const a=(access.groups||[]).filter((_,j)=>j!==i);setAcc('groups',a);setAcc('group',a[0]||'')}}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="text-xs px-2 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800 text-indigo-300 rounded transition-all"
                  onClick={()=>setAcc('groups',[...(access.groups||[access.group].filter(Boolean)),'' ])}>
                  + Ajouter un groupe
                </button>
              </div>
            )}
            {access.type === 'PERMISSION' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-400">Permissions requises</label>
                  <select className="bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1 text-xs text-yellow-300 focus:outline-none"
                    value={access.permLogic||'AND'} onChange={e=>setAcc('permLogic',e.target.value)}>
                    <option value="AND">TOUTES (ET)</option>
                    <option value="OR">UNE PARMI (OU)</option>
                  </select>
                </div>
                <p className="text-[10px] text-gray-600 mb-2">
                  {access.permLogic==='OR'
                    ? 'Le joueur doit avoir AU MOINS UNE de ces permissions.'
                    : 'Le joueur doit avoir TOUTES ces permissions.'}
                </p>
                <div className="space-y-1.5 mb-2">
                  {(access.permissions||[access.permission].filter(Boolean)).map((p,i)=>(
                    <div key={i} className="flex gap-2 items-center">
                      <input className="flex-1 bg-[#2a2a3e] border border-[#373750] rounded px-3 py-1.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        placeholder="premiumkits.kit.vip"
                        value={p}
                        onChange={e=>{const a=[...(access.permissions||[access.permission].filter(Boolean))];a[i]=e.target.value;setAcc('permissions',a);setAcc('permission',a[0]||'')}}/>
                      {(access.permissions||[access.permission].filter(Boolean)).length > 1 && (
                        <button className="text-red-400 hover:text-red-300 text-sm px-1"
                          onClick={()=>{const a=(access.permissions||[]).filter((_,j)=>j!==i);setAcc('permissions',a);setAcc('permission',a[0]||'')}}>×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="text-xs px-2 py-1 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800 text-indigo-300 rounded transition-all"
                  onClick={()=>setAcc('permissions',[...(access.permissions||[access.permission].filter(Boolean)),'' ])}>
                  + Ajouter une permission
                </button>
              </div>
            )}
            {access.type === 'PLAYER' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Player UUID</label>
                <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={access.player||''} onChange={e=>setAcc('player',e.target.value)}/>
              </div>
            )}
            {access.type === 'WORLD' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Worlds (comma separated)</label>
                <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="ffa_sword, lobby, world"
                  value={(access.worlds||[]).join(', ')} onChange={e=>setAcc('worlds',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}/>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Priority (higher = checked first)</label>
              <input type="number" min="0" max="1000"
                className="w-32 bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={priority} onChange={e=>{setPriority(+e.target.value);setDirty(true);}}/>
              <p className="text-xs text-gray-600 mt-0.5">PLAYER=100, GROUP=50, EVERYONE=0 (default)</p>
            </div>

            <AccessSimulator kit={{access, conditions}}/>
          </div>
        )}

        {/* ── CONDITIONS TAB ── */}
        {activeTab === 'conditions' && (
          <div className="space-y-4 max-w-lg">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">⏱ Cooldown (seconds)</label>
                <input type="number" min="0"
                  className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={conditions.cooldownSeconds||0} onChange={e=>setCond('cooldownSeconds',+e.target.value)}/>
                {(conditions.cooldownSeconds||0) > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5">{fmtCD(conditions.cooldownSeconds)}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">⭐ Min Level</label>
                <input type="number" min="0"
                  className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={conditions.minLevel||0} onChange={e=>setCond('minLevel',+e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">💰 Min Money (Vault)</label>
                <input type="number" min="0" step="0.01"
                  className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={conditions.minMoney||0} onChange={e=>setCond('minMoney',+e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">💸 Cost (deducted)</label>
                <input type="number" min="0" step="0.01"
                  className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={conditions.cost||0} onChange={e=>setCond('cost',+e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">🗺️ WorldGuard Region</label>
              <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="spawn_zone"
                value={conditions.worldGuardRegion||''} onChange={e=>setCond('worldGuardRegion',e.target.value)}/>
            </div>

            {/* Event window */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3">
              <label className="text-xs text-pink-400 font-medium block mb-2">🎉 Kit événementiel (optionnel)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Début</label>
                  <input type="datetime-local"
                    className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                    value={conditions.eventStart ? new Date(conditions.eventStart).toISOString().slice(0,16) : ''}
                    onChange={e=>setCond('eventStart', e.target.value ? new Date(e.target.value).getTime() : 0)}/>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Fin</label>
                  <input type="datetime-local"
                    className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                    value={conditions.eventEnd ? new Date(conditions.eventEnd).toISOString().slice(0,16) : ''}
                    onChange={e=>setCond('eventEnd', e.target.value ? new Date(e.target.value).getTime() : 0)}/>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">Laisser vide = pas de restriction de date. Le kit n'est disponible qu'entre ces deux dates.</p>
            </div>
            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#2a2a3e]">
              {[
                ['oneTime','🎯 One-Time Kit','Can only be received once per player'],
                ['requiresPreviewAccept','👁️ Preview Accept','Player must click Accept in the preview GUI'],
              ].map(([key,label,desc])=>(
                <div key={key} className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-300">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                  <button className={`relative w-10 h-5 rounded-full transition-colors ${conditions[key]?'bg-indigo-600':'bg-[#2a2a3e]'}`}
                    onClick={()=>setCond(key,!conditions[key])}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${conditions[key]?'left-5':'left-0.5'}`}/>
                  </button>
                </div>
              ))}
            </div>
            {/* Multi-Placeholder checks */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-blue-400 font-medium">🔍 PlaceholderAPI — Vérifications multiples</label>
                <button
                  className="text-xs px-2 py-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800 text-blue-300 rounded transition-all"
                  onClick={()=>setCond('placeholderChecks',[...(conditions.placeholderChecks||[]),{placeholder:'',operator:'>=',value:'',logic:'AND'}])}>
                  + Ajouter
                </button>
              </div>
              {(conditions.placeholderChecks||[]).length === 0 && (
                <p className="text-[10px] text-gray-600">Aucune vérification. Clique sur Ajouter pour en créer une.</p>
              )}
              {(conditions.placeholderChecks||[]).map((pc,i)=>(
                <div key={i} className="flex gap-1.5 items-center">
                  {i > 0 && (
                    <select className="bg-[#2a2a3e] border border-[#373750] rounded px-1 py-1 text-[10px] text-yellow-300 focus:outline-none w-12"
                      value={pc.logic||'AND'}
                      onChange={e=>{const a=[...(conditions.placeholderChecks||[])];a[i]={...a[i],logic:e.target.value};setCond('placeholderChecks',a)}}>
                      <option value="AND">ET</option>
                      <option value="OR">OU</option>
                    </select>
                  )}
                  <input className="flex-1 bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="%vault_balance%"
                    value={pc.placeholder||''}
                    onChange={e=>{const a=[...(conditions.placeholderChecks||[])];a[i]={...a[i],placeholder:e.target.value};setCond('placeholderChecks',a)}}/>
                  <select className="bg-[#2a2a3e] border border-[#373750] rounded px-1 py-1 text-xs text-white focus:outline-none w-12"
                    value={pc.operator||'>='}
                    onChange={e=>{const a=[...(conditions.placeholderChecks||[])];a[i]={...a[i],operator:e.target.value};setCond('placeholderChecks',a)}}>
                    {['>=','<=','>','<','==','!='].map(op=><option key={op} value={op}>{op}</option>)}
                  </select>
                  <input className="w-20 bg-[#2a2a3e] border border-[#373750] rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="1000"
                    value={pc.value||''}
                    onChange={e=>{const a=[...(conditions.placeholderChecks||[])];a[i]={...a[i],value:e.target.value};setCond('placeholderChecks',a)}}/>
                  <button className="text-red-400 hover:text-red-300 text-sm px-1"
                    onClick={()=>setCond('placeholderChecks',(conditions.placeholderChecks||[]).filter((_,j)=>j!==i))}>×</button>
                </div>
              ))}
              {(conditions.placeholderChecks||[]).length > 0 && (
                <p className="text-[10px] text-gray-600">Les conditions ET/OU sont évaluées de haut en bas.</p>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIONS TAB ── */}
        {activeTab === 'actions' && (
          <div className="space-y-4 max-w-lg">
            {/* Command */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3">
              <label className="text-xs text-orange-400 font-medium block mb-1">⚡ Command on receive (console, in addition to items)</label>
              <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500"
                placeholder="give %player% diamond 1"
                value={actions.onReceiveCommand||''} onChange={e=>setAct('onReceiveCommand',e.target.value)}/>
              <p className="text-[10px] text-gray-600 mt-1">%player% %uuid% %world% available</p>
            </div>
            {/* Custom message */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">💬 Custom message (replaces default)</label>
              <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="&aYou received your &6VIP Kit&a!"
                value={actions.customMessage||''} onChange={e=>setAct('customMessage',e.target.value)}/>
            </div>
            {/* Broadcast */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">📢 Broadcast (global, leave empty = disabled)</label>
              <input className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="&6{player} &7received the &e{kit} &7kit!"
                value={actions.broadcast||''} onChange={e=>setAct('broadcast',e.target.value)}/>
            </div>
            {/* Sound */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">🔊 Sound</label>
                <select className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={actions.sound||''} onChange={e=>setAct('sound',e.target.value)}>
                  <option value="">— None —</option>
                  {SOUNDS.map(s=><option key={s} value={s}>{s.replace(/_/g,' ').toLowerCase()}</option>)}
                </select>
              </div>
              {actions.sound && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Volume</label>
                    <input type="number" min="0.1" max="2" step="0.1"
                      className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-2 text-sm text-white focus:outline-none"
                      value={actions.soundVolume||1} onChange={e=>setAct('soundVolume',+e.target.value)}/>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Pitch</label>
                    <input type="number" min="0.5" max="2" step="0.1"
                      className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-2 text-sm text-white focus:outline-none"
                      value={actions.soundPitch||1} onChange={e=>setAct('soundPitch',+e.target.value)}/>
                  </div>
                </div>
              )}
            </div>
            {/* Particle */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">✨ Particle</label>
                <select className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={actions.particle||''} onChange={e=>setAct('particle',e.target.value)}>
                  <option value="">— None —</option>
                  {PARTICLES.map(p=><option key={p} value={p}>{p.replace(/_/g,' ').toLowerCase()}</option>)}
                </select>
              </div>
              {actions.particle && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Count</label>
                    <input type="number" min="1" max="100"
                      className="w-full bg-[#2a2a3e] border border-[#373750] rounded px-2 py-2 text-sm text-white focus:outline-none"
                      value={actions.particleCount||20} onChange={e=>setAct('particleCount',+e.target.value)}/>
                  </div>
                  {actions.particle === 'DUST' && (
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Color</label>
                      <input type="color"
                        className="w-full h-9 bg-[#2a2a3e] border border-[#373750] rounded px-1 py-1 cursor-pointer"
                        value={actions.particleColor||'#FF0000'} onChange={e=>setAct('particleColor',e.target.value)}/>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAGS TAB ── */}
        {activeTab === 'tags' && (
          <div className="max-w-lg">
            <KitTags tags={tags} onChange={v => { setTags(v); setDirty(true); }}/>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {itemModal && (
        <ItemModal
          slot={itemModal.slot}
          item={itemModal.item}
          onSave={(slot, item) => { setItem(slot, item); setItemModal(null); }}
          onDelete={(slot) => { setItem(slot, null); setItemModal(null); }}
          onClose={() => setItemModal(null)}
        />
      )}
    </div>
  );
}

function fmtCD(s) {
  if (!s || s <= 0) return 'No cooldown';
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h > 0) return `${h}h ${m}m`; if (m > 0) return `${m}m ${sec}s`; return `${sec}s`;
}
