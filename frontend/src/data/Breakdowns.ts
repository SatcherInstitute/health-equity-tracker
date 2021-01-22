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

export class Breakdowns {
  geography: GeographicBreakdown;
  // We may want to extend this to an explicit type to support variants for
  // day/week/month/year.
  time: boolean;
  race: boolean;
  race_nonstandard: boolean;
  age: boolean;
  sex: boolean;
  filterFips?: string;

  constructor(
    geography: GeographicBreakdown,
    race = false,
    race_nonstandard = false,
    age = false,
    sex = false,
    time = false,
    filterFips?: string
  ) {
    this.geography = geography;
    this.race = race;
    this.race_nonstandard = race_nonstandard;
    this.age = age;
    this.sex = sex;
    this.time = time;
    this.filterFips = filterFips;
  }

  getUniqueKey() {
    return (
      "geography: " +
      this.geography +
      ", race: " +
      this.race +
      ", race_nonstandard: " +
      this.race_nonstandard +
      ", age: " +
      this.age +
      ", sex: " +
      this.sex +
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
      race: this.race || undefined,
      race_nonstandard: this.race_nonstandard || undefined,
      age: this.age || undefined,
      sex: this.sex || undefined,
      filterFips: this.filterFips || undefined,
    });
  }

  copy() {
    return new Breakdowns(
      this.geography,
      this.race,
      this.race_nonstandard,
      this.age,
      this.sex,
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
    nonstandardizedRace = false
  ): Breakdowns {
    switch (breakdownVar) {
      case "race_and_ethnicity":
        if (nonstandardizedRace) {
          this.race_nonstandard = true;
        } else {
          this.race = true;
        }
        return this;
      case "age":
        this.age = true;
        return this;
      case "sex":
        this.sex = true;
        return this;
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

  // Helper function returning how many demographic breakdowns are currently requested
  demographicBreakdownCount() {
    return [this.age, this.sex, this.race, this.race_nonstandard].filter(
      (demo) => demo
    ).length;
  }

  /** Filters to entries that exactly match the specified FIPS code. */
  withGeoFilter(fipsCode: string): Breakdowns {
    this.filterFips = fipsCode;
    return this;
  }

  getJoinColumns(): BreakdownVar[] {
    const joinCols: BreakdownVar[] = ["state_fips"];
    if (this.age) {
      joinCols.push("age");
    }
    if (this.race || this.race_nonstandard) {
      joinCols.push("race_and_ethnicity");
    }
    if (this.sex) {
      joinCols.push("sex");
    }
    if (this.time) {
      joinCols.push("date");
    }
    return joinCols;
  }
}
