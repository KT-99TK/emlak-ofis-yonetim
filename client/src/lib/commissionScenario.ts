export type CommissionScenario =
  | "consultantPortfolioTwoSided"
  | "officePortfolioTwoSided"
  | "externalOfficeSingleConsultant"
  | "singleConsultant";

export type ScenarioParticipant = {
  role: "portfolioOffice" | "buyerConsultant" | "sellerConsultant" | "consultant" | "externalOffice";
  name: string;
  baseShare: number;
  consultantPayout: number;
  globalOfficeShare: number;
};

export type CommissionScenarioResult = {
  netCommission: number;
  portfolioOfficeShare: number;
  externalOfficeShare: number;
  globalPool: number;
  consultantTotal: number;
  globalOfficeTotal: number;
  participants: ScenarioParticipant[];
};

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const splitConsultantPool = (name: string, role: ScenarioParticipant["role"], baseShare: number, consultantRate: number): ScenarioParticipant => {
  const consultantPayout = round(baseShare * consultantRate / 100);
  return { role, name, baseShare: round(baseShare), consultantPayout, globalOfficeShare: round(baseShare - consultantPayout) };
};

export function calculateCommissionScenario(input: {
  netCommission: number;
  scenario: CommissionScenario;
  buyerName?: string;
  sellerName?: string;
  consultantName?: string;
  portfolioOfficeName?: string;
  externalOfficeName?: string;
  consultantRate?: number;
  officeRate?: number;
  participantRates?: { buyer: number; seller: number; external: number };
}): CommissionScenarioResult {
  const consultantRate = input.consultantRate ?? 60;
  const officeRate = input.officeRate ?? 40;
  if (!Number.isFinite(input.netCommission) || input.netCommission <= 0) throw new Error("Net komisyon sıfırdan büyük olmalıdır.");
  if (!Number.isFinite(consultantRate) || !Number.isFinite(officeRate) || consultantRate < 0 || officeRate < 0 || round(consultantRate + officeRate) !== 100) throw new Error("Danışman ve Global ofis oranları toplamı %100 olmalıdır.");
  const total = round(input.netCommission);
  const participantRates = input.participantRates;
  if (participantRates) {
    const participantRateTotal = participantRates.buyer + participantRates.seller + participantRates.external;
    if (![participantRates.buyer, participantRates.seller, participantRates.external].every(Number.isFinite) || [participantRates.buyer, participantRates.seller, participantRates.external].some(rate => rate < 0) || round(participantRateTotal) !== 100) {
      throw new Error("Paydaş oranları toplamı %100 olmalıdır.");
    }
  }
  const participants: ScenarioParticipant[] = [];
  let portfolioOfficeShare = 0;
  let externalOfficeShare = 0;
  let globalPool = total;

  if (input.scenario === "consultantPortfolioTwoSided") {
    const buyerBase = participantRates ? round(total * participantRates.buyer / 100) : round(total / 2);
    const sellerBase = participantRates ? round(total * participantRates.seller / 100) : round(total / 2);
    participants.push(splitConsultantPool(input.buyerName || "Alıcı danışmanı", "buyerConsultant", buyerBase, consultantRate));
    participants.push(splitConsultantPool(input.sellerName || "Satıcı danışmanı", "sellerConsultant", sellerBase, consultantRate));
  } else if (input.scenario === "officePortfolioTwoSided") {
    portfolioOfficeShare = participantRates ? round(total * participantRates.external / 100) : round(total / 2);
    globalPool = round(total - portfolioOfficeShare);
    participants.push({ role: "portfolioOffice", name: input.portfolioOfficeName || "Portföy sahibi ofis", baseShare: portfolioOfficeShare, consultantPayout: 0, globalOfficeShare: portfolioOfficeShare });
    const buyerBase = participantRates ? round(total * participantRates.buyer / 100) : round(globalPool / 2);
    const sellerBase = participantRates ? round(total * participantRates.seller / 100) : round(globalPool / 2);
    participants.push(splitConsultantPool(input.buyerName || "Alıcı danışmanı", "buyerConsultant", buyerBase, consultantRate));
    participants.push(splitConsultantPool(input.sellerName || "Satıcı danışmanı", "sellerConsultant", sellerBase, consultantRate));
  } else if (input.scenario === "externalOfficeSingleConsultant") {
    externalOfficeShare = participantRates ? round(total * participantRates.external / 100) : round(total / 2);
    globalPool = round(total - externalOfficeShare);
    participants.push({ role: "externalOffice", name: input.externalOfficeName || "Karşı emlak ofisi", baseShare: externalOfficeShare, consultantPayout: 0, globalOfficeShare: 0 });
    const consultantBase = participantRates ? round(total * participantRates.buyer / 100) : globalPool;
    participants.push(splitConsultantPool(input.consultantName || "Danışman", "consultant", consultantBase, consultantRate));
  } else {
    participants.push(splitConsultantPool(input.consultantName || "Danışman", "consultant", total, consultantRate));
  }

  const consultantTotal = round(participants.reduce((sum, participant) => sum + participant.consultantPayout, 0));
  const globalOfficeTotal = round(participants.reduce((sum, participant) => sum + participant.globalOfficeShare, 0));
  return { netCommission: total, portfolioOfficeShare, externalOfficeShare, globalPool, consultantTotal, globalOfficeTotal, participants };
}

export type DepartingConsultantSplitResult = {
  netCommission: number;
  globalOfficeShare: number;
  consultantPool: number;
  originatingConsultantPayout: number;
  fulfillingConsultantPayout: number;
  corporateOfficePaysConsultant: boolean;
};

/**
 * Bireysel danışman portföyü danışman ayrıldıktan sonra kapanırsa,
 * Global 1881 ofis payı korunur ve yalnız danışman havuzu bölünür.
 * Kurumsal ofis seçeneğinde ofis, anlaşmaya göre danışmana ödeme yapmayabilir.
 */
export function calculateDepartingConsultantSplit(input: {
  netCommission: number;
  consultantRate?: number;
  officeRate?: number;
  consultantRightsSplitPercent?: number;
  corporateOffice?: boolean;
  corporateOfficePaysConsultant?: boolean;
}): DepartingConsultantSplitResult {
  const consultantRate = input.consultantRate ?? 60;
  const officeRate = input.officeRate ?? 40;
  const rightsSplit = input.consultantRightsSplitPercent ?? 50;
  const corporateOffice = input.corporateOffice ?? false;
  const corporateOfficePaysConsultant = input.corporateOfficePaysConsultant ?? true;
  if (!Number.isFinite(input.netCommission) || input.netCommission <= 0) throw new Error("Net komisyon sıfırdan büyük olmalıdır.");
  if (!Number.isFinite(consultantRate) || !Number.isFinite(officeRate) || round(consultantRate + officeRate) !== 100) throw new Error("Danışman ve Global ofis oranları toplamı %100 olmalıdır.");
  if (!Number.isFinite(rightsSplit) || rightsSplit < 0 || rightsSplit > 100) throw new Error("Eski danışman hak paylaşımı 0 ile 100 arasında olmalıdır.");
  const total = round(input.netCommission);
  if (corporateOffice && !corporateOfficePaysConsultant) {
    return { netCommission: total, globalOfficeShare: total, consultantPool: 0, originatingConsultantPayout: 0, fulfillingConsultantPayout: 0, corporateOfficePaysConsultant: false };
  }
  const globalOfficeShare = round(total * officeRate / 100);
  const consultantPool = round(total - globalOfficeShare);
  const originatingConsultantPayout = round(consultantPool * rightsSplit / 100);
  const fulfillingConsultantPayout = round(consultantPool - originatingConsultantPayout);
  return { netCommission: total, globalOfficeShare, consultantPool, originatingConsultantPayout, fulfillingConsultantPayout, corporateOfficePaysConsultant: true };
}

export const COMMISSION_SCENARIO_LABELS: Record<CommissionScenario, string> = {
  consultantPortfolioTwoSided: "Portföy danışmana ait · alıcı ve satıcı iki danışman",
  officePortfolioTwoSided: "Portföy Global/ofise ait · alıcı ve satıcı iki danışman",
  externalOfficeSingleConsultant: "Karşı ofis portföyü · Global dış ofis · tek danışman",
  singleConsultant: "Tek danışman · Global portföy",
};
