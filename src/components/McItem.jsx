import { useState, memo } from 'react';

const V4   = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures';
const V5   = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.5/assets/minecraft/textures';
const I    = (n, v=V4) => `${v}/item/${n}.png`;
const B    = (n, v=V4) => `${v}/block/${n}.png`;

// Items whose texture differs from their lowercase material ID
const ALIASES = {
  // Food
  BEEF:'raw_beef', PORKCHOP:'raw_porkchop', CHICKEN:'raw_chicken',
  MUTTON:'raw_mutton', COD:'raw_cod', SALMON:'raw_salmon', RABBIT:'raw_rabbit',
  // Special items
  GLISTERING_MELON_SLICE:'glistering_melon_slice',
  EXPERIENCE_BOTTLE:'experience_bottle',
  FLINT_AND_STEEL:'flint_and_steel', FIRE_CHARGE:'fire_charge',
  HEART_OF_THE_SEA:'heart_of_the_sea', NAUTILUS_SHELL:'nautilus_shell',
  NETHER_STAR:'nether_star', TOTEM_OF_UNDYING:'totem_of_undying',
  BLAZE_ROD:'blaze_rod', GHAST_TEAR:'ghast_tear', DRAGON_BREATH:'dragon_breath',
  ECHO_SHARD:'echo_shard', DISC_FRAGMENT_5:'disc_fragment_5',
  FILLED_MAP:'filled_map', HONEYCOMB:'honeycomb', GOAT_HORN:'goat_horn',
  GOLDEN_CARROT:'golden_carrot',
};

// Items that use block textures (folder + filename)
const BLOCK_ALIASES = {
  // Plants / flowers
  SHORT_GRASS:'short_grass', GRASS:'short_grass', TALL_GRASS:'tall_grass_top',
  FERN:'fern', LARGE_FERN:'large_fern_top',
  POPPY:'poppy', DANDELION:'dandelion', CORNFLOWER:'cornflower',
  LILY_OF_THE_VALLEY:'lily_of_the_valley', AZURE_BLUET:'azure_bluet',
  OXEYE_DAISY:'oxeye_daisy', ALLIUM:'allium',
  ORANGE_TULIP:'orange_tulip', RED_TULIP:'red_tulip',
  PINK_TULIP:'pink_tulip', WHITE_TULIP:'white_tulip',
  SUNFLOWER:'sunflower_front', LILAC:'lilac_top',
  ROSE_BUSH:'rose_bush_top', PEONY:'peony_top',
  WITHER_ROSE:'wither_rose', PINK_PETALS:'pink_petals',
  TORCHFLOWER:'torchflower', PITCHER_PLANT:'pitcher_plant_top',
  SPORE_BLOSSOM:'spore_blossom', AZALEA:'azalea_top',
  AZALEA_LEAVES:'azalea_leaves', HANGING_ROOTS:'hanging_roots',
  FROGSPAWN:'frogspawn', LILY_PAD:'lily_pad',
  SEAGRASS:'seagrass', KELP:'kelp', DEAD_BUSH:'dead_bush',
  SWEET_BERRIES:'sweet_berry_bush_stage3', GLOW_BERRIES:'cave_vines_plant_lit',
  MOSS_CARPET:'moss_block', VINE:'vine',
  WEEPING_VINES:'weeping_vines_plant', TWISTING_VINES:'twisting_vines_plant',
  // Logs
  OAK_LOG:'oak_log', SPRUCE_LOG:'spruce_log', BIRCH_LOG:'birch_log',
  JUNGLE_LOG:'jungle_log', ACACIA_LOG:'acacia_log', DARK_OAK_LOG:'dark_oak_log',
  MANGROVE_LOG:'mangrove_log', CHERRY_LOG:'cherry_log',
  CRIMSON_STEM:'crimson_stem', WARPED_STEM:'warped_stem',
  BAMBOO_BLOCK:'bamboo_block_top', STRIPPED_BAMBOO_BLOCK:'stripped_bamboo_block_top',
  MANGROVE_ROOTS:'mangrove_roots_side',
  // Leaves
  OAK_LEAVES:'oak_leaves', SPRUCE_LEAVES:'spruce_leaves',
  BIRCH_LEAVES:'birch_leaves', JUNGLE_LEAVES:'jungle_leaves',
  ACACIA_LEAVES:'acacia_leaves', DARK_OAK_LEAVES:'dark_oak_leaves',
  MANGROVE_LEAVES:'mangrove_leaves', CHERRY_LEAVES:'cherry_leaves',
  // Stone / terrain
  STONE:'stone', COBBLESTONE:'cobblestone', GRAVEL:'gravel',
  SAND:'sand', RED_SAND:'red_sand', DIRT:'dirt', COARSE_DIRT:'coarse_dirt',
  GRASS_BLOCK:'grass_block_top', PODZOL:'podzol_top', MYCELIUM:'mycelium_top',
  MUD:'mud', PACKED_MUD:'packed_mud', MUD_BRICKS:'mud_bricks',
  CALCITE:'calcite', TUFF:'tuff', SMOOTH_BASALT:'smooth_basalt',
  BASALT:'basalt_top', DEEPSLATE:'deepslate_top',
  COBBLED_DEEPSLATE:'cobbled_deepslate',
  REINFORCED_DEEPSLATE:'reinforced_deepslate_top',
  OBSIDIAN:'obsidian', CRYING_OBSIDIAN:'crying_obsidian',
  BEDROCK:'bedrock', NETHERRACK:'netherrack',
  SOUL_SAND:'soul_sand', SOUL_SOIL:'soul_soil', MAGMA_BLOCK:'magma',
  NETHER_WART_BLOCK:'nether_wart_block', WARPED_WART_BLOCK:'warped_wart_block',
  CRIMSON_NYLIUM:'crimson_nylium', WARPED_NYLIUM:'warped_nylium',
  ICE:'ice', PACKED_ICE:'packed_ice', BLUE_ICE:'blue_ice',
  SNOW_BLOCK:'snow', SNOW:'snow', END_STONE:'end_stone',
  PURPUR_BLOCK:'purpur_block', PURPUR_PILLAR:'purpur_pillar',
  // Ores
  COAL_ORE:'coal_ore', IRON_ORE:'iron_ore', GOLD_ORE:'gold_ore',
  DIAMOND_ORE:'diamond_ore', EMERALD_ORE:'emerald_ore',
  LAPIS_ORE:'lapis_ore', REDSTONE_ORE:'redstone_ore',
  NETHER_GOLD_ORE:'nether_gold_ore', NETHER_QUARTZ_ORE:'nether_quartz_ore',
  ANCIENT_DEBRIS:'ancient_debris_top',
  // Mineral blocks
  COAL_BLOCK:'coal_block', IRON_BLOCK:'iron_block', GOLD_BLOCK:'gold_block',
  DIAMOND_BLOCK:'diamond_block', EMERALD_BLOCK:'emerald_block',
  LAPIS_BLOCK:'lapis_block', REDSTONE_BLOCK:'redstone_block',
  NETHERITE_BLOCK:'netherite_block', AMETHYST_BLOCK:'amethyst_block',
  BUDDING_AMETHYST:'budding_amethyst',
  RAW_IRON_BLOCK:'raw_iron_block', RAW_GOLD_BLOCK:'raw_gold_block',
  RAW_COPPER_BLOCK:'raw_copper_block',
  // Sculk
  SCULK:'sculk', SCULK_CATALYST:'sculk_catalyst_top',
  SCULK_SENSOR:'sculk_sensor_top', SCULK_SHRIEKER:'sculk_shrieker_top',
  SCULK_VEIN:'sculk_vein',
  // Lights
  GLOWSTONE:'glowstone', SEA_LANTERN:'sea_lantern', SHROOMLIGHT:'shroomlight',
  OCHRE_FROGLIGHT:'ochre_froglight_top',
  VERDANT_FROGLIGHT:'verdant_froglight_top',
  PEARLESCENT_FROGLIGHT:'pearlescent_froglight_top',
  // Buttons (use plank texture)
  STONE_BUTTON:'stone', OAK_BUTTON:'oak_planks', SPRUCE_BUTTON:'spruce_planks',
  BIRCH_BUTTON:'birch_planks', JUNGLE_BUTTON:'jungle_planks',
  ACACIA_BUTTON:'acacia_planks', DARK_OAK_BUTTON:'dark_oak_planks',
  MANGROVE_BUTTON:'mangrove_planks', CHERRY_BUTTON:'cherry_planks',
  CRIMSON_BUTTON:'crimson_planks', WARPED_BUTTON:'warped_planks',
  BAMBOO_BUTTON:'bamboo_planks',
  POLISHED_BLACKSTONE_BUTTON:'polished_blackstone',
  // New 1.21 blocks
  VAULT:'vault_front_off',
  POINTED_DRIPSTONE:'pointed_dripstone_up_tip',
  DRIPSTONE_BLOCK:'dripstone_block',
  ROOTED_DIRT:'rooted_dirt',
};

// Items that need a different version branch
const VERSION_OVERRIDES = {
  HEAVY_CORE: B('heavy_core', V5),
};

export function getTextureUrl(materialId) {
  if (!materialId) return null;
  const id = materialId.toUpperCase();
  // Version override
  if (VERSION_OVERRIDES[id]) return VERSION_OVERRIDES[id];
  // Block texture alias
  if (BLOCK_ALIASES[id]) return B(BLOCK_ALIASES[id]);
  // Item alias
  if (ALIASES[id]) return I(ALIASES[id]);
  // Default: item folder
  return I(id.toLowerCase());
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
