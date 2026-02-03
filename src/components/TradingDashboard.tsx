'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Clock, BarChart3, Zap, Settings, FolderOpen,
  MoreVertical, ArrowUpRight, RefreshCw, Shield, Database, Server, Key,
  Plus, X, CheckCircle, Circle, Edit, Trash, Download, DollarSign } from 'lucide-react';

// Define column titles
const COLUMN_TITLES: Record<'backlog' | 'inprogress' | 'done'> = {
  backlog: 'Backlog',
  inprogress: 'In Progress',
  done: 'Done'
};

type MarketData = {
  symbol: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap: number;
};

type Position = {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  leverage: number;
};

type Trade = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partially_filled';
  pnl: number;
  fee: number;
  timestamp: number;
};

type OrderFormData = {
  symbol: 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT';
  side: 'buy' | 'sell';
  amount: number;
  leverage: number;
};

export default function TradingDashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: 'BTC/USDT',
      currentPrice: 95000,
      change24h: 2.45,
      high24h: 98000,
      low24h: 92000,
      volume: 24.5,
      marketCap: 1870000000000
    },
    {
      symbol: 'ETH/USDT',
      currentPrice: 3300,
      change24h: -1.23,
      high24h: 3450,
      low24h: 3150,
      volume: 12.3,
      marketCap: 4000000000000
    },
    {
      symbol: 'SOL/USDT',
      currentPrice: 150,
      change24h: 5.67,
      high24h: 160,
      low24h: 140,
      volume: 8.7,
      marketCap: 65000000000
    }
  ]);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState({
    equity: 100000,
    totalPnl: 0,
    realizedPnl: 0,
    openPositions: 0,
    marginUsed: 0,
    marginAvailable: 100000
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info',
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData => prevData.map(market => ({
        ...market,
        currentPrice: market.currentPrice + (Math.random() - 0.5) * market.currentPrice * 0.001,
        change24h: market.change24h + (Math.random() - 0.5) * 2,
        high24h: market.currentPrice + (Math.random() - 0.5) * market.currentPrice * 0.01,
        low24h: market.currentPrice + (Math.random() - 0.5) * market.currentPrice * 0.01,
        volume: market.volume + (Math.random() - 0.1) * 5
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const showNotificationMessage = (type: 'success' | 'error' | 'info', message: string, duration: number = 3000) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), duration);
  };

  const placeOrder = (orderData: OrderFormData) => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: orderData.symbol,
      side: orderData.side,
      amount: orderData.amount,
      price: marketData.find(m => m.symbol === orderData.symbol)?.currentPrice || 0,
      status: 'pending',
      pnl: 0,
      fee: orderData.amount * 0.001,
      timestamp: Date.now()
    };

    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: orderData.symbol,
      side: orderData.side === 'buy' ? 'long' : 'short',
      size: orderData.amount,
      entryPrice: marketData.find(m => m.symbol === orderData.symbol)?.currentPrice || 0,
      currentPrice: marketData.find(m => m.symbol === orderData.symbol)?.currentPrice || 0,
      unrealizedPnl: 0,
      leverage: orderData.leverage
    };

    setTrades([newTrade, ...trades]);
    setPositions([newPosition, ...positions]);
    
    // Update portfolio
    const newMarginUsed = positions.reduce((sum, pos) => sum + pos.entryPrice * pos.size * pos.leverage, 0);
    const newTotalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    setPortfolio(prev => ({
      ...prev,
      equity: 100000 + newTotalPnl,
      totalPnl: newTotalPnl,
      realizedPnl: prev.realizedPnl,
      openPositions: positions.length,
      marginUsed: newMarginUsed,
      marginAvailable: 100000 - newMarginUsed
    }));

    showNotificationMessage('success', `Order placed: ${orderData.side.toUpperCase()} ${orderData.amount} ${orderData.symbol}`);
  };

  const closePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const market = marketData.find(m => m.symbol === position.symbol);
    const currentPrice = market?.currentPrice || 0;
    const pnl = position.side === 'long' 
      ? (currentPrice - position.entryPrice) * position.size
      : (position.entryPrice - currentPrice) * position.size;
      
    const closingTrade: Trade = {
      id: Date.now().toString(),
      symbol: position.symbol,
      side: position.side === 'long' ? 'sell' : 'buy',
      amount: position.size,
      price: currentPrice,
      status: 'filled',
      pnl: pnl,
      fee: position.size * 0.001,
      timestamp: Date.now()
    };
      
    setTrades(prev => [...prev, closingTrade]);
    setPositions(prev => prev.filter(p => p.id !== positionId));
    setPortfolio(prev => {
      ...prev,
      equity: prev.equity + pnl,
      totalPnl: prev.totalPnl + pnl,
      openPositions: prev.openPositions - 1,
      marginUsed: prev.marginUsed - position.entryPrice * position.size,
      marginAvailable: prev.marginAvailable + position.entryPrice * position.size
    });
    
    showNotificationMessage('success', `Position closed: ${position.symbol} (${position.side})`);
  };

  const quickBuyBTC = () => {
    const market = marketData.find(m => m.symbol === 'BTC/USDT');
    const price = market?.currentPrice || 0;
    setOrderFormData({
      symbol: 'BTC/USDT',
      side: 'buy',
      amount: 0.01,
      leverage: 1
    });
  };

  const quickSellBTC = () => {
    const market = marketData.find(m => m.symbol === 'BTC/USDT');
    const price = market?.currentPrice || 0;
    setOrderFormData({
      symbol: 'BTC/USDT',
      side: 'sell',
      amount: 0.01,
      leverage: 1
    });
  };

  const quickBuyETH = () => {
    const market = marketData.find(m => m.symbol === 'ETH/USDT');
    const price = market?.currentPrice || 0;
    setOrderFormData({
      symbol: 'ETH/USDT',
      side: 'buy',
      amount: 0.1,
      leverage: 1
    });
  };

  const quickSellETH = () => {
    const market = marketData.find(m => m.symbol === 'ETH/USDT');
    const price = market?.currentPrice || 0;
    setOrderFormData({
      symbol: 'ETH/USDT',
      side: 'sell',
      amount: 0.1,
      leverage: 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🖤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Trading Agent</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time Market Data • Order Management • Position Tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* MCP Status */}
              <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg">
                <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div className="text-sm text-green-600 dark:text-green-400">
                  <span className="font-semibold">Connected</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">WebSocket</span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last updated: Just now</span>
              </div>

              {/* Account Equity */}
              <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  <span className="text-white dark:text-gray-100 font-semibold">$</span>
                  <span className="text-white dark:text-gray-100 font-semibold">{portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Total PnL */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${portfolio.totalPnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <TrendingUp className={`w-4 h-4 ${portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="text-sm">
                  <span className={`text-white dark:text-gray-100 font-semibold ${portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.totalPnl >= 0 ? '+' : ''}{portfolio.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-gray-300 dark:text-gray-400">Total PnL</span>
                </div>
              </div>

              {/* Settings */}
              <button className="bg-white/10 hover:bg-white/20 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Market Data */}
          <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Market Data
              <span className="text-xs text-gray-500 dark:text-gray-400">Real-time • 3s updates</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketData.map((market) => (
                <div key={market.symbol} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {market.symbol.split('/')[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {market.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-semibold ${market.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">24h High</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {market.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">24h Low</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {market.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Volume</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {market.volume.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        $${(market.marketCap / 1000000000).toFixed(2)}T
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Order Entry */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Quick Order
              <span className="text-xs text-gray-500 dark:text-gray-400">One-click trading</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={quickBuyBTC}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl py-4 font-semibold hover:from-green-700 to-emerald-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-100 dark:text-green-100 text-xl font-bold">BTC</span>
                    <span className="text-xs text-green-100 dark:text-green-100">Buy</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm">
                      {marketData.find(m => m.symbol === 'BTC/USDT')?.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={quickSellBTC}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl py-4 font-semibold hover:from-red-700 to-pink-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-red-100 dark:text-red-100 text-xl font-bold">BTC</span>
                    <span className="text-xs text-red-100 dark:text-red-100">Sell</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm">
                      {marketData.find(m => m.symbol === 'BTC/USDT')?.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) || 'N/A'}
                    </span>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={quickBuyETH}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg py-3 font-semibold hover:from-green-700 to-emerald-700 transition-all flex items-center justify-between"
                >
                  <span className="text-xs text-green-100 dark:text-green-100">ETH</span>
                  <span className="text-sm text-green-100 dark:text-green-100">Buy</span>
                </button>
                <button
                  onClick={quickSellETH}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg py-3 font-semibold hover:from-red-700 to-pink-700 transition-all flex items-center justify-between"
                >
                  <span className="text-xs text-red-100 dark:text-red-100">ETH</span>
                  <span className="text-sm text-red-100 dark:text-red-100">Sell</span>
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Trade amount and leverage can be adjusted in settings
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-gray-900 dark:text-white">Positions</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{positions.length} open</span>
                <div className="text-right">
                  <span className={`font-bold ${portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.totalPnl >= 0 ? '+' : ''}${portfolio.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total PnL</span>
                </div>
              </div>
            </div>

            {positions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg font-semibold">No open positions</p>
                <p className="text-sm">Place an order to start trading</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Symbol</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Side</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Entry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Current</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">PnL</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => {
                      const market = marketData.find(m => m.symbol === position.symbol);
                      const currentPrice = market?.currentPrice || 0;
                      const pnl = position.side === 'long' 
                        ? (currentPrice - position.entryPrice) * position.size
                        : (position.entryPrice - currentPrice) * position.size;
                      
                      return (
                        <tr key={position.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-900 dark:text-white">{position.symbol}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${position.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {position.side === 'long' ? 'LONG' : 'SHORT'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700 dark:text-gray-300">{position.size.toFixed(4)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700 dark:text-gray-300">{position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700 dark:text-gray-300">{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => closePosition(position.id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-sm font-semibold transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Trades */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-gray-900 dark:text-white">Recent Trades</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{trades.length} trades</span>
              </div>
            </div>

            {trades.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-lg font-semibold">No trades yet</p>
                <p className="text-sm">Place an order to start trading</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.slice(0, 10).map((trade) => {
                  const isBuy = trade.side === 'buy';
                  
                  return (
                    <div key={trade.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}>
                            <span className="text-white font-bold text-lg">
                              {trade.symbol.split('/')[0]}
                            </span>
                          </div>
                          <div className={`text-xs font-semibold ${trade.status === 'filled' ? 'bg-green-100 text-green-800' : trade.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {trade.status.toUpperCase()}
                            </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(trade.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500 dark:text-gray-400">Amount</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{trade.amount.toFixed(4)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500 dark:text-gray-400">Price</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status</span>
                          <span className={`text-xs font-semibold ${trade.status === 'filled' ? 'bg-green-100 text-green-800' : trade.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {trade.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{trade.fee.toFixed(4)} USDT</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">PnL</span>
                          <span className={`font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(4)} USDT
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Powered by</span>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <span className="text-gray-900 dark:text-white">Mission Control Dashboard</span>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400">Real-time Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Updated</span>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl max-w-md z-50 ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <X className="w-5 h-5" />}
            <span className="font-semibold">{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info'}</span>
          </div>
          <div className="text-sm font-medium">{notification.message}</div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Place Order</h3>
                </div>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Configure your order parameters below:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trading Pair
                  </label>
                  <select
                    value="BTC/USDT"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Side
                  </label>
                  <select
                    value="buy"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={orderFormData.amount}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0.001 }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Leverage
                  </label>
                  <select
                    value={orderFormData.leverage}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, leverage: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                    <option value={20}>20x</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      placeOrder(orderFormData);
                      setShowOrderModal(false);
                    }}
                    type="button"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg py-3 font-semibold hover:from-orange-600 to-red-600 transition-all"
                  >
                    {orderFormData.side === 'buy' ? `Buy ${orderFormData.amount} ${orderFormData.symbol}` : `Sell ${orderFormData.amount} ${orderFormData.symbol}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
