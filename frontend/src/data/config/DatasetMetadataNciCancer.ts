import type { DataSourceMetadata, DatasetMetadata } from '../utils/DatasetTypes'

export type DatasetIdNciCancer =
  | 'nci_cancer-race_and_ethnicity_county_current'
  | 'nci_cancer-alls_county_current'

export const DatasetMetadataMapNciCancer: Record<
  DatasetIdNciCancer,
  DatasetMetadata
> = {
  'nci_cancer-race_and_ethnicity_county_current': {
    name: 'Cancer incidence by race and ethnicity, by county',
    original_data_sourced: '2022',
    source_id: 'nci_cancer',
  },

  'nci_cancer-alls_county_current': {
    name: 'Cancer incidence by county',
    original_data_sourced: '2022',
    source_id: 'nci_cancer',
  },
}

interface DataSourceMetadataNciCancer
  extends Omit<DataSourceMetadata, 'dataset_ids'> {
  readonly dataset_ids: DatasetIdNciCancer[]
}

export const datasourceMetadataNciCancer: DataSourceMetadataNciCancer = {
  id: 'nci_cancer',
  data_source_name: 'National Cancer Institute (NCI) State Cancer Profiles',
  data_source_acronym: 'NCI',
  data_source_pretty_site_name: 'statecancerprofiles.cancer.gov',
  data_source_link:
    'https://statecancerprofiles.cancer.gov/incidencerates/index.php',
  geographic_breakdowns: ['county'],
  data_source_release_years: '2018 - 2022',
  demographic_breakdowns: ['race_and_ethnicity'],
  update_frequency: 'Yearly',
  description:
    'County-level cervical cancer incidence data from the NCI State Cancer Profiles, a joint product of NCI and CDC. Incidence rates are sourced from the National Program of Cancer Registries (NPCR) and the Surveillance, Epidemiology, and End Results (SEER) Program. Rates are age-adjusted to the 2000 U.S. standard population and are for invasive cancer only. Population denominators are based on Census populations as modified by NCI. Data are available by race and ethnicity at the county level, though availability varies; some county/race combinations are suppressed where case counts are too small to produce reliable estimates, and some states restrict release of county-level data entirely.',
  dataset_ids: [
    'nci_cancer-race_and_ethnicity_county_current',
    'nci_cancer-alls_county_current',
  ],
  downloadable: true,
}
