
-- This only works for the "Total" race category, because ACS provides more
-- granular age buckets when looking at all races than when breaking down by
-- race.
CREATE TEMP FUNCTION getDecadeAgeBucket(x ANY TYPE) AS (
  CASE
    WHEN x IN ("0-4", "5-9") THEN "0-9"
    WHEN x IN ("10-14", "15-17", "18-19") THEN "10-19"
    WHEN x IN ("20-20", "21-21", "22-24", "25-29") THEN "20-29"
    WHEN x IN ("30-34", "35-39") THEN "30-39"
    WHEN x IN ("40-44", "45-49") THEN "40-49"
    WHEN x IN ("50-54", "55-59") THEN "50-59"
    WHEN x IN ("60-61", "62-64", "65-66", "67-69") THEN "60-69"
    WHEN x IN ("70-74", "75-79") THEN "70-79"
    WHEN x IN ("80-84", "85+") THEN "80+"
    WHEN x = "Total" THEN "Total"
    ELSE "Unknown"
  END
);

CREATE TEMP FUNCTION getStaggeredDecadeAgeBuckets(x ANY TYPE) AS (
  CASE
    WHEN x IN ("0-4", "5-9") THEN "0-9"
    WHEN x IN ("10-14", "15-17") THEN "10-17"
    WHEN x IN ("18-19", "20-24", "20-20", "21-21", "22-24") THEN "18-24"
    WHEN x IN ("25-29", "30-34") THEN "25-34"
    WHEN x IN ("35-44", "35-39", "40-44") THEN "35-44"
    WHEN x IN ("45-54", "45-49", "50-54") THEN "45-54"
    WHEN x IN ("55-64", "55-59", "60-61", "62-64") THEN "55-64"
    WHEN x IN ("65-74", "65-66", "67-69", "70-74") THEN "65-74"
    WHEN x IN ("75-84", "75-79", "80-84") THEN "75-84"
    WHEN x IN ("85+") THEN "85+"
    WHEN x = "Total" THEN "Total"
    ELSE "Unknown"
  END
);

-- Ignore ingestion timestamp. These queries assume that the dataset has already
-- been deduped and only include the latest rows.
CREATE OR REPLACE TABLE acs_population.by_sex_age_state AS
SELECT state_fips, state_name, sex, getDecadeAgeBucket(age) AS age, SUM(population) AS population
FROM `acs_population.by_sex_age_race_state_std`
WHERE race_category_id = "TOTAL"
GROUP BY state_fips, state_name, sex, age
ORDER BY state_fips, state_name, sex, age;

CREATE OR REPLACE TABLE acs_population.by_sex_age_county AS
SELECT state_fips, county_fips, county_name, sex, getDecadeAgeBucket(age) AS age, SUM(population) AS population
FROM `acs_population.by_sex_age_race_county_std`
WHERE race_category_id = "TOTAL"
GROUP BY state_fips, county_fips, county_name, sex, age
ORDER BY state_fips, county_fips, county_name, sex, age;

-- We can base further aggregations on the above tables. No need to filter to
-- race_category_id = "TOTAL" since the above tables have already done that.
CREATE OR REPLACE TABLE acs_population.by_age_state AS
SELECT * EXCEPT(sex)
FROM `acs_population.by_sex_age_state`
WHERE sex = "Total";

CREATE OR REPLACE TABLE acs_population.by_age_county AS
SELECT * EXCEPT(sex)
FROM `acs_population.by_sex_age_county`
WHERE sex = "Total";


-- These tables use staggered decade age buckets due to limitations with ACS
-- age bucket availability.
CREATE OR REPLACE TABLE acs_population.by_sex_age_race_state_staggered_buckets AS
SELECT
  state_fips, state_name, sex, getStaggeredDecadeAgeBuckets(age) AS age,
  race_category_id, race, race_includes_hispanic, race_and_ethnicity,
  SUM(population) AS population
FROM `acs_population.by_sex_age_race_state_std`
GROUP BY state_fips, state_name, sex, age, race_category_id, race, race_includes_hispanic, race_and_ethnicity
ORDER BY state_fips, state_name, sex, age, race_category_id, race, race_includes_hispanic, race_and_ethnicity;

CREATE OR REPLACE TABLE acs_population.by_sex_age_race_county_staggered_buckets AS
SELECT
  state_fips, county_fips, county_name, sex, getStaggeredDecadeAgeBuckets(age) AS age,
  race_category_id, race, race_includes_hispanic, race_and_ethnicity,
  SUM(population) AS population
FROM `acs_population.by_sex_age_race_county_std`
GROUP BY state_fips, county_fips, county_name, sex, age, race_category_id, race, race_includes_hispanic, race_and_ethnicity
ORDER BY state_fips, county_fips, county_name, sex, age, race_category_id, race, race_includes_hispanic, race_and_ethnicity;

-- We can base further aggregations on the above tables.
CREATE OR REPLACE TABLE acs_population.by_age_race_state_staggered_buckets AS
SELECT * EXCEPT(sex)
FROM `acs_population.by_sex_age_race_state_staggered_buckets`
WHERE sex = "Total";

CREATE OR REPLACE TABLE acs_population.by_age_race_county_staggered_buckets AS
SELECT * EXCEPT(sex)
FROM `acs_population.by_sex_age_race_county_staggered_buckets`
WHERE sex = "Total";


CREATE OR REPLACE TABLE acs_population.by_sex_state AS
SELECT * EXCEPT(race_category_id, race, race_and_ethnicity, race_includes_hispanic, age)
FROM `acs_population.by_sex_age_race_state_std`
WHERE race_category_id = "TOTAL"
  AND age = "Total";

CREATE OR REPLACE TABLE acs_population.by_sex_county AS
SELECT * EXCEPT(race_category_id, race, race_and_ethnicity, race_includes_hispanic, age)
FROM `acs_population.by_sex_age_race_county_std`
WHERE race_category_id = "TOTAL"
  AND age = "Total";
