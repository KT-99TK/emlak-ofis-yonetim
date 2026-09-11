import React from "react";
import { ArrowUpRight, ClipboardCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RoleSuggestionCardProps = {
  isManager: boolean;
  onOpenPath?: (path: string) => void;
};

export function RoleSuggestionCard({ isManager, onOpenPath }: RoleSuggestionCardProps) {
  const suggestion = isManager
    ? {
        eyebrow: "Broker manager önerisi",
        title: "Önce müdahale bekleyen işleri kontrol edin",
        description: "Ekip onayları, açık tahsilatlar ve yeni danışman işlemleri günün ilk kontrol noktasıdır.",
        label: "Ekip özetine git",
        path: "/team",
        icon: UsersRound,
      }
    : {
        eyebrow: "Danışman önerisi",
        title: "Bugünkü planınızı kayıtlarla ilişkilendirin",
        description: "Açık görevinizi müşteri, portföy veya sözleşme kaydına bağlayarak sonraki takibi kaybetmeyin.",
        label: "Müşterilerime git",
        path: "/clients",
        icon: ClipboardCheck,
      };
  const Icon = suggestion.icon;

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-[#dce8e4] bg-[#173e39] text-white shadow-[0_12px_32px_rgba(23,62,57,.12)]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7b270]">
            <Icon className="h-3.5 w-3.5" /> {suggestion.eyebrow}
          </div>
          <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-white">{suggestion.title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#c5d8d2]">{suggestion.description}</p>
        </div>
        <Button type="button" onClick={() => onOpenPath?.(suggestion.path)} className="h-10 shrink-0 rounded-xl bg-[#d7b270] px-4 text-xs font-semibold text-[#29423c] hover:bg-[#e5c789]">
          {suggestion.label} <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
