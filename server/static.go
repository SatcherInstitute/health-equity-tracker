package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// staticHandler serves the React build from staticDir with SPA fallback and
// correct Cache-Control headers:
//   - /assets/* — immutable (Vite fingerprints these with content hashes)
//   - index.html and SPA fallback routes — no-store so the shell is always fresh
//   - everything else — 2-hour public cache
// looksLikeFile returns true when the path's last segment contains a dot,
// indicating the client expects a static asset rather than a SPA route.
func looksLikeFile(p string) bool {
	return strings.Contains(filepath.Base(p), ".")
}

func staticHandler(staticDir string) http.HandlerFunc {
	fileServer := http.FileServer(http.Dir(staticDir))

	return func(w http.ResponseWriter, r *http.Request) {
		urlPath := filepath.Clean(r.URL.Path)
		fullPath := filepath.Join(staticDir, urlPath)

		info, err := os.Stat(fullPath)
		if err != nil || info.IsDir() {
			// Paths that look like files (e.g. /assets/missing.js) get a 404 so
			// broken asset references are visible instead of masked by index.html.
			if looksLikeFile(urlPath) {
				http.NotFound(w, r)
				return
			}
			// Clean SPA routes (e.g. /explore-data) fall back to index.html.
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}

		setCacheControl(w, urlPath)
		fileServer.ServeHTTP(w, r)
	}
}

func setCacheControl(w http.ResponseWriter, urlPath string) {
	switch {
	case strings.HasPrefix(urlPath, "/assets/"):
		// Vite fingerprints all /assets/* filenames with content hashes
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	case urlPath == "/index.html" || urlPath == "/":
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	default:
		w.Header().Set("Cache-Control", "public, max-age=7200")
	}
}
