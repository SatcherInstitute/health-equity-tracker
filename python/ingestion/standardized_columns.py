from enum import Enum, unique
from collections import namedtuple
import pandas


# The name of the column for a unique string id for the race category. Should be
# semi-human readable. See Race enum below for values.
RACE_CATEGORY_ID_COL = "race_category_id"

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
STATE_POSTAL_COL = "state_postal"  # State 2-letter postal abberviation.
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

# Standard Health Insurance Population Cols
TOTAL_HEALTH_INSURANCE_COL = "total_health_insurance"
WITH_HEALTH_INSURANCE_COL = "with_health_insurance"
WITHOUT_HEALTH_INSURANCE_COL = "without_health_insurance"

ABOVE_POVERTY_COL = "above_poverty_line"
BELOW_POVERTY_COL = "below_poverty_line"

COPD_PCT = "copd_pct"
DIABETES_PCT = "diabetes_pct"

VACCINATED_FIRST_DOSE = "vaccinated_first_dose"
VACCINATED_PCT = "vaccinated_pct"
VACCINATED_PCT_SHARE = "vaccinated_pct_share"

RaceTuple = namedtuple("RaceTuple", [
    "race_category_id",
    "race",
    "race_includes_hispanic",
    "race_and_ethnicity"
])


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
    OTHER_STANDARD = ("OTHER_STANDARD", "Some other race", True)

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
    OTHER_STANDARD_NH = ("OTHER_STANDARD_NH", "Some other race", False)

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
    OTHER_NONSTANDARD = ("OTHER_NONSTANDARD", "Some other race*", True)
    OTHER_NONSTANDARD_NH = ("OTHER_NONSTANDARD_NH", "Some other race*", False)

    # Categories that are combinations of other categories
    API = ("API", "Asian and Pacific Islander", True)
    API_NH = ("API_NH", "Asian and Pacific Islander", False)
    # Combines AIAN and NHPI
    INDIGENOUS = ("INDIGENOUS", "Indigenous", True)
    # Combines AIAN_NH and NHPI_NH
    INDIGENOUS_NH = ("INDIGENOUS_NH", "Indigenous", False)
    MULTI_OR_OTHER_STANDARD = (
        "MULTI_OR_OTHER_STANDARD",
        "Two or more races & Some other race",
        True)
    MULTI_OR_OTHER_STANDARD_NH = (
        "MULTI_OR_OTHER_STANDARD_NH",
        "Two or more races & Some other race",
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
