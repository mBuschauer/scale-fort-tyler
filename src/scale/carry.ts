import { Body } from "matter-js";
import { halfOf } from "./bodies";
import { clampToArena } from "./contacts";
import {
  BASE_STEP,
  CONTACT_GAP,
  FRICTION_GRIP,
  MAX_PENETRATION,
  PLATE_MASS,
  RESTING_PENETRATION,
} from "./constants";

type Held = { carrier: Matter.Body; root: Matter.Body; offset: number };

const ridesOn = (body: Matter.Body, surface: Matter.Body) => {
  const hb = halfOf(body);
  const hs = halfOf(surface);
  if (Math.abs(body.position.x - surface.position.x) >= hb.w + hs.w) return false;
  const gap = surface.position.y - hs.h - (body.position.y + hb.h);
  return gap <= CONTACT_GAP && gap >= -(MAX_PENETRATION + RESTING_PENETRATION);
};

export const createCarry = (left: Matter.Body, right: Matter.Body) => {
  const carry = new Map<Matter.Body, Held>();

  const place = (
    weights: Set<Matter.Body>,
    holding: Matter.Body | null,
    shoved: Set<Matter.Body>,
    stepMs: number,
    airborne: ReadonlySet<Matter.Body>,
  ) => {
    const riders = [...weights].sort((a, b) => b.position.y - a.position.y);
    const carriers = new Set<Matter.Body>([left, right]);

    for (const rider of carry.keys()) {
      if (!weights.has(rider)) carry.delete(rider);
    }

    for (const rider of riders) {
      if (rider === holding || airborne.has(rider)) {
        carry.delete(rider);
        continue;
      }

      let carrier: Matter.Body | undefined;
      for (const candidate of carriers) {
        if (candidate !== rider && ridesOn(rider, candidate)) {
          carrier = candidate;
          break;
        }
      }
      if (!carrier) {
        carry.delete(rider);
        continue;
      }

      const slip = rider.velocity.x - carrier.velocity.x;
      const grip = FRICTION_GRIP * (stepMs / BASE_STEP);
      const residual = Math.sign(slip) * Math.max(Math.abs(slip) - grip, 0);

      const held = carry.get(rider);
      const keeps = held && held.carrier === carrier && !shoved.has(rider);
      const offset = keeps ? held.offset + residual : rider.position.x - carrier.position.x;

      Body.setPosition(rider, {
        x: carrier.position.x + offset,
        y: carrier.position.y - halfOf(carrier).h - halfOf(rider).h,
      });
      Body.setVelocity(rider, {
        x: carrier.velocity.x + residual,
        y: carrier.velocity.y,
      });

      clampToArena(rider);
      carry.set(rider, {
        carrier,
        root: carry.get(carrier)?.root ?? carrier,
        offset: rider.position.x - carrier.position.x,
      });

      carriers.add(rider);
    }
  };

  const weigh = () => {
    const load = new Map<Matter.Body, number>([
      [left, 0],
      [right, 0],
    ]);
    for (const [rider, held] of carry) {
      const carried = load.get(held.root);
      if (carried !== undefined) load.set(held.root, carried + rider.plugin.mass);
    }
    for (const [plate, mass] of load) {
      const target = PLATE_MASS + mass;
      if (plate.mass !== target) Body.setMass(plate, target);
    }
  };

  const carried = () => new Set(carry.keys());

  const stacks = () => {
    const stacked = { left: [] as Matter.Body[], right: [] as Matter.Body[] };
    for (const [rider, held] of carry) {
      if (held.root === left) stacked.left.push(rider);
      else if (held.root === right) stacked.right.push(rider);
    }
    return stacked;
  };

  const release = (thrown: Iterable<Matter.Body>) => {
    for (const weight of thrown) carry.delete(weight);
  };

  return { place, weigh, carried, stacks, release };
};
