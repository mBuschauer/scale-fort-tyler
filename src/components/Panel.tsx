import type { Dispatch, SetStateAction } from "react";
import CloseIcon from "./CloseButton";

type PanelProps = {
  weights: Matter.Body[];
  hovered: Matter.Body | null;
  setHovered: Dispatch<SetStateAction<Matter.Body | null>>;
  onRemove: (body: Matter.Body) => void;
  onUnlock: () => void;
};

export default function Panel({ weights, hovered, setHovered, onRemove, onUnlock }: PanelProps) {
  return (
    <aside className="z-10 flex max-h-[38dvh] shrink-0 flex-col border-t border-slate-200 bg-white/90 backdrop-blur-sm md:fixed md:top-6 md:left-6 md:max-h-[calc(100dvh-3rem)] md:w-72 md:rounded-2xl md:border md:shadow-xl md:shadow-slate-900/10">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          On the scale
        </h2>
        <button
          type="button"
          onClick={onUnlock}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Unlock
        </button>
      </header>

      {weights.length === 0 ? (
        <p className="p-4 text-xs leading-relaxed text-slate-500">
          Nothing on the scale. Enter a code to unlock an item.
        </p>
      ) : (
        <ul className="flex flex-col overflow-y-auto p-2" onMouseLeave={() => setHovered(null)}>
          {weights.map((body) => {
            const active = hovered === body;
            return (
              <li
                key={body.id}
                onMouseEnter={() => setHovered(body)}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${active ? "bg-slate-900/5" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setHovered(active ? null : body)}
                  onFocus={() => setHovered(body)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none"
                >
                  <span
                    style={{ backgroundColor: body.render.fillStyle }}
                    className={`size-4 shrink-0 rounded-sm transition-transform ${active ? "scale-125" : ""}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-slate-900">
                      {body.plugin.name}
                    </span>
                    <span className="block truncate text-[10px] text-slate-500">
                      {body.plugin.collection}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(body)}
                  onFocus={() => setHovered(body)}
                  aria-label={`Remove ${body.plugin.name}`}
                  title="Remove and relock its code"
                  className="flex size-6 shrink-0 items-center justify-center rounded text-slate-400 transition-opacity hover:bg-slate-900/10 hover:text-slate-900 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
                >
                  <CloseIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
