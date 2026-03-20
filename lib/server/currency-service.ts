import "server-only";

import { ToolServiceError } from "@/lib/server/tool-services";

type CurrencyProviderName =
  | "Frankfurter"
  | "ExchangeRate-API"
  | "Open Exchange Rates"
  | "Internal same-currency";

type ProviderQuote = {
  provider: CurrencyProviderName;
  base: string;
  target: string;
  rate: number;
  effectiveDate: string;
  isLive: boolean;
  sourceNote: string;
};

export type CurrencyConversionResult = {
  success: true;
  provider: CurrencyProviderName;
  base: string;
  target: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  effectiveDate: string;
  isLive: boolean;
  sourceNote: string;
  requestedDate?: string;
  rateStatus: "live" | "daily-updated" | "historical";
};

type CurrencyQueryInput = {
  base: string;
  target: string;
  amount: number;
  date?: string;
};

type CacheEntry = {
  expiresAt: number;
  value: ProviderQuote;
};

type ProviderDefinition = {
  name: CurrencyProviderName;
  supportsHistorical: boolean;
  fetchQuote: (input: { base: string; target: string; date?: string }) => Promise<ProviderQuote>;
};

const latestRateCache = new Map<string, CacheEntry>();

const LATEST_TTL_MS = 15 * 60 * 1000;
const HISTORICAL_TTL_MS = 24 * 60 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 12 * 1000;
const CURRENT_DATE_ISO = () => new Date().toISOString().slice(0, 10);

const fallbackCurrencyCodes = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "EUR",
  "GBP",
  "GHS",
  "HKD",
  "INR",
  "JPY",
  "KES",
  "MXN",
  "NGN",
  "NOK",
  "NZD",
  "SEK",
  "SGD",
  "USD",
  "XAF",
  "XOF",
  "ZAR",
] as const;

function validateCurrencyCode(value: string, label: string) {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ToolServiceError(`Choose a valid 3-letter ${label} currency code.`);
  }
  return normalized;
}

function validateAmount(value: number) {
  if (!Number.isFinite(value)) {
    throw new ToolServiceError("Enter a valid amount to convert.");
  }
  if (value < 0) {
    throw new ToolServiceError("Enter an amount greater than or equal to 0.");
  }
  return value;
}

function validateHistoricalDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new ToolServiceError("Enter a valid historical date in YYYY-MM-DD format.");
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ToolServiceError("Enter a valid historical date.");
  }
  if (trimmed > CURRENT_DATE_ISO()) {
    throw new ToolServiceError("Historical lookup dates cannot be in the future.");
  }

  return trimmed;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(6));
}

function buildCacheKey(provider: CurrencyProviderName, base: string, target: string, date?: string) {
  return [provider, base, target, date || "latest"].join(":");
}

async function fetchJsonWithTimeout<T>(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ToolServiceError("The exchange-rate provider is temporarily unavailable.", {
        status: response.status === 429 ? 503 : 502,
        code: "UPSTREAM_UNAVAILABLE",
      });
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ToolServiceError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ToolServiceError("The exchange-rate provider took too long to respond.", {
        status: 504,
        code: "UPSTREAM_TIMEOUT",
      });
    }
    throw new ToolServiceError("The exchange-rate provider could not be reached right now.", {
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getCachedQuote(provider: ProviderDefinition, input: { base: string; target: string; date?: string }) {
  const key = buildCacheKey(provider.name, input.base, input.target, input.date);
  const now = Date.now();
  const cached = latestRateCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await provider.fetchQuote(input);
  const ttl = input.date ? HISTORICAL_TTL_MS : LATEST_TTL_MS;

  // Latest quotes are cached for a short time to avoid hammering the provider.
  // Historical quotes are effectively immutable, so they can be cached much longer.
  latestRateCache.set(key, {
    value,
    expiresAt: now + ttl,
  });

  return value;
}

async function fetchFrankfurterQuote(input: { base: string; target: string; date?: string }): Promise<ProviderQuote> {
  const endpoint = input.date ? `https://api.frankfurter.app/${input.date}` : "https://api.frankfurter.app/latest";
  const url = `${endpoint}?from=${encodeURIComponent(input.base)}&to=${encodeURIComponent(input.target)}`;
  const data = await fetchJsonWithTimeout<{
    amount?: number;
    base?: string;
    date?: string;
    rates?: Record<string, number>;
  }>(url);

  const rate = data.rates?.[input.target];
  if (typeof rate !== "number") {
    throw new ToolServiceError("That currency pair is not available from the current exchange-rate provider.");
  }

  return {
    provider: "Frankfurter",
    base: input.base,
    target: input.target,
    rate,
    effectiveDate: data.date || input.date || CURRENT_DATE_ISO(),
    isLive: false,
    sourceNote: input.date
      ? `Historical rate for ${input.date}. Frankfurter returns working-day reference rates by date.`
      : "Daily-updated reference rate. Frankfurter returns the latest working-day date and typically refreshes around 16:00 CET.",
  };
}

async function fetchExchangeRateApiQuote(input: { base: string; target: string; date?: string }): Promise<ProviderQuote> {
  if (input.date) {
    throw new ToolServiceError("Historical lookups are not enabled for the current ExchangeRate-API adapter.", {
      status: 400,
      code: "UNSUPPORTED_DATE",
    });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim();
  if (!apiKey) {
    throw new ToolServiceError("ExchangeRate-API is not configured.", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const data = await fetchJsonWithTimeout<{
    result?: string;
    base_code?: string;
    time_last_update_unix?: number;
    conversion_rates?: Record<string, number>;
  }>(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${encodeURIComponent(input.base)}`);

  const rate = data.conversion_rates?.[input.target];
  if (data.result === "error" || typeof rate !== "number") {
    throw new ToolServiceError("That currency pair is not available from ExchangeRate-API.");
  }

  return {
    provider: "ExchangeRate-API",
    base: input.base,
    target: input.target,
    rate,
    effectiveDate: data.time_last_update_unix
      ? new Date(data.time_last_update_unix * 1000).toISOString()
      : CURRENT_DATE_ISO(),
    isLive: true,
    sourceNote: "Provider-backed latest rate. The returned timestamp comes from ExchangeRate-API.",
  };
}

async function fetchOpenExchangeRatesQuote(input: { base: string; target: string; date?: string }): Promise<ProviderQuote> {
  const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID?.trim();
  if (!appId) {
    throw new ToolServiceError("Open Exchange Rates is not configured.", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  }

  const endpoint = input.date
    ? `https://openexchangerates.org/api/historical/${input.date}.json`
    : "https://openexchangerates.org/api/latest.json";
  const symbols = Array.from(new Set(["USD", input.base, input.target])).join(",");
  const data = await fetchJsonWithTimeout<{
    timestamp?: number;
    base?: string;
    rates?: Record<string, number>;
  }>(`${endpoint}?app_id=${encodeURIComponent(appId)}&symbols=${encodeURIComponent(symbols)}`);

  const usdToBase = input.base === "USD" ? 1 : data.rates?.[input.base];
  const usdToTarget = input.target === "USD" ? 1 : data.rates?.[input.target];
  if (typeof usdToBase !== "number" || typeof usdToTarget !== "number" || usdToBase <= 0) {
    throw new ToolServiceError("That currency pair is not available from Open Exchange Rates.");
  }

  return {
    provider: "Open Exchange Rates",
    base: input.base,
    target: input.target,
    rate: usdToTarget / usdToBase,
    effectiveDate: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : input.date || CURRENT_DATE_ISO(),
    isLive: !input.date,
    sourceNote: input.date
      ? `Historical rate for ${input.date} from Open Exchange Rates.`
      : "Provider-backed latest rate. The returned timestamp comes from Open Exchange Rates.",
  };
}

function shouldTryNextProvider(error: unknown) {
  return error instanceof ToolServiceError && error.status >= 500;
}

function getProviderCandidates(date?: string): ProviderDefinition[] {
  const providers: ProviderDefinition[] = [];

  if (process.env.OPEN_EXCHANGE_RATES_APP_ID?.trim()) {
    providers.push({
      name: "Open Exchange Rates",
      supportsHistorical: true,
      fetchQuote: fetchOpenExchangeRatesQuote,
    });
  }

  if (process.env.EXCHANGE_RATE_API_KEY?.trim()) {
    providers.push({
      name: "ExchangeRate-API",
      supportsHistorical: false,
      fetchQuote: fetchExchangeRateApiQuote,
    });
  }

  providers.push({
    name: "Frankfurter",
    supportsHistorical: true,
    fetchQuote: fetchFrankfurterQuote,
  });

  return providers.filter((provider) => !date || provider.supportsHistorical);
}

export function getCurrencyCodeOptions() {
  return [...fallbackCurrencyCodes];
}

export async function getCurrencyConversion(input: CurrencyQueryInput): Promise<CurrencyConversionResult> {
  const base = validateCurrencyCode(input.base, "base");
  const target = validateCurrencyCode(input.target, "target");
  const amount = validateAmount(input.amount);
  const date = validateHistoricalDate(input.date);

  if (base === target) {
    return {
      success: true,
      provider: "Internal same-currency",
      base,
      target,
      amount,
      convertedAmount: roundCurrency(amount),
      rate: 1,
      effectiveDate: date || new Date().toISOString(),
      isLive: !date,
      sourceNote: date
        ? `Historical rate for ${date}. Same-currency conversion does not require an external provider.`
        : "Same-currency conversion does not require an external provider.",
      requestedDate: date,
      rateStatus: date ? "historical" : "live",
    };
  }

  const providers = getProviderCandidates(date);
  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const quote = await getCachedQuote(provider, { base, target, date });
      return {
        success: true,
        provider: quote.provider,
        base,
        target,
        amount,
        convertedAmount: roundCurrency(amount * quote.rate),
        rate: roundCurrency(quote.rate),
        effectiveDate: quote.effectiveDate,
        isLive: quote.isLive,
        sourceNote: quote.sourceNote,
        requestedDate: date,
        rateStatus: date ? "historical" : quote.isLive ? "live" : "daily-updated",
      };
    } catch (error) {
      lastError = error;
      if (!shouldTryNextProvider(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ToolServiceError("Unable to fetch exchange rates right now. Please try again shortly.", {
        status: 502,
        code: "UPSTREAM_UNAVAILABLE",
      });
}
