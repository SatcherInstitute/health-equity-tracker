from typing import Literal

""" Use these when using cast(TYPE, variable) to explicitly tell the linter
that the variable is actually the expected type.

Prefer using an explicit `Literal["a", "b"]` in function signitures however, as
it seems that (at least VSCODE) can't interpret these TYPE variables as the underlying literals. """

SEX_RACE_AGE_TYPE = Literal["sex", "age", "race"]
SEX_RACE_ETH_AGE_TYPE = Literal["sex", "age", "race_and_ethnicity"]
INCARCERATION_TYPE = Literal["jail", "prison"]
VERA_PROPERTY_TYPE = Literal["raw", "rate",
                             "population", "total_confined_children"]
