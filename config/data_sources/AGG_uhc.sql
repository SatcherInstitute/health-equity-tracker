-- race.
CREATE OR REPLACE TABLE uhc_data.race_and_ethnicity AS
WITH
  race_and_ethnicity AS (
      SELECT DISTINCT
        IF(a.state_name = "United States", "00", b.state_fips_code) as state_fips,
        a.state_name,
        a.race_category_id,
        a.copd_per_100k,
        a.diabetes_per_100k,
        a.frequent_mental_distress_per_100k,
        a.depression_per_100k,
        a.suicide_per_100k,
        a.illicit_opioid_use_per_100k,
        a.non_medical_drug_use_per_100k,
        a.non_medical_rx_opioid_use_per_100k,
        a.excessive_drinking_per_100k,
        a.preventable_hospitalizations_per_100k,
        a.avoided_care_per_100k,
        a.chronic_kidney_disease_per_100k,
        a.cardiovascular_diseases_per_100k,
        a.asthma_per_100k,
        a.voter_participation_per_100k,
        a.race,
        a.race_includes_hispanic,
        a.race_and_ethnicity
    FROM `uhc_data.race_and_ethnicity` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_name
  )
SELECT * FROM race_and_ethnicity
ORDER BY state_fips, race_category_id
;

-- age.
CREATE OR REPLACE TABLE uhc_data.age AS
WITH
  age AS (
      SELECT DISTINCT
        IF(a.state_name = "United States", "00", b.state_fips_code) as state_fips,
        a.state_name,
        a.copd_per_100k,
        a.diabetes_per_100k,
        a.frequent_mental_distress_per_100k,
        a.depression_per_100k,
        a.suicide_per_100k,
        a.illicit_opioid_use_per_100k,
        a.non_medical_drug_use_per_100k,
        a.non_medical_rx_opioid_use_per_100k,
        a.excessive_drinking_per_100k,
        a.preventable_hospitalizations_per_100k,
        a.avoided_care_per_100k,
        a.chronic_kidney_disease_per_100k,
        a.cardiovascular_diseases_per_100k,
        a.asthma_per_100k,
        a.voter_participation_per_100k,
        a.age,
    FROM `uhc_data.age` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_name
  )
SELECT * FROM age
ORDER BY state_fips, age
;

-- sex.
CREATE OR REPLACE TABLE uhc_data.sex AS
WITH
  sex AS (
      SELECT DISTINCT
        IF(a.state_name = "United States", "00", b.state_fips_code) as state_fips,
        a.state_name,
        a.copd_per_100k,
        a.diabetes_per_100k,
        a.frequent_mental_distress_per_100k,
        a.depression_per_100k,
        a.suicide_per_100k,
        a.illicit_opioid_use_per_100k,
        a.non_medical_drug_use_per_100k,
        a.non_medical_rx_opioid_use_per_100k,
        a.excessive_drinking_per_100k,
        a.preventable_hospitalizations_per_100k,
        a.avoided_care_per_100k,
        a.chronic_kidney_disease_per_100k,
        a.cardiovascular_diseases_per_100k,
        a.asthma_per_100k,
        a.voter_participation_per_100k,
        a.sex,
    FROM `uhc_data.sex` AS a
    LEFT JOIN `bigquery-public-data.census_utility.fips_codes_states` AS b
        ON a.state_name = b.state_name
  )
SELECT * FROM sex
ORDER BY state_fips, sex
;
