import type { MarketData, OrderForm, Position, Trade } from './types';

const STORAGE_KEY = 'clawd.trading.state.v1';

export type TradingPersistedStateV1 = {
  version: 1;
  savedAt: number;
  orderForm: OrderForm;
  positions: Position[];
  trades: Trade[];
  // Optional cache — safe to drop if stale
  marketData?: MarketData[];
  marketDataSavedAt?: number;
};

const defaultOrderForm: OrderForm = {
  exchange: 'Binance',
  symbol: 'BTC/USDT',
  side: 'buy',
  amount: 0.1,
  leverage: 1,
};

export const tradingDefaults = {
  orderForm: defaultOrderForm,
  positions: [] as Position[],
  trades: [] as Trade[],
};

export function loadTradingState(): TradingPersistedStateV1 {
  if (typeof window === 'undefined') {
    return {
      version: 1,
      savedAt: Date.now(),
      orderForm: defaultOrderForm,
      positions: [],
      trades: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: 1,
        savedAt: Date.now(),
        orderForm: defaultOrderForm,
        positions: [],
        trades: [],
      };
    }

    const parsed = JSON.parse(raw) as Partial<TradingPersistedStateV1>;

    return {
      version: 1,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      orderForm: parsed.orderForm ?? defaultOrderForm,
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      marketData: Array.isArray(parsed.marketData) ? parsed.marketData : undefined,
      marketDataSavedAt: typeof parsed.marketDataSavedAt === 'number' ? parsed.marketDataSavedAt : undefined,
    };
  } catch {
    return {
      version: 1,
      savedAt: Date.now(),
      orderForm: defaultOrderForm,
      positions: [],
      trades: [],
    };
  }
}

export function saveTradingState(state: TradingPersistedStateV1) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota/blocked storage
  }
}

export function isMarketDataFresh(savedAt?: number, maxAgeMs = 5 * 60 * 1000) {
  if (!savedAt) return false;
  return Date.now() - savedAt < maxAgeMs;
}
