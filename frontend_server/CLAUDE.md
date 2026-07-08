# Frontend Server

Lightweight Node.js server that serves the React static build and proxies data requests to the Python data server.

## Commands

```bash
npm start    # start server
npm test     # run utils tests
```

## How it works

- Serves static files from `../frontend/build/`
- Proxies `/api/*` requests to `VITE_BASE_API_URL` (set per environment via `.env`)
- Routes defined in `routes/`

## Docker

Two-stage build defined in `Dockerfile`:

1. **Stage 1 (`build_react`):** Builds the React frontend
   - Installs frontend deps with `--ignore-scripts` (defers `postinstall` so `run-tokens.ts` isn't called before it's been copied into the image)
   - Copies all frontend source, then runs `npm run build:$DEPLOY_CONTEXT` — the `prebuild` hook runs `npm run tokens` at the right time
2. **Stage 2:** Copies the compiled `build/` output into the Node server image alongside the server code

The `DEPLOY_CONTEXT` build arg selects which `.env` file the server loads at runtime (`dev`, `prod`, `deploy_preview`).
