import React from "react";
import { OfficeFlowPanel, type OfficeFlowContract, type OfficeFlowLedgerEntry, type OfficeFlowObligation } from "@/components/OfficeFlowPanel";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import { listOfflineRecords, type OfflineRecord } from "@/lib/offlineStore";

type OfflineOfficeFlowPanelProps = {
  records?: OfflineRecord[];
  userId: string;
  managerActive?: boolean;
  className?: string;
};

function goTo(hash: string) {
  if (typeof window !== "undefined") window.location.hash = hash;
}

/**
 * Geçiş yılındaki offline ekranların ortak sağ bilgi alanıdır. Danışman yalnız
 * kendi `userId` kapsamındaki yerel kayıtları görür; yalnız açık yerel manager
 * oturumu ofis geneli, isim içermeyen istisna özetini açar.
 */
export default function OfflineOfficeFlowPanel({ records, userId, managerActive, className }: OfflineOfficeFlowPanelProps) {
  const [loadedRecords, setLoadedRecords] = React.useState<OfflineRecord[]>([]);
  React.useEffect(() => {
    if (records) return;
    void listOfflineRecords().then(setLoadedRecords).catch(() => setLoadedRecords([]));
  }, [records]);

  const localManagerActive = managerActive ?? (typeof window !== "undefined" && isLocalManagerSessionActive());
  const sourceRecords = records ?? loadedRecords;
  const scopedRecords = localManagerActive ? sourceRecords : sourceRecords.filter((record) => record.userId === userId);

  const obligations: OfficeFlowObligation[] = scopedRecords
    .filter((record) => record.entity === "obligation" || record.entity === "evacuation")
    .filter((record) => Boolean(record.dueDate || record.noticeDate))
    .map((record) => ({
      id: record.id,
      title: record.title,
      dueDate: record.dueDate ?? record.noticeDate ?? record.updatedAt,
      status: record.status,
      amount: record.amount,
    }));

  const contracts: OfficeFlowContract[] = scopedRecords
    .filter((record) => record.entity === "contract" || record.entity === "transaction")
    .map((record) => ({ id: record.id, status: record.status }));

  const ledgerEntries: OfficeFlowLedgerEntry[] = scopedRecords
    .filter((record) => record.entity === "ledger")
    .map((record) => ({ id: record.id, entryType: record.ledgerType ?? "income", status: record.status }));

  return (
    <aside className={className} aria-label={localManagerActive ? "Ofis geneli istisna özeti" : "Kişisel Ofis Akışı"}>
      <OfficeFlowPanel
        role={localManagerActive ? "admin" : "user"}
        obligations={obligations}
        contracts={contracts}
        ledgerEntries={ledgerEntries}
        onOpenObligations={() => goTo("#/offline")}
        onOpenContracts={() => goTo("#/offline-my-contracts")}
        onOpenAccounting={() => goTo("#/offline-transactions")}
      />
    </aside>
  );
}
