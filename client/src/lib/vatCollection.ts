export type VatCollectionMode = "separate" | "included";

export type VatCollectionScenario = {
  serviceFeeExcludingVat: number;
  expectedCustomerCollection: number;
  separatelyUncollectedVat: number;
  invoiceVatPayable: number;
  netServiceIncome: number;
  absorbedVatLoss: number;
};

/**
 * Yönetim göstergesi: hizmet bedeli KDV hariç kabul edilir. KDV ayrıca tahsil
 * edilmez ve aynı tutar KDV dâhil faturaya çevrilirse net gelir ile içerde
 * taşınan KDV farkını gösterir. Bu hesap vergi beyannamesi yerine geçmez.
 */
export function calculateVatCollectionScenario(serviceFeeExcludingVat: number, collectionMode: VatCollectionMode, vatRate = 0.2): VatCollectionScenario {
  const fee = Math.max(0, Math.round(serviceFeeExcludingVat));
  const expectedCustomerCollection = Math.round(fee * (1 + vatRate) * 100) / 100;
  if (collectionMode === "separate") {
    return { serviceFeeExcludingVat: fee, expectedCustomerCollection, separatelyUncollectedVat: 0, invoiceVatPayable: Math.round(fee * vatRate * 100) / 100, netServiceIncome: fee, absorbedVatLoss: 0 };
  }
  const netServiceIncome = Math.round((fee / (1 + vatRate)) * 100) / 100;
  const invoiceVatPayable = Math.round((fee - netServiceIncome) * 100) / 100;
  return { serviceFeeExcludingVat: fee, expectedCustomerCollection, separatelyUncollectedVat: Math.round(fee * vatRate * 100) / 100, invoiceVatPayable, netServiceIncome, absorbedVatLoss: invoiceVatPayable };
}
