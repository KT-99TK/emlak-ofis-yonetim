import React from "react";
import { cn } from "@/lib/utils";

type GlobalBrandLockupProps = {
  className?: string;
  variant?: "default" | "offline-sidebar";
};

export default function GlobalBrandLockup({ className, variant = "default" }: GlobalBrandLockupProps) {
  const isOfflineSidebar = variant === "offline-sidebar";
  return (
    <div className={cn(
      "flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2.5 py-2",
      isOfflineSidebar
        ? "gap-2.5 border border-white/15 bg-[#123f39] px-2.5 py-3 shadow-[0_12px_24px_rgba(16,62,56,.24)]"
        : "border border-[#d8e1d9] bg-white/80 shadow-[0_8px_22px_rgba(23,62,57,.07)]",
      className,
    )} aria-label="Global 1881 Gayrimenkul">
      <div className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-double text-[#806d46] shadow-[inset_0_0_0_3px_rgba(245,240,221,.9)]",
        isOfflineSidebar
          ? "h-[62px] w-[62px] border-white/90 bg-[#fffdf6] text-[#173e39] ring-1 ring-[#e6c47d]/70"
          : "h-14 w-14 border-[#a6946e]/75 bg-[#fffdf6]",

      )}>
        <span className={cn("font-bold leading-none tracking-[0.13em]", isOfflineSidebar ? "text-[6.5px]" : "text-[6px]")}>GLOBAL</span>
        <strong className={cn("my-0.5 font-serif font-semibold leading-none tracking-[0.04em]", isOfflineSidebar ? "text-[19px]" : "text-[18px]")}>1881</strong>
        <span className={cn("font-bold leading-none tracking-[0.08em]", isOfflineSidebar ? "text-[5px]" : "text-[4.5px]")}>GAYRİMENKUL</span>
      </div>
      <div className="min-w-0 leading-none">
        <p className={cn("truncate whitespace-nowrap font-serif font-semibold", isOfflineSidebar ? "text-[17px] tracking-[0.04em] text-[#fffdf6]" : "text-[17px] tracking-[0.07em] text-[#183d37]")}>GLOBAL 1881</p>
        <p className={cn("mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em]", isOfflineSidebar ? "text-[#e6c47d]" : "text-[#8d6f3f]")}>Gayrimenkul</p>
        <p className={cn("mt-1 truncate text-[9px]", isOfflineSidebar ? "text-[#c5ddd3]" : "text-[#6f817a]")}>Ofis yönetim sistemi</p>
      </div>
    </div>
  );
}
