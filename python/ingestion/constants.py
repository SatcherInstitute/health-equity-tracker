TERRITORY_FIPS_LIST = ["11", "60", "66", "69", "72", "78"]

STATE_LEVEL_FIPS_LIST = ["01", "02", "04", "05",
                         "06", "08", "09", "10",
                         "12", "13", "15", "16", "17", "18", "19", "20",
                         "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
                         "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
                         "41", "42", "44", "45", "46", "47", "48", "49", "50",
                         "51", "53", "54", "55", "56", *TERRITORY_FIPS_LIST]

STATE_POSTALS = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
    "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

TERRITORY_POSTALS = [
    "PR", "VI", "GU", "AS", "MP", "DC"
]


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
