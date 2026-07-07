package main

import (
	"crypto/subtle"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func adminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		expectedToken := os.Getenv("ADMIN_TOKEN")
		if expectedToken == "" || subtle.ConstantTimeCompare([]byte(token), []byte("Bearer "+expectedToken)) != 1 {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	if err := initGCSClient(); err != nil {
		log.Fatalf("failed to initialize GCS client: %v", err)
	}

	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "/static"
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))
	r.Use(corsMiddleware)

	// Health probe — /health avoids Google Frontend interception of /healthz
	r.Get("/health", healthHandler)

	// Data endpoints — both /dataset and /api/dataset are registered because the
	// frontend constructs URLs as BASE_API_URL + "/api/dataset", matching the
	// path the old Node frontend_server proxied to the Python data_server.
	r.Get("/metadata", metadataHandler)
	r.Get("/api/metadata", metadataHandler)
	r.Get("/dataset", datasetHandler)
	r.Get("/api/dataset", datasetHandler)

	// Insight cache and flagging (replaces data_server insight routes)
	r.Get("/insight-cache", getInsightCacheHandler)
	r.With(adminOnly).Post("/insight-cache", putInsightCacheHandler)
	r.Post("/flag-insight", flagInsightHandler)
	r.Get("/flagged-examples", getFlaggedExamplesHandler)

	// Admin routes — require Authorization header
	r.With(adminOnly).Get("/flagged-insights", listFlaggedInsightsHandler)
	r.With(adminOnly).Patch("/flagged-insights", updateFlaggedInsightHandler)

	// AI insight generation (replaces frontend_server /fetch-ai-insight)
	r.Post("/fetch-ai-insight", fetchAIInsightHandler)
	r.Get("/rate-limit-status", rateLimitStatusHandler)

	// News (replaces frontend_server /het-news)
	r.Get("/het-news", hetNewsHandler)

	// Static file serving with SPA fallback (replaces frontend_server static + catch-all)
	r.Handle("/*", staticHandler(staticDir))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadTimeout:       15 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      35 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	log.Printf("server listening on %s (static: %s)", server.Addr, staticDir)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
