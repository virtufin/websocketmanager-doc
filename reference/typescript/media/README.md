# Python Binance Demo - gRPC + Dapr Client Example

This example demonstrates cross-language interoperability by connecting to the WebSocket management service using gRPC with reflection and consuming published messages via the Python Dapr client.

## Prerequisites

1. **Python 3.9+** installed
2. **Dapr CLI** installed and running
3. **Redis** running (for Dapr pub/sub)
4. **The WebSocket management service** running with gRPC reflection enabled

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start Dapr Sidecar

The example assumes Dapr is running with:
- HTTP port: 3500
- gRPC port: 50001
- Redis for pub/sub

```bash
# Start Redis if not running
redis-server

# Initialize Dapr (one-time)
dapr init

# Start the service with Dapr
cd src/Virtufin.WebSocketManager
dapr run --app-id websocket-pubsub-dapr \
  --app-protocol grpc \
  --app-port 5002 \
  --dapr-http-port 3500 \
  --resources-path ../../components \
  -- dotnet run --no-build
```

## Running the Example

```bash
python binance_demo.py
```

The script will:
1. Connect to the service via gRPC using the reusable `WebSocketManagerClient` class
2. Establish a connection to Binance WebSocket via the gRPC service
3. Subscribe to Binance aggTrade and depth streams
4. Start publishing to a Dapr pub/sub topic
5. Consume messages from Dapr pub/sub and display trade data

## Using the Reusable WebSocketManagerClient

The example now uses a reusable Python client class `WebSocketManagerClient` that provides a clean interface for all WebSocket management operations. This replaces the previous inline gRPC code.

### Async Usage

```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src' / 'python'))
from virtufin import WebSocketManagerClient

async def main():
    # Create client with default host (localhost:5002)
    client = WebSocketManagerClient()
    # Or specify separately: client = WebSocketManagerClient("localhost", 5002)
    
    # Use async context manager for automatic connection management
    async with client:
        # Connect to WebSocket
        connection_id = await client.connect_websocket(
            "wss://stream.binance.com:9443/ws",
            auto_reconnect=True
        )
        
        # List connections
        connections = await client.list_connections()
        
        # Send message
        result = await client.send_message(connection_id, {"type": "ping"})
        
        # Disconnect
        await client.disconnect_websocket(connection_id)

# Or use it directly
client = WebSocketManagerClient()
await client.connect()
# ... use client
await client.close()
```

### Sync Usage

For synchronous code, use `SyncWebSocketManagerClient`:

```python
from src.python.virtufin import SyncWebSocketManagerClient

# Create sync client
client = SyncWebSocketManagerClient()

# Use context manager for automatic connection management
with client:
    # Connect to WebSocket
    connection_id = client.connect_websocket(
        "wss://stream.binance.com:9443/ws",
        auto_reconnect=True
    )
    
    # List connections
    connections = client.list_connections()
    
    # Send message
    result = client.send_message(connection_id, {"type": "ping"})
    
    # Disconnect
    client.disconnect_websocket(connection_id)
```

## Features of WebSocketManagerClient

- **Auto-reconnection**: Built-in connection management with auto-reconnect support
- **Service Discovery**: Uses gRPC reflection to discover available services
- **Error Handling**: Comprehensive error handling with descriptive exceptions
- **Async and Sync**: Both async (`WebSocketManagerClient`) and sync (`SyncWebSocketManagerClient`) versions
- **Type Hints**: Full Python type hints for better IDE support
- **Context Managers**: Both `async with` and regular `with` statement support

## How It Works

### gRPC Reflection

The `WebSocketManagerClient` class uses `grpcio-reflection` to dynamically discover the available services. This happens automatically when you connect:

```python
from src.python.virtufin import WebSocketManagerClient

client = WebSocketManagerClient("localhost", 5002)
await client.connect()  # Automatically discovers services via reflection
```

You can also check if specific services are available:

```python
if client.has_service_registry():
    print("ServiceRegistry service is available")
```

The client handles all the reflection details internally, including:
- Creating the gRPC channel with appropriate credentials
- Querying the server for available services
- Caching service stubs for performance
- Handling connection errors and retries

### Dapr Pub/Sub

The script uses the `dapr` Python SDK to subscribe to messages:

```python
from dapr.clients.grpc.client import DaprGrpcClient

client = DaprGrpcClient()
subscription = client.subscribe('btcusd', 'pubsub')
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| GRPC_HOST | localhost | gRPC server hostname |
| GRPC_PORT | 5002 | gRPC server port |
| DAPR_HTTP_PORT | 3500 | Dapr HTTP port |
| BINANCE_WS_URL | wss://stream.binance.com:9443/ws | Binance WebSocket URL |
| BINANCE_STREAMS | btcusdt@aggTrade,btcusdt@depth | Binance streams to subscribe to |
| PUB_SUB_COMPONENT | pubsub | Dapr pub/sub component name |
| TOPIC | btcusd | Topic for publishing trade data |

**Note:** The default gRPC port changed from 5001 to 5002 as part of the port separation change. The service now uses separate ports for HTTP (5001) and gRPC (5002).

## Troubleshooting

### Binance Blocked in Your Region

If Binance WebSocket is blocked, you may see connection errors. Try using a VPN or proxy.

### Dapr Connection Issues

Ensure Dapr is running:
```bash
dapr status
```

### gRPC Reflection Not Working

Verify the service has reflection enabled and is using the correct port:
```bash
# Check gRPC port (5002 for gRPC, 5001 for HTTP)
grpcurl localhost:5002 list
```

You should see `ServerReflection` in the list of services.

### WebSocketManagerClient Issues

If the `WebSocketManagerClient` class fails to connect:

1. **Check the gRPC port**: Ensure you're using port 5002 for gRPC connections
   ```python
   # Correct port for gRPC
   client = WebSocketManagerClient("localhost:5002")
   ```

2. **Verify service is running**: The WebSocket management service must be running with gRPC enabled

3. **Check imports**: Ensure the Python package structure is in your path
   ```python
   import sys
   sys.path.insert(0, '/path/to/project/src')
   from python.virtufin import WebSocketManagerClient
   ```
