import { Archive, BarChart3, BellRing, ClipboardCheck, ClipboardList, FileLock2, FileSignature, GitMerge, HardDrive, Target, UserRound, WalletCards } from "lucide-react";

export const offlineNavigationItems = [
  { icon: HardDrive, label: "Yerel Çalışma Alanı", path: "#/offline", section: "office" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "#/offline-authority", section: "office" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "#/offline-rental", section: "office" },
  { icon: ClipboardCheck, label: "İşlem Kapanışları", path: "#/offline-transactions", section: "office" },
  { icon: WalletCards, label: "Kasa ve Banka", path: "#/offline-cash-bank", section: "office" },
  { icon: BarChart3, label: "Sözleşme ve Finansal İstatistikler", path: "#/offline-performance", section: "office" },
  { icon: Target, label: "Yıllık Ciro Hedefleri", path: "#/offline-targets", section: "office", managerOnly: true },
  { icon: BellRing, label: "Talep Eşleşmeleri", path: "#/offline-request-matches", section: "office", managerOnly: true },
  { icon: GitMerge, label: "Yedekleri Birleştir", path: "#/offline-merge", section: "office" },
  { icon: UserRound, label: "Benim Sözleşmelerim", path: "#/offline-my-contracts", section: "personal" },
  { icon: FileLock2, label: "Aktif İmzalı Belgeler", path: "#/offline-active-documents", section: "personal" },
  { icon: ClipboardList, label: "Müşteri Talepleri", path: "#/offline-requests", section: "personal" },
  { icon: Archive, label: "Müşteri Dijital Arşivi", path: "#/offline-archive", section: "personal" },
];

export function normalizeOfflineHash(hash: string | undefined) {
  return hash === "#/offline-merge" || hash === "#/offline-authority" || hash === "#/offline-rental" || hash === "#/offline-active-documents" || hash === "#/offline-archive" || hash === "#/offline-performance" || hash === "#/offline-my-contracts" || hash === "#/offline-targets" || hash === "#/offline-requests" || hash === "#/offline-request-matches" || hash === "#/offline-transactions" || hash === "#/offline-cash-bank" ? hash : "#/offline";
}
