package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
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
	r.Get("/flagged-insights", listFlaggedInsightsHandler)
	r.Patch("/flagged-insights", updateFlaggedInsightHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("data_server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
