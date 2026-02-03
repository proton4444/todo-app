import { NextRequest, NextResponse } from 'next/server';

type MCPTool = {
  name: string;
  description: string;
  parameters: any;
};

type MCPExchange = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  markets: string[];
};

type MCPTicker = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
};

// Simulated MCP tools (would be fetched from real MCP server)
const MCP_TOOLS: MCPTool[] = [
  {
    name: 'list_exchanges',
    description: 'List all available cryptocurrency exchanges',
    parameters: {}
  },
  {
    name: 'get_price',
    description: 'Get current price for a trading pair',
    parameters: {
      symbol: 'string',
      exchange: 'string'
    }
  },
  {
    name: 'place_order',
    description: 'Place a buy or sell order',
    parameters: {
      exchange: 'string',
      symbol: 'string',
      side: 'buy|sell',
      amount: 'number',
      price: 'number'
    }
  },
  {
    name: 'cancel_order',
    description: 'Cancel an existing order',
    parameters: {
      exchange: 'string',
      orderId: 'string'
    }
  },
  {
    name: 'get_positions',
    description: 'Get all open positions',
    parameters: {
      exchange: 'string'
    }
  },
  {
    name: 'get_order_history',
    description: 'Get order history',
    parameters: {
      exchange: 'string',
      limit: 'number'
    }
  },
  {
    name: 'subscribe_ticker',
    description: 'Subscribe to real-time ticker updates',
    parameters: {
      symbols: 'array'
    }
  }
];

// Simulated exchange connections
const MCP_EXCHANGES: MCPExchange[] = [
  {
    name: 'Binance',
    status: 'connected',
    markets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']
  },
  {
    name: 'Upbit',
    status: 'connected',
    markets: ['BTC/KRW', 'ETH/KRW', 'SOL/KRW']
  },
  {
    name: 'Gate.io',
    status: 'connected',
    markets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
  }
];

// Simulated ticker data
const TICKER_DATA: Record<string, MCPTicker> = {
  'BTC/USDT': { symbol: 'BTC/USDT', price: 43500, change24h: 2.5, volume24h: 1.2e9, timestamp: Date.now() },
  'ETH/USDT': { symbol: 'ETH/USDT', price: 2450, change24h: -1.2, volume24h: 8.5e8, timestamp: Date.now() },
  'SOL/USDT': { symbol: 'SOL/USDT', price: 98.5, change24h: 4.3, volume24h: 3.2e8, timestamp: Date.now() }
};

// In-memory order storage
let orders: any[] = [
  { id: '1', exchange: 'Binance', symbol: 'BTC/USDT', side: 'buy', amount: 0.5, price: 42000, status: 'filled', timestamp: Date.now() - 3600000 },
  { id: '2', exchange: 'Binance', symbol: 'ETH/USDT', side: 'sell', amount: 5, price: 2500, status: 'filled', timestamp: Date.now() - 7200000 }
];

// GET /api/mcp - Fetch MCP status, tools, exchanges, etc.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'tools') {
      return NextResponse.json({ tools: MCP_TOOLS });
    } else if (action === 'exchanges') {
      return NextResponse.json({ exchanges: MCP_EXCHANGES });
    } else if (action === 'ticker') {
      const symbol = searchParams.get('symbol');
      if (symbol) {
        return NextResponse.json({ ticker: TICKER_DATA[symbol] || null });
      }
      return NextResponse.json({ tickers: TICKER_DATA });
    } else if (action === 'orders') {
      return NextResponse.json({ orders });
    } else if (action === 'status') {
      return NextResponse.json({
        connected: true,
        exchanges: MCP_EXCHANGES.length,
        tools: MCP_TOOLS.length,
        uptime: process.uptime()
      });
    } else {
      return NextResponse.json({
        connected: true,
        exchanges: MCP_EXCHANGES,
        tools: MCP_TOOLS,
        tickers: TICKER_DATA
      });
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json({ error: 'MCP request failed' }, { status: 500 });
  }
}

// POST /api/mcp - Execute MCP tools (place order, cancel order, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    if (action === 'place_order') {
      const { exchange, symbol, side, amount, price } = params;
      const newOrder = {
        id: Date.now().toString(),
        exchange,
        symbol,
        side,
        amount,
        price,
        status: 'filled',
        timestamp: Date.now()
      };
      orders = [newOrder, ...orders];

      // Update ticker data with new price simulation
      if (TICKER_DATA[symbol]) {
        TICKER_DATA[symbol].price = price;
        TICKER_DATA[symbol].timestamp = Date.now();
      }

      return NextResponse.json({ order: newOrder, success: true });
    } else if (action === 'cancel_order') {
      const { orderId } = params;
      orders = orders.map((o: any) =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      );
      return NextResponse.json({ success: true, orderId });
    } else if (action === 'subscribe_ticker') {
      // Simulate WebSocket subscription
      const { symbols } = params;
      return NextResponse.json({
        subscribed: true,
        symbols,
        message: 'Successfully subscribed to ticker updates'
      });
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MCP POST error:', error);
    return NextResponse.json({ error: 'MCP execution failed' }, { status: 500 });
  }
}
