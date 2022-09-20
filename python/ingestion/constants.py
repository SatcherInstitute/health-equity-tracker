COUNTY_EQUIVALENT_FIPS_MAP = {
    "60010": "Eastern District",
    "60020": "Manu'a District",
    "60030": "Rose Atoll (Rose Island)",
    "60040": "Swain's Island",
    "60050": "Western District",
    "66010": "Guam",
    "69085": "Northern Islands Municipality",
    "69100": "Rota Municipality",
    "69110": "Saipan Municipality",
    "69120": "Tinian Municipality",
    "78010": "St. Croix",
    "78020": "St. John",
    "78030": "St. Thomas",
}


# Used in BJS, Primary Care Access URL, and filenames
STATE_NAMES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
]

US_FIPS = '00'
US_NAME = 'United States'
US_ABBR = "US"


NATIONAL_LEVEL = "national"
STATE_LEVEL = "state"
COUNTY_LEVEL = "county"

UNKNOWN = "Unknown"

RACE = 'race'
SEX = 'sex'
AGE = 'age'


class Sex:
    MALE = "Male"
    FEMALE = "Female"


class HealthInsurancePopulation:
    WITH = "With"
    WITHOUT = "Without"
    TOTAL = "Total"


class PovertyPopulation:
    BELOW = "below"
    ABOVE = "above"
    TOTAL = "total"
