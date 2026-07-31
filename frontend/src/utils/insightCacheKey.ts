/* cSpell:ignore fnv */
import { REPORT_INSIGHT_PARAM_KEY } from './urlutils'

// FNV-1a, 32 bits, as 8 hex chars. Synchronous and dependency-free so a key can
// be built inline at call time. This is a cache key, not a security digest, and
// a collision would have to land within one view scope to matter at all.
function fnv1a32(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// The single source of server cache keys for every generated insight: per-card,
// report-wide, and compare-mode contrast.
//
// The rendered prompt carries both the template wording and the data rows, so
// hashing it invalidates an entry exactly when either one changes. A pipeline
// run that ships new numbers yields a new key on its own, and one that
// reproduces identical numbers keeps the cache warm — neither outcome needs a
// version constant bumped by hand.
//
// Invalidation is therefore scoped per view rather than per topic or per
// pipeline: refreshed HIV data leaves every diabetes insight cached, and leaves
// the HIV insights whose rendered rows did not move cached too.
//
// `viewScope` distinguishes the insights that share a URL and must not share an
// entry, and arrives already prefixed (e.g. `#rate-map`, `#rate-map-contrast`,
// or '' for the report-wide insight). The URL stays readable in the key because
// scripts/review_flagged_insights.sh prints these to whoever triages a flag.
export function buildInsightCacheKey(
  viewScope: string,
  prompt: string,
): string {
  const params = new URLSearchParams(window.location.search)
  params.delete(REPORT_INSIGHT_PARAM_KEY)
  return `${window.location.pathname}?${params.toString()}${viewScope}-${fnv1a32(prompt)}`
}
