# Data Server

Go HTTP server that responds to data requests by serving pre-exported JSON files from GCS.

## Commands

```bash
# Run locally (from data_server/ directory)
go run .

# Build and run
go build -o data_server . && ./data_server

# Run tests
go test ./...
```

## How it works

Reads JSON files from a GCS bucket (or local `frontend/public/tmp/` during development). Each endpoint maps to a file exported by the `exporter/` service. The frontend sets `VITE_BASE_API_URL` to point at whichever data server environment to use.

Responses are cached in a 150 MB byte-aware LRU cache with a 2-hour TTL. NDJSON files are converted to JSON arrays on the fly before serving.
