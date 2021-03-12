-- Ignore all ingestion timestamps. These queries assume that the dataset has
-- already been deduped and only include the latest rows.

-- State-level joins with ACS population tables. First, we join with a public
-- state fips codes dataset so we can convert from two-leter state postal
-- abbreivation to state fips and full state name (eg AL -> 01 and "Alabama").
-- Then we join with ACS on state x {race, sex, age}.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_state AS
WITH cdc_restricted_race_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.race_and_ethnicity,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_race_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_postal_abbreviation
)
SELECT
    x.state_fips, x.state_name,
    x.race_and_ethnicity,
    x.cases, x.hosp_y, x.hosp_n, x.hosp_unknown, x.death_y, x.death_n, x.death_unknown,
    y.population
FROM cdc_restricted_race_state AS x
LEFT JOIN `acs_population.by_race_state_std_staging` AS y ON
  x.state_fips = y.state_fips AND
  x.race_and_ethnicity = y.race_and_ethnicity
;

CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_state AS
WITH cdc_restricted_sex_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.sex,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_sex_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_name = b.state_postal_abbreviation
)
SELECT
    x.state_fips, x.state_name,
    x.sex,
    x.cases, x.hosp_y, x.hosp_n, x.hosp_unknown, x.death_y, x.death_n, x.death_unknown,
    y.population
FROM cdc_restricted_sex_state AS x
LEFT JOIN `acs_population.by_sex_state` AS y ON
  x.state_fips = y.state_fips AND
  x.sex = y.sex
;

CREATE OR REPLACE TABLE cdc_restricted_data.by_age_state AS
WITH cdc_restricted_age_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.age,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_age_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_name = b.state_postal_abbreviation
)
SELECT
    x.state_fips, x.state_name,
    x.age,
    x.cases, x.hosp_y, x.hosp_n, x.hosp_unknown, x.death_y, x.death_n, x.death_unknown,
    y.population
FROM cdc_restricted_age_state AS x
LEFT JOIN `acs_population.by_age_state` AS y ON
  x.state_fips = y.state_fips AND
  x.age = y.age
;


-- County-level joins with ACS population tables. We first do the same join as
-- in the state case to get state fips codes and use ACS state & county names,
-- but also join with the ACS population table to get ACS county names. We then
-- join again with ACS, this time to get county x {race, sex, age} data.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_county AS
WITH cdc_restricted_race_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.county_name) as county_name,
        IF(a.state_name = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.race_and_ethnicity,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_race_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_postal_abbreviation
    LEFT JOIN `acs_population.by_race_county_std_staging` as c
        ON a.county_fips = c.county_fips
)
SELECT
    x.*, y.population
FROM cdc_restricted_race_county AS x
LEFT JOIN `acs_population.by_race_county_std_staging` AS y ON
    x.county_fips = y.county_fips AND
    x.race_and_ethnicity = y.race_and_ethnicity
;

CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_county AS
WITH cdc_restricted_sex_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.county_name) as county_name,
        IF(a.state_name = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.sex,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_sex_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_postal_abbreviation
    LEFT JOIN `acs_population.by_sex_county` as c
        ON a.county_fips = c.county_fips
)
SELECT
    x.*, y.population
FROM cdc_restricted_sex_county AS x
LEFT JOIN `acs_population.by_sex_county` AS y ON
    x.county_fips = y.county_fips AND
    x.sex = y.sex
;

CREATE OR REPLACE TABLE cdc_restricted_data.by_age_county AS
WITH cdc_restricted_age_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.county_name) as county_name,
        IF(a.state_name = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_name = "Unknown", "Unknown", b.state_name) as state_name,
        a.age,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_age_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_postal_abbreviation
    LEFT JOIN `acs_population.by_age_county` as c
        ON a.county_fips = c.county_fips
)
SELECT
    x.*, y.population
FROM cdc_restricted_age_county AS x
LEFT JOIN `acs_population.by_age_county` AS y ON
    x.county_fips = y.county_fips AND
    x.age = y.age
;