import { Fips } from "../utils/madlib/Fips";

export const ALL_RACES_DISPLAY_NAME = "All races";

export type GeographicBreakdown = "national" | "state" | "county";

// TODO flesh this out - would be nice to enforce more type-checking of these
// column names throughout the codebase, for example with a StandardizedRow type
// or an enum/constants that can be referenced.
// TODO do we want to generalize state_fips to just fips so that the same column
// can be used across different geography levels?
export type BreakdownVar =
  | "race_and_ethnicity"
  | "age"
  | "sex"
  | "date"
  | "state_fips";

export const BREAKDOWN_VAR_DISPLAY_NAMES: Record<BreakdownVar, string> = {
  race_and_ethnicity: "Race and Ethnicity",
  age: "Age",
  sex: "Sex",
  date: "Date",
  state_fips: "State FIPS Code",
};

interface DemographicBreakdown {
  // Name of the column in the returned data
  readonly columnName: string;
  // Whether the demographic breakdown is requested
  enabled: boolean;
  // If requested, should the breakdown include a "total", i.e. value for all age/race/sex
  includeTotal: boolean;
}

function stringifyDemographic(breakdown: DemographicBreakdown) {
  if (breakdown == undefined || !breakdown.enabled) {
    return undefined;
  }
  return breakdown.includeTotal ? "with total" : "without total";
}

function createDemographicBreakdown(
  columnName: string,
  enabled = false,
  includeTotal = false
) {
  return {
    columnName: columnName,
    enabled: enabled,
    includeTotal: includeTotal,
  };
}

export class Breakdowns {
  geography: GeographicBreakdown;
  // We may want to extend this to an explicit type to support variants for
  // day/week/month/year.
  time: boolean;
  demographicBreakdowns: Record<string, DemographicBreakdown>;
  filterFips?: string;

  constructor(
    geography: GeographicBreakdown,
    demographicBreakdowns?: Record<string, DemographicBreakdown>,
    time = false,
    filterFips?: string
  ) {
    this.geography = geography;
    this.demographicBreakdowns = demographicBreakdowns || {
      race: createDemographicBreakdown("race_and_ethnicity"),
      race_nonstandard: createDemographicBreakdown("race_and_ethnicity"),
      age: createDemographicBreakdown("age"),
      sex: createDemographicBreakdown("sex"),
    };
    this.time = time;
    this.filterFips = filterFips;
  }

  getUniqueKey() {
    return (
      "geography: " +
      this.geography +
      ", race: " +
      this.demographicBreakdowns["race"] +
      ", race_nonstandard: " +
      this.demographicBreakdowns["race_nonstandard"] +
      ", age: " +
      this.demographicBreakdowns["age"] +
      ", sex: " +
      this.demographicBreakdowns["sex"] +
      ", time: " +
      this.time +
      ", filterGeo: " +
      this.filterFips
    );
  }

  getBreakdownString() {
    // Any fields that are not set will not be included in the string for readibility
    return JSON.stringify({
      geography: this.geography,
      time: this.time || undefined,
      race: stringifyDemographic(this.demographicBreakdowns["race"]),
      race_nonstandard: stringifyDemographic(
        this.demographicBreakdowns["race_nonstandard"]
      ),
      age: stringifyDemographic(this.demographicBreakdowns["age"]),
      sex: stringifyDemographic(this.demographicBreakdowns["sex"]),
      filterFips: this.filterFips || undefined,
    });
  }

  copy() {
    return new Breakdowns(
      this.geography,
      Object.assign({}, this.demographicBreakdowns),
      this.time,
      this.filterFips
    );
  }

  static national(): Breakdowns {
    return new Breakdowns("national");
  }

  static byState(): Breakdowns {
    return new Breakdowns("state");
  }

  static byCounty(): Breakdowns {
    return new Breakdowns("county");
  }

  static forFips(fips: Fips): Breakdowns {
    return fips.isUsa()
      ? Breakdowns.national()
      : Breakdowns.byState().withGeoFilter(fips.code);
  }

  addBreakdown(
    breakdownVar: BreakdownVar,
    includeTotal = false,
    nonstandardizedRace = false
  ): Breakdowns {
    switch (breakdownVar) {
      case "race_and_ethnicity":
        const breakdownKey = nonstandardizedRace ? "race_nonstandard" : "race";
        this.demographicBreakdowns[breakdownKey] = createDemographicBreakdown(
          "race_and_ethnicity",
          true,
          includeTotal
        );
        return this;
      case "age":
      case "sex":
        // Column name is the same as key for age and sex
        this.demographicBreakdowns[breakdownVar] = createDemographicBreakdown(
          breakdownVar,
          true,
          includeTotal
        );
        return this;
      case "date":
        this.time = true;
        return this;
    }
    return this;
  }

  andRace(includeTotal = false, nonstandard = false): Breakdowns {
    return this.addBreakdown(
      "race_and_ethnicity",
      /*includeTotal*/ includeTotal,
      nonstandard
    );
  }

  andAge(includeTotal = false): Breakdowns {
    return this.addBreakdown("age", includeTotal);
  }

  andGender(includeTotal = false): Breakdowns {
    return this.addBreakdown("sex", includeTotal);
  }

  andTime(): Breakdowns {
    return this.addBreakdown("date");
  }

  // Helper function returning how many demographic breakdowns are currently requested
  demographicBreakdownCount() {
    return Object.entries(this.demographicBreakdowns).filter(
      ([k, v]) => v.enabled
    ).length;
  }

  /** Filters to entries that exactly match the specified FIPS code. */
  withGeoFilter(fipsCode: string): Breakdowns {
    this.filterFips = fipsCode;
    return this;
  }

  getJoinColumns(): BreakdownVar[] {
    const joinCols: BreakdownVar[] = ["state_fips"];
    if (this.demographicBreakdowns.age.enabled) {
      joinCols.push("age");
    }
    if (
      this.demographicBreakdowns.race.enabled ||
      this.demographicBreakdowns.race_nonstandard.enabled
    ) {
      joinCols.push("race_and_ethnicity");
    }
    if (this.demographicBreakdowns.sex.enabled) {
      joinCols.push("sex");
    }
    if (this.time) {
      joinCols.push("date");
    }
    return joinCols;
  }
}
