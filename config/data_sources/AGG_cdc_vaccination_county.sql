-- County-level joins with ACS population tables. First we join with
-- fips_codes_all to get county names. We then join with ACS to get population
-- for county x {race, sex, age}.

-- County-level race.
CREATE OR REPLACE TABLE cdc_vaccination_county.race_and_ethnicity AS
WITH
  cdc_vaccination_race_county AS (
      SELECT DISTINCT
        a.county_fips,
        b.area_name as county_name,
        a.race_category_id,
        a.vaccinated_first_dose,
        a.race,
        a.race_includes_hispanic,
        a.race_and_ethnicity
      FROM `cdc_vaccination_county.race_and_ethnicity` AS a
      LEFT JOIN `bigquery-public-data.census_utility.fips_codes_all` as b
          ON a.county_fips = b.county_fips_code
      WHERE a.county_fips != ""
  ),
  joined_with_acs as (
      SELECT x.*, y.population
      FROM cdc_vaccination_race_county AS x
      LEFT JOIN `acs_population.by_race_county_std` AS y
          USING (county_fips, race_category_id)
  )
SELECT * FROM joined_with_acs
ORDER BY county_fips, race_category_id
;
