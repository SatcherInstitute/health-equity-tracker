package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// no-cache + ETag lets browsers revalidate on every request while still getting
// cheap 304s when the data has not changed. The previous max-age=7200 meant a
// browser that fetched before a DAG rerun held the old payload for two hours
// regardless of what the server did.
const cacheControlHeader = "no-cache"

var datasetCache = newByteCache(maxCacheBytes, cacheTTL)

// gcsDownload fetches an object and its GCS generation number in one round trip.
// Tests replace it with a mock.
var gcsDownload = func(ctx context.Context, bucket, name string) ([]byte, int64, error) {
	return downloadBlobWithGeneration(ctx, bucket, name)
}

// gcsGeneration fetches only the GCS generation number (metadata-only request).
// Tests replace it with a mock.
var gcsGeneration = func(ctx context.Context, bucket, name string) (int64, error) {
	return getGCSGeneration(ctx, bucket, name)
}

// cachedDownload returns cached bytes and the GCS generation number for the object.
// On a cache hit it checks GCS metadata every checkInterval to detect DAG rewrites
// without waiting out the full cacheTTL.
func cachedDownload(ctx context.Context, bucket, name string) ([]byte, int64, error) {
	if data, gen, checkedAt, ok := datasetCache.getWithMeta(name); ok {
		if time.Since(checkedAt) < checkInterval {
			return data, gen, nil
		}
		currentGen, err := gcsGeneration(ctx, bucket, name)
		if err != nil {
			// Serve stale on transient metadata failure; touch so we don't hammer GCS every request.
			datasetCache.touch(name)
			return data, gen, nil
		}
		if currentGen == gen {
			datasetCache.touch(name)
			return data, gen, nil
		}
		// Object was rewritten by a DAG run; fetch the new version.
		dlCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()
		newData, actualGen, fetchErr := gcsDownload(dlCtx, bucket, name)
		if fetchErr != nil {
			// Serve stale rather than 500 — cache still holds a consistent data/generation pair.
			return data, gen, nil
		}
		datasetCache.set(name, newData, actualGen)
		return newData, actualGen, nil
	}
	dlCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	data, gen, err := gcsDownload(dlCtx, bucket, name)
	if err != nil {
		return nil, 0, err
	}
	datasetCache.set(name, data, gen)
	return data, gen, nil
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

// corsMiddleware allows any origin because the dataset routes are public; /insight
// and /flag-insight restrict origins separately via insightOriginOnly.
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
	data, _, err := cachedDownload(r.Context(), bucket, filename)
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
	data, gen, err := cachedDownload(r.Context(), bucket, name)
	if err != nil {
		log.Printf("dataset error for %q: %v", name, err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	etag := fmt.Sprintf(`"%d"`, gen)
	w.Header().Set("Content-Disposition", "attachment; filename="+name)
	w.Header().Set("Vary", "Accept-Encoding")
	w.Header().Set("Cache-Control", cacheControlHeader)
	w.Header().Set("ETag", etag)
	if r.Header.Get("If-None-Match") == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}
	if strings.HasSuffix(name, ".csv") {
		w.Header().Set("Content-Type", "text/csv")
		w.Write(data)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(ndjsonToArray(data))
}
