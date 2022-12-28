-- race.
CREATE OR REPLACE TABLE kff_vaccination.race_and_ethnicity AS
WITH
  race_and_ethnicity AS (
      SELECT DISTINCT
        b.state_fips_code as state_fips,
        a.state_name,
        a.race_category_id,
        a.vaccinated_pct,
        a.vaccinated_pct_share,
        a.vaccinated_first_dose,
        a.race_and_ethnicity,
        a.population_pct,
    FROM `kff_vaccination.race_and_ethnicity` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_name
  ),
  all_acs as (
      SELECT state_fips, state_name, population, population_pct, race_category_id, race_and_ethnicity FROM `acs_population.by_race_state_std`
    UNION ALL
      SELECT state_fips, state_name, population, population_pct, race_category_id, race_and_ethnicity FROM `acs_2010_population.by_race_and_ethnicity_territory`
  ),
  joined_with_acs as (
      SELECT x.*, y.population, y.population_pct as acs_vaccine_population_pct
      FROM race_and_ethnicity AS x
      LEFT JOIN `all_acs` AS y
          USING (state_fips, race_category_id)
  )
SELECT * FROM joined_with_acs
ORDER BY state_fips, race_category_id
;
