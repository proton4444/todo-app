import { NextRequest, NextResponse } from 'next/server';

type Trade = {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
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

// In-memory storage (replace with database in production)
let trades: Trade[] = [
  { id: '1', symbol: 'BTC/USDT', side: 'buy', amount: 0.5, price: 42000, timestamp: Date.now() - 3600000, status: 'filled' },
  { id: '2', symbol: 'ETH/USDT', side: 'sell', amount: 5, price: 2500, timestamp: Date.now() - 7200000, status: 'filled' },
];

let positions: Position[] = [
  { id: '1', symbol: 'BTC/USDT', side: 'long', size: 0.5, entryPrice: 42000, currentPrice: 43500, pnl: 750, pnlPercent: 3.57 },
  { id: '2', symbol: 'ETH/USDT', side: 'short', size: 5, entryPrice: 2500, currentPrice: 2450, pnl: 250, pnlPercent: 4.0 },
];

// GET /api/trading - Fetch trading data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'trades') {
      return NextResponse.json({ trades });
    } else if (type === 'positions') {
      return NextResponse.json({ positions });
    } else {
      return NextResponse.json({ trades, positions });
    }
  } catch (error) {
    console.error('Error fetching trading data:', error);
    return NextResponse.json({ error: 'Failed to fetch trading data' }, { status: 500 });
  }
}

// POST /api/trading - Create trade or update position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trade, position } = body;

    if (action === 'createTrade' && trade) {
      // Create new trade
      const newTrade: Trade = {
        id: Date.now().toString(),
        ...trade,
        timestamp: Date.now(),
        status: 'filled',
      };
      trades = [newTrade, ...trades];
      return NextResponse.json({ trade: newTrade });
    } else if (action === 'updatePosition' && position) {
      // Update or create position
      const existingIndex = positions.findIndex(p => p.symbol === position.symbol);
      if (existingIndex >= 0) {
        positions[existingIndex] = { ...positions[existingIndex], ...position };
      } else {
        positions = [...positions, { ...position, id: Date.now().toString() }];
      }
      return NextResponse.json({ position });
    } else if (action === 'closePosition' && position?.id) {
      // Close position
      positions = positions.filter(p => p.id !== position.id);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing trading request:', error);
    return NextResponse.json({ error: 'Failed to process trading request' }, { status: 500 });
  }
}
