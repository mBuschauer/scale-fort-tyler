export type WeightSpec = {
  name: string;
  collection: "Celestial Relics" | "Military Remnants";
  mass: number;
  color: string;
  size: number;
};

export type Item = WeightSpec & { code: string };

export const CATALOG = {
  DFP: {
    name: "Dawnfeather Prism",
    collection: "Celestial Relics",
    mass: 4,
    color: "#a8dadc",
    size: 38,
  },
  C2: {
    name: "Emerald Wyrm Tooth",
    collection: "Celestial Relics",
    mass: 7,
    color: "#2a9d8f",
    size: 42,
  },
  SSM: {
    name: "Sunstone medallion",
    collection: "Celestial Relics",
    mass: 8,
    color: "#e9c46a",
    size: 44,
  },
  CSI: {
    name: "Coiled serpent idol",
    collection: "Celestial Relics",
    mass: 9,
    color: "#588157",
    size: 46,
  },
  GHD: {
    name: "Gilded halo disk",
    collection: "Celestial Relics",
    mass: 10,
    color: "#d4a017",
    size: 48,
  },
  TMF: {
    name: "The Mercy Fuze",
    collection: "Military Remnants",
    mass: 12,
    color: "#b08968",
    size: 50
  },
  OBS: {
    name: "Observer's Shard",
    collection: "Military Remnants",
    mass: 18,
    color: "#6c757d",
    size: 54,
  },
  TLC: {
    name: "The Last Cartridge",
    collection: "Military Remnants",
    mass: 21,
    color: "#bc6c25",
    size: 56,
  },
  ARS: {
    name: "Artillery Sponge",
    collection: "Military Remnants",
    mass: 24,
    color: "#495057",
    size: 60,
  },
  CBF: {
    name: "Cannonball fragment",
    collection: "Military Remnants",
    mass: 27,
    color: "#343a40",
    size: 64,
  },
} satisfies Record<string, WeightSpec>;

export type Code = keyof typeof CATALOG;

export const VOLATILE_PAIR = ["Celestial Relics", "Military Remnants"] as const;

const BY_CODE = new Map<string, Item>(
  Object.entries(CATALOG).map(([code, spec]) => {
    const normalised = code.trim().toUpperCase();
    return [normalised, { ...spec, code: normalised }];
  }),
);

export const lookup = (typed: string): Item | undefined => BY_CODE.get(typed.trim().toUpperCase());
