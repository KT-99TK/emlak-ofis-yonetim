export type OfflineClientDetails = {
  address: string;
  phone: string;
  identity: string;
};

const SCHEMA = "global1881-offline-client-v1";

export function encodeOfflineClientDetails(input: OfflineClientDetails) {
  return JSON.stringify({ schema: SCHEMA, ...input });
}

export function decodeOfflineClientDetails(raw: string | undefined | null): OfflineClientDetails {
  const fallback = { address: raw ?? "", phone: "", identity: "" };
  if (!raw?.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<OfflineClientDetails> & { schema?: string };
    if (parsed.schema !== SCHEMA) return fallback;
    return {
      address: typeof parsed.address === "string" ? parsed.address : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      identity: typeof parsed.identity === "string" ? parsed.identity : "",
    };
  } catch {
    return fallback;
  }
}

export function offlineClientDisplayDetails(raw: string | undefined | null) {
  const details = decodeOfflineClientDetails(raw);
  return details.address || details.phone || details.identity || "Açıklama yok";
}
