import type { MetricConfig } from '../data/config/MetricConfigTypes'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { HetRow } from '../data/utils/DatasetTypes'
import { buildContrastPrompt } from './generateContrastInsight'
import {
  buildReportInsightPrompt,
  formatAgeAdjustedRatios,
  formatDemographicRates,
  formatGeographicSpread,
  formatTemporalChange,
  formatUnknownShare,
} from './generateReportInsight'
import {
  buildCardInsightPrompt,
  formatDataRows,
  getTableColumnShape,
  type InsightContext,
} from './generateVisualizationInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'
import { INSIGHT_DATA_BUDGETS } from './insightPromptBudget'

// Fixture inputs are deliberately plain JSON with no TypeScript-only types, so
// the Go port in #5045 can render the same cases from the same files and be
// checked against the same expected output.

interface FixtureMetricConfig {
  metricId: string
  shortLabel: string
  // Only the population-vs-distribution chart reads this: its population share
  // hangs off the rate config itself rather than being resolved as a separate
  // table column, so a fixture for that chart has to nest it here.
  populationComparisonMetric?: FixtureMetricConfig
}

// The data table's two extra columns. Pinned per fixture rather than resolved
// from a DataTypeConfig, for the same reason metricConfig is: a fixture stays
// readable and stays valid when unrelated topic config changes.
interface FixtureShareMetrics {
  shareConfig?: FixtureMetricConfig
  populationConfig?: FixtureMetricConfig
  // Set when the population column counts a broader group than the rate's own
  // denominator (the isGeneralPopulationComparison topics).
  generalPopulationLabel?: string
}

interface CardFixture extends FixtureShareMetrics {
  kind: 'card'
  why: string
  hashId: ScrollableHashId
  topic: string
  location: string
  demographicType: DemographicType
  metricConfig: FixtureMetricConfig
  rows: HetRow[]
  context?: InsightContext
}

interface ContrastView {
  topic: string
  location: string
  metricConfig: FixtureMetricConfig
  rows: HetRow[]
}

interface ContrastFixture {
  kind: 'contrast'
  why: string
  hashId: ScrollableHashId
  demographicType: DemographicType
  viewA: ContrastView
  viewB: ContrastView
}

interface ReportSection extends FixtureShareMetrics {
  rows: HetRow[]
  metricConfig?: FixtureMetricConfig
}

interface ReportFixture {
  kind: 'report'
  why: string
  topic: string
  location: string
  demographicType: DemographicType
  placeNoun: string
  metricConfig: FixtureMetricConfig
  sections: {
    demographic: ReportSection
    geographic: ReportSection
    temporal: ReportSection
    ageAdjusted: ReportSection
    unknown: ReportSection
  }
}

export type InsightPromptFixture = CardFixture | ContrastFixture | ReportFixture

// Fixtures pin a metric explicitly rather than resolving one from a full
// DataTypeConfig, so a fixture stays readable and stays valid when unrelated
// topic config changes. Only these two fields reach the prompt text.
const asMetricConfig = (config: FixtureMetricConfig): MetricConfig =>
  config as unknown as MetricConfig

const shareMetrics = (source: FixtureShareMetrics) => ({
  shareConfig: source.shareConfig && asMetricConfig(source.shareConfig),
  populationConfig:
    source.populationConfig && asMetricConfig(source.populationConfig),
  generalPopulationLabel: source.generalPopulationLabel,
})

function renderCard(fixture: CardFixture): string {
  const options = {
    selectedGroups: fixture.context?.selectedGroups,
    activeDemographicGroup: fixture.context?.activeDemographicGroup,
    ...shareMetrics(fixture),
  }

  const dataSection = formatDataRows(
    fixture.rows,
    fixture.hashId,
    fixture.demographicType,
    asMetricConfig(fixture.metricConfig),
    options,
  )

  return buildCardInsightPrompt(
    fixture.hashId,
    fixture.topic,
    fixture.location,
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[fixture.demographicType],
    dataSection,
    fixture.context,
    fixture.hashId === 'data-table'
      ? getTableColumnShape(
          fixture.rows,
          fixture.demographicType,
          asMetricConfig(fixture.metricConfig),
          options,
        )
      : undefined,
  )
}

function renderContrast(fixture: ContrastFixture): string {
  const section = (view: ContrastView) =>
    formatDataRows(
      view.rows,
      fixture.hashId,
      fixture.demographicType,
      asMetricConfig(view.metricConfig),
      { budgetBytes: INSIGHT_DATA_BUDGETS.contrast },
    )

  return buildContrastPrompt(
    fixture.viewA.topic,
    fixture.viewB.topic,
    fixture.viewA.location,
    fixture.viewB.location,
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[fixture.demographicType],
    section(fixture.viewA),
    section(fixture.viewB),
  )
}

function renderReport(fixture: ReportFixture): string {
  const { sections, demographicType } = fixture
  const metricFor = (section: ReportSection) =>
    asMetricConfig(section.metricConfig ?? fixture.metricConfig)

  const demographicShares = shareMetrics(sections.demographic)

  return buildReportInsightPrompt(
    fixture.topic,
    fixture.location,
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demographicType],
    {
      demographicSection: formatDemographicRates(
        sections.demographic.rows,
        demographicType,
        metricFor(sections.demographic),
        demographicShares.shareConfig,
        demographicShares.populationConfig,
      ),
      geographicSection: formatGeographicSpread(
        sections.geographic.rows,
        metricFor(sections.geographic),
        fixture.placeNoun,
      ),
      temporalSection: formatTemporalChange(
        sections.temporal.rows,
        demographicType,
        metricFor(sections.temporal),
      ),
      ageAdjustedSection: formatAgeAdjustedRatios(
        sections.ageAdjusted.rows,
        demographicType,
        metricFor(sections.ageAdjusted),
      ),
      unknownSection: formatUnknownShare(
        sections.unknown.rows,
        demographicType,
        metricFor(sections.unknown),
      ),
    },
    getTableColumnShape(
      sections.demographic.rows,
      demographicType,
      metricFor(sections.demographic),
      demographicShares,
    ),
  )
}

// Renders a fixture through the same builders production uses. Deterministic and
// offline: no provider call, no network, no clock.
export function renderFixturePrompt(fixture: InsightPromptFixture): string {
  switch (fixture.kind) {
    case 'card':
      return renderCard(fixture)
    case 'contrast':
      return renderContrast(fixture)
    case 'report':
      return renderReport(fixture)
  }
}
