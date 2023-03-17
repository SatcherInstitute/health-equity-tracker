from datasources.acs_population import ACSPopulation
from datasources.decia_2010_territory_population import DECIA2010Population
from datasources.age_adjust_cdc_restricted import AgeAdjustCDCRestricted
from datasources.census_pop_estimates import CensusPopEstimates
from datasources.census_pop_estimates_sc import CensusPopEstimatesSC
from datasources.cdc_restricted import CDCRestrictedData
from datasources.cdc_vaccination_county import CDCVaccinationCounty
from datasources.cdc_vaccination_national import CDCVaccinationNational
from datasources.covid_tracking_project import CovidTrackingProject
from datasources.covid_tracking_project_metadata import CtpMetadata
from datasources.decia_2020_territory_population import Decia2020TerritoryPopulationData
from datasources.kff_vaccination import KFFVaccination
from datasources.acs_condition import AcsCondition
from datasources.uhc import UHCData
from datasources.cdc_svi_county import CDCSviCounty
from datasources.geo_context import GeoContext
from datasources.cdc_hiv import CDCHIVData
from datasources.cawp_time import CAWPTimeData
from datasources.bjs_incarceration import BJSIncarcerationData
from datasources.vera_incarceration_county import VeraIncarcerationCounty

# Map of data source ID to the class that implements the ingestion methods for
# that data source.
DATA_SOURCES_DICT = {
    ACSPopulation.get_id(): ACSPopulation(),
    DECIA2010Population.get_id(): DECIA2010Population(),
    AgeAdjustCDCRestricted.get_id(): AgeAdjustCDCRestricted(),
    CensusPopEstimates.get_id(): CensusPopEstimates(),
    CensusPopEstimatesSC.get_id(): CensusPopEstimatesSC(),
    CDCRestrictedData.get_id(): CDCRestrictedData(),
    CDCVaccinationCounty.get_id(): CDCVaccinationCounty(),
    CDCVaccinationNational.get_id(): CDCVaccinationNational(),
    CovidTrackingProject.get_id(): CovidTrackingProject(),
    CtpMetadata.get_id(): CtpMetadata(),
    Decia2020TerritoryPopulationData.get_id(): Decia2020TerritoryPopulationData(),
    KFFVaccination.get_id(): KFFVaccination(),
    AcsCondition.get_id(): AcsCondition(),
    CDCSviCounty.get_id(): CDCSviCounty(),
    GeoContext.get_id(): GeoContext(),
    CDCHIVData.get_id(): CDCHIVData(),
    UHCData.get_id(): UHCData(),
    CAWPTimeData.get_id(): CAWPTimeData(),
    BJSIncarcerationData.get_id(): BJSIncarcerationData(),
    VeraIncarcerationCounty.get_id(): VeraIncarcerationCounty(),
}
