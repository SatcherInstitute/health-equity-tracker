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

// A var rather than a const so tests can point the model chain at a fake
// server, matching the gcsDownload pattern in handlers.go.
var geminiAPIBase = "https://generativelanguage.googleapis.com/v1beta/models/"

const (
	// A comma-separated fallback chain, tried in order. Every entry must be a
	// free-tier text model, since this feature is budgeted at $0 (see the quota
	// ceilings in config/variables.tf) and a paid model would silently start
	// billing. Order is by measured availability, then by how tight the model's
	// own free per-minute limit is: gemini-3.6-flash returned a 429 during
	// probing where the two 3.5 models did not, so it sits last.
	// Deliberately pinned names rather than the gemini-flash-lite-latest alias,
	// whose target can change with no deploy and no prompt change.
	geminiModelDefault    = "gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.6-flash"
	geminiMaxOutputTokens = 1024
	// Budget for the whole chain, not one call. A generation that is genuinely
	// running is a success worth waiting for (measured up to 54s), while the
	// failure this chain exists to route around returns in under 11s, so a
	// single shared deadline lets a slow success finish and still leaves room to
	// fall through several fast failures.
	geminiTimeout = 75 * time.Second
	// Same-model attempts before advancing to the next model. Kept low because a
	// different model is a strictly better retry than the same one: "high
	// demand" 503s are correlated capacity windows, so a second attempt against
	// the model that just refused usually refuses again.
	geminiMaxAttempts = 2
	geminiRetryDelay  = 2 * time.Second
)

var (
	// errInsightQuota means the provider refused on quota grounds. Callers map
	// this to the same 429 contract the frontend already understands.
	errInsightQuota = errors.New("insight provider quota exhausted")
	// errInsightNoContent means the call succeeded but yielded no usable text,
	// which happens when a safety or token-limit finish reason fires.
	errInsightNoContent = errors.New("insight provider returned no content")
	// errInsightCapacity is the "high demand" 503, returned once a single model
	// has used up its attempts. Distinct from the others so the chain knows this
	// model is full rather than misconfigured.
	errInsightCapacity = errors.New("insight provider at capacity")
	// errInsightModelMissing is a 404 on the model name. A chain entry that this
	// key cannot call must not take the whole request down with it, so it is
	// treated as an availability failure and skipped.
	errInsightModelMissing = errors.New("insight model not available")
)

type insightGeneration struct {
	text         string
	promptTokens int
	outputTokens int
	// model is the chain entry that actually answered, which is not necessarily
	// the first one. The insight log reports this rather than the configured
	// head of the chain, so a reader can tell which model wrote a given insight.
	model string
}

// generateInsight is a package-level var so tests can substitute a fake,
// matching the gcsDownload pattern in handlers.go.
var generateInsight = callGemini

// geminiModels parses GEMINI_MODEL as a comma-separated fallback chain. A single
// name is a one-entry chain, so an environment that predates the chain keeps
// working unchanged.
func geminiModels() []string {
	raw := os.Getenv("GEMINI_MODEL")
	if strings.TrimSpace(raw) == "" {
		raw = geminiModelDefault
	}
	models := make([]string, 0, 3)
	for _, m := range strings.Split(raw, ",") {
		if m = strings.TrimSpace(m); m != "" {
			models = append(models, m)
		}
	}
	// An env var of only commas or whitespace would otherwise disable generation
	// entirely, which is a worse outcome than ignoring it.
	if len(models) == 0 {
		return strings.Split(geminiModelDefault, ",")
	}
	return models
}

// Health equity reporting necessarily describes disease and incarceration
// outcomes tied to demographic data, which can trip Gemini's default
// thresholds for content unrelated to race or protected groups. Those two
// categories are relaxed to high-only. HARASSMENT and HATE_SPEECH are left at
// Gemini's own default (medium-and-above): an insight blocked as hateful or
// stereotyped is never shown to a reader (a blocked generation renders no
// insight section rather than an error), so a missed insight is always the
// safer outcome than a permissive threshold on these two categories.
func geminiSafetySettings() []map[string]string {
	thresholds := map[string]string{
		"HARM_CATEGORY_HARASSMENT":        "BLOCK_MEDIUM_AND_ABOVE",
		"HARM_CATEGORY_HATE_SPEECH":       "BLOCK_MEDIUM_AND_ABOVE",
		"HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_ONLY_HIGH",
		"HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_ONLY_HIGH",
	}
	settings := make([]map[string]string, 0, len(thresholds))
	for category, threshold := range thresholds {
		settings = append(settings, map[string]string{
			"category":  category,
			"threshold": threshold,
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

// callGemini walks the model chain until one answers. The deadline is set here
// rather than per model so a slow generation can use the whole budget, while a
// chain of fast refusals still gets through every entry.
func callGemini(ctx context.Context, apiKey, system, prompt string) (insightGeneration, error) {
	ctx, cancel := context.WithTimeout(ctx, geminiTimeout)
	defer cancel()

	models := geminiModels()
	var lastErr error
	// Both are tracked because the two outcomes carry different contracts: the
	// caller releases the reserved slot and answers 429 only when quota is the
	// whole story. A chain that also hit capacity may well have generated
	// nothing too, but that is not provable, so the slot stays spent.
	sawQuota := false
	sawCapacity := false
	// The models actually called, so a failure names what was tried rather than
	// what was configured. The shared deadline can end the walk early, leaving
	// later entries untouched.
	attempted := make([]string, 0, len(models))

	for i, model := range models {
		if ctx.Err() != nil {
			break
		}
		attempted = append(attempted, model)
		out, err := doCallGemini(ctx, apiKey, system, prompt, geminiAPIBase+model+":generateContent")
		if err == nil {
			out.model = model
			if i > 0 {
				log.Printf("[insight] %s answered after %d earlier model(s) failed", model, i)
			}
			return out, nil
		}

		// Only availability failures advance. A malformed request or a blocked
		// prompt fails identically on every model, so walking the chain would
		// just spend the budget to learn the same thing three times.
		switch {
		case errors.Is(err, errInsightQuota):
			sawQuota = true
		case errors.Is(err, errInsightCapacity), errors.Is(err, errInsightModelMissing):
			sawCapacity = true
		default:
			out.model = model
			return out, err
		}

		log.Printf("[insight] model %s unavailable (%v), trying next of %d", model, err, len(models))
		lastErr = err
	}

	failed := insightGeneration{model: strings.Join(attempted, ",")}

	switch {
	case sawQuota && !sawCapacity:
		// Quota only when every failure was quota: it is the one outcome the
		// caller answers by handing the reserved ledger slot back, and a
		// capacity failure has not proven nothing was generated.
		return failed, errInsightQuota
	case sawCapacity && errors.Is(lastErr, errInsightQuota):
		// doCallGemini returns errInsightQuota unwrapped, so a chain whose
		// *last* entry 429s would otherwise leak quota through the fallback
		// return below and release the slot regardless of what the earlier
		// entries did. Gating the branch above is not enough on its own.
		return failed, errInsightCapacity
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("insight request: %w", ctx.Err())
	}
	return failed, lastErr
}

func doCallGemini(ctx context.Context, apiKey, system, prompt, url string) (insightGeneration, error) {
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

	var lastErr error
	for attempt := range geminiMaxAttempts {
		if attempt > 0 {
			select {
			case <-ctx.Done():
				return insightGeneration{}, fmt.Errorf("insight request: %w", ctx.Err())
			case <-time.After(geminiRetryDelay):
			}
		}

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
			// Wrapped as capacity so a connection-level failure advances the
			// chain rather than ending the request on one unreachable model.
			lastErr = fmt.Errorf("insight request: %w: %w", errInsightCapacity, err)
			continue
		}

		body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
		resp.Body.Close()
		if err != nil {
			return insightGeneration{}, fmt.Errorf("read insight response: %w", err)
		}
		// Cloud Run ships one log entry per newline. An error body that is
		// pretty-printed JSON gets split across entries, making the 503 reason
		// invisible. Collapse to a single line for every log call below.
		logBody := strings.NewReplacer("\n", " ", "\r", "").Replace(string(body))

		if resp.StatusCode == http.StatusTooManyRequests {
			// Not retried against this model: a spent free-tier limit does not
			// clear in seconds. The caller advances to the next model, whose
			// limits are counted separately.
			return insightGeneration{}, errInsightQuota
		}
		if resp.StatusCode == http.StatusNotFound {
			// A name this key cannot call. Logged because it means the chain is
			// misconfigured even though the request may still succeed.
			log.Printf("[insight] model not found at %s: %s", url, logBody)
			return insightGeneration{}, errInsightModelMissing
		}
		if resp.StatusCode == http.StatusServiceUnavailable {
			// Capacity 503: retry after a short delay. Log on the last attempt only.
			if attempt == geminiMaxAttempts-1 {
				log.Printf("[insight] provider returned 503 after %d attempts: %s", geminiMaxAttempts, logBody)
			}
			lastErr = errInsightCapacity
			continue
		}
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			// Body is logged but never returned to the caller, since upstream error
			// payloads can echo request content.
			log.Printf("[insight] provider returned %d: %s", resp.StatusCode, logBody)
			return insightGeneration{}, fmt.Errorf("insight provider status %d", resp.StatusCode)
		}

		return parseGeminiResponse(body)
	}

	return insightGeneration{}, lastErr
}
