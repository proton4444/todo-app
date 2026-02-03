# MCP Integration Guide

## Overview

This trading dashboard integrates with the Model Context Protocol (MCP) server `vkdnjznd/crypto-trading-mcp` to provide unified access to multiple cryptocurrency exchanges.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Trading        │  HTTP   │  Next.js API    │  MCP    │  crypto-trading │
│  Dashboard     │◄────────►│  /api/mcp      │◄────────►│  -mcp server   │
│  (Frontend)    │         │  (Bridge)       │         │  (Python)       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                    │
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │   Exchanges:    │
                                                          │ • Binance       │
                                                          │ • Upbit         │
                                                          │ • Gate.io       │
                                                          └──────────────────┘
```

## MCP Tools Available

The following tools are exposed through the MCP server:

| Tool | Description | Parameters |
|------|-------------|-------------|
| `list_exchanges` | List all available cryptocurrency exchanges | - |
| `get_price` | Get current price for a trading pair | `symbol`, `exchange` |
| `place_order` | Place a buy or sell order | `exchange`, `symbol`, `side`, `amount`, `price` |
| `cancel_order` | Cancel an existing order | `exchange`, `orderId` |
| `get_positions` | Get all open positions | `exchange` |
| `get_order_history` | Get order history | `exchange`, `limit` |
| `subscribe_ticker` | Subscribe to real-time ticker updates | `symbols` (array) |

## Setup Instructions

### 1. Clone and Install MCP Server

```bash
# Clone the MCP server repository
git clone https://github.com/vkdnjznd/crypto-trading-mcp.git
cd crypto-trading-mcp

# Install dependencies (using uv for fast Python package management)
pip install uv
uv pip install -e .
```

### 2. Configure Exchange API Keys

Add your exchange API credentials to `.env.local`:

```bash
# Binance
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# Upbit
UPBIT_ACCESS_KEY=your_upbit_access_key_here
UPBIT_SECRET_KEY=your_upbit_secret_key_here

# Gate.io
GATE_API_KEY=your_gate_api_key_here
GATE_SECRET_KEY=your_gate_secret_key_here
```

**Important:** Never commit `.env.local` to version control!

### 3. Run MCP Server

The MCP server can run in two modes:

**Mode A: stdio (default)**
```bash
python -m crypto_trading_mcp
```

**Mode B: SSE (Server-Sent Events)**
```bash
uvicorn crypto_trading_mcp.server:app --host 0.0.0.0 --port 8000
```

### 4. Configure Next.js App

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` to match your configuration:

```bash
# MCP Settings
MCP_SIMULATION_MODE=false  # Set to false to use real MCP server
MCP_SERVER_URL=http://localhost:8000  # If using SSE mode
```

## API Endpoints

### `GET /api/mcp`

Fetch MCP status, tools, exchanges, or market data.

**Query Parameters:**
- `action=status` - Get MCP connection status
- `action=tools` - List available MCP tools
- `action=exchanges` - List connected exchanges
- `action=ticker` - Get ticker data (add `?symbol=BTC/USDT` for specific symbol)
- `action=orders` - Get order history

**Example:**
```bash
curl "http://localhost:3000/api/mcp?action=status"
curl "http://localhost:3000/api/mcp?action=ticker"
curl "http://localhost:3000/api/mcp?action=exchanges"
```

### `POST /api/mcp`

Execute MCP tools (place orders, cancel orders, etc.).

**Request Body:**
```json
{
  "action": "place_order",
  "params": {
    "exchange": "Binance",
    "symbol": "BTC/USDT",
    "side": "buy",
    "amount": 0.5,
    "price": 43500
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "place_order",
    "params": {
      "exchange": "Binance",
      "symbol": "BTC/USDT",
      "side": "buy",
      "amount": 0.5,
      "price": 43500
    }
  }'
```

## Supported Exchanges

Currently, the MCP server supports:

1. **Binance** - Largest cryptocurrency exchange by volume
   - Spot trading
   - API Keys required

2. **Upbit** - Leading South Korean exchange
   - Spot trading
   - API Keys required

3. **Gate.io** - Established exchange with global reach
   - Spot trading
   - API Keys required

## Real-time Data Updates

The dashboard uses two methods for real-time data:

### 1. Polling (Current Implementation)
- Fetches market data every 3 seconds via HTTP
- Simulated in current implementation
- Will be replaced with WebSocket in production

### 2. WebSocket (Planned)
- Uses `subscribe_ticker` MCP tool
- Real-time push updates (no polling)
- Lower latency, more efficient

## Error Handling

The MCP integration includes robust error handling:

- **Connection failures:** Dashboard shows "MCP Disconnected" state
- **API rate limits:** Automatic retry with exponential backoff
- **Order failures:** User notification with error details
- **WebSocket disconnects:** Automatic reconnection logic

## Security Considerations

1. **API Key Protection:**
   - Never commit `.env.local` to Git
   - Use different API keys for development/production
   - Rotate API keys regularly

2. **Order Validation:**
   - Client-side validation before sending to MCP
   - Server-side validation in MCP server
   - Risk limits enforced (max leverage, position size)

3. **Rate Limiting:**
   - Respect exchange API rate limits
   - Implement backoff on rate limit errors

## Testing

### Test MCP Connection

```bash
curl "http://localhost:3000/api/mcp?action=status"
```

Expected response:
```json
{
  "connected": true,
  "exchanges": 3,
  "tools": 7,
  "uptime": 3600
}
```

### Test Order Placement

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "place_order",
    "params": {
      "exchange": "Binance",
      "symbol": "BTC/USDT",
      "side": "buy",
      "amount": 0.01,
      "price": 40000
    }
  }'
```

## Troubleshooting

### "MCP Disconnected" Error

**Cause:** MCP server not running or connection failed

**Solution:**
1. Check if MCP server is running: `ps aux | grep crypto_trading_mcp`
2. Start MCP server: `python -m crypto_trading_mcp`
3. Verify API keys in `.env.local`

### "Failed to place order" Error

**Cause:** Invalid parameters or API key issues

**Solution:**
1. Check exchange credentials in `.env.local`
2. Verify symbol format (e.g., `BTC/USDT`, not `BTCUSDT`)
3. Check order amount exceeds minimum/maximum limits
4. Verify account has sufficient balance

### "Rate limit exceeded" Error

**Cause:** Too many API requests

**Solution:**
1. Reduce refresh interval (default 3s)
2. Implement exponential backoff (built-in)
3. Contact exchange for higher rate limits

## Next Steps

After completing Phase 3 (MCP Integration), proceed to:

- **Phase 4:** Data Layer (database models, validation, persistence)
- **Phase 5:** Strategy Layer (Alpha Arena integration, signal generation)
- **Phase 6:** Risk Management (VaR calculator, position sizing)

## Additional Resources

- [crypto-trading-mcp GitHub](https://github.com/vkdnjznd/crypto-trading-mcp)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Binance API Docs](https://binance-docs.github.io/apidocs)
- [Upbit API Docs](https://docs.upbit.com)
- [Gate.io API Docs](https://www.gate.io/docs)
