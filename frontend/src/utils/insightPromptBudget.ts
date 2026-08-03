// The server rejects any prompt larger than this (server/insight_budget.go).
// Every budget below is sized so the assembled prompt, data plus scaffold text,
// lands under it no matter which sections are present.
export const INSIGHT_PROMPT_MAX_BYTES = 30 * 1024

// Bytes of data rows a prompt may carry, tiered by how many data sections that
// prompt holds. A prompt with one section can afford to send far more of it than
// a prompt that always carries two.
export const INSIGHT_DATA_BUDGETS = {
  // Single card insight: one data section, so it gets the most room. Sized so
  // the largest real view measured, a national map of every state across every
  // race group (~21KB), is sent whole rather than losing the tail of the list.
  card: 24 * 1024,
  // Report-wide insight: up to five sections, each capped at this.
  report: 4 * 1024,
  // Compare-mode contrast insight: always two sections, one per side.
  contrast: 12 * 1024,
} as const

const encoder = new TextEncoder()

export function byteLength(text: string): number {
  return encoder.encode(text).length
}

// Keeps whole lines from the start until the budget is spent, so an over-budget
// section degrades to a shorter well-formed list rather than a list whose last
// entry is cut mid-number. Order is preserved rather than re-ranked, since the
// prompt hash that keys the insight cache depends on the same rows rendering the
// same way every time.
export function trimLinesToBudget(
  lines: string[],
  budgetBytes: number,
): string {
  const kept: string[] = []
  let used = 0
  for (const line of lines) {
    const cost = byteLength(line) + (kept.length ? 1 : 0)
    if (used + cost > budgetBytes) break
    kept.push(line)
    used += cost
  }
  return kept.join('\n')
}

export function trimSectionToBudget(
  section: string,
  budgetBytes: number,
): string {
  if (byteLength(section) <= budgetBytes) return section
  return trimLinesToBudget(section.split('\n'), budgetBytes)
}
