-- Ignore all ingestion timestamps. They are not helpful for the user 

-- State-level joins with ACS population tables. First, we join with the public
-- fips_codes_states dataset to convert from 2-letter state postal abbreviation
-- to state fips & full name (eg AL -> 01 and "Alabama"). We also convert the data
-- columns to JSON strings to prevent them from being omitted by the frontend.

-- State-level cases by race.
CREATE OR REPLACE TABLE covid_tracking_project.cases_by_race_state AS
SELECT DISTINCT
    b.state_fips_code AS state_fips,
    b.state_name,
    a.date,
    TO_JSON_STRING(a.cases) as cases,
    IF(a.reports_race = 1, true, false) AS reports_race,
    IF(a.reports_ethnicity = 1, true, false) AS reports_ethnicity,
    IF(a.race_mutually_exclusive = 1, true, false) AS race_mutually_exclusive
FROM `covid_tracking_project.covid_tracking_project_cases` AS a
LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
ORDER BY state_fips, date, race
;

-- State-level deaths by race.
CREATE OR REPLACE TABLE covid_tracking_project.deaths_by_race_state AS
SELECT DISTINCT
    b.state_fips_code AS state_fips,
    b.state_name,
    a.date,
    TO_JSON_STRING(a.deaths) as deaths,
    IF(a.reports_race = 1, true, false) AS reports_race,
    IF(a.reports_ethnicity = 1, true, false) AS reports_ethnicity,
    IF(a.race_mutually_exclusive = 1, true, false) AS race_mutually_exclusive
FROM `covid_tracking_project.covid_tracking_project_deaths` AS a
LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
ORDER BY state_fips, date, race
;

-- State-level hospitalizations by race. We don't currently have metadata for hospitalizations.
CREATE OR REPLACE TABLE covid_tracking_project.hospitalizations_by_race_state AS
SELECT DISTINCT
    b.state_fips_code AS state_fips,
    b.state_name,
    a.date,
    a.race,
    TO_JSON_STRING(a.hosp) as hospitalizations,
FROM `covid_tracking_project.covid_tracking_project_hosp` AS a
LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
ORDER BY state_fips, date, race
;

-- State-level tests by race. We don't currently have metadata for tests.
CREATE OR REPLACE TABLE covid_tracking_project.tests_by_race_state AS
SELECT DISTINCT
    b.state_fips_code AS state_fips,
    b.state_name,
    a.date,
    a.race,
    TO_JSON_STRING(a.tests) as tests,
FROM `covid_tracking_project.covid_tracking_project_tests` AS a
LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
    ON a.state_postal = b.state_postal_abbreviation
ORDER BY state_fips, date, race
;
