import { describe, expect, it } from "vitest";
import { decodeOfflineClientDetails, encodeOfflineClientDetails, offlineClientDisplayDetails } from "./offlineClientDetails";

describe("offline client details", () => {
  it("round-trips address, phone and identity for contract recall", () => {
    const encoded = encodeOfflineClientDetails({ address: "Urla / İzmir", phone: "+90 532 000 00 00", identity: "12345678901" });
    expect(decodeOfflineClientDetails(encoded)).toEqual({ address: "Urla / İzmir", phone: "+90 532 000 00 00", identity: "12345678901" });
    expect(offlineClientDisplayDetails(encoded)).toBe("Urla / İzmir");
  });

  it("keeps legacy plain-text client details readable", () => {
    expect(decodeOfflineClientDetails("İstanbul adresi")).toEqual({ address: "İstanbul adresi", phone: "", identity: "" });
    expect(offlineClientDisplayDetails("İstanbul adresi")).toBe("İstanbul adresi");
  });
});
