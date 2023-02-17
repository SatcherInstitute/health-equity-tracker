from datasources.acs_population import ACSPopulation
from datasources.acs_2010_population import ACS2010Population
from datasources.age_adjust_cdc_restricted import AgeAdjustCDCRestricted
from datasources.census_pop_estimates import CensusPopEstimates
from datasources.census_pop_estimates_sc import CensusPopEstimatesSC
from datasources.cdc_restricted import CDCRestrictedData
from datasources.cdc_vaccination_county import CDCVaccinationCounty
from datasources.cdc_vaccination_national import CDCVaccinationNational
from datasources.covid_tracking_project import CovidTrackingProject
from datasources.covid_tracking_project_metadata import CtpMetadata
from datasources.kff_vaccination import KFFVaccination
from datasources.acs_health_insurance import AcsHealthInsurance
from datasources.acs_poverty import ACSPovertyDataSource
from datasources.uhc import UHCData
from datasources.cdc_svi_county import CDCSviCounty
from datasources.geo_context import GeoContext
from datasources.cdc_hiv_time import CDCHIVTimeData
from datasources.cawp_time import CAWPTimeData
from datasources.bjs_incarceration import BJSIncarcerationData
from datasources.vera_incarceration_county import VeraIncarcerationCounty

# Map of data source ID to the class that implements the ingestion methods for
# that data source.
DATA_SOURCES_DICT = {
    ACSPopulation.get_id(): ACSPopulation(),
    ACS2010Population.get_id(): ACS2010Population(),
    AgeAdjustCDCRestricted.get_id(): AgeAdjustCDCRestricted(),
    CensusPopEstimates.get_id(): CensusPopEstimates(),
    CensusPopEstimatesSC.get_id(): CensusPopEstimatesSC(),
    CDCRestrictedData.get_id(): CDCRestrictedData(),
    CDCVaccinationCounty.get_id(): CDCVaccinationCounty(),
    CDCVaccinationNational.get_id(): CDCVaccinationNational(),
    CovidTrackingProject.get_id(): CovidTrackingProject(),
    CtpMetadata.get_id(): CtpMetadata(),
    KFFVaccination.get_id(): KFFVaccination(),
    AcsHealthInsurance.get_id(): AcsHealthInsurance(),
    ACSPovertyDataSource.get_id(): ACSPovertyDataSource(),
    CDCSviCounty.get_id(): CDCSviCounty(),
    GeoContext.get_id(): GeoContext(),
    CDCHIVTimeData.get_id(): CDCHIVTimeData(),
    UHCData.get_id(): UHCData(),
    CAWPTimeData.get_id(): CAWPTimeData(),
    BJSIncarcerationData.get_id(): BJSIncarcerationData(),
    VeraIncarcerationCounty.get_id(): VeraIncarcerationCounty(),
}
