/**
 * Imported by both:
 *   - frontend_server/server.js  (Node.js, for /precache and /fetch-ai-insight)
 *   - frontend/src/utils/generateReportInsight.ts  (TypeScript, for live generation)
 *
 * Keep this file as plain JS with no imports so it works in both contexts.
 */

/**
 * @param {string} topic - Full display name of the data type (e.g. "HIV prevalence")
 * @param {string} location - Sentence-form location name (e.g. "the United States")
 * @param {string} demographicLabel - Demographic breakdown label (e.g. "race/ethnicity")
 * @returns {string}
 */
export function buildReportInsightPrompt(topic, location, demographicLabel) {
  return `You are a public health analyst reviewing a report about "${topic}" in ${location}, broken down by ${demographicLabel}.

The page contains multiple charts: a rate map, rates over time, a rate bar chart, an unknowns map, inequities over time, and a population vs distribution chart.

WRITING RULES — follow these strictly:
- Write at an 8th-grade reading level. Use short words and simple sentences.
- Avoid jargon. If you must use a technical term, explain it immediately.
- Each section: 1-2 sentences maximum, 35 words or fewer.
- keyFindings: 1 sentence, 25 words or fewer. Lead with the single most striking fact.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation outside the JSON. Use this exact structure:

{
  "keyFindings": "1 sentence (max 25 words): the single most striking disparity, leading with a specific number or rate.",
  "locationComparison": "1-2 sentences (max 35 words): which places have the biggest gaps and why that might be.",
  "demographicInsights": "1-2 sentences (max 35 words): which group is most affected and how large the gap is compared to others.",
  "whatThisMeans": "1-2 sentences (max 35 words): what this means for real people in these communities, in plain everyday language."
}`
}
