# Virtufin WebSocket Manager

📖 Documentation: [websocketmanager.doc.virtufin.com](https://websocketmanager.doc.virtufin.com)

A WebSocket management service with REST and gRPC APIs, built on ASP.NET Core with Dapr integration.

## Features

- WebSocket connection management
- REST API for WebSocket operations
- gRPC API for WebSocket operations
- Dapr integration for pub/sub and state management
- Health checks and monitoring

## Deployment

All deployment infrastructure is managed in dedicated repositories.

### Local (Native Dapr)

Run services natively with Dapr sidecars. No Docker containers for services. Requires Dapr CLI, .NET SDK, and Redis.

```bash
git clone https://git.haenerconsulting.com/virtufin/deploy-local.git
cd deploy-local
./scripts/deploy_websocketmanager.sh
```

See [deploy-local](https://git.haenerconsulting.com/virtufin/deploy-local) for full documentation.

### Docker Dev

Build and run from source via Docker Compose.

```bash
git clone https://git.haenerconsulting.com/virtufin/docker-compose.git
cd docker-compose
./scripts/deploy_websocketmanager.dev.sh
```

### Docker Prod

Run pre-built Harbor images via Docker Compose.

```bash
git clone https://git.haenerconsulting.com/virtufin/docker-compose.git
cd docker-compose
./scripts/deploy_websocketmanager.prod.sh
```

See [docker-compose](https://git.haenerconsulting.com/virtufin/docker-compose) for full documentation.

### Kubernetes

Deploy with the Virtufin Helm chart. Requires Dapr installed on the cluster.

```bash
helm repo add virtufin https://helm.haenerconsulting.com/virtufin/helm
helm install virtufin virtufin/virtufin \
  --namespace virtufin \
  --create-namespace \
  --set stateStore.host=<redis-host> \
  --set pubsub.host=<redis-host>
```

See [helm](https://helm.haenerconsulting.com/virtufin/helm) for all configurable values.

## Port Configuration

The application supports separate ports for HTTP/REST APIs and gRPC services:

### Command-Line Arguments
- `--http-port`, `-h`: HTTP port for REST APIs (default: 5001)
- `--grpc-port`, `-g`: gRPC port for gRPC services (default: 5002)

### Environment Variables
- `HttpPort`: Same as `--http-port` (e.g., `HttpPort=8080`)
- `GrpcPort`: Same as `--grpc-port` (e.g., `GrpcPort=8081`)

### Configuration Precedence
1. Command-line arguments (highest priority)
2. Environment variables
3. Default values (5001 for HTTP, 5002 for gRPC)

### Development

#### Testing
Run tests with:
```bash
dotnet test
```

#### Logging
Control log level with `--log-level` argument:
```bash
dotnet run --project src/Virtufin.WebSocketManager -- --log-level Debug
```

Available log levels: Trace, Debug, Information, Warning, Error, Critical, None

### Troubleshooting

#### Port Already in Use
If you get an error that a port is already in use:
- Check for other applications using the same port
- Use a different port with `--http-port` and/or `--grpc-port`

#### gRPC Connection Issues
- Ensure you're connecting to the correct gRPC port (default: 5002)
- Use plaintext HTTP/2 connection (no TLS required)
- Verify the gRPC client is configured for HTTP/2 plaintext

### License

[License information here]