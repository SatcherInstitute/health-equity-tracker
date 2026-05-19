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

Built as a container, deployed to Cloud Run. See `Dockerfile`.
