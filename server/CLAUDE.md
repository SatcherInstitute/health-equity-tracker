# Server

Combined Go HTTP server. A single binary and a single Docker image (~15 MB) serves:

- React static files with correct Cache-Control headers and SPA fallback
- GCS dataset and metadata endpoints
- AI insight generation (direct Anthropic API call — no proxy hop)
- Insight cache and flagging (direct GCS reads/writes — no inter-service HTTP)
- Webflow news feed with TTL cache
- Admin insight management (requires `Authorization: Bearer $ADMIN_TOKEN`)

## Commands

```bash
# Run locally (from server/ directory)
go run .

# Build and run
go build -o server . && ./server

# Run tests
go test ./...
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GCS_BUCKET` | Yes | - | GCS bucket for dataset files |
| `METADATA_FILENAME` | Yes | - | Filename of the metadata NDJSON in GCS |
| `INSIGHTS_CACHE_BUCKET` | No | - | GCS bucket for persisted AI insight cache |
| `FLAGGED_INSIGHTS_BUCKET` | No | - | GCS bucket for flagged insight records |
| `ADMIN_TOKEN` | No | - | Bearer token for admin routes (`/flagged-insights`) |
| `ANTHROPIC_API_KEY` | No | - | Required for `/fetch-ai-insight` |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-5-20250929` | Anthropic model used for insight generation |
| `WEBFLOW_API_TOKEN` | No | - | Required for `/het-news` |
| `INSIGHT_NEGATIVE_EXAMPLES_ENABLED` | No | `false` | Feed prior flagged outputs back into prompts |
| `STATIC_DIR` | No | `/static` | Directory containing the React build |
| `PORT` | No | `8080` | HTTP listen port |

## How it works

The server handles all traffic on a single port:

- **Data requests** (`/dataset`, `/metadata`): served from GCS via a 150 MB byte-aware LRU
  cache with a 2-hour TTL. NDJSON files are converted to JSON arrays on the fly.
- **AI insights** (`/fetch-ai-insight`): checks a `sync.Map` in-process cache, then the GCS
  persistent cache, then calls the Anthropic API directly and writes back to GCS.
- **Flagging** (`/flag-insight`): writes a flag record to GCS, deletes the cached insight, and
  clears the in-process `sync.Map` entry — all in the same process with no HTTP hops.
- **News** (`/het-news`): fetches from the Webflow CDN API with a 5-minute TTL cache (tags
  cached for 1 hour). Serves stale data on upstream errors.
- **Static files**: served from `STATIC_DIR` with proper `Cache-Control` headers:
  - `/assets/*` — `immutable` (Vite fingerprints filenames with content hashes)
  - `index.html` — `no-store` (shell must always be fresh)
  - Everything else — `public, max-age=7200`
  - Unknown paths → `index.html` (SPA client-side routing fallback)

## Dockerfile

Three-stage build (build context is the repo root, like all other services):

1. `node:24-slim` — builds the React frontend
2. `golang:1.26.3-alpine` — builds the Go binary
3. `gcr.io/distroless/static-debian12:nonroot` — runtime (~15 MB, no shell)

Build with `DEPLOY_CONTEXT` arg set to `dev`, `prod`, or `deploy_preview`:

```bash
# From repo root
docker build -f server/Dockerfile --build-arg DEPLOY_CONTEXT=dev -t het-server .
docker run -p 8080:8080 \
  -e GCS_BUCKET=het-bucket \
  -e METADATA_FILENAME=all_metadata.ndjson \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e WEBFLOW_API_TOKEN=... \
  het-server
```
