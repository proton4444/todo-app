'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { MarketData, MCPStatus, OrderForm, Position, Trade } from './types';
import { isMarketDataFresh, loadTradingState, saveTradingState, tradingDefaults, type TradingPersistedStateV1 } from './storage';

export type TradingState = {
  mcpConnected: boolean;
  mcpStatus: MCPStatus | null;
  availableExchanges: any[];

  marketData: MarketData[];
  positions: Position[];
  trades: Trade[];
  orderForm: OrderForm;

  usingSSE: boolean;
  lastUpdateTime: number;
};

type TradingAction =
  | { type: 'set_mcp_connected'; value: boolean }
  | { type: 'set_mcp_status'; value: MCPStatus | null }
  | { type: 'set_available_exchanges'; value: any[] }
  | { type: 'set_market_data'; value: MarketData[]; updateTime?: boolean }
  | { type: 'set_positions'; value: Position[] }
  | { type: 'set_trades'; value: Trade[] }
  | { type: 'prepend_trade'; value: Trade }
  | { type: 'set_order_form'; value: Partial<OrderForm> }
  | { type: 'set_using_sse'; value: boolean }
  | { type: 'set_last_update_time'; value: number };

const initialFromStorage = (): Pick<TradingState, 'marketData' | 'positions' | 'trades' | 'orderForm'> => {
  const persisted = loadTradingState();

  const marketData = isMarketDataFresh(persisted.marketDataSavedAt) ? (persisted.marketData ?? []) : [];

  return {
    marketData,
    positions: persisted.positions ?? tradingDefaults.positions,
    trades: persisted.trades ?? tradingDefaults.trades,
    orderForm: persisted.orderForm ?? tradingDefaults.orderForm,
  };
};

const baseInitialState: TradingState = {
  mcpConnected: true,
  mcpStatus: null,
  availableExchanges: [],

  marketData: [],
  positions: [],
  trades: [],
  orderForm: tradingDefaults.orderForm,

  usingSSE: false,
  lastUpdateTime: Date.now(),
};

function tradingReducer(state: TradingState, action: TradingAction): TradingState {
  switch (action.type) {
    case 'set_mcp_connected':
      return { ...state, mcpConnected: action.value };
    case 'set_mcp_status':
      return { ...state, mcpStatus: action.value };
    case 'set_available_exchanges':
      return { ...state, availableExchanges: action.value };
    case 'set_market_data':
      return {
        ...state,
        marketData: action.value,
        lastUpdateTime: action.updateTime === false ? state.lastUpdateTime : Date.now(),
      };
    case 'set_positions':
      return { ...state, positions: action.value };
    case 'set_trades':
      return { ...state, trades: action.value };
    case 'prepend_trade':
      return { ...state, trades: [action.value, ...state.trades].slice(0, 200) };
    case 'set_order_form':
      return { ...state, orderForm: { ...state.orderForm, ...action.value } };
    case 'set_using_sse':
      return { ...state, usingSSE: action.value };
    case 'set_last_update_time':
      return { ...state, lastUpdateTime: action.value };
    default:
      return state;
  }
}

type TradingStore = {
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;

  // persistence helpers
  persistNow: (opts?: { includeMarketData?: boolean }) => void;
};

const TradingContext = createContext<TradingStore | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const persisted = useMemo(() => initialFromStorage(), []);

  const [state, dispatch] = useReducer(tradingReducer, {
    ...baseInitialState,
    ...persisted,
  });

  const lastPersistRef = useRef<number>(0);

  const persistNow = (opts?: { includeMarketData?: boolean }) => {
    const includeMarketData = opts?.includeMarketData ?? false;

    const payload: TradingPersistedStateV1 = {
      version: 1,
      savedAt: Date.now(),
      orderForm: state.orderForm,
      positions: state.positions,
      trades: state.trades,
      ...(includeMarketData
        ? {
            marketData: state.marketData,
            marketDataSavedAt: Date.now(),
          }
        : {}),
    };

    saveTradingState(payload);
    lastPersistRef.current = Date.now();
  };

  // Persist core state changes (throttled)
  useEffect(() => {
    const now = Date.now();
    const since = now - lastPersistRef.current;

    // If user is trading rapidly, avoid spamming localStorage.
    const shouldThrottle = since < 750;

    if (shouldThrottle) {
      const t = window.setTimeout(() => persistNow(), 800);
      return () => window.clearTimeout(t);
    }

    persistNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.orderForm, state.positions, state.trades]);

  // Persist market data occasionally as a cache (helps cold reload)
  useEffect(() => {
    // only persist if we have something meaningful
    if (!state.marketData.length) return;

    const t = window.setTimeout(() => persistNow({ includeMarketData: true }), 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.marketData]);

  const store = useMemo<TradingStore>(() => ({ state, dispatch, persistNow }), [state]);

  return <TradingContext.Provider value={store}>{children}</TradingContext.Provider>;
}

export function useTradingStore() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error('useTradingStore must be used within TradingProvider');

  const { state, dispatch, persistNow } = ctx;

  const actions = useMemo(
    () => ({
      setMcpConnected: (value: boolean) => dispatch({ type: 'set_mcp_connected', value }),
      setMcpStatus: (value: MCPStatus | null) => dispatch({ type: 'set_mcp_status', value }),
      setAvailableExchanges: (value: any[]) => dispatch({ type: 'set_available_exchanges', value }),
      setMarketData: (value: MarketData[]) => dispatch({ type: 'set_market_data', value }),
      setPositions: (value: Position[]) => dispatch({ type: 'set_positions', value }),
      setTrades: (value: Trade[]) => dispatch({ type: 'set_trades', value }),
      prependTrade: (value: Trade) => dispatch({ type: 'prepend_trade', value }),
      setOrderForm: (value: Partial<OrderForm>) => dispatch({ type: 'set_order_form', value }),
      setUsingSSE: (value: boolean) => dispatch({ type: 'set_using_sse', value }),
      setLastUpdateTime: (value: number) => dispatch({ type: 'set_last_update_time', value }),
      persistNow,
    }),
    [dispatch, persistNow]
  );

  return { state, actions };
}
