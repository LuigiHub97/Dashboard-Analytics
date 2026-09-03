import { useState } from "react";

function playPaidSound() {
  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;

    [880, 1320].forEach((freq, i) => {
      const start = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Web Audio unavailable in this browser; the animation still plays without sound.
  }
}

interface PayButtonProps {
  paid: boolean;
  onToggle: () => Promise<void>;
}

export function PayButton({ paid, onToggle }: PayButtonProps) {
  const [popping, setPopping] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    const willBePaid = !paid;
    setBusy(true);
    try {
      await onToggle();
      if (willBePaid) {
        playPaidSound();
        setPopping(true);
        setTimeout(() => setPopping(false), 700);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="pay-btn-wrap">
      {popping && <span className="cifra-pop">R$</span>}
      <button
        type="button"
        className={"pay-btn " + (paid ? "pay-btn-paid" : "pay-btn-pending")}
        onClick={handleClick}
        disabled={busy}
      >
        {paid ? "✓ Pago" : "Pagar"}
      </button>
    </span>
  );
}
