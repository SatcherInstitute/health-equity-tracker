package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"
)

const (
	webflowBase            = "https://api-cdn.webflow.com/v2"
	webflowNewsCollectionID = "6811154eaf44a4127de5c768"
	webflowTagsCollectionID = "681260687cb93bd6bf4f782f"
	hetOrgID               = "ae155e605db764fb19ba82c7a5b4ac26"
	tagTTL                 = time.Hour
	newsTTL                = 5 * time.Minute
)

type webflowArticle struct {
	Title     string   `json:"title"`
	Author    *string  `json:"author"`
	Date      string   `json:"date"`
	Tags      []string `json:"tags"`
	Slug      string   `json:"slug"`
	Summary   *string  `json:"summary"`
	Thumbnail *string  `json:"thumbnail"`
}

type webflowState struct {
	mu            sync.RWMutex
	tagCache      map[string]string
	tagFetchTime  time.Time
	newsCache     []webflowArticle
	newsFetchTime time.Time
}

var wfState webflowState

var webflowClient = &http.Client{Timeout: 10 * time.Second}

func webflowHeaders() map[string]string {
	token := os.Getenv("WEBFLOW_API_TOKEN")
	return map[string]string{
		"Authorization": "Bearer " + token,
		"Accept":        "application/json",
	}
}

func webflowGet(url string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	for k, v := range webflowHeaders() {
		req.Header.Set(k, v)
	}
	return webflowClient.Do(req)
}

func getTagMap(forceRefresh bool) (map[string]string, error) {
	now := time.Now()

	wfState.mu.RLock()
	if !forceRefresh && wfState.tagCache != nil && now.Sub(wfState.tagFetchTime) < tagTTL {
		tags := wfState.tagCache
		wfState.mu.RUnlock()
		return tags, nil
	}
	stale := wfState.tagCache
	wfState.mu.RUnlock()

	resp, err := webflowGet(fmt.Sprintf("%s/collections/%s/items", webflowBase, webflowTagsCollectionID))
	if err != nil {
		if stale != nil {
			log.Print("[webflow-tags] API unreachable, serving stale cache.")
			return stale, nil
		}
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if stale != nil {
			log.Printf("[webflow-tags] API returned %d, serving stale cache.", resp.StatusCode)
			return stale, nil
		}
		return nil, fmt.Errorf("tags API error: %s", resp.Status)
	}

	var data struct {
		Items []struct {
			ID        string `json:"id"`
			FieldData struct {
				Name string `json:"name"`
			} `json:"fieldData"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		if stale != nil {
			return stale, nil
		}
		return nil, err
	}

	tags := make(map[string]string, len(data.Items))
	for _, item := range data.Items {
		tags[item.ID] = item.FieldData.Name
	}

	wfState.mu.Lock()
	wfState.tagCache = tags
	wfState.tagFetchTime = now
	wfState.mu.Unlock()

	return tags, nil
}

func hetNewsHandler(w http.ResponseWriter, r *http.Request) {
	if os.Getenv("WEBFLOW_API_TOKEN") == "" {
		http.Error(w, "Webflow API token not configured", http.StatusServiceUnavailable)
		return
	}

	now := time.Now()

	wfState.mu.RLock()
	if wfState.newsCache != nil && now.Sub(wfState.newsFetchTime) < newsTTL {
		articles := wfState.newsCache
		wfState.mu.RUnlock()
		writeJSON(w, map[string]any{"articles": articles})
		return
	}
	staleNews := wfState.newsCache
	wfState.mu.RUnlock()

	tagMap, err := getTagMap(false)
	if err != nil {
		log.Printf("[webflow-news] tag fetch error: %v", err)
		if staleNews != nil {
			log.Print("[webflow-news] serving stale news after tag error.")
			writeJSON(w, map[string]any{"articles": staleNews})
			return
		}
		http.Error(w, "Internal server error while fetching news articles.", http.StatusInternalServerError)
		return
	}

	resp, err := webflowGet(fmt.Sprintf("%s/collections/%s/items", webflowBase, webflowNewsCollectionID))
	if err != nil {
		log.Printf("[webflow-news] news fetch error: %v", err)
		if staleNews != nil {
			log.Print("[webflow-news] serving stale news after fetch error.")
			writeJSON(w, map[string]any{"articles": staleNews})
			return
		}
		http.Error(w, "Internal server error while fetching news articles.", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[webflow-news] API returned %d", resp.StatusCode)
		if staleNews != nil {
			writeJSON(w, map[string]any{"articles": staleNews})
			return
		}
		http.Error(w, "Internal server error while fetching news articles.", http.StatusInternalServerError)
		return
	}

	var data struct {
		Items []struct {
			FieldData struct {
				Name       string   `json:"name"`
				Author     *string  `json:"author"`
				Date       string   `json:"date"`
				Tags       []string `json:"tags"`
				Slug       string   `json:"slug"`
				PostSummary *string `json:"post-summary"`
				PrimaryOrg string   `json:"primary-org"`
				MainImage  *struct {
					URL string `json:"url"`
				} `json:"main-image"`
			} `json:"fieldData"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Printf("[webflow-news] decode error: %v", err)
		if staleNews != nil {
			writeJSON(w, map[string]any{"articles": staleNews})
			return
		}
		http.Error(w, "Internal server error while fetching news articles.", http.StatusInternalServerError)
		return
	}

	// Lazy tag cache invalidation: refresh if we find an unknown tag ID
	hasUnknownTag := false
	for _, item := range data.Items {
		for _, id := range item.FieldData.Tags {
			if _, ok := tagMap[id]; !ok {
				hasUnknownTag = true
				break
			}
		}
		if hasUnknownTag {
			break
		}
	}
	if hasUnknownTag {
		if refreshed, err := getTagMap(true); err == nil {
			tagMap = refreshed
		}
	}

	// Filter, sort, slice, and map to output shape
	type rawItem = struct {
		FieldData struct {
			Name       string   `json:"name"`
			Author     *string  `json:"author"`
			Date       string   `json:"date"`
			Tags       []string `json:"tags"`
			Slug       string   `json:"slug"`
			PostSummary *string `json:"post-summary"`
			PrimaryOrg string   `json:"primary-org"`
			MainImage  *struct {
				URL string `json:"url"`
			} `json:"main-image"`
		} `json:"fieldData"`
	}
	filtered := make([]rawItem, 0)
	for _, item := range data.Items {
		if item.FieldData.PrimaryOrg == hetOrgID {
			filtered = append(filtered, item)
		}
	}
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].FieldData.Date > filtered[j].FieldData.Date
	})
	if len(filtered) > 3 {
		filtered = filtered[:3]
	}

	articles := make([]webflowArticle, 0, len(filtered))
	for _, item := range filtered {
		f := item.FieldData
		tags := make([]string, 0, len(f.Tags))
		for _, id := range f.Tags {
			name := tagMap[id]
			if name == "" {
				name = id
			}
			tags = append(tags, name)
		}
		var thumbnail *string
		if f.MainImage != nil {
			thumbnail = &f.MainImage.URL
		}
		articles = append(articles, webflowArticle{
			Title:     f.Name,
			Author:    f.Author,
			Date:      f.Date,
			Tags:      tags,
			Slug:      f.Slug,
			Summary:   f.PostSummary,
			Thumbnail: thumbnail,
		})
	}

	wfState.mu.Lock()
	wfState.newsCache = articles
	wfState.newsFetchTime = now
	wfState.mu.Unlock()

	writeJSON(w, map[string]any{"articles": articles})
}
