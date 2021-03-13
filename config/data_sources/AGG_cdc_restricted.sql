-- Ignore all ingestion timestamps. These queries assume that the dataset has
-- already been deduped and only include the latest rows.

-- State-level joins with ACS population tables. First, we join with the public
-- fips_codes_states dataset to convert from 2-letter state postal abbreviation
-- to state fips & full name (eg AL -> 01 and "Alabama"). Then we join with ACS
-- to get population for state x {race, sex, age}.

-- State-level race.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_state AS
WITH cdc_restricted_race_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.race_and_ethnicity,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_race_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
)
SELECT x.*, y.population
FROM cdc_restricted_race_state AS x
LEFT JOIN `acs_population.by_race_state_std` AS y
    USING (state_fips, race_and_ethnicity)
;

-- State-level sex.
CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_state AS
WITH cdc_restricted_sex_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.sex,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_sex_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
)
SELECT x.*, y.population
FROM cdc_restricted_sex_state AS x
LEFT JOIN `acs_population.by_sex_state` AS y
    USING (state_fips, sex)
;

-- State-level age.
CREATE OR REPLACE TABLE cdc_restricted_data.by_age_state AS
WITH cdc_restricted_age_state AS (
    SELECT DISTINCT
        b.state_fips_code as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.age,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_age_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
)
SELECT x.*, y.population
FROM cdc_restricted_age_state AS x
LEFT JOIN `acs_population.by_age_state` AS y
    USING (state_fips, age)
;


-- County-level joins with ACS population tables. We first do the same join
-- with fips_codes_states as in the state case, but also join with
-- fips_codes_all to get county names. We then join with ACS to get population
-- for county x {race, sex, age}.

-- County-level race.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_county AS
WITH cdc_restricted_race_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.area_name) as county_name,
        IF(a.state_postal = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.race_and_ethnicity,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_race_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_all` as c
        ON a.county_fips = c.county_fips_code AND
           c.summary_level_name = "state-county"
)
SELECT x.*, y.population
FROM cdc_restricted_race_county AS x
LEFT JOIN `acs_population.by_race_county_std` AS y
    USING (county_fips, state_fips, race_and_ethnicity)
;

-- County-level sex.
CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_county AS
WITH cdc_restricted_sex_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.area_name) as county_name,
        IF(a.state_postal = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.sex,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_sex_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_all` as c
        ON a.county_fips = c.county_fips_code AND
           c.summary_level_name = "state-county"
)
SELECT x.*, y.population
FROM cdc_restricted_sex_county AS x
LEFT JOIN `acs_population.by_sex_county` AS y
    USING (county_fips, state_fips, sex)
;

-- County-level age.
CREATE OR REPLACE TABLE cdc_restricted_data.by_age_county AS
WITH cdc_restricted_age_county AS (
    SELECT DISTINCT
        a.county_fips,
        IF(a.county_fips = "", "Unknown", c.area_name) as county_name,
        IF(a.state_postal = "Unknown", "", b.state_fips_code) as state_fips,
        IF(a.state_postal = "Unknown", "Unknown", b.state_name) as state_name,
        a.age,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_age_county` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_all` as c
        ON a.county_fips = c.county_fips_code AND
           c.summary_level_name = "state-county"
)
SELECT x.*, y.population
FROM cdc_restricted_age_county AS x
LEFT JOIN `acs_population.by_age_county` AS y
    USING (county_fips, state_fips, age)
;