'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, TrendingUp, TrendingDown, Wallet, Activity, History, BarChart3, X, CheckCircle, AlertCircle } from 'lucide-react';

type MarketData = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
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
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
};

type OrderForm = {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  leverage: number;
};

export default function TradingDashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'BTC/USDT', price: 43500.00, change24h: 2.5, volume24h: 1.2e9 },
    { symbol: 'ETH/USDT', price: 2450.00, change24h: -1.2, volume24h: 8.5e8 },
    { symbol: 'SOL/USDT', price: 98.50, change24h: 4.3, volume24h: 3.2e8 },
  ]);

  const [positions, setPositions] = useState<Position[]>([
    { id: '1', symbol: 'BTC/USDT', side: 'long', size: 0.5, entryPrice: 42000, currentPrice: 43500, pnl: 750, pnlPercent: 3.57 },
    { id: '2', symbol: 'ETH/USDT', side: 'short', size: 5, entryPrice: 2500, currentPrice: 2450, pnl: 250, pnlPercent: 4.0 },
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', symbol: 'BTC/USDT', side: 'buy', amount: 0.5, price: 42000, timestamp: Date.now() - 3600000, status: 'filled' },
    { id: '2', symbol: 'ETH/USDT', side: 'sell', amount: 5, price: 2500, timestamp: Date.now() - 7200000, status: 'filled' },
  ]);

  const [orderForm, setOrderForm] = useState<OrderForm>({
    symbol: 'BTC/USDT',
    side: 'buy',
    amount: 0.1,
    leverage: 1,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, visible: boolean }>({ type: 'success', message: '', visible: false });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
  };

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(m => ({
        ...m,
        price: m.price * (1 + (Math.random() - 0.5) * 0.001),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickOrder = (symbol: string, side: 'buy' | 'sell') => {
    const price = marketData.find(m => m.symbol === symbol)?.price || 0;
    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol,
      side,
      amount: orderForm.amount,
      price,
      timestamp: Date.now(),
      status: 'filled',
    };

    setTrades(prev => [newTrade, ...prev]);

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

    showNotification('success', `Order placed: ${side.toUpperCase()} ${orderForm.amount} ${symbol}`);
  };

  const handleSubmitOrder = () => {
    const price = marketData.find(m => m.symbol === orderForm.symbol)?.price || 0;
    handleQuickOrder(orderForm.symbol, orderForm.side);
  };

  const handleClosePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const newTrade: Trade = {
        id: Date.now().toString(),
        symbol: position.symbol,
        side: position.side === 'long' ? 'sell' : 'buy',
        amount: position.size,
        price: position.currentPrice,
        timestamp: Date.now(),
        status: 'filled',
      };
      setTrades(prev => [newTrade, ...prev]);
      setPositions(prev => prev.filter(p => p.id !== positionId));
      showNotification('success', `Position closed: ${position.symbol}`);
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
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">MCP Connected</span>
                </div>
              </div>
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
                <span className="text-gray-400">24h Volume</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ${(marketData.reduce((sum, m) => sum + m.volume24h, 0) / 1e9).toFixed(2)}B
            </div>
            <div className="text-sm text-gray-400">
              Across {marketData.length} markets
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
                  Market Data
                </h2>
                <div className="text-sm text-gray-400">
                  Last update: Just now
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
                Order Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Symbol</label>
                  <select
                    value={orderForm.symbol}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'buy' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderForm(prev => ({ ...prev, side: 'sell' }))}
                      className={`py-3 rounded-lg font-medium transition-all ${orderForm.side === 'sell' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
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
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Leverage</label>
                  <input
                    type="number"
                    value={orderForm.leverage}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
                    min="1"
                    max="20"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${orderForm.side === 'buy' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'}`}
              >
                {orderForm.side.toUpperCase()} {orderForm.amount} {orderForm.symbol}
              </button>

              {/* Quick Order Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => handleQuickOrder('BTC/USDT', 'buy')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Buy BTC
                </button>
                <button
                  onClick={() => handleQuickOrder('ETH/USDT', 'sell')}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
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
                Recent Trades
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
                        <div className="text-gray-400">Amount</div>
                        <div className="text-white">{trade.amount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Price</div>
                        <div className="text-white">${trade.price.toLocaleString()}</div>
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
