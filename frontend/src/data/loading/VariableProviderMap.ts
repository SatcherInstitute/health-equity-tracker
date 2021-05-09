import VariableProvider from "../variables/VariableProvider";
import CdcCovidProvider from "../variables/CdcCovidProvider";
import BrfssProvider from "../variables/BrfssProvider";
import { MetricId } from "../config/MetricConfig";
import AcsHealthInsuranceProvider from "../variables/AcsHealthInsuranceProvider";
import AcsPovertyProvider from "../variables/AcsPovertyProvider";
import StandardVariableProvider from "../variables/StandardVariableProvider";
import {
  PctShareDerivedColumn,
  PctShareOfKnownDerivedColumn,
  RowDerivedColumn,
} from "../variables/modifiers";
import { FunctionPreprocessor } from "../variables/preprocessors";
import { per100k } from "../utils/datasetutils";

export type ProviderId =
  | "acs_health_insurance_provider"
  | "acs_pop_provider"
  | "acs_poverty_provider"
  | "cdc_covid_provider"
  | "covid_provider"
  | "brfss_provider";

export default class VariableProviderMap {
  private providers: VariableProvider[];
  private providersById: Record<ProviderId, VariableProvider>;
  private metricsToProviderIds: Record<MetricId, ProviderId>;

  constructor() {
    const populationProvider = createAcsPopulationProvider();
    this.providers = [
      populationProvider,
      new CdcCovidProvider(populationProvider),
      new BrfssProvider(populationProvider),
      new AcsHealthInsuranceProvider(),
      new AcsPovertyProvider(),
    ];

    this.providersById = this.getProvidersById();
    this.metricsToProviderIds = this.getMetricsToProviderIdsMap();
  }

  private getProvidersById(): Record<ProviderId, VariableProvider> {
    const providersById: Partial<Record<
      ProviderId,
      VariableProvider
    >> = Object.fromEntries(this.providers.map((p) => [p.providerId, p]));
    return providersById as Record<ProviderId, VariableProvider>;
  }

  private getMetricsToProviderIdsMap(): Record<MetricId, ProviderId> {
    const metricsToProviderIds: Partial<Record<MetricId, ProviderId>> = {};
    this.providers.forEach((provider) => {
      provider.providesMetrics.forEach((varId) => {
        metricsToProviderIds[varId] = provider.providerId;
      });
    });
    return metricsToProviderIds as Record<MetricId, ProviderId>;
  }

  /**
   * Returns a list of all VariableProviders required to get the specified
   * variables.
   */
  getUniqueProviders(metricIds: MetricId[]): VariableProvider[] {
    const providerIds = metricIds.map((id) => {
      const providerId = this.metricsToProviderIds[id];
      if (!providerId) {
        throw new Error("No provider configured for metric id: " + id);
      }
      return providerId;
    });
    const dedupedIds = Array.from(new Set(providerIds));
    return dedupedIds.map((id) => this.providersById[id]);
  }
}

function createAcsPopulationProvider(): VariableProvider {
  return new StandardVariableProvider(
    "acs_population",
    "acs_pop_provider",
    ["population", "population_pct"],
    { autoGenerateNational: true }
  ).addOneDimensionalGroupModifier(
    new PctShareDerivedColumn("population", "_pct")
  );
}

function createCdcCovidProvider(
  populationProvider: VariableProvider
): VariableProvider {
  const covidProvider = new StandardVariableProvider(
    "cdc_restricted_data",
    "cdc_covid_provider",
    [
      "covid_cases",
      "covid_deaths",
      "covid_hosp",
      "covid_cases_share",
      "covid_deaths_share",
      "covid_hosp_share",
      "covid_cases_share_of_known",
      "covid_deaths_share_of_known",
      "covid_hosp_share_of_known",
      "covid_deaths_per_100k",
      "covid_cases_per_100k",
      "covid_hosp_per_100k",
      "covid_cases_reporting_population",
      "covid_deaths_reporting_population",
      "covid_hosp_reporting_population",
      "covid_cases_reporting_population_pct",
      "covid_deaths_reporting_population_pct",
      "covid_hosp_reporting_population_pct",
    ],
    {
      autoGenerateNational: true,
      autoJoinWithPopulation: populationProvider,
    }
  );

  covidProvider
    .addPreprocessor(
      new FunctionPreprocessor((df) => {
        return df
          .renameSeries({
            cases: "covid_cases",
            death_y: "covid_deaths",
            hosp_y: "covid_hosp",
          })
          .transformSeries({
            covid_deaths: (value) => (isNaN(value) ? null : value),
            covid_hosp: (value) => (isNaN(value) ? null : value),
          });
      })
    )
    .addRowModifier(
      new RowDerivedColumn("covid_deaths", (row) =>
        row.death_unknown === row.covid_cases ? null : row.covid_deaths
      )
    )
    .addRowModifier(
      new RowDerivedColumn("covid_hosp", (row) =>
        row.hosp_unknown === row.covid_cases ? null : row.covid_hosp
      )
    );

  ["covid_cases", "covid_deaths", "covid_hosp"].forEach((countCol) => {
    covidProvider
      .addRowModifier(
        new RowDerivedColumn(countCol + "_per_100k", (row) =>
          per100k(row[countCol], row.population)
        )
      )
      .addOneDimensionalGroupModifier(
        new PctShareDerivedColumn(countCol, "_share")
      )
      .addOneDimensionalGroupModifier(
        new PctShareOfKnownDerivedColumn(countCol, "_share_of_known")
      )
      .addRowModifier(
        new RowDerivedColumn(
          countCol + "_reporting_population",
          (row) => row.population
        )
      )
      .addRowModifier(
        new RowDerivedColumn(
          countCol + "_reporting_population_pct",
          (row) => row.population_pct
        )
      );
  });

  return covidProvider;
}
