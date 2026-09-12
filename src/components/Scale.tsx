import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { Composite, Engine, Events, Mouse, MouseConstraint, Render } from "matter-js";
import { clampTilt, createArena, weightAt } from "../scale/bodies";
import { createBalanceWatch, type Balance } from "../scale/balance";
import { createCarry } from "../scale/carry";
import { resolveContacts } from "../scale/contacts";
import { createExplosion } from "../scale/explosion";
import { drawOverlay } from "../scale/overlay";
import { BASE_STEP, HEIGHT, INTERACTABLE_CAT, MOUSE_CAT, WIDTH } from "../scale/constants";

type ScaleProps = {
  weights: Matter.Body[];
  hovered: Matter.Body | null;
  setHovered: Dispatch<SetStateAction<Matter.Body | null>>;
  onBalanced: (balance: Balance) => void;
};

export default function Scale({ weights, hovered, setHovered, onBalanced }: ScaleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const inWorldRef = useRef(new Set<Matter.Body>());
  const ringRef = useRef<Matter.Body | null>(null);
  const pointerRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    ringRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    engine.positionIterations = 12;
    engine.velocityIterations = 8;
    engine.constraintIterations = 4;

    const render = Render.create({
      canvas,
      engine,
      options: { width: WIDTH, height: HEIGHT, wireframes: false, background: "transparent" },
    });

    const arena = createArena(world);
    const plates = [arena.left, arena.right];
    const carry = createCarry(arena.left, arena.right);
    const explosion = createExplosion();
    const balance = createBalanceWatch();
    const inWorld = inWorldRef.current;

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      collisionFilter: { category: MOUSE_CAT, mask: INTERACTABLE_CAT },
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    const fit = () => {
      const ratio = (frame.clientWidth / WIDTH) * (window.devicePixelRatio || 1);
      if (!ratio || ratio === render.options.pixelRatio) return;
      Render.setPixelRatio(render, ratio);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      mouse.pixelRatio = ratio;
    };
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(frame);

    let stepMs = BASE_STEP;

    Events.on(engine, "afterUpdate", () => {
      clampTilt(arena.beam);
      const shoved = resolveContacts([...inWorld], arena.solids, plates);
      carry.place(inWorld, mouseConstraint.body, shoved, stepMs, explosion.airborne);

      const thrown = explosion.update(carry.carried(), inWorld);
      if (thrown) carry.release(thrown);

      carry.weigh();

      const balanced = balance.update(arena.beam, carry.stacks(), performance.now());
      if (balanced) onBalanced(balanced);
    });

    Events.on(render, "afterRender", () =>
      drawOverlay(render, arena, inWorld, ringRef.current, explosion.blast()),
    );

    let pointerInside = false;
    const onEnter = () => (pointerInside = true);
    const onLeave = () => (pointerInside = false);
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);

    const trackPointer = () => {
      const under = pointerInside ? weightAt(inWorld, mouse.position) : null;
      if (under === pointerRef.current) return;
      pointerRef.current = under;
      setHovered(under);
    };

    const recentFrames: number[] = [];
    let previousFrame = 0;
    let frameId = 0;

    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);

      const elapsed = previousFrame ? now - previousFrame : 0;
      previousFrame = now;
      if (elapsed <= 0 || elapsed > 250) return;

      recentFrames.push(elapsed);
      if (recentFrames.length > 30) recentFrames.shift();
      if (recentFrames.length >= 10) {
        const sorted = [...recentFrames].sort((a, b) => a - b);
        const hz = Math.round(1000 / sorted[sorted.length >> 1]);
        stepMs = 1000 / Math.min(Math.max(hz, 30), 240);
      }

      Engine.update(engine, stepMs);
      trackPointer();
      Render.world(render);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
      Events.off(engine, "afterUpdate");
      Events.off(render, "afterRender");
      Composite.clear(world, false);
      Engine.clear(engine);
      engineRef.current = null;
      inWorld.clear();
      pointerRef.current = null;
    };
  }, [setHovered, onBalanced]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const inWorld = inWorldRef.current;
    const live = new Set(weights);

    for (const body of inWorld) {
      if (live.has(body)) continue;
      Composite.remove(engine.world, body);
      inWorld.delete(body);
    }

    for (const body of weights) {
      if (inWorld.has(body)) continue;
      inWorld.add(body);
      Composite.add(engine.world, body);
    }
  }, [weights]);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden [container-type:size]">
      <div ref={frameRef} className="aspect-[3/2] w-[min(100%,150cqh)]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block h-full w-full touch-none"
        />
      </div>
    </div>
  );
}
