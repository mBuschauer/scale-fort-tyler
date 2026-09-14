export default function Couatl({ onClick }: { onClick: () => void; label?: string; }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Xical"
            className="group fixed top-4 right-4 z-20 flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-[translate,scale,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:border-fuchsia-300 hover:shadow-xl hover:shadow-fuchsia-500/25 focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment focus-visible:outline-none active:translate-y-0 active:scale-95 md:top-6 md:right-6 md:size-20"
        >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--color-teal-200)_0%,var(--color-fuchsia-200)_45%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
            <img
                src={`${import.meta.env.BASE_URL}couatl.png`}
                draggable={false}
                className="relative size-full object-contain p-1.5 transition-transform duration-500 ease-out select-none group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none"
            />
        </button>
    );
}
