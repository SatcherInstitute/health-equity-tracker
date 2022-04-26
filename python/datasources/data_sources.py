from datasources.acs_population import ACSPopulation
from datasources.acs_2010_population import ACS2010Population
from datasources.age_adjust_cdc_restricted import AgeAdjustCDCRestricted
from datasources.census_pop_estimates import CensusPopEstimates
from datasources.cdc_covid_deaths import CDCCovidDeaths
from datasources.cdc_restricted import CDCRestrictedData
from datasources.cdc_vaccination_county import CDCVaccinationCounty
from datasources.cdc_vaccination_national import CDCVaccinationNational
from datasources.county_adjacency import CountyAdjacency
from datasources.county_names import CountyNames
from datasources.covid_tracking_project import CovidTrackingProject
from datasources.covid_tracking_project_metadata import CtpMetadata
from datasources.household_income import HouseholdIncome
from datasources.kff_vaccination import KFFVaccination
from datasources.manual_uploads import ManualUploads
from datasources.primary_care_access import PrimaryCareAccess
from datasources.state_names import StateNames
from datasources.urgent_care_facilities import UrgentCareFacilities
from datasources.acs_health_insurance import ACSHealthInsurance
from datasources.acs_poverty import ACSPovertyDataSource
from datasources.acs_household_income import ACSHouseholdIncomeDatasource
from datasources.uhc import UHCData
from datasources.cawp import CAWPData

# Map of data source ID to the class that implements the ingestion methods for
# that data source.
DATA_SOURCES_DICT = {
    ACSPopulation.get_id(): ACSPopulation(),
    ACS2010Population.get_id(): ACS2010Population(),
    AgeAdjustCDCRestricted.get_id(): AgeAdjustCDCRestricted(),
    CensusPopEstimates.get_id(): CensusPopEstimates(),
    CDCCovidDeaths.get_id(): CDCCovidDeaths(),
    CDCRestrictedData.get_id(): CDCRestrictedData(),
    CDCVaccinationCounty.get_id(): CDCVaccinationCounty(),
    CDCVaccinationNational.get_id(): CDCVaccinationNational(),
    CountyAdjacency.get_id(): CountyAdjacency(),
    CountyNames.get_id(): CountyNames(),
    CovidTrackingProject.get_id(): CovidTrackingProject(),
    CtpMetadata.get_id(): CtpMetadata(),
    HouseholdIncome.get_id(): HouseholdIncome(),
    KFFVaccination.get_id(): KFFVaccination(),
    ManualUploads.get_id(): ManualUploads(),
    PrimaryCareAccess.get_id(): PrimaryCareAccess(),
    StateNames.get_id(): StateNames(),
    UrgentCareFacilities.get_id(): UrgentCareFacilities(),
    ACSHealthInsurance.get_id(): ACSHealthInsurance(),
    ACSHouseholdIncomeDatasource.get_id(): ACSHouseholdIncomeDatasource(),
    ACSPovertyDataSource.get_id(): ACSPovertyDataSource(),
    UHCData.get_id(): UHCData(),
    CAWPData.get_id(): CAWPData(),
}
