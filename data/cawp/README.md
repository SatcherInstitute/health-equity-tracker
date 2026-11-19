# CAWP data files

Inputs for `python/datasources/cawp.py` (women in elected office by race/ethnicity). After
changing any file here, commit it and rerun `dagCawp.yml` (see the root `CLAUDE.md`).

| File | What it is | Source | How to update | When |
|---|---|---|---|---|
| `cawp-by_race_and_ethnicity_time_series.csv` | One row per woman per year in Congress, state legislatures, and territorial office | [CAWP Women Elected Officials Database](https://cawp.rutgers.edu/data/women-elected-officials-database) | `npm run refresh-cawp -- --section numerator` (from `frontend/`; ~30-60 min) | After each election and swearing-in |
| `cawp_state_leg_{fips}.csv` (50 states) | Total state legislature seats per year | [CAWP state information pages](https://cawp.rutgers.edu/facts/state-state-information/) | `npm run refresh-cawp -- --section state_leg` | Yearly |
| `cawp_state_leg_{fips}.csv` (DC 11 and territories 60, 66, 69, 72, 78) | Total DC council and territorial legislature seats per year | [NCSL](https://www.ncsl.org/resources/details/number-of-legislators-and-length-of-terms-in-years) | Edit by hand | Yearly |
| `tab20_cd11820_county20_natl.txt` | County-to-congressional-district crosswalk | [Census](https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/) | `npm run refresh-cawp -- --section crosswalk` | Each new Congress / redistricting |

## How line items are counted

`load_women_line_items()` in `cawp.py` reads `cawp-by_race_and_ethnicity_time_series.csv` before any counting.

- CAWP repeats a woman's row when her party label changes, so rows are deduplicated on ID, year, position, and state.
- A woman listing several races counts once in each of them and once in "Two or more races". A "Multiracial Alone" entry listed beside another race still counts once in "Two or more races".
