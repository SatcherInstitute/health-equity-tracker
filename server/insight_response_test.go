package main

import (
	"errors"
	"testing"
)

// What the model actually sends back varies more than the prompt asks for, and
// the normalized form is what gets cached, so a shape only occasionally gotten
// wrong must not be able to persist for the full TTL.
func TestNormalizeInsightResponse(t *testing.T) {
	tests := []struct {
		name string
		raw  string
		kind string
		want string
	}{
		{
			name: "card envelope keeps a verbatim highlight",
			raw:  `{"insight":{"text":"Black residents are nearly twice as likely to be diagnosed.","highlight":"nearly twice as likely"}}`,
			kind: insightKindCard,
			want: `{"insight":{"text":"Black residents are nearly twice as likely to be diagnosed.","highlight":"nearly twice as likely"}}`,
		},
		{
			name: "fences are stripped before parsing",
			raw:  "```json\n{\"insight\":{\"text\":\"A sentence.\",\"highlight\":\"A sentence\"}}\n```",
			kind: insightKindCard,
			want: `{"insight":{"text":"A sentence.","highlight":"A sentence"}}`,
		},
		{
			// Paraphrased rather than quoted, so the client could not locate it.
			name: "highlight absent from the text is dropped",
			raw:  `{"insight":{"text":"Rates differ sharply by group.","highlight":"rates vary widely"}}`,
			kind: insightKindCard,
			want: `{"insight":{"text":"Rates differ sharply by group."}}`,
		},
		{
			name: "highlight covering the whole sentence is dropped",
			raw:  `{"insight":{"text":"Rates differ sharply by group.","highlight":"Rates differ sharply by group."}}`,
			kind: insightKindCard,
			want: `{"insight":{"text":"Rates differ sharply by group."}}`,
		},
		{
			name: "whitespace-only highlight is dropped",
			raw:  `{"insight":{"text":"Rates differ sharply by group.","highlight":"   "}}`,
			kind: insightKindCard,
			want: `{"insight":{"text":"Rates differ sharply by group."}}`,
		},
		{
			// The shape the card returned before the envelope shipped.
			name: "bare sentence becomes a one-section envelope",
			raw:  "  Rates differ sharply by group.  ",
			kind: insightKindCard,
			want: `{"insight":{"text":"Rates differ sharply by group."}}`,
		},
		{
			name: "bare string section is coerced to an object",
			raw:  `{"insight":"Rates differ sharply by group."}`,
			kind: insightKindCard,
			want: `{"insight":{"text":"Rates differ sharply by group."}}`,
		},
		{
			name: "a JSON array falls back to the raw text",
			raw:  `["Rates differ sharply by group."]`,
			kind: insightKindContrast,
			want: `{"insight":{"text":"[\"Rates differ sharply by group.\"]"}}`,
		},
		{
			name: "report keeps every section",
			raw:  `{"keyFindings":{"text":"One.","highlight":"One"},"locationComparison":{"text":"Two."},"demographicInsights":{"text":"Three."},"whatThisMeans":{"text":"Four."}}`,
			kind: insightKindReport,
			want: `{"demographicInsights":{"text":"Three."},"keyFindings":{"text":"One.","highlight":"One"},"locationComparison":{"text":"Two."},"whatThisMeans":{"text":"Four."}}`,
		},
		{
			name: "report of bare strings is coerced section by section",
			raw:  `{"keyFindings":"One.","locationComparison":"Two.","demographicInsights":"Three.","whatThisMeans":"Four."}`,
			kind: insightKindReport,
			want: `{"demographicInsights":{"text":"Three."},"keyFindings":{"text":"One."},"locationComparison":{"text":"Two."},"whatThisMeans":{"text":"Four."}}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := normalizeInsightResponse(tt.raw, tt.kind)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("got  %s\nwant %s", got, tt.want)
			}
		})
	}
}

// A card can always fall back to the sentence the model wrote, losing the
// highlight and nothing else. A report cannot: its four sections render
// separately and there is no way to split one string into them.
func TestNormalizeInsightResponseRejectsIncompleteReport(t *testing.T) {
	tests := map[string]string{
		"bare sentence":                      "Rates differ sharply by group.",
		"missing a key":                      `{"keyFindings":{"text":"One."},"locationComparison":{"text":"Two."},"demographicInsights":{"text":"Three."}}`,
		"section is not an object or string": `{"keyFindings":42,"locationComparison":"Two.","demographicInsights":"Three.","whatThisMeans":"Four."}`,
	}

	for name, raw := range tests {
		t.Run(name, func(t *testing.T) {
			if _, err := normalizeInsightResponse(raw, insightKindReport); !errors.Is(err, errInsightMalformed) {
				t.Errorf("err = %v, want errInsightMalformed", err)
			}
		})
	}
}
