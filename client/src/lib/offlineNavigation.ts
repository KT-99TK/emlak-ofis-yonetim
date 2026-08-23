import { BarChart3, FileSignature, GitMerge, HardDrive, Target, UserRound } from "lucide-react";

export const offlineNavigationItems = [
  { icon: HardDrive, label: "Yerel Çalışma Alanı", path: "#/offline" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "#/offline-authority" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "#/offline-rental" },
  { icon: BarChart3, label: "Sözleşme ve Finansal İstatistikler", path: "#/offline-performance" },
  { icon: UserRound, label: "Benim Sözleşmelerim", path: "#/offline-my-contracts" },
  { icon: Target, label: "Yıllık Ciro Hedefleri", path: "#/offline-targets", managerOnly: true },
  { icon: GitMerge, label: "Yedekleri Birleştir", path: "#/offline-merge" },
];

export function normalizeOfflineHash(hash: string | undefined) {
  return hash === "#/offline-merge" || hash === "#/offline-authority" || hash === "#/offline-rental" || hash === "#/offline-performance" || hash === "#/offline-my-contracts" || hash === "#/offline-targets" ? hash : "#/offline";
}
