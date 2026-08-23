import React from "react";
import { CheckCircle2 } from "lucide-react";
import { buildManifestPreview, type ManifestPreviewInput } from "@/lib/manifestPresentation";
import { formatTurkishDateTime } from "@/lib/turkishDate";

type ManifestPreviewRowProps = {
  manifest: ManifestPreviewInput & { latestSyncAt?: string | null };
  testId?: string;
};

export default function ManifestPreviewRow({ manifest, testId = "manifest-preview-row" }: ManifestPreviewRowProps) {
  const preview = buildManifestPreview(manifest);
  return (
    <div data-testid={testId} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#edf0ec] py-2 text-xs text-[#70807c]">
      <CheckCircle2 className="h-4 w-4 text-[#2b786e]" />
      <strong className="text-[#34433f]">{preview.file}</strong>
      <span>{preview.recordCount} kayıt</span>
      <span>{preview.deviceId}</span>
      <span>kullanıcı: {preview.userId}</span>
      <span>{preview.exportedAt !== "tarih yok" ? formatTurkishDateTime(preview.exportedAt) : preview.exportedAt}</span>
      <span>en yüksek sürüm: {preview.maxRecordVersion}</span>
      <span>son aktarım: {manifest.latestSyncAt ? formatTurkishDateTime(manifest.latestSyncAt) : "henüz yok"}</span>
      <span data-testid="manifest-checksum">checksum: {preview.checksumLabel}</span>
      <span data-testid="manifest-signature">ECDSA: {preview.signatureLabel}</span>
    </div>
  );
}
