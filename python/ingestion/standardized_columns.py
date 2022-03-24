from enum import Enum, unique
from collections import namedtuple
import pandas

# The name of the column for a unique string id for the race category. Should be
# semi-human readable. See Race enum below for values.
RACE_CATEGORY_ID_COL = "race_category_id"

# For intersectional displays like CAWP data where we know all values will refer only to women
RACE_WOMEN_COL = "race_women"

# The name of the column that displays the fully-qualified race name, including
# whether Hispanic/Latino are included.
RACE_OR_HISPANIC_COL = "race_and_ethnicity"

# The name of the column for Whether a person is Hispanic/Latino or not.
HISPANIC_COL = "hispanic_or_latino"

# The name of the column for whether the race category includes Hispanic/Latino
# people.
RACE_INCLUDES_HISPANIC_COL = "race_includes_hispanic"

# The name of the column that displays the basic race name, not specifying
# whether Hispanic/Latino people are included.
RACE_COL = "race"

AGE_COL = "age"
SEX_COL = "sex"
STATE_FIPS_COL = "state_fips"
STATE_NAME_COL = "state_name"
STATE_POSTAL_COL = "state_postal"  # State 2-letter postal abbreviation.
COUNTY_FIPS_COL = "county_fips"
COUNTY_NAME_COL = "county_name"
POPULATION_COL = "population"
INCOME_COL = "income"
POPULATION_PCT_COL = "population_pct"

TOTAL_VALUE = "Total"
ALL_VALUE = "All"

# Standardized column names for Covid cases, hospitalizations, and deaths.
COVID_CASES = "cases"
COVID_HOSP_Y = "hosp_y"
COVID_HOSP_N = "hosp_n"
COVID_HOSP_UNKNOWN = "hosp_unknown"
COVID_DEATH_Y = "death_y"
COVID_DEATH_N = "death_n"
COVID_DEATH_UNKNOWN = "death_unknown"

COVID_DEATH_RATIO_AGE_ADJUSTED = "death_ratio_age_adjusted"
COVID_HOSP_RATIO_AGE_ADJUSTED = "hosp_ratio_age_adjusted"

# Standard Health Insurance Population Cols
TOTAL_HEALTH_INSURANCE_COL = "total_health_insurance"
WITH_HEALTH_INSURANCE_COL = "with_health_insurance"
WITHOUT_HEALTH_INSURANCE_COL = "without_health_insurance"

ABOVE_POVERTY_COL = "above_poverty_line"
BELOW_POVERTY_COL = "below_poverty_line"

# Standardized names for UHC columns
DEPRESSION_PER_100K = "depression_per_100k"
ILLICIT_OPIOID_USE_PER_100K = "illicit_opioid_use_per_100k"
NON_MEDICAL_RX_OPIOID_USE_PER_100K = "non_medical_rx_opioid_use_per_100k"
NON_MEDICAL_DRUG_USE_PER_100K = "non_medical_drug_use_per_100k"
EXCESSIVE_DRINKING_PER_100K = "excessive_drinking_per_100k"
COPD_PER_100K = "copd_per_100k"
DIABETES_PER_100K = "diabetes_per_100k"
ANXIETY_PER_100K = "anxiety_per_100k"
FREQUENT_MENTAL_DISTRESS_PER_100K = "frequent_mental_distress_per_100k"
SUICIDE_PER_100K = "suicide_per_100k"
PREVENTABLE_HOSP_PER_100K = "preventable_hospitalizations_per_100k"
AVOIDED_CARE_PER_100K = "avoided_care_per_100k"
CHRONIC_KIDNEY_PER_100K = "chronic_kidney_disease_per_100k"
CARDIOVASCULAR_PER_100K = "cardiovascular_diseases_per_100k"
ASTHMA_PER_100K = "asthma_per_100k"
VOTER_PARTICIPATION_PER_100K = "voter_participation_per_100k"

# Standardized for Vaccination columns
VACCINATED_FIRST_DOSE = "vaccinated_first_dose"
VACCINATED_PCT = "vaccinated_pct"
VACCINATED_SHARE_OF_KNOWN = "vaccinated_share_of_known"
VACCINATED_PER_100K = "vaccinated_per_100k"
VACCINATED_PCT_SHARE = "vaccinated_pct_share"

# Standardized for CAWP Women in Legislature
# (eg % state legislature who are black women)
WOMEN_STATE_LEG_PCT = "women_state_leg_pct"
# (eg % of women legislators who are black)
WOMEN_STATE_LEG_PCT_SHARE = "women_state_leg_pct_share"
WOMEN_US_CONGRESS_PCT = "women_us_congress_pct"
# (eg % of women legislators who are black)
WOMEN_US_CONGRESS_PCT_SHARE = "women_us_congress_pct_share"

RaceTuple = namedtuple("RaceTuple", [
    "race_category_id",
    "race",
    "race_includes_hispanic",
    "race_and_ethnicity"
])

RACE_COLUMNS = RaceTuple._fields


@unique
class Race(Enum):
    # These categories are one format of standard categories used in ACS data,
    # where categories are mutually exclusive but each one includes
    # Hispanic/Latino. The sum of these values is equal to the total population.
    # OTHER_STANDARD is defined as anyone who does not fall into one of the
    # other categories in this format.
    AIAN = ("AIAN", "American Indian and Alaska Native", True)
    ASIAN = ("ASIAN", "Asian", True)
    BLACK = ("BLACK", "Black or African American", True)
    NHPI = ("NHPI", "Native Hawaiian and Pacific Islander", True)
    MULTI = ("MULTI", "Two or more races", True)
    WHITE = ("WHITE", "White", True)
    OTHER_STANDARD = ("OTHER_STANDARD", "Unrepresented race", True)

    # These categories are another format of standard categories used in ACS
    # data, where categories are mutually exclusive and exclude Hispanic/Latino.
    # Hispanic/Latino is its own category. Each one of these is a strict subset
    # of its counterpart in the above format. OTHER_STANDARD_NH is defined as
    # anyone who does not fall into one of the other categories in this format.
    # Where possible, this format is preferred.
    AIAN_NH = ("AIAN_NH", "American Indian and Alaska Native", False)
    ASIAN_NH = ("ASIAN_NH", "Asian", False)
    BLACK_NH = ("BLACK_NH", "Black or African American", False)
    NHPI_NH = ("NHPI_NH", "Native Hawaiian and Pacific Islander", False)
    MULTI_NH = ("MULTI_NH", "Two or more races", False)
    WHITE_NH = ("WHITE_NH", "White", False)
    HISP = ("HISP", "Hispanic or Latino", True)
    OTHER_STANDARD_NH = ("OTHER_STANDARD_NH", "Unrepresented race", False)

    # Below are special values that have slightly different characteristics.

    # Hispanic vs Non-Hispanic can be defined differently across datasets.
    # Sometimes Hispanic/Latino is treated as mutually exclusive with other
    # racial categories, so when a person is categorized as Hispanic or Latino
    # they are excluded from the data for any other racial category they belong
    # to. Other times, a person may be reported as both Hispanic/Latino and as
    # another race. In some datasets, these are reported entirely independently
    # so we do not know the relationship between Hispanic/Latino and race.
    # ETHNICITY_UNKNOWN refers to data that does not know whether the person is
    # Hispanic or Latino. (Some datasets use "ethnicity" to refer to whether
    # someone is Hispanic or Latino)
    NH = ("NH", "Not Hispanic or Latino", False)
    ETHNICITY_UNKNOWN = ("ETHNICITY_UNKNOWN", "Unknown ethnicity", None)

    # OTHER_STANDARD and OTHER_STANDARD_NH define "other" in a specific way (see
    # above). Some datasets may group additional races into "other"
    # when reporting (for example "other" may sometimes include AIAN or NHPI).
    # These datasets should use OTHER_NONSTANDARD/OTHER_NONSTANDARD_NH to
    # prevent joining with the incorrect population data.
    # TODO: The frontend uses the race_and_ethnicity column as a unique
    # identifier in some places. Until we migrate to using race_category_id,
    # we add a * for the non-standard other so it doesn't accidentally get
    # joined with the standard other on the frontend.
    OTHER_NONSTANDARD = ("OTHER_NONSTANDARD", "Unrepresented race", True)
    OTHER_NONSTANDARD_NH = ("OTHER_NONSTANDARD_NH",
                            "Unrepresented race", False)

    # CAWP Unique Race/Eth Categories
    ASIAN_PAC_NH = ("ASIAN_PAC_NH", "Asian American & Pacific Islander", False)
    MENA_NH = ("MENA_NH", "Middle Eastern & North African", False)
    AIANNH_NH = (
        "AIANNH_NH", "Native American, Alaska Native, & Native Hawaiian", False)
    HISP_F = ("HISP_F", "Latina", True)

    # Categories that are combinations of other categories

    # Combines AIAN and NHPI
    API = ("API", "Asian, Native Hawaiian, and Pacific Islander", True)
    # Combines AIAN_NH and NHPI_NH
    API_NH = ("API_NH", "Asian, Native Hawaiian, and Pacific Islander", False)

    INDIGENOUS = ("INDIGENOUS", "Indigenous", True)
    INDIGENOUS_NH = ("INDIGENOUS_NH", "Indigenous", False)
    MULTI_OR_OTHER_STANDARD = (
        "MULTI_OR_OTHER_STANDARD",
        "Two or more races & Unrepresented race",
        True)
    MULTI_OR_OTHER_STANDARD_NH = (
        "MULTI_OR_OTHER_STANDARD_NH",
        "Two or more races & Unrepresented race",
        False)

    # When the race is unknown. Different from ETHNICITY_UNKNOWN, which
    # specifically refers to whether Hispanic/Latino is unknown.
    UNKNOWN = ("UNKNOWN", "Unknown race", True)
    UNKNOWN_NH = ("UNKNOWN_NH", "Unknown race", False)

    # The total across races. This must always be included when the other race
    # values do not sum to 100%
    TOTAL = ("TOTAL", TOTAL_VALUE, None)
    ALL = ("ALL", ALL_VALUE, None)

    # We set the enum value to the first arg, which is the race category id, or
    # a unique code that can be used to reference that race. Race category ids
    # should be set to the same value as the enum name.
    # Arguments are set as optional to accommodate a mypy bug with enums:
    # https://github.com/python/mypy/issues/1021.
    def __new__(cls, value, race=None, includes_hispanic=None):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._race = race
        obj._includes_hispanic = includes_hispanic
        return obj

    @property
    def race_category_id(self) -> str:
        """The race category id; uniquely identifies this enum member."""
        return self.value

    @property
    def race(self):
        """The basic display name for this race."""
        return self._race

    @property
    def includes_hispanic(self):
        """Whether this race includes Hispanic or Latino."""
        return self._includes_hispanic

    @property
    def race_and_ethnicity(self) -> str:
        """The fully-qualified dispaly name that specifies both race and whether
           the category includes Hispanic or Latino."""
        if (self.includes_hispanic is True or
                self.includes_hispanic is None or
                self.race in ["Hispanic or Latino", "Not Hispanic or Latino"]):
            return self.race
        else:
            return self.race + " (Non-Hispanic)"

    @staticmethod
    def get_col_names() -> list:
        """The list of column names for putting the race attributes into a
           table. Columns are returned in the same order as `as_tuple()`."""
        return list(RaceTuple._fields)

    @staticmethod
    def from_category_id(category_id: str):
        """Gets an instance of this Enum from the provided race category id."""
        # Instances of an enum can be constructed from their value, and since we
        # set the enum value to the category id, we can construct an instance
        # without providing other params.
        # pylint: disable=no-value-for-parameter
        return Race(category_id)

    def as_tuple(self) -> RaceTuple:
        """The race attributes, in the same order as `get_col_names()`."""
        return RaceTuple(self.race_category_id, self.race,
                         self.includes_hispanic, self.race_and_ethnicity)


def add_race_columns_from_category_id(df):
    """Adds all race-related columns to the dataframe using the race category id
       to determine these values."""
    df["race_tuple"] = df.apply(
        lambda r: Race.from_category_id(r[RACE_CATEGORY_ID_COL]).as_tuple(),
        axis=1)
    df[Race.get_col_names()] = pandas.DataFrame(
        df["race_tuple"].tolist(), index=df.index)
    df.drop("race_tuple", axis=1, inplace=True)
