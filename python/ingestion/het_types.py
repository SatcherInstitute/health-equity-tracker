from typing import Literal, TypedDict

""" Use these when using cast(TYPE, variable) to explicitly tell the linter
that the variable is actually the expected type.

Prefer using an explicit `Literal["a", "b"]` in function signatures however, as
it seems that (at least VSCODE) can't interpret these TYPE variables as the underlying literals. """

SEX_RACE_AGE_TYPE = Literal["sex", "age", "race"]
SEX_RACE_ETH_AGE_TYPE = Literal["sex", "age", "race_and_ethnicity"]
DEMOGRAPHIC_TYPE = Literal["sex", "age", "race", "race_and_ethnicity"]
INCARCERATION_TYPE = Literal["jail", "prison"]
VERA_PROPERTY_TYPE = Literal["raw", "rate", "population", "total_confined_children"]
GEO_TYPE = Literal["county", "state", "national"]
PHRMA_BREAKDOWN_TYPE = Literal['age', 'sex', 'race_and_ethnicity', 'lis', 'eligibility']
PHRMA_BREAKDOWN_TYPE_OR_ALL = Literal['age', 'sex', 'race_and_ethnicity', 'lis', 'eligibility', 'all']
HIV_BREAKDOWN_TYPE = Literal['age', 'sex', 'race', 'race_and_ethnicity', 'black_women']
TIME_VIEW_TYPE = Literal['historical', 'current']
TOPIC_CATEGORY_TYPE = Literal[
    'non-behavioral_health',  # TODO: delete this once AHR is split across all categories properly
    'all',
    'behavioral_health',
]


class RATE_CALC_COLS_TYPE(TypedDict):
    numerator_col: str
    denominator_col: str
    rate_col: str
