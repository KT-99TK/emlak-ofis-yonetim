const TCMB_DAILY_RATES_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";

export type TcmbCurrencyRate = {
  buying: number;
  selling: number;
};

export type DailyExchangeRates = {
  rateDate: string;
  source: "TCMB";
  sourceUrl: string;
  isReferenceRate: true;
  rates: {
    USD: TcmbCurrencyRate;
    EUR: TcmbCurrencyRate;
  };
};

let cachedRates: { fetchedAt: number; value: DailyExchangeRates } | null = null;

function parseCurrency(xml: string, currencyCode: "USD" | "EUR") {
  const currencyPattern = new RegExp(
    String.raw`<Currency\b[^>]*CurrencyCode=["']${currencyCode}["'][^>]*>[\s\S]*?</Currency>`,
    "i"
  );
  const block = xml.match(currencyPattern)?.[0];
  if (!block) throw new Error(`TCMB yanıtında ${currencyCode} kuru bulunamadı.`);
  const read = (tag: string) => block.match(new RegExp(`<${tag}>([^<]+)</${tag}>`, "i"))?.[1]?.trim() ?? "";
  const buying = Number(read("ForexBuying").replace(",", "."));
  const selling = Number(read("ForexSelling").replace(",", "."));
  if (!Number.isFinite(buying) || buying <= 0 || !Number.isFinite(selling) || selling <= 0) {
    throw new Error(`TCMB ${currencyCode} kuru geçersiz.`);
  }
  return { buying, selling } satisfies TcmbCurrencyRate;
}

function parseRateDate(xml: string) {
  const date = xml.match(/<Tarih_Date\b[^>]*Tarih=["'](\d{2})[.](\d{2})[.](\d{4})["']/i);
  if (!date) throw new Error("TCMB kur yanıtında tarih bulunamadı.");
  return `${date[3]}-${date[2]}-${date[1]}`;
}

export async function getDailyExchangeRates(): Promise<DailyExchangeRates> {
  const now = Date.now();
  if (cachedRates && now - cachedRates.fetchedAt < 15 * 60 * 1000) return cachedRates.value;

  const response = await fetch(TCMB_DAILY_RATES_URL, {
    headers: { Accept: "application/xml, text/xml" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`TCMB kur servisi HTTP ${response.status} döndürdü.`);
  const xml = await response.text();
  const value: DailyExchangeRates = {
    rateDate: parseRateDate(xml),
    source: "TCMB",
    sourceUrl: TCMB_DAILY_RATES_URL,
    isReferenceRate: true,
    rates: {
      USD: parseCurrency(xml, "USD"),
      EUR: parseCurrency(xml, "EUR"),
    },
  };
  cachedRates = { fetchedAt: now, value };
  return value;
}

export const __exchangeRateTestables = { parseCurrency, parseRateDate };

/** Backward-compatible helper for callers that only need the EUR buying rate. */
export async function getEurTryReferenceRate() {
  const daily = await getDailyExchangeRates();
  return {
    baseCurrency: "EUR" as const,
    quoteCurrency: "TRY" as const,
    rate: daily.rates.EUR.buying,
    rateDate: daily.rateDate,
    source: daily.source,
    sourceUrl: daily.sourceUrl,
    isReferenceRate: true as const,
  };
}
