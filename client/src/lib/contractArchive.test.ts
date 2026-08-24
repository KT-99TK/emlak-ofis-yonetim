import { describe, expect, it } from "vitest";
import { CONTRACT_ARCHIVE_SCHEMA, archiveCustomerNames, compareContractArchiveChronologically, createContractArchiveMetadata, parseContractArchiveMetadata } from "./contractArchive";

const source = {
  documentType: "rental" as const,
  customerName: "Ayşe Demir",
  documentDate: "21.08.2024",
  originalFileName: "CAHIT-YILMAZ__AYSE-DEMIR__KIRA__2024-08-21.pdf",
  sha256: "a".repeat(64),
  byteSize: 245_000,
  storageKey: "7729c0b0-987f-42aa-a68a-3a4d535b6807",
  historicalActivity: "2024 yaz dönemindeki eski kira işlemi",
  archiveNote: "Eski dönem belgesi",
};

describe("contract archive metadata", () => {
  it("creates immutable archive metadata with Turkish date presentation and checksum", () => {
    const metadata = createContractArchiveMetadata(source);
    expect(metadata).toMatchObject({ schema: CONTRACT_ARCHIVE_SCHEMA, readonly: true, customerName: "Ayşe Demir", historicalActivity: "2024 yaz dönemindeki eski kira işlemi", documentTypeLabel: "Kira sözleşmesi", documentDate: "2024-08-21", documentDateDisplay: "21.08.2024", sha256: source.sha256 });
    expect(parseContractArchiveMetadata({ entity: "contractArchive", details: JSON.stringify(metadata) })).toEqual(metadata);
  });

  it("rejects non-PDF input, invalid checksum and path traversal storage keys", () => {
    expect(() => createContractArchiveMetadata({ ...source, customerName: "" })).toThrow("müşteri adı");
    expect(() => createContractArchiveMetadata({ ...source, historicalActivity: "" })).toThrow("işlem özeti");
    expect(() => createContractArchiveMetadata({ ...source, originalFileName: "eski-sozlesme.exe" })).toThrow("PDF");
    expect(() => createContractArchiveMetadata({ ...source, sha256: "not-a-checksum" })).toThrow("bütünlük");
    expect(() => createContractArchiveMetadata({ ...source, storageKey: "../other-consultant" })).toThrow("depolama");
  });

  it("indexes a single historic rental PDF under its principal customer and its tenant without duplicate names", () => {
    const metadata = createContractArchiveMetadata({ ...source, customerName: "Necip Hakan Özcan", relatedCustomers: [{ name: "Tevfik Ateş Kut", role: "tenant" }, { name: "Necip Hakan Özcan", role: "propertyOwner" }] });
    expect(metadata.relatedCustomers).toEqual([{ name: "Tevfik Ateş Kut", role: "tenant" }]);
    expect(archiveCustomerNames(metadata)).toEqual(["Necip Hakan Özcan", "Tevfik Ateş Kut"]);
  });

  it("does not accept invalid archive snapshots as active contract data", () => {
    expect(parseContractArchiveMetadata({ entity: "contract", details: JSON.stringify(createContractArchiveMetadata(source)) })).toBeNull();
    expect(parseContractArchiveMetadata({ entity: "contractArchive", details: JSON.stringify({ ...source, schema: "active-contract" }) })).toBeNull();
  });

  it("orders each customer’s dated documents from oldest to newest and leaves unknown dates last", () => {
    const old = createContractArchiveMetadata({ ...source, documentDate: "10.01.2023", storageKey: "old-file", sha256: "b".repeat(64) });
    const recent = createContractArchiveMetadata({ ...source, documentDate: "05.02.2025", storageKey: "recent-file", sha256: "c".repeat(64) });
    const unknown = createContractArchiveMetadata({ ...source, documentDate: "", storageKey: "unknown-file", sha256: "d".repeat(64) });
    expect([unknown, recent, old].sort(compareContractArchiveChronologically).map((item) => item.storageKey)).toEqual(["old-file", "recent-file", "unknown-file"]);
  });
});
