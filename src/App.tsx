import { useEffect, useMemo, useRef, useState } from "react";
import Celebration from "./components/Celebration";
import Chat from "./components/Chat";
import Couatl from "./components/Couatl";
import Modal from "./components/Modal";
import Panel from "./components/Panel";
import Scale from "./components/Scale";
import type { Balance } from "./scale/balance";
import { createWeight } from "./scale/bodies";
import type { Item } from "./scale/catalog";
import { SPAWN_GAP } from "./scale/constants";
import { restoreUnlocked, saveUnlocked } from "./scale/storage";

export default function App() {
  const [unlocking, setUnlocking] = useState(false);
  const [weights, setWeights] = useState<Matter.Body[]>([]);
  const [queued, setQueued] = useState<Item[]>(restoreUnlocked);
  const [hovered, setHovered] = useState<Matter.Body | null>(null);
  const [celebration, setCelebration] = useState<Balance | null>(null);

  const [coutalUnlocked, setCoutalUnlocked] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const xicalUnlocked = localStorage.getItem("xicalUnlocked")
    if (xicalUnlocked) {
      setCoutalUnlocked(true);
    } 
  }, [])

  useEffect(() => {
    const next = queued[0];
    if (!next) return;

    const wait = Math.max(0, SPAWN_GAP - (performance.now() - lastSpawn.current));
    const timer = setTimeout(() => {
      lastSpawn.current = performance.now();
      setWeights((prev) => [...prev, createWeight(next)]);
      setQueued((prev) => prev.slice(1));
    }, wait);
    return () => clearTimeout(timer);
  }, [queued]);

  const unlocked = useMemo(
    () => [
      ...weights.map((body) => body.plugin.code as string),
      ...queued.map((item) => item.code),
    ],
    [weights, queued],
  );

  useEffect(() => {
    saveUnlocked(unlocked);
  }, [unlocked]);

  const removeWeight = (body: Matter.Body) => {
    setWeights((prev) => prev.filter((weight) => weight !== body));
    setHovered((current) => (current === body ? null : current));
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-parchment font-sans text-slate-900 md:block">
      {coutalUnlocked && <Couatl onClick={() => setChatPanelOpen(!chatPanelOpen)} />}
      {coutalUnlocked && chatPanelOpen && <Chat onClose={() => setChatPanelOpen(false)} />}

      <main className="relative min-h-0 flex-1 md:absolute md:inset-0">
        <Scale
          weights={weights}
          hovered={hovered}
          setHovered={setHovered}
          onBalanced={setCelebration}
        />
      </main>
      <Panel
        weights={weights}
        hovered={hovered}
        setHovered={setHovered}
        onRemove={removeWeight}
        onUnlock={() => setUnlocking(true)}
      />
      {celebration && <Celebration balance={celebration} onClose={() => setCelebration(null)} />}
      {unlocking && (
        <Modal
          unlocked={unlocked}
          onUnlock={(item) => setQueued((prev) => [...prev, item])}
          onClose={() => setUnlocking(false)}
          unlockXical={() => setCoutalUnlocked(true)}
        />
      )}
    </div>
  );
}
