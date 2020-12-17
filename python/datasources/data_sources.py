from datasources.american_community_survey import AmericanCommunitySurvey
from datasources.cdc_covid_deaths import CDCCovidDeaths
from datasources.county_adjacency import CountyAdjacency
from datasources.county_names import CountyNames
from datasources.covid_tracking_project import CovidTrackingProject
from datasources.household_income import HouseholdIncome
from datasources.manual_uploads import ManualUploads
from datasources.primary_care_access import PrimaryCareAccess
from datasources.state_names import StateNames
from datasources.urgent_care_facilities import UrgentCareFacilities


# Map of data source ID to the class that implements the ingestion methods for that
# data source.
DATA_SOURCES_DICT = {
    AmericanCommunitySurvey.get_id(): AmericanCommunitySurvey(),
    CDCCovidDeaths.get_id(): CDCCovidDeaths(),
    CountyAdjacency.get_id(): CountyAdjacency(),
    CountyNames.get_id(): CountyNames(),
    CovidTrackingProject.get_id(): CovidTrackingProject(),
    HouseholdIncome.get_id(): HouseholdIncome(),
    ManualUploads.get_id(): ManualUploads(),
    PrimaryCareAccess.get_id(): PrimaryCareAccess(),
    StateNames.get_id(): StateNames(),
    UrgentCareFacilities.get_id(): UrgentCareFacilities()
}
