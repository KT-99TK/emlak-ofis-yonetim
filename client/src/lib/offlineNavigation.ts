import { BarChart3, FileSignature, GitMerge, HardDrive } from "lucide-react";

export const offlineNavigationItems = [
  { icon: HardDrive, label: "Yerel Çalışma Alanı", path: "#/offline" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "#/offline-authority" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "#/offline-rental" },
  { icon: BarChart3, label: "Danışman Performansı", path: "#/offline-performance" },
  { icon: GitMerge, label: "Yedekleri Birleştir", path: "#/offline-merge" },
];

export function normalizeOfflineHash(hash: string | undefined) {
  return hash === "#/offline-merge" || hash === "#/offline-authority" || hash === "#/offline-rental" || hash === "#/offline-performance" ? hash : "#/offline";
}
