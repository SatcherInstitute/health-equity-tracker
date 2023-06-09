from datasources.acs_condition import AcsCondition
from datasources.acs_population import ACSPopulation
from datasources.age_adjust_cdc_restricted import AgeAdjustCDCRestricted
from datasources.ahr import AHRData
from datasources.bjs_incarceration import BJSIncarcerationData
from datasources.cawp_time import CAWPTimeData
from datasources.cdc_hiv import CDCHIVData
from datasources.cdc_restricted import CDCRestrictedData
from datasources.cdc_svi_county import CDCSviCounty
from datasources.cdc_vaccination_county import CDCVaccinationCounty
from datasources.cdc_vaccination_national import CDCVaccinationNational
from datasources.census_pop_estimates import CensusPopEstimates
from datasources.census_pop_estimates_sc import CensusPopEstimatesSC
from datasources.decia_2010_territory_population import Decia2010TerritoryPopulationData
from datasources.decia_2020_territory_population import Decia2020TerritoryPopulationData
from datasources.geo_context import GeoContext
from datasources.kff_vaccination import KFFVaccination
from datasources.phrma import PhrmaData
from datasources.vera_incarceration_county import VeraIncarcerationCounty

# Map of data source ID to the class that implements the ingestion methods for
# that data source.
DATA_SOURCES_DICT = {
    AcsCondition.get_id(): AcsCondition(),
    ACSPopulation.get_id(): ACSPopulation(),
    AgeAdjustCDCRestricted.get_id(): AgeAdjustCDCRestricted(),
    AHRData.get_id(): AHRData(),
    BJSIncarcerationData.get_id(): BJSIncarcerationData(),
    CAWPTimeData.get_id(): CAWPTimeData(),
    CDCHIVData.get_id(): CDCHIVData(),
    CDCRestrictedData.get_id(): CDCRestrictedData(),
    CDCSviCounty.get_id(): CDCSviCounty(),
    CDCVaccinationCounty.get_id(): CDCVaccinationCounty(),
    CDCVaccinationNational.get_id(): CDCVaccinationNational(),
    CensusPopEstimates.get_id(): CensusPopEstimates(),
    CensusPopEstimatesSC.get_id(): CensusPopEstimatesSC(),
    Decia2010TerritoryPopulationData.get_id(): Decia2010TerritoryPopulationData(),
    Decia2020TerritoryPopulationData.get_id(): Decia2020TerritoryPopulationData(),
    GeoContext.get_id(): GeoContext(),
    KFFVaccination.get_id(): KFFVaccination(),
    PhrmaData.get_id(): PhrmaData(),
    VeraIncarcerationCounty.get_id(): VeraIncarcerationCounty(),
}
