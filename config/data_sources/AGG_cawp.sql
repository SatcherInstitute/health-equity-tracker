-- race.
CREATE OR REPLACE TABLE cawp_data.race_and_ethnicity AS
WITH
  race_and_ethnicity AS (
      SELECT DISTINCT
        IF(a.state_name = "United States", "00", b.state_fips_code) as state_fips,
        a.state_name,
        a.race_category_id,
        a.women_state_leg_pct,
        a.race,
        a.race_includes_hispanic,
        a.race_and_ethnicity
    FROM `cawp_data.race_and_ethnicity` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_name
  )
SELECT * FROM race_and_ethnicity
ORDER BY state_fips, race_category_id
;
