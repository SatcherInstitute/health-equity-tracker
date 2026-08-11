// Every insight surface (card, contrast, report) returns the same envelope: a
// map of section key -> { text, highlight }. Surfaces differ only in which keys
// they carry, so one parser and one renderer serve all of them.
export interface InsightSection {
  text: string
  highlight?: string
}

// Card and contrast insights are a single section. Named so the envelope has
// the same shape as the report's, rather than a bare string special case.
export const SINGLE_INSIGHT_KEY = 'insight'

function stripFences(raw: string): string {
  return raw.replace(/```json|```/g, '').trim()
}

// A highlight the model paraphrased instead of quoting cannot be located in the
// text, and a highlight covering the whole sentence underlines everything. Both
// degrade to no highlight rather than to a wrong one.
function toSection(value: unknown): InsightSection | null {
  if (typeof value === 'string') return { text: value }
  if (typeof value !== 'object' || value === null) return null

  const { text, highlight } = value as Record<string, unknown>
  if (typeof text !== 'string') return null

  const usable =
    typeof highlight === 'string' &&
    highlight.length > 0 &&
    text.includes(highlight) &&
    highlight.trim() !== text.trim()

  return usable ? { text, highlight: highlight as string } : { text }
}

// Tolerant on purpose: the server may still be sending a bare sentence, or a
// report object of bare strings, from before the envelope shipped.
export function parseInsightSections<K extends string>(
  raw: string,
  keys: readonly K[],
): Record<K, InsightSection> | null {
  // A one-section surface can always fall back to the raw text, so a failure to
  // parse costs it the highlight and nothing else. A report cannot: its four
  // sections render separately and there is no way to split one string into them.
  const fallback = () =>
    keys.length === 1
      ? ({ [keys[0]]: { text: raw.trim() } } as Record<K, InsightSection>)
      : null

  let parsed: unknown
  try {
    parsed = JSON.parse(stripFences(raw))
  } catch {
    return fallback()
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return fallback()
  }

  const sections = {} as Record<K, InsightSection>
  for (const key of keys) {
    const section = toSection((parsed as Record<string, unknown>)[key])
    if (!section) return fallback()
    sections[key] = section
  }
  return sections
}

export function parseSingleInsight(raw: string): InsightSection {
  const sections = parseInsightSections(raw, [SINGLE_INSIGHT_KEY])
  return sections?.[SINGLE_INSIGHT_KEY] ?? { text: raw.trim() }
}
