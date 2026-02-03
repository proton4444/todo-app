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
  lastError?: string;
  retryCount?: number;
};

type MCPTicker = {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
};

type MCPError = {
  code: string;
  message: string;
  timestamp: number;
  retryable: boolean;
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

// Simulated exchange connections with error handling
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

// NOTE: This endpoint simulates an MCP server.
// It intentionally does NOT provide durable trade history persistence.
// The UI treats localStorage as the source of truth for trades.

let activeSubscriptions: string[] = [];
let mcpConnected = true;
let lastError: MCPError | null = null;
let connectionRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff

// Simulate connection errors (10% chance)
function simulateConnectionError(): boolean {
  return Math.random() < 0.1;
}

// Simulate reconnection with exponential backoff
async function simulateReconnection(): Promise<boolean> {
  if (connectionRetryCount >= MAX_RETRY_ATTEMPTS) {
    console.error('Max retry attempts reached, giving up');
    return false;
  }

  const delay = RETRY_DELAYS[Math.min(connectionRetryCount, RETRY_DELAYS.length - 1)];
  console.log(`Reconnection attempt ${connectionRetryCount + 1}/${MAX_RETRY_ATTEMPTS}, waiting ${delay}ms...`);

  await new Promise(resolve => setTimeout(resolve, delay));

  // 80% success rate for reconnection
  if (Math.random() < 0.8) {
    console.log('Reconnection successful!');
    connectionRetryCount = 0;
    lastError = null;
    return true;
  } else {
    connectionRetryCount++;
    lastError = {
      code: 'CONNECTION_FAILED',
      message: `Reconnection attempt ${connectionRetryCount} failed`,
      timestamp: Date.now(),
      retryable: true
    };
    return simulateReconnection();
  }
}

// Update ticker prices with random fluctuation
function updateTickerPrices() {
  Object.keys(TICKER_DATA).forEach(symbol => {
    const ticker = TICKER_DATA[symbol];
    const changePercent = (Math.random() - 0.5) * 0.002; // ±0.1% change
    ticker.price = ticker.price * (1 + changePercent);
    ticker.change24h = ticker.change24h + (Math.random() - 0.5) * 0.1;
    ticker.timestamp = Date.now();
  });
}

// GET /api/mcp - Fetch MCP status, tools, exchanges, etc.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Simulate connection error
    if (!mcpConnected && simulateConnectionError()) {
      return NextResponse.json({
        error: 'MCP disconnected',
        lastError,
        connected: false
      }, { status: 503 });
    }

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
      return NextResponse.json({ orders: [] });
    } else if (action === 'status') {
      return NextResponse.json({
        connected: mcpConnected,
        exchanges: MCP_EXCHANGES.length,
        tools: MCP_TOOLS.length,
        uptime: process.uptime(),
        lastError,
        connectionRetryCount,
        activeSubscriptions: activeSubscriptions.length
      });
    } else if (action === 'stream') {
      // SSE (Server-Sent Events) for real-time ticker updates
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();

            // Send initial data
            const initialData = JSON.stringify({
              type: 'connected',
              tickers: TICKER_DATA
            });
            controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

            // Send ticker updates every second
            const interval = setInterval(() => {
              if (!mcpConnected) {
                const errorData = JSON.stringify({
                  type: 'error',
                  error: lastError
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                return;
              }

              updateTickerPrices();

              const tickerData = JSON.stringify({
                type: 'ticker_update',
                tickers: TICKER_DATA,
                timestamp: Date.now()
              });
              controller.enqueue(encoder.encode(`data: ${tickerData}\n\n`));
            }, 1000);

            // Clean up on close
            request.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } else {
      return NextResponse.json({
        connected: mcpConnected,
        exchanges: MCP_EXCHANGES,
        tools: MCP_TOOLS,
        tickers: TICKER_DATA
      });
    }
  } catch (error) {
    console.error('MCP API error:', error);
    lastError = {
      code: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      retryable: true
    };
    return NextResponse.json({ error: 'MCP request failed', lastError }, { status: 500 });
  }
}

// POST /api/mcp - Execute MCP tools (place order, cancel order, etc.)
export async function POST(request: NextRequest) {
  try {
    // Check MCP connection
    if (!mcpConnected) {
      // Try to reconnect
      const reconnected = await simulateReconnection();
      if (!reconnected) {
        return NextResponse.json({
          error: 'MCP disconnected',
          lastError,
          message: 'Failed to reconnect to MCP server'
        }, { status: 503 });
      }
    }

    const body = await request.json();
    const { action, params } = body;

    if (action === 'place_order') {
      const { exchange, symbol, side, amount, price } = params;

      // Validate exchange
      const exchangeObj = MCP_EXCHANGES.find(e => e.name === exchange);
      if (!exchangeObj || exchangeObj.status !== 'connected') {
        return NextResponse.json({
          error: 'Exchange not connected',
          exchange,
          availableExchanges: MCP_EXCHANGES.filter(e => e.status === 'connected').map(e => e.name)
        }, { status: 400 });
      }

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

      // Update ticker data with new price
      if (TICKER_DATA[symbol]) {
        TICKER_DATA[symbol].price = price;
        TICKER_DATA[symbol].timestamp = Date.now();
      }

      return NextResponse.json({ order: newOrder, success: true });
    } else if (action === 'cancel_order') {
      const { orderId } = params;
      // No persistent order store in this simulated API.
      return NextResponse.json({ success: true, orderId });
    } else if (action === 'subscribe_ticker') {
      const { symbols } = params;
      activeSubscriptions = [...new Set([...activeSubscriptions, ...symbols])];
      return NextResponse.json({
        subscribed: true,
        symbols: activeSubscriptions,
        message: 'Successfully subscribed to ticker updates'
      });
    } else if (action === 'toggle_connection') {
      const { connected } = params;
      mcpConnected = connected;

      if (!connected) {
        lastError = {
          code: 'MANUAL_DISCONNECT',
          message: 'MCP connection manually disabled',
          timestamp: Date.now(),
          retryable: false
        };
      } else {
        lastError = null;
        connectionRetryCount = 0;
      }

      return NextResponse.json({
        connected: mcpConnected,
        message: `MCP ${connected ? 'connected' : 'disconnected'}`,
        lastError
      });
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MCP POST error:', error);
    lastError = {
      code: 'EXECUTION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      retryable: true
    };
    return NextResponse.json({ error: 'MCP execution failed', lastError }, { status: 500 });
  }
}
