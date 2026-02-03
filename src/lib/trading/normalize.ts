import type { Trade } from './types';

export type NormalizedTradesResult = {
  trades: Trade[];
  dropped: number;
  deduped: number;
};

function stableTradeId(t: Partial<Trade>, fallback: string) {
  // Prefer a provided id from MCP
  if (typeof t.id === 'string' && t.id.trim()) return t.id;

  // Otherwise build a deterministic-ish id
  const exchange = typeof t.exchange === 'string' ? t.exchange : 'Unknown';
  const symbol = typeof t.symbol === 'string' ? t.symbol : 'UNKNOWN/UNKNOWN';
  const side = t.side === 'buy' || t.side === 'sell' ? t.side : 'buy';
  const amount = typeof t.amount === 'number' ? t.amount : 0;
  const price = typeof t.price === 'number' ? t.price : 0;
  const ts = typeof t.timestamp === 'number' ? t.timestamp : 0;

  return `${exchange}:${symbol}:${side}:${amount}:${price}:${ts}:${fallback}`;
}

export function normalizeTrades(input: any, opts?: { limit?: number }): NormalizedTradesResult {
  const limit = opts?.limit ?? 200;

  if (!Array.isArray(input)) {
    return { trades: [], dropped: 0, deduped: 0 };
  }

  const out: Trade[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  let deduped = 0;

  for (let i = 0; i < input.length; i++) {
    const raw = input[i] as Partial<Trade>;

    const timestamp = typeof raw.timestamp === 'number' ? raw.timestamp : Date.now();
    const trade: Trade = {
      id: stableTradeId(raw, String(i)),
      exchange: typeof raw.exchange === 'string' ? raw.exchange : 'Unknown',
      symbol: typeof raw.symbol === 'string' ? raw.symbol : 'UNKNOWN/UNKNOWN',
      side: raw.side === 'buy' || raw.side === 'sell' ? raw.side : 'buy',
      amount: typeof raw.amount === 'number' ? raw.amount : 0,
      price: typeof raw.price === 'number' ? raw.price : 0,
      timestamp,
      status: raw.status === 'filled' || raw.status === 'pending' || raw.status === 'cancelled' ? raw.status : 'filled',
    };

    // Basic sanity checks
    if (!trade.symbol || !Number.isFinite(trade.amount) || trade.amount <= 0 || !Number.isFinite(trade.price) || trade.price <= 0) {
      dropped++;
      continue;
    }

    if (seen.has(trade.id)) {
      deduped++;
      continue;
    }

    seen.add(trade.id);
    out.push(trade);

    if (out.length >= limit) break;
  }

  // Sort newest first (defensive)
  out.sort((a, b) => b.timestamp - a.timestamp);

  return { trades: out, dropped, deduped };
}
