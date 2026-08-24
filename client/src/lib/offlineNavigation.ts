import { Archive, BarChart3, BellRing, ClipboardCheck, ClipboardList, FileLock2, FileSignature, GitMerge, HardDrive, Target, UserRound, WalletCards } from "lucide-react";

export const offlineNavigationItems = [
  { icon: HardDrive, label: "Yerel Çalışma Alanı", path: "#/offline" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "#/offline-authority" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "#/offline-rental" },
  { icon: FileLock2, label: "Aktif İmzalı Belgeler", path: "#/offline-active-documents" },
  { icon: Archive, label: "Müşteri Dijital Arşivi", path: "#/offline-archive" },
  { icon: BarChart3, label: "Sözleşme ve Finansal İstatistikler", path: "#/offline-performance" },
  { icon: UserRound, label: "Benim Sözleşmelerim", path: "#/offline-my-contracts" },
  { icon: ClipboardList, label: "Müşteri Talepleri", path: "#/offline-requests" },
  { icon: ClipboardCheck, label: "İşlem Kapanışları", path: "#/offline-transactions" },
  { icon: WalletCards, label: "Kasa ve Banka", path: "#/offline-cash-bank" },
  { icon: Target, label: "Yıllık Ciro Hedefleri", path: "#/offline-targets", managerOnly: true },
  { icon: BellRing, label: "Talep Eşleşmeleri", path: "#/offline-request-matches", managerOnly: true },
  { icon: GitMerge, label: "Yedekleri Birleştir", path: "#/offline-merge" },
];

export function normalizeOfflineHash(hash: string | undefined) {
  return hash === "#/offline-merge" || hash === "#/offline-authority" || hash === "#/offline-rental" || hash === "#/offline-active-documents" || hash === "#/offline-archive" || hash === "#/offline-performance" || hash === "#/offline-my-contracts" || hash === "#/offline-targets" || hash === "#/offline-requests" || hash === "#/offline-request-matches" || hash === "#/offline-transactions" || hash === "#/offline-cash-bank" ? hash : "#/offline";
}
