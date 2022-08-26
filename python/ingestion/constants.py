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

STATE_LEVEL_FIPS_TO_NAME_MAP = {
    "01": "Alabama",
    # "02": "Alaska",
    # "04": "Arizona",
    # "05": "Arkansas",
    # "06": "California",
    # "08": "Colorado",
    # "09": "Connecticut",
    # "10": "Delaware",
    # "11": "District of Columbia",
    # "12": "Florida",
    # "13": "Georgia",
    # "15": "Hawaii",
    # "16": "Idaho",
    # "17": "Illinois",
    # "18": "Indiana",
    # "19": "Iowa",
    # "20": "Kansas",
    # "21": "Kentucky",
    # "22": "Louisiana",
    # "23": "Maine",
    # "24": "Maryland",
    # "25": "Massachusetts",
    # "26": "Michigan",
    # "27": "Minnesota",
    # "28": "Mississippi",
    # "29": "Missouri",
    # "30": "Montana",
    # "31": "Nebraska",
    # "32": "Nevada",
    # "33": "New Hampshire",
    # "34": "New Jersey",
    # "35": "New Mexico",
    # "36": "New York",
    # "37": "North Carolina",
    # "38": "North Dakota",
    # "39": "Ohio",
    # "40": "Oklahoma",
    # "41": "Oregon",
    # "42": "Pennsylvania",
    # "44": "Rhode Island",
    # "45": "South Carolina",
    # "46": "South Dakota",
    # "47": "Tennessee",
    # "48": "Texas",
    # "49": "Utah",
    # "50": "Vermont",
    # "51": "Virginia",
    # "53": "Washington",
    # "54": "West Virginia",
    # "55": "Wisconsin",
    # "56": "Wyoming",
    # "60": "American Samoa",
    # "66": "Guam",
    # "69": "Northern Mariana Islands",
    # "72": "Puerto Rico",
    "78": "U.S. Virgin Islands"
}

# Used in BJS, Primary Care Access URL, and filenames
# TODO: confirm we should have territory names in this list ?
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

UNKNOWN = "Unknown"


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
