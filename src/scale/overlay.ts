import { halfOf, type Arena } from "./bodies";
import type { Blast } from "./explosion";
import { BLAST_CORE, BLAST_EDGE, BLAST_FLASH, BLAST_RADIUS, INK, PIVOT } from "./constants";

const SPARKS = 14;

const drawBlast = (ctx: CanvasRenderingContext2D, blast: Blast) => {
  const age = (performance.now() - blast.startedAt) / BLAST_FLASH;
  if (age < 0 || age > 1) return;
  ctx.save();

  const radius = BLAST_RADIUS * (1 - (1 - age) ** 3);
  const fade = 1 - age;
  const { x, y } = blast;

  const glow = ctx.createRadialGradient(x, y, 0, x, y, Math.max(radius, 1));
  glow.addColorStop(0, BLAST_CORE);
  glow.addColorStop(0.45, BLAST_EDGE);
  glow.addColorStop(1, "rgba(231, 111, 81, 0)");
  ctx.globalAlpha = fade * 0.6;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = fade;
  ctx.strokeStyle = BLAST_EDGE;
  ctx.lineWidth = 1 + 7 * fade;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = BLAST_CORE;
  ctx.lineWidth = 2 + 2 * fade;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < SPARKS; i++) {
    const angle = blast.seed + (i / SPARKS) * Math.PI * 2;
    const length = 10 + 26 * fade;
    ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    ctx.lineTo(x + Math.cos(angle) * (radius + length), y + Math.sin(angle) * (radius + length));
  }
  ctx.stroke();

  ctx.restore();
};

export const drawOverlay = (
  render: Matter.Render,
  { beam, left, right }: Arena,
  weights: Set<Matter.Body>,
  hovered: Matter.Body | null,
  blast: Blast | null,
) => {
  const ctx = render.context;
  ctx.save();

  if (blast) drawBlast(ctx, blast);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x, PIVOT.y);
  ctx.lineTo(beam.position.x, beam.position.y);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(PIVOT.x, PIVOT.y, 6, 0, Math.PI * 2);
  ctx.fill();

  if (hovered && weights.has(hovered)) {
    const half = halfOf(hovered);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(
      hovered.position.x - half.w - 3,
      hovered.position.y - half.h - 3,
      half.w * 2 + 6,
      half.h * 2 + 6,
      4,
    );
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = INK;
  ctx.fillText("L", left.position.x, left.position.y + 18);
  ctx.fillText("R", right.position.x, right.position.y + 18);

  ctx.restore();
};
