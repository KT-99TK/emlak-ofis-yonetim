export type RentalExpenseMethod = "lump_sum" | "actual";

export function estimateRentalIncomeTax2026(input: {
  annualGrossRent: number;
  ownershipSharePercent: number;
  residentialExemptionEligible: boolean;
  expenseMethod: RentalExpenseMethod;
  actualExpenseTotal: number;
}) {
  const share = Math.max(1, Math.min(100, input.ownershipSharePercent)) / 100;
  const ownershipAdjustedIncome = input.annualGrossRent * share;
  
  const residentialExemption = input.residentialExemptionEligible ? Math.min(58000, ownershipAdjustedIncome) : 0;
  const incomeAfterExemption = ownershipAdjustedIncome - residentialExemption;
  
  let deductibleExpense = 0;
  if (input.expenseMethod === "lump_sum") {
    deductibleExpense = incomeAfterExemption * 0.15;
  } else {
    const actualExpenseShare = input.actualExpenseTotal * share;
    deductibleExpense = ownershipAdjustedIncome > 0 ? actualExpenseShare * (incomeAfterExemption / ownershipAdjustedIncome) : 0;
  }
  
  const taxableBase = Math.max(0, incomeAfterExemption - deductibleExpense);
  
  let estimatedTax = 0;
  if (taxableBase <= 190000) {
    estimatedTax = taxableBase * 0.15;
  } else if (taxableBase <= 400000) {
    estimatedTax = 28500 + (taxableBase - 190000) * 0.20;
  } else if (taxableBase <= 1000000) {
    estimatedTax = 70500 + (taxableBase - 400000) * 0.27;
  } else if (taxableBase <= 5300000) {
    estimatedTax = 232500 + (taxableBase - 1000000) * 0.35;
  } else {
    estimatedTax = 1737500 + (taxableBase - 5300000) * 0.40;
  }
  
  return {
    ownershipAdjustedIncome,
    residentialExemption,
    deductibleExpense,
    taxableBase,
    estimatedTax,
    grossRentalIncome: input.annualGrossRent,
  };
}
