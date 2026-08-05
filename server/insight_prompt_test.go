package main

import (
	"encoding/json"
	"flag"
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// Regenerates the committed .prompt.txt files instead of comparing against them:
// go test -run TestInsightPromptFixtures -update ./...
var updateInsightPrompts = flag.Bool("update", false, "rewrite the insight prompt fixtures")

// The fixtures in testdata/insight_prompts pin the exact text sent to the model.
// The insight cache key is a hash of that text, so the diff a template edit
// produces here is a direct readout of how much of the cache it displaces.
// Accept a change only by rerunning with -update and reviewing that diff.

// A fixture is a descriptor, and the harness renders it through the same
// renderInsightPrompt the endpoint runs. So these cases check the served path
// rather than a test-only mirror of it, and the set of committed fixtures is a
// direct readout of which input shapes the endpoint is known to handle.
func TestInsightPromptFixtures(t *testing.T) {
	inputs, err := filepath.Glob(filepath.Join("testdata", "insight_prompts", "*.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(inputs) == 0 {
		t.Fatal("no prompt fixtures found")
	}

	for _, input := range inputs {
		name := strings.TrimSuffix(filepath.Base(input), ".json")
		t.Run(name, func(t *testing.T) {
			raw, err := os.ReadFile(input)
			if err != nil {
				t.Fatal(err)
			}
			var fixture insightDescriptor
			if err := json.Unmarshal(raw, &fixture); err != nil {
				t.Fatal(err)
			}
			wantPath := strings.TrimSuffix(input, ".json") + ".prompt.txt"

			got, err := renderInsightPrompt(&fixture)
			if err != nil {
				t.Fatalf("render: %v", err)
			}
			if *updateInsightPrompts {
				if err := os.WriteFile(wantPath, []byte(got), 0o644); err != nil {
					t.Fatal(err)
				}
				return
			}

			want, err := os.ReadFile(wantPath)
			if err != nil {
				t.Fatal(err)
			}
			if got != string(want) {
				t.Errorf("prompt does not match %s\n--- got ---\n%s\n--- want ---\n%s",
					filepath.Base(wantPath), got, string(want))
			}
		})
	}
}

// jsNumber and peerRankLabel carry sharp contracts that the fixtures only
// exercise incidentally, so pin them directly. Expected jsNumber values are
// String(n) output copied from a JS runtime, not derived from the Go code.
func TestJSNumberMatchesJavaScript(t *testing.T) {
	cases := []struct {
		in   float64
		want string
	}{
		{0, "0"},
		{math.Copysign(0, -1), "0"},
		{4, "4"},
		{-4, "-4"},
		{0.5, "0.5"},
		{-0.5, "-0.5"},
		{100, "100"},
		{43.8, "43.8"},
		// Written out rather than 0.1+0.2, which Go folds exactly at compile time.
		{0.30000000000000004, "0.30000000000000004"},
		// Exponential range. Unreachable for a rate or a share today, but a
		// silent divergence here would displace cache entries rather than fail.
		{1e-6, "0.000001"},
		{1.5e-7, "1.5e-7"},
		{-1.5e-7, "-1.5e-7"},
		{5e-324, "5e-324"},
		{1e21, "1e+21"},
		{-1e21, "-1e+21"},
		{1.2345e21, "1.2345e+21"},
		{1e22, "1e+22"},
		{math.NaN(), "NaN"},
		{math.Inf(1), "Infinity"},
		{math.Inf(-1), "-Infinity"},
	}
	for _, c := range cases {
		if got := jsNumber(c.in); got != c.want {
			t.Errorf("jsNumber(%v) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestPeerRankLabelBands(t *testing.T) {
	// Each band's lower bound and the value just under it, as thousandths of the
	// reporting count so the boundaries land exactly.
	cases := []struct {
		higherThan int
		want       string
	}{
		{1000, "among the highest"},
		{900, "among the highest"},
		{899, "higher than most"},
		{750, "higher than most"},
		{749, "above the typical"},
		{600, "above the typical"},
		{599, "near the typical"},
		{400, "near the typical"},
		{399, "below the typical"},
		{250, "below the typical"},
		{249, "lower than most"},
		{100, "lower than most"},
		{99, "among the lowest"},
		{0, "among the lowest"},
	}
	for _, c := range cases {
		if got := peerRankLabel(c.higherThan, 1000); got != c.want {
			t.Errorf("peerRankLabel(%d, 1000) = %q, want %q", c.higherThan, got, c.want)
		}
	}
}
