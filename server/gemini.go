package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	geminiAPIBase         = "https://generativelanguage.googleapis.com/v1beta/models/"
	geminiModelDefault    = "gemini-3.1-flash-lite"
	geminiMaxOutputTokens = 1024
	geminiTimeout         = 30 * time.Second
)

var (
	// errInsightQuota means the provider refused on quota grounds. Callers map
	// this to the same 429 contract the frontend already understands.
	errInsightQuota = errors.New("insight provider quota exhausted")
	// errInsightNoContent means the call succeeded but yielded no usable text,
	// which happens when a safety or token-limit finish reason fires.
	errInsightNoContent = errors.New("insight provider returned no content")
)

type insightGeneration struct {
	text         string
	promptTokens int
	outputTokens int
}

// generateInsight is a package-level var so tests can substitute a fake,
// matching the gcsDownload pattern in handlers.go.
var generateInsight = callGemini

func geminiModel() string {
	if m := os.Getenv("GEMINI_MODEL"); m != "" {
		return m
	}
	return geminiModelDefault
}

// Health equity reporting necessarily describes race, incarceration, and disease
// outcomes. Gemini's default thresholds filter that as harassment or hate speech,
// so the categories that overlap our subject matter are relaxed to high-only.
func geminiSafetySettings() []map[string]string {
	categories := []string{
		"HARM_CATEGORY_HARASSMENT",
		"HARM_CATEGORY_HATE_SPEECH",
		"HARM_CATEGORY_SEXUALLY_EXPLICIT",
		"HARM_CATEGORY_DANGEROUS_CONTENT",
	}
	settings := make([]map[string]string, 0, len(categories))
	for _, c := range categories {
		settings = append(settings, map[string]string{
			"category":  c,
			"threshold": "BLOCK_ONLY_HIGH",
		})
	}
	return settings
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
	UsageMetadata struct {
		PromptTokenCount     int `json:"promptTokenCount"`
		CandidatesTokenCount int `json:"candidatesTokenCount"`
	} `json:"usageMetadata"`
	PromptFeedback struct {
		BlockReason string `json:"blockReason"`
	} `json:"promptFeedback"`
}

// parseGeminiResponse joins every text part of the first candidate. Gemini may
// split a single reply across parts, and may return a candidate with no parts at
// all when it stops early, so an empty result is a normal outcome rather than a
// malformed payload.
func parseGeminiResponse(raw []byte) (insightGeneration, error) {
	var resp geminiResponse
	if err := json.Unmarshal(raw, &resp); err != nil {
		return insightGeneration{}, fmt.Errorf("decode insight response: %w", err)
	}

	out := insightGeneration{
		promptTokens: resp.UsageMetadata.PromptTokenCount,
		outputTokens: resp.UsageMetadata.CandidatesTokenCount,
	}

	if reason := resp.PromptFeedback.BlockReason; reason != "" {
		log.Printf("[insight] prompt blocked upstream: %s", reason)
		return out, errInsightNoContent
	}
	if len(resp.Candidates) == 0 {
		return out, errInsightNoContent
	}

	candidate := resp.Candidates[0]
	var sb strings.Builder
	for _, part := range candidate.Content.Parts {
		sb.WriteString(part.Text)
	}
	out.text = strings.TrimSpace(sb.String())

	if out.text == "" {
		// Surfaced rather than swallowed so filtered topics are diagnosable.
		log.Printf("[insight] no text returned, finishReason=%q", candidate.FinishReason)
		return out, errInsightNoContent
	}
	return out, nil
}

func callGemini(ctx context.Context, apiKey, system, prompt string) (insightGeneration, error) {
	reqBody, err := json.Marshal(map[string]any{
		"systemInstruction": map[string]any{
			"parts": []map[string]string{{"text": system}},
		},
		"contents": []map[string]any{{
			"role":  "user",
			"parts": []map[string]string{{"text": prompt}},
		}},
		"generationConfig": map[string]any{
			"maxOutputTokens": geminiMaxOutputTokens,
		},
		"safetySettings": geminiSafetySettings(),
	})
	if err != nil {
		return insightGeneration{}, fmt.Errorf("encode insight request: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, geminiTimeout)
	defer cancel()

	url := geminiAPIBase + geminiModel() + ":generateContent"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(reqBody))
	if err != nil {
		return insightGeneration{}, fmt.Errorf("build insight request: %w", err)
	}
	// Header rather than a ?key= query param, so the credential never lands in
	// request logs or error strings that echo the URL.
	req.Header.Set("x-goog-api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return insightGeneration{}, fmt.Errorf("insight request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	if err != nil {
		return insightGeneration{}, fmt.Errorf("read insight response: %w", err)
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		return insightGeneration{}, errInsightQuota
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// Body is logged but never returned to the caller, since upstream error
		// payloads can echo request content.
		log.Printf("[insight] provider returned %d: %s", resp.StatusCode, body)
		return insightGeneration{}, fmt.Errorf("insight provider status %d", resp.StatusCode)
	}

	return parseGeminiResponse(body)
}
