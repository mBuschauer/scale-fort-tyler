import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { lookup, type Item } from "../scale/catalog";
import CloseIcon from "./CloseButton";

type ModalProps = {
  unlocked: string[];
  onUnlock: (item: Item) => void;
  onClose: () => void;
  unlockXical: () => void;
};

export default function Modal({ unlocked, onUnlock, onClose, unlockXical }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const isXical = typed.trim().toUpperCase() === "XICAL";
  const match = lookup(typed);
  const unknown = typed.trim() !== "" && !match && !isXical;
  const taken = !!match && unlocked.includes(match.code);

  const close = () => dialogRef.current?.close();

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    if (isXical) {
      localStorage.setItem("xicalUnlocked", JSON.stringify(true));
      unlockXical();
      close();
      return;
    }
    if (!match || taken) return;
    onUnlock(match);
    close();
  };

  const hint = unknown
    ? "Not a valid code."
    : taken
      ? "Already unlocked. It is on the scale."
      : match
        ? `${match.name} · ${match.collection}`
        : "Enter a code to unlock an item.";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      aria-labelledby="unlock-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/25 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 id="unlock-title" className="text-lg font-semibold tracking-tight">
            Unlock item
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Code
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="••"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={unknown}
              aria-describedby="unlock-hint"
              className={`w-full rounded-xl border bg-white px-3 py-2 text-sm tracking-widest text-slate-900 uppercase shadow-sm transition-colors placeholder:tracking-normal placeholder:text-slate-400 focus:ring-2 focus:outline-none ${
                unknown
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-900/10"
              }`}
            />
            <span
              id="unlock-hint"
              className={`text-xs font-normal ${unknown ? "text-red-500" : "text-slate-500"}`}
            >
              {hint}
            </span>
          </label>

          {match && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span
                style={{
                  backgroundColor: match.color,
                  width: match.size / 2,
                  height: match.size / 2,
                }}
                className={`shrink-0 rounded-sm shadow-sm ${taken ? "opacity-40" : ""}`}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-900">
                  {match.name}
                </span>
                <span className="block truncate text-xs text-slate-500">{match.collection}</span>
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isXical && (!match || taken)}
            className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {taken ? "Already unlocked" : "Unlock"}
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          {unlocked.length} item{unlocked.length === 1 ? "" : "s"} unlocked
        </p>
      </div>
    </dialog>
  );
}
