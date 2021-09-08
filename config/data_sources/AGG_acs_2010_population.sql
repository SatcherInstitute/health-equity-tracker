CREATE OR REPLACE TABLE merged_population_data.by_race_state AS
WITH
  all_acs as (
      SELECT * FROM `acs_population.by_race_state_std`
    UNION ALL
      SELECT * FROM `acs_2010_population.by_race_and_ethnicity_territory`
  )
SELECT * FROM all_acs
ORDER BY state_fips, race_category_id
;

CREATE OR REPLACE TABLE merged_population_data.by_sex_state AS
WITH
  all_acs as (
      SELECT * FROM `acs_population.by_sex_state`
    UNION ALL
      SELECT * FROM `acs_2010_population.by_sex_territory`
  )
SELECT * FROM all_acs
ORDER BY state_fips, sex
;

CREATE OR REPLACE TABLE merged_population_data.by_age_state AS
WITH
  all_acs as (
      SELECT * FROM `acs_population.by_age_state`
    UNION ALL
      SELECT state_fips, state_name, age, population FROM `acs_2010_population.by_age_territory`
  )
SELECT * FROM all_acs
ORDER BY state_fips, age
;
