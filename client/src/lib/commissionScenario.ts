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
const splitConsultantPool = (name: string, role: ScenarioParticipant["role"], baseShare: number): ScenarioParticipant => {
  const consultantPayout = round(baseShare * 0.6);
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
}): CommissionScenarioResult {
  if (!Number.isFinite(input.netCommission) || input.netCommission <= 0) throw new Error("Net komisyon sıfırdan büyük olmalıdır.");
  const total = round(input.netCommission);
  const participants: ScenarioParticipant[] = [];
  let portfolioOfficeShare = 0;
  let externalOfficeShare = 0;
  let globalPool = total;

  if (input.scenario === "consultantPortfolioTwoSided") {
    participants.push(splitConsultantPool(input.buyerName || "Alıcı danışmanı", "buyerConsultant", total / 2));
    participants.push(splitConsultantPool(input.sellerName || "Satıcı danışmanı", "sellerConsultant", total / 2));
  } else if (input.scenario === "officePortfolioTwoSided") {
    portfolioOfficeShare = round(total / 2);
    globalPool = round(total - portfolioOfficeShare);
    participants.push({ role: "portfolioOffice", name: input.portfolioOfficeName || "Portföy sahibi ofis", baseShare: portfolioOfficeShare, consultantPayout: 0, globalOfficeShare: portfolioOfficeShare });
    participants.push(splitConsultantPool(input.buyerName || "Alıcı danışmanı", "buyerConsultant", globalPool / 2));
    participants.push(splitConsultantPool(input.sellerName || "Satıcı danışmanı", "sellerConsultant", globalPool / 2));
  } else if (input.scenario === "externalOfficeSingleConsultant") {
    externalOfficeShare = round(total / 2);
    globalPool = round(total - externalOfficeShare);
    participants.push({ role: "externalOffice", name: input.externalOfficeName || "Karşı emlak ofisi", baseShare: externalOfficeShare, consultantPayout: 0, globalOfficeShare: 0 });
    participants.push(splitConsultantPool(input.consultantName || "Danışman", "consultant", globalPool));
  } else {
    participants.push(splitConsultantPool(input.consultantName || "Danışman", "consultant", total));
  }

  const consultantTotal = round(participants.reduce((sum, participant) => sum + participant.consultantPayout, 0));
  const globalOfficeTotal = round(participants.reduce((sum, participant) => sum + participant.globalOfficeShare, 0));
  return { netCommission: total, portfolioOfficeShare, externalOfficeShare, globalPool, consultantTotal, globalOfficeTotal, participants };
}

export const COMMISSION_SCENARIO_LABELS: Record<CommissionScenario, string> = {
  consultantPortfolioTwoSided: "Portföy danışmana ait · alıcı ve satıcı iki danışman",
  officePortfolioTwoSided: "Portföy Global/ofise ait · alıcı ve satıcı iki danışman",
  externalOfficeSingleConsultant: "Karşı ofis portföyü · Global dış ofis · tek danışman",
  singleConsultant: "Tek danışman · Global portföy",
};
