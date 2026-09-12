import { Body } from "matter-js";
import { VOLATILE_PAIR } from "./catalog";
import {
  BLAST_FLASH,
  BLAST_FREEFALL,
  BLAST_MIN_PUSH,
  BLAST_RADIUS,
  BLAST_RISE,
  BLAST_SPEED,
} from "./constants";

const [RELICS, REMNANTS] = VOLATILE_PAIR;

export type Blast = { x: number; y: number; startedAt: number; seed: number };

const flashpoint = (carried: Iterable<Matter.Body>) => {
  const relics: Matter.Body[] = [];
  const remnants: Matter.Body[] = [];
  for (const weight of carried) {
    if (weight.plugin.collection === RELICS) relics.push(weight);
    else if (weight.plugin.collection === REMNANTS) remnants.push(weight);
  }

  let closest = Infinity;
  let spark: { x: number; y: number } | null = null;
  for (const relic of relics) {
    for (const remnant of remnants) {
      const gap = Math.hypot(
        relic.position.x - remnant.position.x,
        relic.position.y - remnant.position.y,
      );
      if (gap >= closest) continue;
      closest = gap;
      spark = {
        x: (relic.position.x + remnant.position.x) / 2,
        y: (relic.position.y + remnant.position.y) / 2,
      };
    }
  }
  return spark;
};

export const createExplosion = () => {
  const airborne = new Set<Matter.Body>();
  let settlesAt = 0;
  let blast: Blast | null = null;

  const update = (carried: Set<Matter.Body>, weights: Set<Matter.Body>) => {
    const now = performance.now();
    if (blast && now - blast.startedAt > BLAST_FLASH) blast = null;

    if (now < settlesAt) return null;
    airborne.clear();

    const spark = flashpoint(carried);
    if (!spark) return null;

    blast = { ...spark, startedAt: now, seed: Math.random() * Math.PI * 2 };
    settlesAt = now + BLAST_FREEFALL;

    const launched: Matter.Body[] = [];
    for (const weight of weights) {
      const dx = weight.position.x - spark.x;
      const dy = weight.position.y - spark.y;
      const distance = Math.hypot(dx, dy);

      const reach = Math.max(1 - distance / BLAST_RADIUS, 0);
      const push = carried.has(weight) ? BLAST_MIN_PUSH + (1 - BLAST_MIN_PUSH) * reach : reach;
      if (push === 0) continue;

      const nx = distance === 0 ? 0 : dx / distance;
      const ny = distance === 0 ? -1 : dy / distance;
      const speed = (BLAST_SPEED / Math.sqrt(weight.plugin.mass)) * push;

      Body.setVelocity(weight, {
        x: nx * speed,
        y: Math.min(ny * speed, 0) - BLAST_RISE * speed,
      });
      airborne.add(weight);
      launched.push(weight);
    }
    return launched;
  };

  return {
    update,
    airborne: airborne as ReadonlySet<Matter.Body>,
    blast: () => blast,
  };
};
