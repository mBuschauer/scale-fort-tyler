import { useEffect, useRef } from "react";
import type { Balance, BalanceItem } from "../scale/balance";
import CloseIcon from "./CloseIcon";

type CelebrationProps = {
  balance: Balance;
  onClose: () => void;
};

const Pan = ({ label, items }: { label: string; items: BalanceItem[] }) => (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <h3 className="border-b border-slate-200 px-4 py-2.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
      {label}
    </h3>
    <ul className="flex flex-col p-2">
      {items.map((item) => (
        <li
          key={item.name}
          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-900/5"
        >
          <span
            style={{ backgroundColor: item.color }}
            className="size-4 shrink-0 rounded-sm transition-transform group-hover:scale-125"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-slate-900">{item.name}</span>
            <span className="block truncate text-[10px] text-slate-500">{item.collection}</span>
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export default function Celebration({ balance, onClose }: CelebrationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      aria-labelledby="celebration-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/25 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" aria-hidden="true">
              🎉
            </span>
            <div>
              <h2 id="celebration-title" className="text-lg font-semibold tracking-tight">
                Balanced!
              </h2>
              <p className="text-sm text-slate-500">Both pans weigh exactly the same.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Pan label="Left pan" items={balance.left} />
          <Pan label="Right pan" items={balance.right} />
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Continue
        </button>
      </div>
    </dialog>
  );
}
