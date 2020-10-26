from datasources import (cdc_covid_deaths, county_adjacency, county_names, 
                         household_income, population_by_race, primary_care_access, 
                         state_names, urgent_care_facilities)
from cdc_covid_deaths import CDCCovidDeaths
from county_adjacency import CountyAdjacency
from county_names import CountyNames
from household_income import HouseholdIncome
from population_by_race import PopulationByRace
from primary_care_access import PrimaryCareAccess
from state_names import StateNames
from urgent_care_facilities import UrgentCareFacilities

DATA_SOURCES_DICT = {
    CDCCovidDeaths.get_id() : CDCCovidDeaths(),
    CountyAdjacency.get_id() : CountyAdjacency(),
    CountyNames.get_id() : CountyNames(),
    HouseholdIncome.get_id() : HouseholdIncome(),
    PopulationByRace.get_id() : PopulationByRace(),
    PrimaryCareAccess.get_id() : PrimaryCareAccess(),
    StateNames.get_id() : StateNames(),
    UrgentCareFacilities.get_id() : UrgentCareFacilities()
}