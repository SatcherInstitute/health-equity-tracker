package main

import (
	"encoding/json"
	"errors"
	"strings"
)

// Every insight surface returns the same envelope: a map of section key to
// {text, highlight}. A card or contrast carries one section, a report carries
// four, so one parser and one renderer on the client serve all three.
const singleInsightKey = "insight"

var reportInsightKeys = []string{
	"keyFindings",
	"locationComparison",
	"demographicInsights",
	"whatThisMeans",
}

type insightSection struct {
	Text      string `json:"text"`
	Highlight string `json:"highlight,omitempty"`
}

var errInsightMalformed = errors.New("insight response missing its expected sections")

var insightFenceReplacer = strings.NewReplacer("```json", "", "```", "")

func stripInsightFences(raw string) string {
	return strings.TrimSpace(insightFenceReplacer.Replace(raw))
}

// A highlight the model paraphrased instead of quoting cannot be located in the
// text, and one covering the whole sentence would underline everything. Both
// degrade to no highlight rather than to a wrong one.
func toInsightSection(value any) (insightSection, bool) {
	switch v := value.(type) {
	case string:
		return insightSection{Text: v}, true
	case map[string]any:
		text, ok := v["text"].(string)
		if !ok {
			return insightSection{}, false
		}
		highlight, _ := v["highlight"].(string)
		usable := strings.TrimSpace(highlight) != "" &&
			strings.Contains(text, highlight) &&
			strings.TrimSpace(highlight) != strings.TrimSpace(text)
		if !usable {
			return insightSection{Text: text}, true
		}
		return insightSection{Text: text, Highlight: highlight}, true
	}
	return insightSection{}, false
}

func parseInsightSections(raw string, keys []string) (map[string]insightSection, bool) {
	var parsed map[string]any
	if err := json.Unmarshal([]byte(stripInsightFences(raw)), &parsed); err != nil {
		return nil, false
	}
	sections := make(map[string]insightSection, len(keys))
	for _, key := range keys {
		section, ok := toInsightSection(parsed[key])
		if !ok {
			return nil, false
		}
		sections[key] = section
	}
	return sections, true
}

// Repairs whatever the model returned into the envelope once, here, rather than
// at every render site. The normalized form is what gets cached, so a shape the
// model only occasionally gets wrong cannot persist for the full TTL.
func normalizeInsightResponse(raw, kind string) (string, error) {
	keys := []string{singleInsightKey}
	if kind == insightKindReport {
		keys = reportInsightKeys
	}

	sections, ok := parseInsightSections(raw, keys)
	if !ok {
		// A one-section surface can always fall back to the sentence the model
		// wrote: it loses the highlight and nothing else. A report cannot, since
		// there is no way to split one string into four sections.
		if kind == insightKindReport {
			return "", errInsightMalformed
		}
		sections = map[string]insightSection{singleInsightKey: {Text: strings.TrimSpace(raw)}}
	}

	out, err := json.Marshal(sections)
	if err != nil {
		return "", err
	}
	return string(out), nil
}
