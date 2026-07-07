package main

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const cacheControlHeader = "public, max-age=7200"

var datasetCache = newByteCache(maxCacheBytes, cacheTTL)

// gcsDownload is the function used to fetch blobs from GCS. Tests replace it
// with a mock so that metadataHandler and datasetHandler can be exercised
// through the real code path without needing a GCS connection.
var gcsDownload = func(ctx context.Context, bucket, name string) ([]byte, error) {
	return downloadBlob(ctx, bucket, name)
}

func cachedDownload(ctx context.Context, bucket, name string) ([]byte, error) {
	if data, ok := datasetCache.get(name); ok {
		return data, nil
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	data, err := gcsDownload(ctx, bucket, name)
	if err != nil {
		return nil, err
	}
	datasetCache.set(name, data)
	return data, nil
}

// ndjsonToArray converts NDJSON bytes to a JSON array, preserving each line verbatim.
func ndjsonToArray(data []byte) []byte {
	var buf bytes.Buffer
	buf.WriteByte('[')
	first := true
	for _, line := range bytes.Split(bytes.TrimRight(data, "\n"), []byte("\n")) {
		line = bytes.TrimSpace(line)
		if len(line) == 0 {
			continue
		}
		if !first {
			buf.WriteByte(',')
		}
		buf.Write(line)
		first = false
	}
	buf.WriteByte(']')
	return buf.Bytes()
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}

func metadataHandler(w http.ResponseWriter, r *http.Request) {
	bucket := os.Getenv("GCS_BUCKET")
	filename := os.Getenv("METADATA_FILENAME")
	data, err := cachedDownload(r.Context(), bucket, filename)
	if err != nil {
		log.Printf("metadata error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Vary", "Accept-Encoding")
	w.Header().Set("Content-Type", "application/json")
	w.Write(ndjsonToArray(data))
}

func datasetHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "Request missing required url param 'name'", http.StatusBadRequest)
		return
	}
	if strings.Contains(name, "..") {
		http.Error(w, "Invalid dataset name", http.StatusBadRequest)
		return
	}
	bucket := os.Getenv("GCS_BUCKET")
	data, err := cachedDownload(r.Context(), bucket, name)
	if err != nil {
		log.Printf("dataset error for %q: %v", name, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Disposition", "attachment; filename="+name)
	w.Header().Set("Vary", "Accept-Encoding")
	w.Header().Set("Cache-Control", cacheControlHeader)
	if strings.HasSuffix(name, ".csv") {
		w.Header().Set("Content-Type", "text/csv")
		w.Write(data)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(ndjsonToArray(data))
}
