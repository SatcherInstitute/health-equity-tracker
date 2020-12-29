import AcsPopulationProvider from "./variables/AcsPopulationProvider";
import VariableProvider from "./variables/VariableProvider";
import CovidProvider from "./variables/CovidProvider";
import BrfssProvider from "./variables/BrfssProvider";

// TODO consider making this an enum instead of a type literal, since these will
// be used throughout the code base and an enum provides a little more explicit
// clarity.
export type MetricId =
  | "diabetes_count"
  | "diabetes_per_100k"
  | "copd_count"
  | "copd_per_100k"
  | "population"
  | "population_pct"
  | "covid_cases"
  | "covid_deaths"
  | "covid_hosp"
  | "covid_cases_pct_of_geo"
  | "covid_deaths_pct_of_geo"
  | "covid_hosp_pct_of_geo"
  | "covid_deaths_per_100k"
  | "covid_cases_per_100k"
  | "covid_hosp_per_100k";

export type ProviderId =
  | "acs_pop_provider"
  | "covid_provider"
  | "brfss_provider";

const acsProvider = new AcsPopulationProvider();

// TODO I think this needs restructuring, so that one provider can provide
// multiple variables, each with their own ids and descriptions. This allows
// variables that naturally come together like "population" and "population_pct"
// to be provided by the same getData() call.
const providers: VariableProvider[] = [
  acsProvider,
  new CovidProvider(acsProvider),
  new BrfssProvider(),
];

// TODO I don't know why Typescript is complaining that it's missing properties.
// It seems to expect all possible values for MetricId to be present.
const providersById: Record<ProviderId, VariableProvider> = Object.fromEntries(
  providers.map((p) => [p.providerId, p])
) as Record<ProviderId, VariableProvider>;

const metricsToProviderIds: Record<MetricId, ProviderId> = {} as Record<
  MetricId,
  ProviderId
>;
providers.forEach((provider) => {
  provider.providesMetrics.forEach((varId) => {
    metricsToProviderIds[varId] = provider.providerId;
  });
});

/** Returns the VariableProvider that gets the specified variable. */
export function getProvider(variableId: MetricId): VariableProvider {
  const providerId = metricsToProviderIds[variableId];
  const provider = providersById[providerId];
  return provider;
}

/**
 * Returns a list of all VariableProviders required to get the specified
 * variables.
 */
export function getUniqueProviders(
  variableIds: MetricId[]
): VariableProvider[] {
  const providerIds = variableIds.map((id) => metricsToProviderIds[id]);
  const dedupedIds = Array.from(new Set(providerIds));
  return dedupedIds.map((id) => providersById[id]);
}

/** Returns the list of dataset ids that the provided variables depend on. */
export function getDependentDatasets(variableIds: MetricId[]): string[] {
  const providers = variableIds.map((id) => getProvider(id));
  return VariableProvider.getUniqueDatasetIds(providers);
}
