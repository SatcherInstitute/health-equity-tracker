import { CITY_FIPS_MAP } from "./Cities";
import { COUNTY_FIPS_MAP } from "./Counties";

export const USA_DISPLAY_NAME = "United States";
// Fake FIPS code used to represent totals in USA for convenience
export const USA_FIPS = "00";

export const AMERICAN_SAMOA = "60";
export const GUAM = "66";
export const NORTHERN_MARIANA_ISLANDS = "69";
export const PUERTO_RICO = "72";
export const VIRGIN_ISLANDS = "78";

export const TERRITORY_CODES = [
  AMERICAN_SAMOA,
  GUAM,
  NORTHERN_MARIANA_ISLANDS,
  PUERTO_RICO,
  VIRGIN_ISLANDS,
];

export const ACS_2010_FIPS = [
  GUAM,
  VIRGIN_ISLANDS,
  NORTHERN_MARIANA_ISLANDS,
  AMERICAN_SAMOA,
];

// Fips code for District of Columbia (county).
export const DC_COUNTY_FIPS = "11001";

class Fips {
  code: string;

  constructor(code: string) {
    if (!RegExp("^[0-9]{2}|[0-9]{5}|[0-9]{10}$").test(code)) {
      throw new Error(`Invalid FIPS code: ${code}`);
    }
    this.code = code;
  }

  isUsa() {
    return this.code === USA_FIPS;
  }

  isStateOrTerritory() {
    return this.code.length === 2 && !this.isUsa();
  }

  isState() {
    return this.isStateOrTerritory() && !TERRITORY_CODES.includes(this.code);
  }

  isTerritory() {
    return this.isStateOrTerritory() && TERRITORY_CODES.includes(this.code);
  }

  needsACS2010() {
    return this.isStateOrTerritory() && ACS_2010_FIPS.includes(this.code);
  }

  isCounty() {
    return this.code.length === 5;
  }

  isCity() {
    return this.code.length === 10;
  }

  getFipsTypeDisplayName() {
    if (this.isUsa()) {
      return "national";
    } else if (this.isState()) {
      return "state";
    } else if (this.isTerritory()) {
      return "territory";
    } else if (this.isCounty()) {
      return "county";
    } else if (this.isCity()) {
      return "city";
    } else {
      return "";
    }
  }

  getChildFipsTypeDisplayName() {
    if (this.isUsa()) {
      return "state/territory";
    } else if (this.isState()) {
      return "county";
    } else if (this.isTerritory()) {
      return "county equivalent";
    } else {
      return "";
    }
  }

  getPluralChildFipsTypeDisplayName() {
    if (this.isUsa()) {
      return "states/territories";
    } else if (this.isState()) {
      return "counties";
    } else if (this.isTerritory()) {
      return "county equivalents";
    } else {
      return "";
    }
  }

  getDisplayName(): string {
    // USA or STATE
    if (this.isStateOrTerritory() || this.isUsa())
      return STATE_FIPS_MAP[this.code];
    // COUNTY EQUIVALENTS (FROM TERRITORIES)
    if (this.getParentFips().isTerritory())
      return `${COUNTY_FIPS_MAP[this.code]}`;
    // COUNTIES (with the word COUNTY added as needed)
    if (this.isCounty()) {
      return `${COUNTY_FIPS_MAP[this.code]} County`;
      // const optionalCounty =
      //   COUNTY_FIPS_MAP[this.code].includes("Borough") ||
      //   COUNTY_FIPS_MAP[this.code].includes("Area") ||
      //   COUNTY_FIPS_MAP[this.code].includes("District")
      //     ? ""
      //     : " County";
      // return `${COUNTY_FIPS_MAP[this.code]}${optionalCounty}`;
    }
    if (this.isCity()) {
      return `${CITY_FIPS_MAP[this.code]}, ${this.getParentFips()
        .getParentFips()
        .getDisplayName()}`;
    }
    return "";
    // const optionalCounty =
    //   COUNTY_FIPS_MAP[this.code].includes("Borough") ||
    //     COUNTY_FIPS_MAP[this.code].includes("Area") ||
    //     COUNTY_FIPS_MAP[this.code].includes("District")
    //     ? ""
    //     : " County";
    // return `${COUNTY_FIPS_MAP[this.code]}${optionalCounty}`;
  }

  getFullDisplayName() {
    return `${this.getDisplayName()}${
      this.isCounty() ? ", " + this.getStateDisplayName() : ""
    }`;
  }

  getSentenceDisplayName() {
    return `${this.isUsa() ? " the " : ""}${this.getFullDisplayName()}`;
  }

  getStateFipsCode() {
    return this.code.substring(0, 2);
  }

  getStateDisplayName() {
    return STATE_FIPS_MAP[this.getStateFipsCode()];
  }

  getCountyFipsCode() {
    return this.code.substring(0, 5);
  }

  getCountyDisplayName() {
    return COUNTY_FIPS_MAP[this.getCountyFipsCode()];
  }

  getParentFips() {
    if (this.isStateOrTerritory()) return new Fips(USA_FIPS);
    if (this.isCounty()) return new Fips(this.getStateFipsCode());
    if (this.isCity()) return new Fips(this.getCountyFipsCode());
    return new Fips(USA_FIPS);
  }

  isParentOf(cityOrCountyFipsCode: string) {
    return (
      cityOrCountyFipsCode.substring(0, 2) === this.code ||
      cityOrCountyFipsCode.substring(0, 5) === this.code
    );
  }
}

export { Fips };

export const STATE_FIPS_MAP: Record<string, string> = {
  [USA_FIPS]: USA_DISPLAY_NAME,
  "01": "Alabama",
  "02": "Alaska",
  "04": "Arizona",
  "05": "Arkansas",
  "06": "California",
  "08": "Colorado",
  "09": "Connecticut",
  "10": "Delaware",
  "11": "District of Columbia",
  "12": "Florida",
  "13": "Georgia",
  "15": "Hawaii",
  "16": "Idaho",
  "17": "Illinois",
  "18": "Indiana",
  "19": "Iowa",
  "20": "Kansas",
  "21": "Kentucky",
  "22": "Louisiana",
  "23": "Maine",
  "24": "Maryland",
  "25": "Massachusetts",
  "26": "Michigan",
  "27": "Minnesota",
  "28": "Mississippi",
  "29": "Missouri",
  "30": "Montana",
  "31": "Nebraska",
  "32": "Nevada",
  "33": "New Hampshire",
  "34": "New Jersey",
  "35": "New Mexico",
  "36": "New York",
  "37": "North Carolina",
  "38": "North Dakota",
  "39": "Ohio",
  "40": "Oklahoma",
  "41": "Oregon",
  "42": "Pennsylvania",
  "44": "Rhode Island",
  "45": "South Carolina",
  "46": "South Dakota",
  "47": "Tennessee",
  "48": "Texas",
  "49": "Utah",
  "50": "Vermont",
  "51": "Virginia",
  "53": "Washington",
  "54": "West Virginia",
  "55": "Wisconsin",
  "56": "Wyoming",
  "60": "American Samoa",
  "66": "Guam",
  "69": "Northern Mariana Islands",
  "72": "Puerto Rico",
  "78": "U.S. Virgin Islands",
};

export const FIPS_MAP = {
  ...STATE_FIPS_MAP,
  ...COUNTY_FIPS_MAP,
  ...CITY_FIPS_MAP,
};
