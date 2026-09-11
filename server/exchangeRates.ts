const ECB_EUR_TRY_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.TRY.EUR.SP00.A?lastNObservations=1&format=csvdata";

export type EurTryReferenceRate = {
  baseCurrency: "EUR";
  quoteCurrency: "TRY";
  rate: number;
  rateDate: string;
  source: "ECB";
  sourceUrl: string;
  isReferenceRate: true;
};

let cachedRate: { fetchedAt: number; value: EurTryReferenceRate } | null = null;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

export async function getEurTryReferenceRate(): Promise<EurTryReferenceRate> {
  const now = Date.now();
  if (cachedRate && now - cachedRate.fetchedAt < 15 * 60 * 1000) {
    return cachedRate.value;
  }

  const response = await fetch(ECB_EUR_TRY_URL, {
    headers: { Accept: "text/csv" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`ECB kur servisi HTTP ${response.status} döndürdü.`);
  }
  const csv = await response.text();
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("ECB kur yanıtında veri bulunamadı.");

  const header = parseCsvLine(lines[0]);
  const row = parseCsvLine(lines[lines.length - 1]);
  const dateIndex = header.indexOf("TIME_PERIOD");
  const valueIndex = header.indexOf("OBS_VALUE");
  const rateDate = row[dateIndex];
  const rate = Number(row[valueIndex]);
  if (!rateDate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("ECB kur yanıtı geçersiz.");
  }

  const value: EurTryReferenceRate = {
    baseCurrency: "EUR",
    quoteCurrency: "TRY",
    rate,
    rateDate,
    source: "ECB",
    sourceUrl: ECB_EUR_TRY_URL,
    isReferenceRate: true,
  };
  cachedRate = { fetchedAt: now, value };
  return value;
}

export const __exchangeRateTestables = { parseCsvLine };
