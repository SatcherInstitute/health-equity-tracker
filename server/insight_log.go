package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"
)

// Outcomes of a single /fetch-ai-insight request. Every request records exactly
// one of these, so cache hit rate is a ratio over the three cache-relevant ones
// and needs no separate counter.
const (
	outcomeMemoryHit   = "memory_hit"
	outcomeGCSHit      = "gcs_hit"
	outcomeGenerated   = "generated"
	outcomeSuppressed  = "suppressed"
	outcomeUnavailable = "unavailable"
	outcomeRejected    = "rejected"
	outcomeError       = "error"

	// Not a request outcome: emitted on its own line when usage crosses the warn
	// threshold, which is the signal the ceiling alert matches on.
	outcomeCeilingApproaching = "ceiling_approaching"
)

// Reasons narrow an unavailable, rejected, or error outcome to the specific gate
// that produced it, so "no insight was shown" can be told apart from "the cap was
// reached" without reading the surrounding lines.
const (
	reasonMissingPrompt   = "missing_prompt"
	reasonPromptTooLarge  = "prompt_too_large"
	reasonNoCacheBucket   = "no_cache_bucket"
	reasonGenerationOff   = "generation_disabled"
	reasonNoAPIKey        = "no_api_key"
	reasonLedgerError     = "ledger_error"
	reasonCeilingReached  = "ceiling_reached"
	reasonProviderQuota   = "provider_quota"
	reasonProviderError   = "provider_error"
	reasonNoContent       = "no_content"
	reasonSuppressionRead = "suppression_check"
)

const insightTopicMaxLen = 64

// insightEvent is the queryable payload of one insight request. Fields are
// omitempty so a cache hit does not carry a wall of zeroed generation fields.
type insightEvent struct {
	Outcome string `json:"outcome"`
	Reason  string `json:"reason,omitempty"`

	CacheKey string `json:"cacheKey,omitempty"`
	Topic    string `json:"topic,omitempty"`

	// Set only on the generated path. Tokens are what the provider's free tier
	// meters, and are the input to a spend figure if this ever moves off it.
	Model        string `json:"model,omitempty"`
	PromptTokens int    `json:"promptTokens,omitempty"`
	OutputTokens int    `json:"outputTokens,omitempty"`

	DailyGenerations   int `json:"dailyGenerations,omitempty"`
	DailyLimit         int `json:"dailyLimit,omitempty"`
	MonthlyGenerations int `json:"monthlyGenerations,omitempty"`
	MonthlyLimit       int `json:"monthlyLimit,omitempty"`

	DurationMs int64 `json:"durationMs"`
}

// Written directly rather than through the log package: Cloud Logging only parses
// a stdout line as structured when the whole line is a JSON object, and log's
// date prefix would leave every line an unparsed string.
var insightLogOut io.Writer = os.Stdout

func insightSeverity(outcome string) string {
	switch outcome {
	case outcomeError:
		return "ERROR"
	case outcomeUnavailable:
		return "WARNING"
	default:
		return "INFO"
	}
}

func writeInsightLog(severity, message string, payload any) {
	line, err := json.Marshal(map[string]any{
		"severity": severity,
		"message":  message,
		"insight":  payload,
	})
	if err != nil {
		return
	}
	// One Write, so concurrent requests cannot interleave within a line.
	insightLogOut.Write(append(line, '\n'))
}

func logInsightEvent(ev *insightEvent, start time.Time) {
	ev.DurationMs = time.Since(start).Milliseconds()
	if len(ev.Topic) > insightTopicMaxLen {
		ev.Topic = ev.Topic[:insightTopicMaxLen]
	}
	writeInsightLog(insightSeverity(ev.Outcome), "insight "+ev.Outcome, ev)
}

// logCeilingApproach fires once per period, on the single request whose
// post-increment count lands on the threshold. The ledger's compare-and-swap
// hands out each count exactly once, so this cannot double-fire across instances
// and cannot degrade into a line per request for the rest of the period.
func logCeilingApproach(period string, count, limit int) {
	if limit <= 0 || count != ceilingWarnAt(limit) {
		return
	}
	writeInsightLog("WARNING",
		fmt.Sprintf("insight %s generation ceiling approaching: %d of %d", period, count, limit),
		map[string]any{
			"outcome":     outcomeCeilingApproaching,
			"period":      period,
			"generations": count,
			"limit":       limit,
		})
}
