import { Fips } from "../utils/Fips";
import BreakdownFilter from "./BreakdownFilter";

export type TimeView = "cross_sectional" | "longitudinal";

export type GeographicBreakdown =
  | "national"
  | "state"
  | "county"
  | "territory"
  | "state/territory";

export type BreakdownVar =
  | "race_and_ethnicity"
  | "age"
  | "sex"
  | "date"
  | "fips";

export const DEMOGRAPHIC_BREAKDOWNS = [
  "race_and_ethnicity",
  "sex",
  "age",
] as const;

// union type of array
export type DemographicBreakdownKey = typeof DEMOGRAPHIC_BREAKDOWNS[number];

export const BREAKDOWN_VAR_DISPLAY_NAMES: Record<BreakdownVar, string> = {
  race_and_ethnicity: "Race And Ethnicity",
  age: "Age",
  sex: "Sex",
  date: "Date",
  fips: "FIPS Code",
} as const;

// union type of values (capitalized display names), eg "Race and Ethnicity" | "Age" | "Sex"
export type BreakdownVarDisplayName =
  typeof BREAKDOWN_VAR_DISPLAY_NAMES[keyof typeof BREAKDOWN_VAR_DISPLAY_NAMES];

export const BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE: Record<
  BreakdownVar,
  string
> = {
  race_and_ethnicity: "race and ethnicity",
  age: "age",
  sex: "sex",
  date: "date",
  fips: "FIPs codes",
};

interface DemographicBreakdown {
  // Name of the column in the returned data
  readonly columnName: BreakdownVar;
  // Whether the demographic breakdown is requested
  readonly enabled: boolean;
  // Filter to apply to the breakdown. If no filter is specified, all available
  // values for that column should be returned.
  readonly filter?: Readonly<BreakdownFilter>;
}

function stringifyDemographic(breakdown: DemographicBreakdown) {
  if (!breakdown.enabled) {
    return undefined;
  }
  if (!breakdown.filter) {
    return "no filters";
  }
  const includeStr = breakdown.filter.include ? "include " : "exclude ";
  return includeStr + breakdown.filter.values.join();
}

function createDemographicBreakdown(
  columnName: BreakdownVar,
  enabled = false,
  filter?: BreakdownFilter
): DemographicBreakdown {
  return {
    columnName: columnName,
    enabled: enabled,
    filter: filter,
  };
}

export class Breakdowns {
  geography: GeographicBreakdown;
  // We may want to extend this to an explicit type to support variants for
  // day/week/month/year.
  time: boolean;
  demographicBreakdowns: Record<
    DemographicBreakdownKey,
    Readonly<DemographicBreakdown>
  >;
  filterFips?: Fips;

  constructor(
    geography: GeographicBreakdown,
    demographicBreakdowns?: Record<
      DemographicBreakdownKey,
      DemographicBreakdown
    >,
    time = false,
    filterFips?: Fips | undefined
  ) {
    this.geography = geography;
    this.demographicBreakdowns = demographicBreakdowns
      ? { ...demographicBreakdowns }
      : {
          race_and_ethnicity: createDemographicBreakdown("race_and_ethnicity"),
          age: createDemographicBreakdown("age"),
          sex: createDemographicBreakdown("sex"),
        };
    this.time = time;
    this.filterFips = filterFips;
  }

  // Returns a string that uniquely identifies a breakdown. Two identical breakdowns will return the same key
  getUniqueKey() {
    let breakdowns: Record<string, any> = {
      geography: this.geography,
      time: this.time || undefined,
      filterFips: this.filterFips ? this.filterFips.code : undefined,
    };
    Object.entries(this.demographicBreakdowns).forEach(
      ([breakdownKey, breakdown]) => {
        breakdowns[breakdownKey] = stringifyDemographic(breakdown);
      }
    );
    // Any fields that are not set will not be included in the string for readability
    // We want to sort these to ensure that it is deterministic so that all breakdowns map to the same key
    const orderedBreakdownKeys = Object.keys(breakdowns)
      .sort()
      .filter((k) => breakdowns[k] !== undefined);
    return orderedBreakdownKeys.map((k) => `${k}:${breakdowns[k]}`).join(",");
  }

  copy() {
    return new Breakdowns(
      this.geography,
      { ...this.demographicBreakdowns },
      this.time,
      this.filterFips ? new Fips(this.filterFips.code) : undefined
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
    if (fips.isCounty()) {
      return Breakdowns.byCounty().withGeoFilter(fips);
    }

    return fips.isUsa()
      ? Breakdowns.national()
      : Breakdowns.byState().withGeoFilter(fips);
  }

  static forParentFips(fips: Fips): Breakdowns {
    if (fips.isStateOrTerritory()) {
      return Breakdowns.byCounty().withGeoFilter(fips);
    }
    if (fips.isUsa()) {
      return Breakdowns.byState();
    }
    return Breakdowns.forFips(fips);
  }

  static forChildrenFips(fips: Fips): Breakdowns {
    if (fips.isCounty()) {
      return Breakdowns.byCounty().withGeoFilter(fips);
    } else if (fips.isStateOrTerritory()) {
      return Breakdowns.byCounty().withGeoFilter(fips);
    } else {
      return Breakdowns.byState();
    }
  }

  addBreakdown(
    breakdownVar: BreakdownVar,
    filter?: BreakdownFilter
  ): Breakdowns {
    switch (breakdownVar) {
      case "race_and_ethnicity":
      case "age":
      case "sex":
        // Column name is the same as key
        this.demographicBreakdowns[breakdownVar] = createDemographicBreakdown(
          breakdownVar,
          true,
          filter
        );
        return this;
      case "date":
        this.time = true;
        return this;
      case "fips":
        throw new Error("Fips breakdown cannot be added");
    }
  }

  andRace(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown("race_and_ethnicity", filter);
  }

  andAge(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown("age", filter);
  }

  andSex(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown("sex", filter);
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

  hasNoDemographicBreakdown() {
    return this.demographicBreakdownCount() === 0;
  }

  hasExactlyOneDemographic() {
    return this.demographicBreakdownCount() === 1;
  }

  getSoleDemographicBreakdown(): DemographicBreakdown {
    if (!this.hasExactlyOneDemographic()) {
      throw new Error("Invalid assertion of only one demographic breakdown");
    }

    return Object.values(this.demographicBreakdowns).find(
      (breakdown) => breakdown.enabled
    )!;
  }

  hasOnlyRace() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.race_and_ethnicity.enabled
    );
  }

  hasOnlyAge() {
    return (
      this.hasExactlyOneDemographic() && this.demographicBreakdowns.age.enabled
    );
  }

  hasOnlySex() {
    return (
      this.hasExactlyOneDemographic() && this.demographicBreakdowns.sex.enabled
    );
  }

  hasOneRegionOfGeographicGranularity(): boolean {
    switch (this.geography) {
      case "county":
        return !!this.filterFips && this.filterFips.isCounty();
      case "state":
        return !!this.filterFips && this.filterFips.isStateOrTerritory();
      case "territory":
        return !!this.filterFips && this.filterFips.isStateOrTerritory();
      case "state/territory":
        return !!this.filterFips && this.filterFips.isStateOrTerritory();
      case "national":
        return !this.filterFips || this.filterFips.isUsa();
    }
  }

  /** Filters to entries that exactly match the specified FIPS code. */
  withGeoFilter(fips: Fips): Breakdowns {
    this.filterFips = fips;
    return this;
  }

  getJoinColumns(): BreakdownVar[] {
    const joinCols: BreakdownVar[] = ["fips"];
    Object.entries(this.demographicBreakdowns).forEach(
      ([key, demographicBreakdown]) => {
        if (demographicBreakdown.enabled) {
          joinCols.push(demographicBreakdown.columnName);
        }
      }
    );
    if (this.time) {
      joinCols.push("date");
    }
    return joinCols.sort();
  }
}
