-- Ignore all ingestion timestamps. These queries assume that the dataset has
-- already been deduped and only include the latest rows.

-- State-level joins with ACS population tables. First, we join with the public
-- fips_codes_states dataset to convert from 2-letter state postal abbreviation
-- to state fips & full name (eg AL -> 01 and "Alabama"). We then join with ACS
-- to get population for state x {race, sex, age} and compute a total row for
-- state x {race, sex, age}, returning the union of these last two tables.

-- State-level race.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_state AS
WITH
  cdc_restricted_race_state AS (
      SELECT DISTINCT
        b.state_fips_code as state_fips,
        b.state_name,
        a.race_and_ethnicity,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_race_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    WHERE a.state_postal != "Unknown"
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_race_state AS x
      LEFT JOIN `acs_population.by_race_state_std` AS y
          USING (state_fips, race_and_ethnicity)
  ),
  totals as (
      SELECT
        state_fips, state_name,
        'Total' as race_and_ethnicity,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY state_fips, state_name, race_and_ethnicity
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_state_std` AS y
          ON x.state_fips = y.state_fips AND 
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY state_fips, race_and_ethnicity
;

-- State-level sex.
CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_state AS
WITH
  cdc_restricted_sex_state AS (
      SELECT DISTINCT
        b.state_fips_code as state_fips,
        b.state_name,
        a.sex,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_sex_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    WHERE a.state_postal != "Unknown"
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_sex_state AS x
      LEFT JOIN `acs_population.by_sex_state` AS y
          USING (state_fips, sex)
  ),
  totals as (
      SELECT
        state_fips, state_name,
        'Total' as sex,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY state_fips, state_name, sex
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_state_std` AS y
          ON x.state_fips = y.state_fips AND 
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY state_fips, sex
;

-- State-level age.
CREATE OR REPLACE TABLE cdc_restricted_data.by_age_state AS
WITH
  cdc_restricted_age_state AS (
      SELECT DISTINCT
        b.state_fips_code as state_fips,
        b.state_name,
        a.age,
        a.cases, a.hosp_y, a.hosp_n, a.hosp_unknown, a.death_y, a.death_n, a.death_unknown
    FROM `cdc_restricted_data.cdc_restricted_by_age_state` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_postal = b.state_postal_abbreviation
    WHERE a.state_postal != "Unknown"
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_age_state AS x
      LEFT JOIN `acs_population.by_age_state` AS y
          USING (state_fips, age)
  ),
  totals as (
      SELECT
        state_fips, state_name,
        'Total' as age,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY state_fips, state_name, age
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_state_std` AS y
          ON x.state_fips = y.state_fips AND 
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY state_fips, age
;


-- County-level joins with ACS population tables. We first do the same join
-- with fips_codes_states as in the state case, but also join with
-- fips_codes_all to get county names. We then join with ACS to get population
-- for county x {race, sex, age} and compute a total row for county x
-- {race, sex, age}, returning the union of these last two tables.
-- Note that there are county/state pairs in the data which do not actually
-- exist, so we have to filter these out by checking that the first two
-- characters of the county fips code match the state fips code.

-- County-level race.
CREATE OR REPLACE TABLE cdc_restricted_data.by_race_county AS
WITH
  cdc_restricted_race_county AS (
      SELECT DISTINCT
        a.county_fips,
        c.area_name as county_name,
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
      WHERE a.county_fips != ""
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_race_county AS x
      LEFT JOIN `acs_population.by_race_county_std` AS y
          USING (county_fips, state_fips, race_and_ethnicity)
      WHERE SUBSTRING(x.county_fips, 0, 2) = x.state_fips
  ),
  totals as (
      SELECT
        county_fips, county_name, state_fips, state_name,
        'Total' as race_and_ethnicity,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY county_fips, county_name, state_fips, state_name, race_and_ethnicity
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_county_std` AS y
          ON x.county_fips = y.county_fips AND
             x.state_fips = y.state_fips AND
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY county_fips, race_and_ethnicity
;

-- County-level sex.
CREATE OR REPLACE TABLE cdc_restricted_data.by_sex_county AS
WITH
  cdc_restricted_sex_county AS (
      SELECT DISTINCT
        a.county_fips,
        c.area_name as county_name,
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
      WHERE a.county_fips != ""
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_sex_county AS x
      LEFT JOIN `acs_population.by_sex_county` AS y
          USING (county_fips, state_fips, sex)
      WHERE SUBSTRING(x.county_fips, 0, 2) = x.state_fips
  ),
  totals as (
      SELECT
        county_fips, county_name, state_fips, state_name,
        'Total' as sex,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY county_fips, county_name, state_fips, state_name, sex
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_county_std` AS y
          ON x.county_fips = y.county_fips AND
             x.state_fips = y.state_fips AND
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY county_fips, sex
;

-- County-level age.
CREATE OR REPLACE TABLE cdc_restricted_data.by_age_county AS
WITH
  cdc_restricted_age_county AS (
      SELECT DISTINCT
        a.county_fips,
        c.area_name as county_name,
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
      WHERE a.county_fips != ""
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_restricted_age_county AS x
      LEFT JOIN `acs_population.by_age_county` AS y
          USING (county_fips, state_fips, age)
      WHERE SUBSTRING(x.county_fips, 0, 2) = x.state_fips
  ),
  totals as (
      SELECT
        county_fips, county_name, state_fips, state_name,
        'Total' as age,
        SUM(cases) as cases,
        SUM(hosp_y) as hosp_y,
        SUM(hosp_n) as hosp_n,
        SUM(hosp_unknown) as hosp_unknown,
        SUM(death_y) as death_y,
        SUM(death_n) as death_n,
        SUM(death_unknown) as death_unknown,
      FROM joined_with_acs
      GROUP BY county_fips, county_name, state_fips, state_name, age
  ),
  -- TODO do this properly. For more details, see
  -- https://github.com/SatcherInstitute/health-equity-tracker/issues/604.
  total_rows as (
      SELECT x.*, y.population
      FROM totals as x
      LEFT JOIN `acs_population.by_race_county_std` AS y
          ON x.county_fips = y.county_fips AND
             x.state_fips = y.state_fips AND
             y.race_and_ethnicity = "Total"
  )
SELECT * FROM joined_with_acs
UNION ALL
SELECT * FROM total_rows
ORDER BY county_fips, age
;