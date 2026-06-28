import { useState, memo } from 'react';

const ITEM_BASE  = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item';
const BLOCK_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/block';

const I = (name) => `${ITEM_BASE}/${name}.png`;
const B = (name) => `${BLOCK_BASE}/${name}.png`;

// Full alias map — item ID -> texture URL
// Items not listed here use lowercase ID in item/ folder (default)
const ALIASES = {
  // ── Food (raw names differ) ──────────────────────────────────────────────
  BEEF:          I('raw_beef'),
  PORKCHOP:      I('raw_porkchop'),
  CHICKEN:       I('raw_chicken'),
  MUTTON:        I('raw_mutton'),
  COD:           I('raw_cod'),
  SALMON:        I('raw_salmon'),
  RABBIT:        I('raw_rabbit'),

  // ── Plants/flowers (block textures) ──────────────────────────────────────
  SHORT_GRASS:          B('short_grass'),
  GRASS:                B('short_grass'),
  TALL_GRASS:           B('tall_grass_top'),
  FERN:                 B('fern'),
  LARGE_FERN:           B('large_fern_top'),
  POPPY:                B('poppy'),
  DANDELION:            B('dandelion'),
  CORNFLOWER:           B('cornflower'),
  LILY_OF_THE_VALLEY:   B('lily_of_the_valley'),
  AZURE_BLUET:          B('azure_bluet'),
  OXEYE_DAISY:          B('oxeye_daisy'),
  ALLIUM:               B('allium'),
  ORANGE_TULIP:         B('orange_tulip'),
  RED_TULIP:            B('red_tulip'),
  PINK_TULIP:           B('pink_tulip'),
  WHITE_TULIP:          B('white_tulip'),
  SUNFLOWER:            B('sunflower_front'),
  LILAC:                B('lilac_top'),
  ROSE_BUSH:            B('rose_bush_top'),
  PEONY:                B('peony_top'),
  WITHER_ROSE:          B('wither_rose'),
  PINK_PETALS:          B('pink_petals'),
  TORCHFLOWER:          B('torchflower'),
  PITCHER_PLANT:        B('pitcher_plant_top'),
  PITCHER_POD:          B('pitcher_crop_bottom'),
  SPORE_BLOSSOM:        B('spore_blossom'),
  AZALEA:               B('azalea_top'),
  AZALEA_LEAVES:        B('azalea_leaves'),
  HANGING_ROOTS:        B('hanging_roots'),
  FROGSPAWN:            B('frogspawn'),
  BIG_DRIPLEAF:         B('big_dripleaf_top'),
  SMALL_DRIPLEAF:       B('small_dripleaf_top'),
  LILY_PAD:             B('lily_pad'),
  SEAGRASS:             B('seagrass'),
  KELP:                 B('kelp'),
  DEAD_BUSH:            B('dead_bush'),
  SWEET_BERRIES:        B('sweet_berry_bush_stage3'),
  GLOW_BERRIES:         B('cave_vines_plant_lit'),
  MOSS_CARPET:          B('moss_block'),
  VINE:                 B('vine'),
  WEEPING_VINES:        B('weeping_vines_plant'),
  TWISTING_VINES:       B('twisting_vines_plant'),

  // ── Logs / wood (block textures) ─────────────────────────────────────────
  OAK_LOG:              B('oak_log'),
  SPRUCE_LOG:           B('spruce_log'),
  BIRCH_LOG:            B('birch_log'),
  JUNGLE_LOG:           B('jungle_log'),
  ACACIA_LOG:           B('acacia_log'),
  DARK_OAK_LOG:         B('dark_oak_log'),
  MANGROVE_LOG:         B('mangrove_log'),
  CHERRY_LOG:           B('cherry_log'),
  CRIMSON_STEM:         B('crimson_stem'),
  WARPED_STEM:          B('warped_stem'),
  BAMBOO_BLOCK:         B('bamboo_block_top'),
  STRIPPED_BAMBOO_BLOCK:B('stripped_bamboo_block_top'),
  MANGROVE_ROOTS:       B('mangrove_roots_side'),

  // ── Leaves ────────────────────────────────────────────────────────────────
  OAK_LEAVES:           B('oak_leaves'),
  SPRUCE_LEAVES:        B('spruce_leaves'),
  BIRCH_LEAVES:         B('birch_leaves'),
  JUNGLE_LEAVES:        B('jungle_leaves'),
  ACACIA_LEAVES:        B('acacia_leaves'),
  DARK_OAK_LEAVES:      B('dark_oak_leaves'),
  MANGROVE_LEAVES:      B('mangrove_leaves'),
  CHERRY_LEAVES:        B('cherry_leaves'),

  // ── Stones & terrain (block textures) ────────────────────────────────────
  STONE:                B('stone'),
  COBBLESTONE:          B('cobblestone'),
  GRAVEL:               B('gravel'),
  SAND:                 B('sand'),
  RED_SAND:             B('red_sand'),
  DIRT:                 B('dirt'),
  COARSE_DIRT:          B('coarse_dirt'),
  GRASS_BLOCK:          B('grass_block_top'),
  PODZOL:               B('podzol_top'),
  MYCELIUM:             B('mycelium_top'),
  MUD:                  B('mud'),
  PACKED_MUD:           B('packed_mud'),
  MUD_BRICKS:           B('mud_bricks'),
  CALCITE:              B('calcite'),
  TUFF:                 B('tuff'),
  SMOOTH_BASALT:        B('smooth_basalt'),
  BASALT:               B('basalt_top'),
  DEEPSLATE:            B('deepslate_top'),
  COBBLED_DEEPSLATE:    B('cobbled_deepslate'),
  REINFORCED_DEEPSLATE: B('reinforced_deepslate_top'),
  OBSIDIAN:             B('obsidian'),
  CRYING_OBSIDIAN:      B('crying_obsidian'),
  BEDROCK:              B('bedrock'),
  NETHERRACK:           B('netherrack'),
  SOUL_SAND:            B('soul_sand'),
  SOUL_SOIL:            B('soul_soil'),
  MAGMA_BLOCK:          B('magma'),
  NETHER_WART_BLOCK:    B('nether_wart_block'),
  WARPED_WART_BLOCK:    B('warped_wart_block'),
  CRIMSON_NYLIUM:       B('crimson_nylium'),
  WARPED_NYLIUM:        B('warped_nylium'),
  ICE:                  B('ice'),
  PACKED_ICE:           B('packed_ice'),
  BLUE_ICE:             B('blue_ice'),
  SNOW_BLOCK:           B('snow'),
  SNOW:                 B('snow'),
  END_STONE:            B('end_stone'),
  PURPUR_BLOCK:         B('purpur_block'),
  PURPUR_PILLAR:        B('purpur_pillar'),

  // ── Ores (block textures) ─────────────────────────────────────────────────
  COAL_ORE:             B('coal_ore'),
  IRON_ORE:             B('iron_ore'),
  GOLD_ORE:             B('gold_ore'),
  DIAMOND_ORE:          B('diamond_ore'),
  EMERALD_ORE:          B('emerald_ore'),
  LAPIS_ORE:            B('lapis_ore'),
  REDSTONE_ORE:         B('redstone_ore'),
  NETHER_GOLD_ORE:      B('nether_gold_ore'),
  NETHER_QUARTZ_ORE:    B('nether_quartz_ore'),
  ANCIENT_DEBRIS:       B('ancient_debris_top'),

  // ── Mineral blocks ────────────────────────────────────────────────────────
  COAL_BLOCK:           B('coal_block'),
  IRON_BLOCK:           B('iron_block'),
  GOLD_BLOCK:           B('gold_block'),
  DIAMOND_BLOCK:        B('diamond_block'),
  EMERALD_BLOCK:        B('emerald_block'),
  LAPIS_BLOCK:          B('lapis_block'),
  REDSTONE_BLOCK:       B('redstone_block'),
  NETHERITE_BLOCK:      B('netherite_block'),
  AMETHYST_BLOCK:       B('amethyst_block'),
  BUDDING_AMETHYST:     B('budding_amethyst'),
  RAW_IRON_BLOCK:       B('raw_iron_block'),
  RAW_GOLD_BLOCK:       B('raw_gold_block'),
  RAW_COPPER_BLOCK:     B('raw_copper_block'),

  // ── Sculk ─────────────────────────────────────────────────────────────────
  SCULK:                B('sculk'),
  SCULK_CATALYST:       B('sculk_catalyst_top'),
  SCULK_SENSOR:         B('sculk_sensor_top'),
  SCULK_SHRIEKER:       B('sculk_shrieker_top'),
  SCULK_VEIN:           B('sculk_vein'),

  // ── Glowstone / lights ────────────────────────────────────────────────────
  GLOWSTONE:            B('glowstone'),
  SEA_LANTERN:          B('sea_lantern'),
  SHROOMLIGHT:          B('shroomlight'),
  OCHRE_FROGLIGHT:      B('ochre_froglight_top'),
  VERDANT_FROGLIGHT:    B('verdant_froglight_top'),
  PEARLESCENT_FROGLIGHT:B('pearlescent_froglight_top'),
  BEACON:               B('beacon'),
  CONDUIT:              I('conduit'),

  // ── Buttons / pressure plates (block texture) ────────────────────────────
  STONE_BUTTON:         B('stone'),
  OAK_BUTTON:           B('oak_planks'),
  SPRUCE_BUTTON:        B('spruce_planks'),
  BIRCH_BUTTON:         B('birch_planks'),
  JUNGLE_BUTTON:        B('jungle_planks'),
  ACACIA_BUTTON:        B('acacia_planks'),
  DARK_OAK_BUTTON:      B('dark_oak_planks'),
  MANGROVE_BUTTON:      B('mangrove_planks'),
  CHERRY_BUTTON:        B('cherry_planks'),
  CRIMSON_BUTTON:       B('crimson_planks'),
  WARPED_BUTTON:        B('warped_planks'),
  BAMBOO_BUTTON:        B('bamboo_planks'),
  POLISHED_BLACKSTONE_BUTTON: B('polished_blackstone'),

  // ── 1.21 new items ────────────────────────────────────────────────────────
  VAULT:                B('vault_front_off'),
  HEAVY_CORE:           B('heavy_core'),
  WIND_CHARGE:          I('wind_charge'),
  BREEZE_ROD:           I('breeze_rod'),
  MACE:                 I('mace'),
  TRIAL_KEY:            I('trial_key'),
  OMINOUS_TRIAL_KEY:    I('ominous_trial_key'),
  OMINOUS_BOTTLE:       I('ominous_bottle'),
  ARMADILLO_SCUTE:      I('armadillo_scute'),
  WOLF_ARMOR:           I('wolf_armor'),

  // ── Misc items with different names ──────────────────────────────────────
  GLISTERING_MELON_SLICE: I('glistering_melon_slice'),
  MELON_SLICE:          I('melon_slice'),
  EXPERIENCE_BOTTLE:    I('experience_bottle'),
  GOLDEN_CARROT:        I('golden_carrot'),
  NETHER_STAR:          I('nether_star'),
  TOTEM_OF_UNDYING:     I('totem_of_undying'),
  BLAZE_ROD:            I('blaze_rod'),
  GHAST_TEAR:           I('ghast_tear'),
  DRAGON_BREATH:        I('dragon_breath'),
  ECHO_SHARD:           I('echo_shard'),
  FLINT_AND_STEEL:      I('flint_and_steel'),
  FIRE_CHARGE:          I('fire_charge'),
  HEART_OF_THE_SEA:     I('heart_of_the_sea'),
  NAUTILUS_SHELL:       I('nautilus_shell'),
  HONEYCOMB:            I('honeycomb'),
  GOAT_HORN:            I('goat_horn'),
  DISC_FRAGMENT_5:      I('disc_fragment_5'),
  FILLED_MAP:           I('filled_map'),

  // ── Pointed dripstone etc ─────────────────────────────────────────────────
  POINTED_DRIPSTONE:    B('pointed_dripstone_up_tip'),
  DRIPSTONE_BLOCK:      B('dripstone_block'),
  ROOTED_DIRT:          B('rooted_dirt'),
};

export function getTextureUrl(materialId) {
  if (!materialId) return null;
  const id = materialId.toUpperCase();
  if (ALIASES[id]) return ALIASES[id];
  // Default: item folder with lowercase name
  return `${ITEM_BASE}/${id.toLowerCase()}.png`;
}

const McItem = memo(function McItem({ materialId, size = 32, className = '', style = {}, title }) {
  const [err, setErr] = useState(false);
  const url = getTextureUrl(materialId);

  if (!materialId || err) {
    return (
      <div className={`flex items-center justify-center text-gray-600 select-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.55, lineHeight: 1, ...style }}
        title={title || materialId}>
        📦
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={materialId}
      title={title || materialId}
      className={className}
      width={size}
      height={size}
      draggable={false}
      onError={() => setErr(true)}
      style={{ imageRendering: 'pixelated', objectFit: 'contain', display: 'block', ...style }}
    />
  );
});

export default McItem;
