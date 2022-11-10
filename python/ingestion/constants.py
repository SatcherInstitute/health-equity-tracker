STATE_LEVEL_FIPS_LIST = [
    "01", "02", "04", "05", "06", "08", "09", "10",
    "11", "12", "13", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
    "41", "42", "44", "45", "46", "47", "48", "49", "50",
    "51", "53", "54", "55", "56", "60",
    "66", "69", "72", "78"
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



    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
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

STATE_TERRITORY_DICT = {
    "01": {"postal": "AL", "name": "Alabama"},
    "02": {"postal": "AK", "name": "Alaska"},
    "04": {"postal": "AZ", "name": "Arizona"},
    "05": {"postal": "AK", "name": "Arkansas"},
    "06": {"postal": "", "name": "California"},
    "08": {"postal": "", "name": "Colorado"},
    "09": {"postal": "", "name": "Connecticut"},
    "10": {"postal": "", "name": "Delaware"},
    "11": {"postal": "", "name": "Florida"},
    "12": {"postal": "", "name": "Georgia"},
    "13": {"postal": "", "name": "Hawaii"},
    "15": {"postal": "", "name": "Idaho"},
    "16": {"postal": "", "name": "Illinois"},
    "17": {"postal": "", "name": ""},
    "18": {"postal": "", "name": ""},
    "19": {"postal": "", "name": ""},
    "20": {"postal": "", "name": ""},
    "21": {"postal": "", "name": ""},
    "22": {"postal": "", "name": ""},
    "23": {"postal": "", "name": ""},
    "24": {"postal": "", "name": ""},
    "25": {"postal": "", "name": ""},
    "26": {"postal": "", "name": ""},
    "27": {"postal": "", "name": ""},
    "28": {"postal": "", "name": ""},
    "29": {"postal": "", "name": ""},
    "30": {"postal": "", "name": ""},
    "31": {"postal": "", "name": ""},
    "32": {"postal": "", "name": ""},
    "33": {"postal": "", "name": ""},
    "34": {"postal": "", "name": ""},
    "35": {"postal": "", "name": ""},
    "36": {"postal": "", "name": ""},
    "37": {"postal": "", "name": ""},
    "38": {"postal": "", "name": ""},
    "39": {"postal": "", "name": ""},
    "40": {"postal": "", "name": ""},
    "41": {"postal": "", "name": ""},
    "42": {"postal": "", "name": ""},
    "44": {"postal": "", "name": ""},
    "45": {"postal": "", "name": ""},
    "46": {"postal": "", "name": ""},
    "47": {"postal": "", "name": ""},
    "48": {"postal": "", "name": ""},
    "49": {"postal": "", "name": ""},
    "50": {"postal": "", "name": ""},
    "51": {"postal": "", "name": ""},
    "53": {"postal": "", "name": ""},
    "54": {"postal": "", "name": ""},
    "55": {"postal": "", "name": ""},
    "56": {"postal": "", "name": ""},
    "60": {"postal": "", "name": ""},
    "66": {"postal": "", "name": ""},
    "69": {"postal": "", "name": ""},
    "72": {"postal": "", "name": ""},
    "78": {"postal": "", "name": ""}
}


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
