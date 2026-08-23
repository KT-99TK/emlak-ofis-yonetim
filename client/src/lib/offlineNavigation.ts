import { FileSignature, GitMerge, HardDrive } from "lucide-react";

export const offlineNavigationItems = [
  { icon: HardDrive, label: "Yerel Çalışma Alanı", path: "#/offline" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "#/offline-authority" },
  { icon: GitMerge, label: "Yedekleri Birleştir", path: "#/offline-merge" },
];

export function normalizeOfflineHash(hash: string | undefined) {
  return hash === "#/offline-merge" || hash === "#/offline-authority" ? hash : "#/offline";
}
