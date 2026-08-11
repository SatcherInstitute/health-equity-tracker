package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"
)

// Descriptors carry the rendered rows of a whole report, so the ceiling is well
// above the prompt ceiling. The prompt itself is still checked separately after
// rendering, since that is what actually reaches the provider.
const insightDescriptorMaxBytes = 1024 * 1024

// The topic a generated insight is attributed to. A contrast prompt covers two,
// and the first is the one the reader chose first.
func (d *insightDescriptor) topic() string {
	if d.Kind == insightKindContrast && d.ViewA != nil {
		return d.ViewA.Topic
	}
	return d.Topic
}

// Serves an insight for a described view: the caller sends what it is showing,
// and the server renders the prompt, derives the cache key from it, and runs
// the suppression, cache, and generation flow.
//
// Prompt wording and key derivation live in one place. A template edit takes
// effect without a client deploy, and a client cannot mint a key that disagrees
// with the prompt it is for.
//
// A `preview` request stops after rendering and returns the prompt and key
// without generating. That is how a client checks that the server renders the
// same text it does, and it spends nothing to do it.
func insightHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	var ev insightEvent
	defer func() { logInsightEvent(&ev, start) }()

	var req struct {
		insightDescriptor
		Preview bool `json:"preview"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, insightDescriptorMaxBytes)).Decode(&req); err != nil {
		ev.Outcome, ev.Reason = outcomeRejected, reasonBadDescriptor
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, `{"error":"Malformed descriptor"}`, http.StatusBadRequest)
		return
	}
	desc := &req.insightDescriptor
	ev.Topic = desc.topic()

	prompt, err := renderInsightPrompt(desc)
	if err != nil {
		ev.Outcome, ev.Reason = outcomeRejected, reasonBadDescriptor
		writeJSONStatus(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if len(prompt) > insightPromptMaxBytes {
		ev.Outcome, ev.Reason = outcomeRejected, reasonPromptTooLarge
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, `{"error":"Prompt too large"}`, http.StatusRequestEntityTooLarge)
		return
	}

	cacheKey := sanitizeInsightKey(desc.cacheKey(prompt))

	if req.Preview {
		ev.Outcome, ev.CacheKey = outcomePreview, cacheKey
		writeJSON(w, map[string]string{"cacheKey": cacheKey, "prompt": prompt})
		return
	}

	content, ok := resolveInsight(w, r, &ev, prompt, cacheKey, desc.topic(), desc.Kind)
	if !ok {
		return
	}
	// The key rides along because flagging an insight needs it, and the client no
	// longer builds it. The prompt does not: it is up to 30 KB the client has no
	// use for, and preview returns it for the cases that do.
	writeJSON(w, map[string]string{"content": content, "cacheKey": cacheKey})
}
