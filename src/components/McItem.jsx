import { useState, memo } from 'react';

// GitHub raw assets — no CORS, official Minecraft textures, PNG pixel art
const TEX_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item';

// Some items have different names in the texture files
const ALIASES = {
  SHORT_GRASS: 'short_grass',
  GRASS: 'short_grass',
  BEEF: 'raw_beef',
  PORKCHOP: 'raw_porkchop',
  CHICKEN: 'raw_chicken',
  MUTTON: 'raw_mutton',
  COD: 'raw_cod',
  SALMON: 'raw_salmon',
  RABBIT: 'raw_rabbit',
  GLISTERING_MELON_SLICE: 'glistering_melon_slice',
  GOLDEN_CARROT: 'golden_carrot',
  EXPERIENCE_BOTTLE: 'experience_bottle',
  ENDER_EYE: 'ender_eye',
  ENDER_PEARL: 'ender_pearl',
  NETHER_STAR: 'nether_star',
  TOTEM_OF_UNDYING: 'totem_of_undying',
  BLAZE_ROD: 'blaze_rod',
  GHAST_TEAR: 'ghast_tear',
  DRAGON_BREATH: 'dragon_breath',
  FLINT_AND_STEEL: 'flint_and_steel',
  FIRE_CHARGE: 'fire_charge',
  WIND_CHARGE: 'wind_charge',
  TRIAL_KEY: 'trial_key',
  OMINOUS_TRIAL_KEY: 'ominous_trial_key',
  OMINOUS_BOTTLE: 'ominous_bottle',
  HEAVY_CORE: 'heavy_core',
  ECHO_SHARD: 'echo_shard',
  RECOVERY_COMPASS: 'recovery_compass',
  DISC_FRAGMENT_5: 'disc_fragment_5',
  FILLED_MAP: 'filled_map',
  HEART_OF_THE_SEA: 'heart_of_the_sea',
  NAUTILUS_SHELL: 'nautilus_shell',
  HONEYCOMB: 'honeycomb',
  GOAT_HORN: 'goat_horn',
  BREEZE_ROD: 'breeze_rod',
  ARMADILLO_SCUTE: 'armadillo_scute',
  WOLF_ARMOR: 'wolf_armor',
  MUSIC_DISC_13: 'music_disc_13',
  MUSIC_DISC_CAT: 'music_disc_cat',
  MUSIC_DISC_BLOCKS: 'music_disc_blocks',
  MUSIC_DISC_CHIRP: 'music_disc_chirp',
  MUSIC_DISC_FAR: 'music_disc_far',
  MUSIC_DISC_MALL: 'music_disc_mall',
  MUSIC_DISC_MELLOHI: 'music_disc_mellohi',
  MUSIC_DISC_STAL: 'music_disc_stal',
  MUSIC_DISC_STRAD: 'music_disc_strad',
  MUSIC_DISC_WARD: 'music_disc_ward',
  MUSIC_DISC_11: 'music_disc_11',
  MUSIC_DISC_WAIT: 'music_disc_wait',
  MUSIC_DISC_OTHERSIDE: 'music_disc_otherside',
  MUSIC_DISC_5: 'music_disc_5',
  MUSIC_DISC_PIGSTEP: 'music_disc_pigstep',
  MUSIC_DISC_RELIC: 'music_disc_relic',
  MUSIC_DISC_CREATOR: 'music_disc_creator',
  MUSIC_DISC_CREATOR_MUSIC_BOX: 'music_disc_creator_music_box',
  MUSIC_DISC_PRECIPICE: 'music_disc_precipice',
};

export function getTextureUrl(materialId) {
  if (!materialId) return null;
  const id = materialId.toUpperCase();
  const texName = ALIASES[id] || id.toLowerCase();
  return `${TEX_BASE}/${texName}.png`;
}

const McItem = memo(function McItem({
  materialId,
  size = 32,
  className = '',
  style = {},
  title,
}) {
  const [err, setErr] = useState(false);
  const url = getTextureUrl(materialId);

  if (!materialId || err) {
    return (
      <div
        className={`flex items-center justify-center text-gray-600 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.55, ...style }}
        title={title || materialId}
      >
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
      style={{
        imageRendering: 'pixelated',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
});

export default McItem;
