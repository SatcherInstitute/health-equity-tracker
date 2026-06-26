package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"cloud.google.com/go/storage"
)

const (
	insightKeyMaxLen    = 500
	insightTTLMs        = 180 * 24 * 60 * 60 * 1000 // 6 months in milliseconds
	maxFlaggedExamples  = 10

	flagStatusFlagged    = "flagged"
	flagStatusSuppressed = "suppressed"
	flagStatusPermanent  = "permanent"
	flagStatusReenabled  = "reenabled"
)

var (
	validFlagReasons  = map[string]bool{"inaccurate": true, "misleading": true, "offensive": true, "other": true}
	validFlagStatuses = map[string]bool{
		flagStatusFlagged: true, flagStatusSuppressed: true,
		flagStatusPermanent: true, flagStatusReenabled: true,
	}
	suppressingStatuses    = map[string]bool{flagStatusSuppressed: true, flagStatusPermanent: true}
	negativeExampleStatuses = map[string]bool{
		flagStatusFlagged: true, flagStatusSuppressed: true, flagStatusPermanent: true,
	}
)

func validateInsightKey(key string) bool {
	return key != "" && len(key) <= insightKeyMaxLen && !strings.Contains(key, "..")
}

func jsonBody(r *http.Request) map[string]any {
	var body map[string]any
	if err := json.NewDecoder(io.LimitReader(r.Body, 1024*1024)).Decode(&body); err != nil {
		return map[string]any{}
	}
	return body
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func flaggedRecord(ctx context.Context, flaggedBucket, key string) (map[string]any, error) {
	data, err := downloadBlob(ctx, flaggedBucket, key+".json")
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, nil
		}
		return nil, err
	}
	var record map[string]any
	if err := json.Unmarshal(data, &record); err != nil {
		return nil, err
	}
	return record, nil
}

func cachedInsightContent(ctx context.Context, cacheBucket, key string) string {
	if cacheBucket == "" {
		return ""
	}
	data, err := downloadBlob(ctx, cacheBucket, "insights/"+key+".json")
	if err != nil {
		return ""
	}
	var payload map[string]any
	if err := json.Unmarshal(data, &payload); err != nil {
		return ""
	}
	content, _ := payload["content"].(string)
	return content
}

func getInsightCacheHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if !validateInsightKey(key) {
		http.Error(w, "Request missing or invalid required url param 'key'", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	flaggedBucket := os.Getenv("FLAGGED_INSIGHTS_BUCKET")
	if flaggedBucket != "" {
		record, err := flaggedRecord(ctx, flaggedBucket, key)
		if err != nil {
			log.Printf("flag record error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		if record != nil {
			if status, _ := record["status"].(string); suppressingStatuses[status] {
				writeJSON(w, map[string]bool{"suppressed": true})
				return
			}
		}
	}

	cacheBucket := os.Getenv("INSIGHTS_CACHE_BUCKET")
	if cacheBucket == "" {
		http.Error(w, "Insights cache not configured", http.StatusServiceUnavailable)
		return
	}

	data, err := downloadBlob(ctx, cacheBucket, "insights/"+key+".json")
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		log.Printf("insight cache read error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	var payload map[string]any
	if err := json.Unmarshal(data, &payload); err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	ts, _ := payload["timestamp"].(float64)
	if int64(time.Now().UnixMilli())-int64(ts) >= insightTTLMs {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	writeJSON(w, payload)
}

func putInsightCacheHandler(w http.ResponseWriter, r *http.Request) {
	body := jsonBody(r)
	key, _ := body["key"].(string)
	content, _ := body["content"].(string)
	if !validateInsightKey(key) || content == "" {
		http.Error(w, "Request body missing or invalid 'key' or 'content'", http.StatusBadRequest)
		return
	}

	cacheBucket := os.Getenv("INSIGHTS_CACHE_BUCKET")
	if cacheBucket == "" {
		http.Error(w, "Insights cache not configured", http.StatusServiceUnavailable)
		return
	}

	payload, _ := json.Marshal(map[string]any{
		"content":   content,
		"timestamp": time.Now().UnixMilli(),
	})

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	if err := uploadBlob(ctx, cacheBucket, "insights/"+key+".json", payload, "application/json"); err != nil {
		log.Printf("insight cache write error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func flagInsightHandler(w http.ResponseWriter, r *http.Request) {
	body := jsonBody(r)
	key, _ := body["key"].(string)
	reason, _ := body["reason"].(string)
	if !validateInsightKey(key) || !validFlagReasons[reason] {
		http.Error(w, "Request body missing or invalid 'key' or 'reason'", http.StatusBadRequest)
		return
	}

	flaggedBucket := os.Getenv("FLAGGED_INSIGHTS_BUCKET")
	if flaggedBucket == "" {
		http.Error(w, "Insight flagging not configured", http.StatusServiceUnavailable)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	// Preserve existing suppression status if key was already suppressed/permanent
	status := flagStatusFlagged
	if existing, err := flaggedRecord(ctx, flaggedBucket, key); err != nil {
		log.Printf("flagged record read error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	} else if existing != nil {
		if existingStatus, _ := existing["status"].(string); suppressingStatuses[existingStatus] {
			status = existingStatus
		}
	}

	cacheBucket := os.Getenv("INSIGHTS_CACHE_BUCKET")
	content := cachedInsightContent(ctx, cacheBucket, key)

	note, _ := body["note"].(string)
	topic, _ := body["topic"].(string)
	if len(note) > 1000 {
		note = note[:1000]
	}
	if len(content) > 5000 {
		content = content[:5000]
	}
	if len(topic) > 200 {
		topic = topic[:200]
	}

	record, _ := json.Marshal(map[string]any{
		"key":       key,
		"reason":    reason,
		"note":      note,
		"content":   content,
		"topic":     topic,
		"status":    status,
		"timestamp": time.Now().UnixMilli(),
	})

	if err := uploadBlob(ctx, flaggedBucket, key+".json", record, "application/json"); err != nil {
		log.Printf("flag write error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if cacheBucket != "" {
		if err := deleteBlob(ctx, cacheBucket, "insights/"+key+".json"); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
			log.Printf("failed to delete cached insight after flagging: %v", err)
		}
	}
	w.WriteHeader(http.StatusNoContent)
}

func getFlaggedExamplesHandler(w http.ResponseWriter, r *http.Request) {
	flaggedBucket := os.Getenv("FLAGGED_INSIGHTS_BUCKET")
	if flaggedBucket == "" {
		writeJSON(w, map[string]any{"examples": []any{}})
		return
	}

	topic := r.URL.Query().Get("topic")

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	blobs, err := listBlobsMeta(ctx, flaggedBucket)
	if err != nil {
		log.Printf("list blobs error: %v", err)
		writeJSON(w, map[string]any{"examples": []any{}})
		return
	}

	sort.Slice(blobs, func(i, j int) bool {
		return blobs[i].Updated.After(blobs[j].Updated)
	})

	var examples []map[string]any
	for _, blob := range blobs {
		if len(examples) >= maxFlaggedExamples {
			break
		}
		if !strings.HasSuffix(blob.Name, ".json") {
			continue
		}
		data, err := blob.download(ctx)
		if err != nil {
			continue
		}
		var record map[string]any
		if err := json.Unmarshal(data, &record); err != nil {
			continue
		}
		status, _ := record["status"].(string)
		if !negativeExampleStatuses[status] {
			continue
		}
		if topic != "" {
			if t, _ := record["topic"].(string); t != topic {
				continue
			}
		}
		content, _ := record["content"].(string)
		if content == "" {
			continue
		}
		examples = append(examples, map[string]any{
			"reason":  record["reason"],
			"content": content,
		})
	}

	if examples == nil {
		examples = []map[string]any{}
	}
	writeJSON(w, map[string]any{"examples": examples})
}

func listFlaggedInsightsHandler(w http.ResponseWriter, r *http.Request) {
	flaggedBucket := os.Getenv("FLAGGED_INSIGHTS_BUCKET")
	if flaggedBucket == "" {
		http.Error(w, "Insight flagging not configured", http.StatusServiceUnavailable)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	blobs, err := listBlobsMeta(ctx, flaggedBucket)
	if err != nil {
		log.Printf("list flagged insights error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	var mu sync.Mutex
	var records []map[string]any
	sem := make(chan struct{}, 10) // Limit concurrent downloads
	var wg sync.WaitGroup

	for _, blob := range blobs {
		if !strings.HasSuffix(blob.Name, ".json") {
			continue
		}
		wg.Add(1)
		go func(b *blobMeta) {
			defer wg.Done()
			sem <- struct{}{}        // Acquire
			defer func() { <-sem }() // Release

			data, err := b.download(ctx)
			if err != nil {
				return
			}
			var record map[string]any
			if err := json.Unmarshal(data, &record); err != nil {
				return
			}
			mu.Lock()
			records = append(records, record)
			mu.Unlock()
		}(blob)
	}
	wg.Wait()

	sort.Slice(records, func(i, j int) bool {
		ti, _ := records[i]["timestamp"].(float64)
		tj, _ := records[j]["timestamp"].(float64)
		return ti > tj
	})

	if records == nil {
		records = []map[string]any{}
	}
	writeJSON(w, map[string]any{"flagged": records})
}

func updateFlaggedInsightHandler(w http.ResponseWriter, r *http.Request) {
	body := jsonBody(r)
	key, _ := body["key"].(string)
	status, _ := body["status"].(string)
	if !validateInsightKey(key) || !validFlagStatuses[status] {
		http.Error(w, "Request body missing or invalid 'key' or 'status'", http.StatusBadRequest)
		return
	}

	flaggedBucket := os.Getenv("FLAGGED_INSIGHTS_BUCKET")
	if flaggedBucket == "" {
		http.Error(w, "Insight flagging not configured", http.StatusServiceUnavailable)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	record, err := flaggedRecord(ctx, flaggedBucket, key)
	if err != nil {
		log.Printf("flagged record read error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if record == nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	record["status"] = status
	record["statusUpdatedAt"] = time.Now().UnixMilli()

	data, _ := json.Marshal(record)
	if err := uploadBlob(ctx, flaggedBucket, key+".json", data, "application/json"); err != nil {
		log.Printf("flag update write error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if status == flagStatusReenabled {
		cacheBucket := os.Getenv("INSIGHTS_CACHE_BUCKET")
		if cacheBucket != "" {
			if err := deleteBlob(ctx, cacheBucket, "insights/"+key+".json"); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
				log.Printf("failed to delete cached insight on re-enable: %v", err)
			}
		}
	}

	writeJSON(w, record)
}
