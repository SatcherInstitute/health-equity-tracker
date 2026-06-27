package main

import (
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
		if expectedToken == "" || token != "Bearer "+expectedToken {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize GCS client before starting the server
	if err := initGCSClient(); err != nil {
		log.Fatalf("failed to initialize GCS client: %v", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	r.Get("/", healthHandler)
	r.Get("/metadata", metadataHandler)
	r.Get("/dataset", datasetHandler)
	r.Get("/insight-cache", getInsightCacheHandler)
	r.Post("/insight-cache", putInsightCacheHandler)
	r.Post("/flag-insight", flagInsightHandler)
	r.Get("/flagged-examples", getFlaggedExamplesHandler)

	// Admin routes — require authorization
	r.With(adminOnly).Get("/flagged-insights", listFlaggedInsightsHandler)
	r.With(adminOnly).Patch("/flagged-insights", updateFlaggedInsightHandler)

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

	log.Printf("data_server listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
