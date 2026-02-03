export type MarketData = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
};

export type Position = {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
};

export type Trade = {
  id: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
};

export type OrderForm = {
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  leverage: number;
};

export type MCPStatus = {
  connected: boolean;
  exchanges: number;
  tools: number;
  uptime: number;
  lastError?: any;
  connectionRetryCount?: number;
  activeSubscriptions?: number;
};
