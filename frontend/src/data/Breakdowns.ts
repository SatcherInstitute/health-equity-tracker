import { Fips } from "../utils/madlib/Fips";

export const ALL_RACES_DISPLAY_NAME = "All races";

export type GeographicBreakdown = "national" | "state" | "county";

// TODO is the race vs race_nonstandard distinction necessary, or should we just
// expect each provider to know what type it uses?
export type DemographicBreakdown = "race" | "race_nonstandard" | "age" | "sex";

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

function demographicBreakdownToCol(
  demographic: DemographicBreakdown
): BreakdownVar {
  switch (demographic) {
    case "race":
    case "race_nonstandard":
      return "race_and_ethnicity";
    case "age":
      return "age";
    case "sex":
      return "sex";
  }
}

export class Breakdowns {
  geography: GeographicBreakdown;
  // Note: this assumes only one demographic breakdown at a time. If we want to
  // support more later we can refactor this to multiple boolean fields.
  demographic?: DemographicBreakdown;
  // We may want to extend this to an explicit type to support variants for
  // day/week/month/year.
  time?: boolean;

  filterFips?: string;

  constructor(
    geography: GeographicBreakdown,
    demographic?: DemographicBreakdown,
    time?: boolean,
    filterFips?: string
  ) {
    this.geography = geography;
    this.demographic = demographic;
    this.time = time;
    this.filterFips = filterFips;
  }

  getUniqueKey() {
    return (
      "geography: " +
      this.geography +
      ", demographic: " +
      this.demographic +
      ", time: " +
      !!this.time +
      ", filterGeo: " +
      this.filterFips
    );
  }

  copy() {
    return new Breakdowns(
      this.geography,
      this.demographic,
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

  andDemographic(demographic: DemographicBreakdown): Breakdowns {
    if (this.demographic) {
      throw new Error("Multiple demographic breakdowns not supported");
    }
    this.demographic = demographic;
    return this;
  }

  addBreakdown(
    breakdownVar: BreakdownVar,
    nonstandardizedRace = false
  ): Breakdowns {
    switch (breakdownVar) {
      case "race_and_ethnicity":
        return nonstandardizedRace
          ? this.andDemographic("race_nonstandard")
          : this.andDemographic("race");
      case "age":
        return this.andDemographic("age");
      case "sex":
        return this.andDemographic("sex");
      case "date":
        this.time = true;
        return this;
    }
    return this;
  }

  andRace(nonstandard = false): Breakdowns {
    return this.addBreakdown("race_and_ethnicity", nonstandard);
  }

  andAge(): Breakdowns {
    return this.addBreakdown("age");
  }

  andGender(): Breakdowns {
    return this.addBreakdown("sex");
  }

  andTime(): Breakdowns {
    return this.addBreakdown("date");
  }

  /** Filters to entries that exactly match the specified FIPS code. */
  withGeoFilter(fipsCode: string): Breakdowns {
    this.filterFips = fipsCode;
    return this;
  }

  getJoinColumns(): BreakdownVar[] {
    const joinCols: BreakdownVar[] = ["state_fips"];
    if (this.demographic) {
      joinCols.push(demographicBreakdownToCol(this.demographic));
    }
    if (this.time) {
      joinCols.push("date");
    }
    return joinCols;
  }
}
