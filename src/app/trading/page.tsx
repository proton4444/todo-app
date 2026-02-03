'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, TrendingUp, TrendingDown, Wallet, Activity, History, BarChart3, CheckCircle, AlertCircle, Database, Wifi, WifiOff, Settings, Plug, Unplug, X } from 'lucide-react';

type MarketData = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
};

type Position = {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
};

type Trade = {
  id: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
};

type OrderForm = {
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  leverage: number;
};

type MCPStatus = {
  connected: boolean;
  exchanges: number;
  tools: number;
  uptime: number;
  lastError?: any;
  connectionRetryCount?: number;
  activeSubscriptions?: number;
};

export default function TradingDashboard() {
  const [mcpConnected, setMcpConnected] = useState(true);
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null);
  const [availableExchanges, setAvailableExchanges] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    exchange: 'Binance',
    symbol: 'BTC/USDT',
    side: 'buy',
    amount: 0.1,
    leverage: 1,
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, visible: boolean }>({ type: 'success', message: '', visible: false });
  const [usingSSE, setUsingSSE] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const eventSourceRef = useRef<EventSource | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
  };

  // Load MCP status on mount
  useEffect(() => {
    loadMCPStatus();
    loadExchanges();
    loadTrades();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Setup SSE connection when MCP is connected
  useEffect(() => {
    if (mcpConnected && !usingSSE) {
      connectSSE();
    } else if (!mcpConnected && eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setUsingSSE(false);
    }
  }, [mcpConnected, usingSSE]);

  const connectSSE = () => {
    try {
      const eventSource = new EventSource('/api/mcp?action=stream');
      eventSourceRef.current = eventSource;
      setUsingSSE(true);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            console.log('SSE Connected:', data);
            setMarketData(Object.values(data.tickers));
            showNotification('success', 'Real-time data stream connected');
          } else if (data.type === 'ticker_update') {
            setMarketData(Object.values(data.tickers));
            setLastUpdateTime(Date.now());
          } else if (data.type === 'error') {
            console.error('SSE Error:', data.error);
            showNotification('error', `Stream error: ${data.error.message}`);
          }
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        showNotification('error', 'Real-time stream connection lost');
        eventSource.close();
        setUsingSSE(false);
      };

      showNotification('success', 'Connecting to real-time data stream...');
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      showNotification('error', 'Failed to connect to real-time stream');
      setUsingSSE(false);
    }
  };

  const loadMCPStatus = async () => {
    try {
      const response = await fetch('/api/mcp?action=status');
      const data = await response.json();
      if (data.connected) {
        setMcpStatus(data);
        setMcpConnected(true);
      } else {
        setMcpConnected(false);
      }
    } catch (error) {
      console.error('Failed to load MCP status:', error);
      setMcpConnected(false);
    }
  };

  const loadExchanges = async () => {
    try {
      const response = await fetch('/api/mcp?action=exchanges');
      const data = await response.json();
      setAvailableExchanges(data.exchanges || []);
    } catch (error) {
      console.error('Failed to load exchanges:', error);
    }
  };

  const loadTrades = async () => {
    try {
      const response = await fetch('/api/mcp?action=orders');
      const data = await response.json();
      if (data.orders) {
        setTrades(data.orders);
      }
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const handleQuickOrder = async (symbol: string, side: 'buy' | 'sell') => {
    const price = marketData.find(m => m.symbol === symbol)?.price || 0;

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'place_order',
          params: {
            exchange: orderForm.exchange,
            symbol,
            side,
            amount: orderForm.amount,
            price
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setTrades(prev => [data.order, ...prev]);

        // Update or create position
        setPositions(prev => {
          const existing = prev.find(p => p.symbol === symbol);
          if (existing) {
            return prev.map(p =>
              p.symbol === symbol
                ? { ...p, currentPrice: price, pnl: p.pnl + (side === 'buy' ? (price - p.entryPrice) * p.size : (p.entryPrice - price) * p.size) }
                : p
            );
          } else {
            return [
              ...prev,
              {
                id: Date.now().toString(),
                symbol,
                side: side === 'buy' ? 'long' : 'short',
                size: orderForm.amount,
                entryPrice: price,
                currentPrice: price,
                pnl: 0,
                pnlPercent: 0,
              }
            ];
          }
        });

        showNotification('success', `Order placed via MCP: ${side.toUpperCase()} ${orderForm.amount} ${symbol}`);
      } else {
        showNotification('error', data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      showNotification('error', 'Order execution failed');
    }
  };

  const handleSubmitOrder = () => {
    handleQuickOrder(orderForm.symbol, orderForm.side);
  };

  const handleClosePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      setPositions(prev => prev.filter(p => p.id !== positionId));
      showNotification('success', `Position closed: ${position.symbol}`);
    }
  };

  const handleToggleMCP = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_connection',
          params: { connected: !mcpConnected }
        })
      });

      const data = await response.json();
      setMcpConnected(data.connected);
      showNotification('success', data.message);
    } catch (error) {
      console.error('Failed to toggle MCP:', error);
      showNotification('error', 'Failed to toggle MCP connection');
    }
  };

  const totalEquity = 100000;
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const openPositions = positions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
              <p className="text-gray-400">Real-time trading with MCP integration</p>
            </div>
            <div className="flex items-center gap-4">
              {/* MCP Connection Toggle */}
              <button
                onClick={handleToggleMCP}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  mcpConnected
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {mcpConnected ? <Plug className="w-4 h-4" /> : <Unplug className="w-4 h-4" />}
                <span className="font-medium">{mcpConnected ? 'MCP Connected' : 'MCP Disconnected'}</span>
              </button>

              {/* MCP Status Details */}
              {mcpConnected && mcpStatus && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Database className="w-4 h-4" />
                      <span>{mcpStatus.exchanges} exchanges</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span>{mcpStatus.tools} tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Wifi className={`w-4 h-4 ${usingSSE ? 'text-green-400' : 'text-yellow-400'}`} />
                      <span>{usingSSE ? 'SSE Live' : 'Polling'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{Math.floor(mcpStatus.uptime / 60)}m uptime</span>
                    </div>
                  </div>
                </div>
              )}

              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all" onClick={loadMCPStatus}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-500" />
                <span className="text-gray-400">Total Equity</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ${totalEquity.toLocaleString()}
            </div>
            <div className={`text-sm ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} PnL
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400">Open Positions</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {openPositions}
            </div>
            <div className="text-sm text-gray-400">
              Active trades
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-500" />
                <span className="text-gray-400">Data Stream</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">
              {mcpConnected ? (
                <span className={usingSSE ? 'text-green-400' : 'text-yellow-400'}>
                  {usingSSE ? 'Live SSE' : 'Polling'}
                </span>
              ) : (
                <span className="text-red-400">Offline</span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {usingSSE ? 'Real-time updates (1s)' : 'Every 3 seconds'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Market Data & Order Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Data */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Market Data (via MCP)
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {usingSSE && <Wifi className="w-4 h-4 text-green-400" />}
                  <span>{mcpConnected ? (usingSSE ? 'Live SSE' : 'Polling') : 'Offline'}</span>
                  <span className="text-xs">
                    ({Math.floor((Date.now() - lastUpdateTime) / 1000)}s ago)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {marketData.map((market) => (
                  <div key={market.symbol} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{market.symbol.split('/')[0].substring(0, 2)}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{market.symbol}</div>
                        <div className="text-sm text-gray-400">
                          Vol: ${(market.volume24h / 1e6).toFixed(2)}M
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${market.price.toLocaleString()}</div>
                      <div className={`text-sm ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Entry Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Order Entry (via MCP)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Exchange</label>
                  <select
                    value={orderForm.exchange}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, exchange: e.target.value }))}
                    disabled={!mcpConnected}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {availableExchanges.map((ex: any) => (
                      <option key={ex.name} value={ex.name}>
                        {ex.name} {ex.status === 'connected' ? '✅' : '❌'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Symbol</label>
                  <select
                    value={orderForm.symbol}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, symbol: e.target.value }))}
                    disabled={!mcpConnected}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {marketData.map(m => (
                      <option key={m.symbol} value={m.symbol}>{m.symbol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Side</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderForm(prev => ({ ...prev, side: 'buy' }))}
                      disabled={!mcpConnected}
                      className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'buy' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'} disabled:opacity-50`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderForm(prev => ({ ...prev, side: 'sell' }))}
                      disabled={!mcpConnected}
                      className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'sell' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'} disabled:opacity-50`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={orderForm.amount}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    step="0.01"
                    disabled={!mcpConnected}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={!mcpConnected}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${!mcpConnected ? 'bg-gray-600 cursor-not-allowed' : orderForm.side === 'buy' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'}`}
              >
                {mcpConnected ? `${orderForm.side.toUpperCase()} ${orderForm.amount} ${orderForm.symbol}` : 'MCP Disconnected'}
              </button>

              {/* Quick Order Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => handleQuickOrder('BTC/USDT', 'buy')}
                  disabled={!mcpConnected}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-4 h-4" />
                  Buy BTC
                </button>
                <button
                  onClick={() => handleQuickOrder('ETH/USDT', 'sell')}
                  disabled={!mcpConnected}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingDown className="w-4 h-4" />
                  Sell ETH
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Positions & Trades */}
          <div className="space-y-6">
            {/* Positions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-500" />
                Positions
              </h2>

              <div className="space-y-4">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No open positions
                  </div>
                ) : (
                  positions.map((position) => (
                    <div key={position.id} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{position.symbol}</span>
                          <span className={`text-xs px-2 py-1 rounded ${position.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {position.side.toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleClosePosition(position.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-400">Size</div>
                          <div className="text-white">{position.size}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Entry</div>
                          <div className="text-white">${position.entryPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Current</div>
                          <div className="text-white">${position.currentPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">PnL</div>
                          <div className={`font-semibold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-pink-500" />
                Recent Trades (MCP)
              </h2>

              <div className="space-y-3">
                {trades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                        <span className="text-white font-medium">{trade.symbol}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${trade.status === 'filled' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {trade.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-gray-400">Exchange</div>
                        <div className="text-white">{trade.exchange}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Amount</div>
                        <div className="text-white">{trade.amount}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.visible && (
          <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-2xl ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center gap-3`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}
