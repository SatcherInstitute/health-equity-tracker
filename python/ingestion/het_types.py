from typing import Literal, TypedDict

""" Use these when using cast(TYPE, variable) to explicitly tell the linter
that the variable is actually the expected type.

Prefer using an explicit `Literal["a", "b"]` in function signatures however, as
it seems that (at least VSCODE) can't interpret these TYPE variables as the underlying literals. """

SEX_RACE_AGE_TYPE = Literal["sex", "age", "race"]
SEX_RACE_ETH_AGE_TYPE = Literal["sex", "age", "race_and_ethnicity"]
DEMOGRAPHIC_TYPE = Literal["sex", "age", "race", "race_and_ethnicity"]

PHRMA_BREAKDOWN_TYPE = Literal[
    'age',
    'sex',
    'race_and_ethnicity',
    'lis',
    'eligibility',
    'insurance_status',
    'education',
    'income',
]
PHRMA_BREAKDOWN_TYPE_OR_ALL = Literal[
    'age', 'sex', 'race_and_ethnicity', 'lis', 'eligibility', 'insurance_status', 'education', 'income', 'all'
]

PHRMA_DATASET_TYPE = Literal["brfss", "medicare"]

HIV_BREAKDOWN_TYPE = Literal['age', 'sex', 'race', 'race_and_ethnicity', 'black_women']
WISQARS_DEMO_TYPE = Literal["sex", "age", "race_and_ethnicity", "urbanicty", "all"]

INCARCERATION_TYPE = Literal["jail", "prison"]
VERA_PROPERTY_TYPE = Literal["raw", "rate", "population", "confined_children_estimated_total"]
GEO_TYPE = Literal["county", "state", "national"]


TIME_VIEW_TYPE = Literal['historical', 'current']

TOPIC_CATEGORY_TYPE = Literal[
    'non-behavioral_health',  # TODO: delete this once AHR is split across all categories properly
    'all',
    'behavioral_health',
]

WISQARS_VAR_TYPE = Literal[
    "fatal_gun_injuries",
    "gun_violence_homicide",
    "gun_violence_suicide",
    "gun_deaths_young_adults",
    "gun_deaths_youth",
    "gun_homicides_black_men",
    "fatal",
]

SUFFIX_TYPE = Literal["count", "pct_share", "per_100k", "estimated_total", "pct_relative_inequity", "pct_rate", "index"]


class RATE_CALC_COLS_TYPE(TypedDict):
    numerator_col: str
    denominator_col: str
    rate_col: str
