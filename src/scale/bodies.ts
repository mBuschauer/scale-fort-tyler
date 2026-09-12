import { Bodies, Body, Composite, Constraint } from "matter-js";
import type { Item } from "./catalog";
import {
  BEAM_HALF_LENGTH,
  BEAM_MASS,
  BEAM_THICKNESS,
  DEFAULT_CAT,
  EARTH,
  FLOOR_TOP,
  HEIGHT,
  INK,
  INTERACTABLE_CAT,
  MAX_TILT,
  PIVOT,
  PIVOT_DROP,
  PLATE_CAT,
  PLATE_COLOR,
  PLATE_MASS,
  PLATE_THICKNESS,
  PLATE_WIDTH,
  SPAWN,
  STAND,
  STRING_DROP,
  WIDTH,
} from "./constants";

type Half = { w: number; h: number };
type Side = -1 | 1;

export type Arena = {
  beam: Matter.Body;
  left: Matter.Body;
  right: Matter.Body;
  solids: Matter.Body[];
};

export const halfOf = (body: Matter.Body) => body.plugin.half as Half;

export const previousOf = (body: Matter.Body) =>
  (body as unknown as { positionPrev: Matter.Vector }).positionPrev;

const rotateAbout = Body.rotate as unknown as (
  body: Matter.Body,
  rotation: number,
  point: Matter.Vector,
) => void;

export const clampTilt = (beam: Matter.Body) => {
  if (Math.abs(beam.angle) <= MAX_TILT) return;
  rotateAbout(beam, Math.sign(beam.angle) * MAX_TILT - beam.angle, PIVOT);
  Body.setAngularVelocity(beam, 0);
};

const makePlate = (beam: Matter.Body, side: Side) => {
  const beamEndX = side * BEAM_HALF_LENGTH;
  const plate = Bodies.rectangle(
    PIVOT.x + beamEndX,
    PIVOT.y + PIVOT_DROP + STRING_DROP + PLATE_THICKNESS / 2,
    PLATE_WIDTH,
    PLATE_THICKNESS,
    {
      frictionAir: 0.04,
      friction: 0.9,
      collisionFilter: { category: PLATE_CAT, mask: DEFAULT_CAT },
      plugin: { half: { w: PLATE_WIDTH / 2, h: PLATE_THICKNESS / 2 } },
      render: { fillStyle: PLATE_COLOR },
    },
  );
  Body.setMass(plate, PLATE_MASS);
  Body.setInertia(plate, Infinity);

  const stringLength = Math.hypot(STRING_DROP, PLATE_WIDTH / 2);
  const strings = [-1, 1].map((edge) =>
    Constraint.create({
      bodyA: beam,
      pointA: { x: beamEndX, y: 0 },
      bodyB: plate,
      pointB: { x: (edge * PLATE_WIDTH) / 2, y: -PLATE_THICKNESS / 2 },
      length: stringLength,
      stiffness: 1,
      damping: 0.05,
      render: { strokeStyle: INK, lineWidth: 1.5, type: "line" },
    }),
  );
  return { plate, strings };
};

export const createArena = (world: Matter.Composite): Arena => {
  const floor = Bodies.rectangle(WIDTH / 2, FLOOR_TOP + 20, WIDTH, 40, {
    isStatic: true,
    render: { fillStyle: EARTH },
  });
  const bounds = [
    Bodies.rectangle(-20, HEIGHT / 2, 40, HEIGHT * 2, { isStatic: true }),
    Bodies.rectangle(WIDTH + 20, HEIGHT / 2, 40, HEIGHT * 2, { isStatic: true }),
    Bodies.rectangle(WIDTH / 2, -20, WIDTH, 40, { isStatic: true }),
  ];

  const post = Bodies.rectangle(PIVOT.x, (PIVOT.y + FLOOR_TOP) / 2, 14, FLOOR_TOP - PIVOT.y, {
    isStatic: true,
    collisionFilter: { category: DEFAULT_CAT, mask: 0 },
    render: { fillStyle: STAND },
  });
  const foot = Bodies.rectangle(PIVOT.x, FLOOR_TOP - 10, 160, 20, {
    isStatic: true,
    plugin: { half: { w: 80, h: 10 } },
    render: { fillStyle: STAND },
  });

  const beam = Bodies.rectangle(
    PIVOT.x,
    PIVOT.y + PIVOT_DROP,
    BEAM_HALF_LENGTH * 2,
    BEAM_THICKNESS,
    {
      frictionAir: 0.05,
      collisionFilter: { category: DEFAULT_CAT, mask: 0 },
      render: { fillStyle: INK },
    },
  );
  Body.setMass(beam, BEAM_MASS);

  const pivotConstraint = Constraint.create({
    pointA: PIVOT,
    bodyB: beam,
    pointB: { x: 0, y: -PIVOT_DROP },
    length: 0,
    stiffness: 1,
    render: { visible: false },
  });

  const left = makePlate(beam, -1);
  const right = makePlate(beam, 1);

  Composite.add(world, [
    floor,
    ...bounds,
    post,
    foot,
    beam,
    pivotConstraint,
    left.plate,
    ...left.strings,
    right.plate,
    ...right.strings,
  ]);

  return {
    beam,
    left: left.plate,
    right: right.plate,
    solids: [left.plate, right.plate, foot],
  };
};

export const createWeight = ({ code, name, collection, mass, color, size }: Item) => {
  const body = Bodies.rectangle(SPAWN.x, SPAWN.y, size, size, {
    friction: 0.9,
    restitution: 0,
    collisionFilter: { category: INTERACTABLE_CAT, mask: ~PLATE_CAT },
    plugin: { half: { w: size / 2, h: size / 2 }, mass, code, name, collection },
    render: { fillStyle: color },
  });
  Body.setMass(body, mass);
  Body.setInertia(body, Infinity);
  return body;
};

export const weightAt = (weights: Set<Matter.Body>, point: Matter.Vector) => {
  for (const weight of weights) {
    const half = halfOf(weight);
    if (Math.abs(point.x - weight.position.x) > half.w) continue;
    if (Math.abs(point.y - weight.position.y) > half.h) continue;
    return weight;
  }
  return null;
};
