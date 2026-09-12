import { Body } from "matter-js";
import { halfOf, previousOf } from "./bodies";
import {
  EDGE_SLOP,
  FLOOR_TOP,
  MAX_PENETRATION,
  RESTING_PENETRATION,
  SEPARATION_PASSES,
  WIDTH,
} from "./constants";

const stopInto = (body: Matter.Body, nx: number, ny: number, surface?: Matter.Body) => {
  const vx = body.velocity.x - (surface ? surface.velocity.x : 0);
  const vy = body.velocity.y - (surface ? surface.velocity.y : 0);
  const into = vx * nx + vy * ny;
  if (into >= 0) return;
  Body.setVelocity(body, {
    x: body.velocity.x - into * nx,
    y: body.velocity.y - into * ny,
  });
};

const stopClosing = (a: Matter.Body, b: Matter.Body, nx: number, ny: number, shareA: number) => {
  const into = (a.velocity.x - b.velocity.x) * nx + (a.velocity.y - b.velocity.y) * ny;
  if (into >= 0) return;
  Body.setVelocity(a, {
    x: a.velocity.x - into * nx * shareA,
    y: a.velocity.y - into * ny * shareA,
  });
  Body.setVelocity(b, {
    x: b.velocity.x + into * nx * (1 - shareA),
    y: b.velocity.y + into * ny * (1 - shareA),
  });
};

const moveBy = (body: Matter.Body, dx: number, dy: number) => {
  Body.setPosition(body, { x: body.position.x + dx, y: body.position.y + dy });
};

const separation = (a: Matter.Body, b: Matter.Body) => {
  const ha = halfOf(a);
  const hb = halfOf(b);
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const px = ha.w + hb.w - Math.abs(dx);
  const py = ha.h + hb.h - Math.abs(dy);
  if (px <= MAX_PENETRATION || py <= MAX_PENETRATION) return null;
  return px < py
    ? { nx: dx < 0 ? -1 : 1, ny: 0, depth: px - RESTING_PENETRATION }
    : { nx: 0, ny: dy < 0 ? -1 : 1, depth: py - RESTING_PENETRATION };
};

const landOnTop = (body: Matter.Body, surface: Matter.Body) => {
  const hb = halfOf(body);
  const hs = halfOf(surface);
  if (Math.abs(body.position.x - surface.position.x) >= hb.w + hs.w) return false;
  const top = surface.position.y - hs.h;
  const limit = top - hb.h + MAX_PENETRATION;
  if (previousOf(body).y > limit || body.position.y <= limit) return false;
  Body.setPosition(body, { x: body.position.x, y: top - hb.h + RESTING_PENETRATION });
  stopInto(body, 0, -1, surface);
  return true;
};

export const clampToArena = (body: Matter.Body) => {
  const h = halfOf(body);
  const minX = h.w - EDGE_SLOP;
  const minY = h.h - EDGE_SLOP;
  const maxX = WIDTH - minX;
  const maxY = FLOOR_TOP - minY;
  const x = minX > maxX ? WIDTH / 2 : Math.min(Math.max(body.position.x, minX), maxX);
  const y = minY > maxY ? FLOOR_TOP / 2 : Math.min(Math.max(body.position.y, minY), maxY);
  if (x === body.position.x && y === body.position.y) return;
  if (x !== body.position.x) stopInto(body, x > body.position.x ? 1 : -1, 0);
  if (y !== body.position.y) stopInto(body, 0, y > body.position.y ? 1 : -1);
  Body.setPosition(body, { x, y });
};

export const resolveContacts = (
  weights: Matter.Body[],
  solids: Matter.Body[],
  plates: Matter.Body[],
) => {
  const shoved = new Set<Matter.Body>();

  for (let pass = 0; pass < SEPARATION_PASSES; pass++) {
    for (const weight of weights) {
      for (const solid of solids) {
        if (landOnTop(weight, solid)) continue;
        const hit = separation(weight, solid);
        if (!hit) continue;
        moveBy(weight, hit.nx * hit.depth, hit.ny * hit.depth);
        stopInto(weight, hit.nx, hit.ny, solid);
        if (hit.nx !== 0) shoved.add(weight);
      }
    }

    for (let i = 0; i < weights.length; i++) {
      for (let j = i + 1; j < weights.length; j++) {
        const a = weights[i];
        const b = weights[j];
        const hit = separation(a, b);
        if (!hit) continue;
        const totalInverse = a.inverseMass + b.inverseMass;
        if (totalInverse === 0) continue;
        const shareA = a.inverseMass / totalInverse;
        moveBy(a, hit.nx * hit.depth * shareA, hit.ny * hit.depth * shareA);
        moveBy(b, -hit.nx * hit.depth * (1 - shareA), -hit.ny * hit.depth * (1 - shareA));
        stopClosing(a, b, hit.nx, hit.ny, shareA);
        if (hit.nx !== 0) {
          shoved.add(a);
          shoved.add(b);
        }
      }
    }

    for (const weight of weights) clampToArena(weight);
    for (const plate of plates) clampToArena(plate);
  }

  return shoved;
};
