"use client";

import Link from "next/link";

function beep(type: "click" | "data" = "click") {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type === "data" ? "square" : "sawtooth";
  osc.frequency.value = type === "data" ? 1180 : 220;
  gain.gain.setValueAtTime(type === "data" ? 0.035 : 0.025, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

const items = [
  { href: "/audit", label: "SCAN", icon: ">_" },
  { href: "/", label: "VAULT", icon: "$" },
  { href: "/dashboard", label: "FEED", icon: ">>" },
  { href: "/dashboard", label: "SYSTEM", icon: "[]" },
];

export function CyberNav() {
  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-[70] md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => beep(item.label === "SCAN" ? "data" : "click")}
              className="flex flex-col items-center gap-1 px-2 py-2 text-[10px] font-bold text-[#00FF41]"
            >
              <span className="text-sm leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
