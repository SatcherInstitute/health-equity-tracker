from typing import Literal, get_args, TypedDict
from typing_extensions import TypeAlias

COMPREHENSIVE_DEMOGRAPHIC_TYPE: TypeAlias = Literal[
    'sex',
    'age',
    'race',
    'race_and_ethnicity',
    'lis',
    'eligibility',
    'insurance_status',
    'education',
    'income',
    'all',
    'black_women',
    'urbanicity',
    'black_women_by_age',
    'black_men_by_age',
    'black_men_by_urbanicity',
    'youth_by_race_and_ethnicity',
    'alls',
]


def create_subset_type(*options):
    comprehensive_options = set(get_args(COMPREHENSIVE_DEMOGRAPHIC_TYPE))
    invalid_options = set(options) - comprehensive_options
    if invalid_options:
        raise ValueError(f"Invalid options {invalid_options}. Must be subset of comprehensive demographic type")
    return Literal[options]


# Define type aliases explicitly
SEX_RACE_AGE_TYPE: TypeAlias = Literal['sex', 'age', 'race']
SEX_RACE_ETH_AGE_TYPE: TypeAlias = Literal['sex', 'age', 'race_and_ethnicity']
DEMOGRAPHIC_TYPE: TypeAlias = Literal['sex', 'age', 'race', 'race_and_ethnicity']

PHRMA_BREAKDOWN_TYPE: TypeAlias = Literal[
    'age', 'sex', 'race_and_ethnicity', 'lis', 'eligibility', 'insurance_status', 'education', 'income'
]
PHRMA_BREAKDOWN_TYPE_OR_ALL: TypeAlias = Literal[
    'age', 'sex', 'race_and_ethnicity', 'lis', 'eligibility', 'insurance_status', 'education', 'income', 'all'
]

HIV_BREAKDOWN_TYPE: TypeAlias = Literal['age', 'sex', 'race', 'race_and_ethnicity', 'black_women']
WISQARS_DEMO_TYPE: TypeAlias = Literal['sex', 'age', 'race_and_ethnicity', 'urbanicity', 'all']

GEO_TYPE = Literal["county", "state", "national"]

CANCER_TYPE_OR_ALL = Literal['age', 'race', 'race_and_ethnicity', 'sex', 'all']

TIME_VIEW_TYPE = Literal['historical', 'current']

TOPIC_CATEGORY_TYPE = Literal[
    'non-behavioral_health',  # TODO: delete this once AHR is split across all categories properly
    'all',
    'behavioral_health',
]
PHRMA_DATASET_TYPE = Literal["brfss", "medicare"]

WISQARS_VAR_TYPE = Literal[
    "fatal_gun_injuries",
    "gun_violence_homicide",
    "gun_violence_suicide",
    "gun_deaths_young_adults",
    "gun_deaths_youth",
    "gun_homicides_black_men",
    "fatal",
]

INCARCERATION_TYPE = Literal["jail", "prison"]
VERA_PROPERTY_TYPE = Literal["raw", "rate", "population", "confined_children_estimated_total"]

SUFFIX_TYPE = Literal["count", "pct_share", "per_100k", "estimated_total", "pct_relative_inequity", "pct_rate", "index"]


class RATE_CALC_COLS_TYPE(TypedDict):
    numerator_col: str
    denominator_col: str
    rate_col: str
