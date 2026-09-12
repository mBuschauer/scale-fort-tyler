import { lookup, type Item } from "./catalog";

const KEY = "scale.unlocked";

export const loadUnlocked = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((code): code is string => typeof code === "string");
  } catch {
    return [];
  }
};

export const saveUnlocked = (codes: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(codes));
  } catch {
    return;
  }
};

export const restoreUnlocked = (): Item[] => {
  const items = new Set<Item>();
  for (const code of loadUnlocked()) {
    const item = lookup(code);
    if (item) items.add(item);
  }
  return [...items];
};
