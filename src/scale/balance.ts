import { BALANCE_HOLD, LEVEL_TILT } from "./constants";

export type BalanceItem = { name: string; collection: string; color: string };
export type Balance = { left: BalanceItem[]; right: BalanceItem[] };

type Stacks = { left: Matter.Body[]; right: Matter.Body[] };

const massOf = (stack: Matter.Body[]) =>
  stack.reduce((total, body) => total + (body.plugin.mass as number), 0);

const itemsOf = (stack: Matter.Body[]): BalanceItem[] =>
  stack.map((body) => ({
    name: body.plugin.name as string,
    collection: body.plugin.collection as string,
    color: body.render.fillStyle ?? "",
  }));

const isBalanced = (beam: Matter.Body, { left, right }: Stacks) => {
  if (left.length === 0 || right.length === 0) return false;
  if (massOf(left) !== massOf(right)) return false;
  const collection = left[0].plugin.collection;
  if ([...left, ...right].some((body) => body.plugin.collection !== collection)) return false;
  return Math.abs(beam.angle) <= LEVEL_TILT;
};

export const createBalanceWatch = () => {
  let since = 0;
  let announced = false;

  const update = (beam: Matter.Body, stacks: Stacks, now: number): Balance | null => {
    if (!isBalanced(beam, stacks)) {
      since = 0;
      announced = false;
      return null;
    }
    if (!since) since = now;
    if (announced || now - since < BALANCE_HOLD) return null;
    announced = true;
    return { left: itemsOf(stacks.left), right: itemsOf(stacks.right) };
  };

  return { update };
};
