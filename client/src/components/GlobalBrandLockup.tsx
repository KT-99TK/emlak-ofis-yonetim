import React from "react";
import { cn } from "@/lib/utils";

type GlobalBrandLockupProps = { className?: string };

export default function GlobalBrandLockup({ className }: GlobalBrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#d8e1d9] bg-white/80 px-2.5 py-2 shadow-[0_8px_22px_rgba(23,62,57,.07)]", className)} aria-label="Global 1881 Gayrimenkul">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-double border-[#a6946e]/75 bg-[#fffdf6] text-[#806d46] shadow-[inset_0_0_0_3px_rgba(245,240,221,.9)]">
        <span className="text-[6px] font-bold leading-none tracking-[0.13em]">GLOBAL</span>
        <strong className="my-0.5 font-serif text-[18px] font-semibold leading-none tracking-[0.04em]">1881</strong>
        <span className="text-[4.5px] font-bold leading-none tracking-[0.08em]">GAYRİMENKUL</span>
      </div>
      <div className="min-w-0 leading-none">
        <p className="truncate font-serif text-[17px] font-semibold tracking-[0.07em] text-[#183d37]">GLOBAL 1881</p>
        <p className="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d6f3f]">Gayrimenkul</p>
        <p className="mt-1 truncate text-[9px] text-[#6f817a]">Ofis yönetim sistemi</p>
      </div>
    </div>
  );
}
