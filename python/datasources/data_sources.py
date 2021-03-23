from datasources.acs_population import ACSPopulation
from datasources.cdc_covid_deaths import CDCCovidDeaths
from datasources.cdc_restricted import CDCRestrictedData
from datasources.county_adjacency import CountyAdjacency
from datasources.county_names import CountyNames
from datasources.covid_tracking_project import CovidTrackingProject
from datasources.covid_tracking_project_metadata import CtpMetadata
from datasources.household_income import HouseholdIncome
from datasources.manual_uploads import ManualUploads
from datasources.primary_care_access import PrimaryCareAccess
from datasources.state_names import StateNames
from datasources.urgent_care_facilities import UrgentCareFacilities
from datasources.acs_health_insurance import ACSHealthInsurance
from datasources.acs_household_income import ACSHouseholdIncomeDatasource

# Map of data source ID to the class that implements the ingestion methods for
# that data source.
DATA_SOURCES_DICT = {
    ACSPopulation.get_id(): ACSPopulation(),
    CDCCovidDeaths.get_id(): CDCCovidDeaths(),
    CDCRestrictedData.get_id(): CDCRestrictedData(),
    CountyAdjacency.get_id(): CountyAdjacency(),
    CountyNames.get_id(): CountyNames(),
    CovidTrackingProject.get_id(): CovidTrackingProject(),
    CtpMetadata.get_id(): CtpMetadata(),
    HouseholdIncome.get_id(): HouseholdIncome(),
    ManualUploads.get_id(): ManualUploads(),
    PrimaryCareAccess.get_id(): PrimaryCareAccess(),
    StateNames.get_id(): StateNames(),
    UrgentCareFacilities.get_id(): UrgentCareFacilities(),
    ACSHealthInsurance.get_id(): ACSHealthInsurance(),
    ACSHouseholdIncomeDatasource.get_id(): ACSHouseholdIncomeDatasource()
}
