import { describe, expect, it } from "vitest";
import { isUrlaNeighborhood, titleCaseTurkish, URLA_NEIGHBORHOODS, URLA_NEIGHBORHOODS_VERSION } from "./urlaNeighborhoods";

describe("Urla yerleşim verisi", () => {
  it("resmî kaynakla eşlenen 37 mahalleyi ve Diğer serbest giriş ayrımını korur", () => {
    expect(URLA_NEIGHBORHOODS).toHaveLength(37);
    expect(URLA_NEIGHBORHOODS).toContain("Bademler");
    expect(URLA_NEIGHBORHOODS).toContain("Zeytinler");
    expect(isUrlaNeighborhood("İçmeler")).toBe(true);
    expect(isUrlaNeighborhood("İzmir Konak")).toBe(false);
    expect(titleCaseTurkish("atatürk mahallesi")).toBe("Atatürk Mahallesi");
    expect(titleCaseTurkish("içmeler")).toBe("İçmeler");
    expect(URLA_NEIGHBORHOODS_VERSION).toMatch(/^urla-mahalleleri-/);
  });
});
