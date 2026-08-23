import { describe, expect, it } from "vitest";
import { calculateVatCollectionScenario } from "./vatCollection";

describe("KDV tahsilat senaryosu", () => {
  it("KDV ayrıca tahsil edildiğinde hizmet bedeli kaybı oluşturmaz", () => {
    expect(calculateVatCollectionScenario(2_000, "separate")).toMatchObject({ expectedCustomerCollection: 2_400, separatelyUncollectedVat: 0, invoiceVatPayable: 400, netServiceIncome: 2_000, absorbedVatLoss: 0 });
  });

  it("tahsil edilen hizmet bedeli KDV dahil faturaya dönüştürülürse içerde taşınan KDV kaybını gösterir", () => {
    expect(calculateVatCollectionScenario(2_000, "included")).toMatchObject({ expectedCustomerCollection: 2_400, separatelyUncollectedVat: 400, invoiceVatPayable: 333.33, netServiceIncome: 1666.67, absorbedVatLoss: 333.33 });
  });
});
