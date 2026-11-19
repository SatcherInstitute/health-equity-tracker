# CAWP data files

Inputs for `python/datasources/cawp.py` (women in elected office by race/ethnicity). After
changing any file here, commit it and rerun `dagCawp.yml` (see the root `CLAUDE.md`).

| File | What it is | Source | How to update | When |
|---|---|---|---|---|
| `cawp-by_race_and_ethnicity_time_series.csv` | One row per woman per year in Congress, state legislatures, and territorial office (incl. territorial governors) | [CAWP Women Elected Officials Database](https://cawp.rutgers.edu/data/women-elected-officials-database) | `npm run refresh-cawp -- --section numerator` (from `frontend/`; ~30-60 min) | After each election and swearing-in |
| `cawp-statewide_executive_time_series.csv` | Same, for statewide executive offices (governors, lieutenant governors, and others). CAWP's unfiltered export omits this level. | CAWP database, filtered to Statewide Executive | `npm run refresh-cawp -- --section statewide_exec` (a few minutes) | After each election and inauguration (January) |
| `cawp_state_leg_{fips}.csv` (50 states) | Total state legislature seats per year | [CAWP state information pages](https://cawp.rutgers.edu/facts/state-state-information/) | `npm run refresh-cawp -- --section state_leg` | Yearly |
| `cawp_state_leg_{fips}.csv` (DC 11 and territories 60, 66, 69, 72, 78) | Total DC council and territorial legislature seats per year | [NCSL](https://www.ncsl.org/resources/details/number-of-legislators-and-length-of-terms-in-years) | Edit by hand | Yearly |
| `cawp_lt_gov_offices.csv` | States with a statewide-elected lieutenant governor and the first year the office existed under that title | See below | Edit by hand | Yearly, and after any election that creates or abolishes the office |
| `tab20_cd11820_county20_natl.txt` | County-to-congressional-district crosswalk | [Census](https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/) | `npm run refresh-cawp -- --section crosswalk` | Each new Congress / redistricting |

## Lieutenant governor offices (`cawp_lt_gov_offices.csv`)

Each listed state counts as one lieutenant governor seat per year from `first_year`, through
`last_year` if set. Unlisted states, DC, and territories have no seat.

Columns:

- `first_year`: first year the office was filled under the lieutenant governor title. `1915`
  means the office predates the start of the CAWP time series.
- `last_year`: blank unless the office is abolished.
- `office_source`: evidence that the office is elected statewide. For every state except
  Arizona this is The Council of State Governments, *The Book of the States*,
  [Table 4.12, "The Lieutenant Governors: 2023"](https://bookofthestates.org/tables/2023-4-12/),
  which lists each state's method of selection.
- `start_year_source`: evidence for `first_year`: the state's list of lieutenant governors, or
  the history of the office where it began or was renamed after 1915.

Who is not listed, per the same Book of the States table:

- Maine, New Hampshire, Oregon, and Wyoming have no lieutenant governor.
- In Tennessee and West Virginia the senate president holds the title by statute and is not
  elected statewide.
- Puerto Rico has no lieutenant governor. CAWP does not record the lieutenant governors of the
  other territories, so they are left out to keep the numerator and denominator consistent.

Arizona is listed from 2027: voters created the office with
[Proposition 131 (2022)](https://ballotpedia.org/Arizona_Lieutenant_Governor_Amendment_(2022)),
and the first lieutenant governor takes office in January 2027.

To update: check the newest Book of the States lieutenant governor table (`bookofthestates.org/tables/<year>-4-12/`)
for states gaining or losing the office, check CAWP for any change in coverage, edit the rows
and both source columns, then copy the file over
`python/tests/data/cawp/test_input_cawp_lt_gov_offices.csv` and rerun the CAWP tests.

## How line items are counted

`load_women_line_items()` in `cawp.py` reads `cawp-by_race_and_ethnicity_time_series.csv` (and, for governors and lieutenant governors, `cawp-statewide_executive_time_series.csv`) before any counting.

- CAWP repeats a woman's row when her party label changes, so rows are deduplicated on ID, year, position, and state.
- A woman listing several races counts once in each of them and once in "Two or more races". A "Multiracial Alone" entry listed beside another race still counts once in "Two or more races".
