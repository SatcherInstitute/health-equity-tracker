BEGIN
/*
  Copyright 2020 Brian Suk
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/*
  Input:
    ingest_table STRING: Fully qualified (org.dataset.tablename) table with input data.
    target_table STRING: Fully qualified (org.dataset.tablename) table to be merged into.
    order_column STRING: Name of the column that defines write time. Usually a TIMESTAMP, but
      should be some sort of date/time.
    latest_flag STRING: Column name that is the flag that tells you a row is the latest one.
      This column in the table should be of type BOOL.
    unique_columns ARRAY<STRING>: Array of column names that determine what constitutes a
      distinct row that can be updated.
    measurement_columns ARRAY<STRING>: Array of column names that represent data for a unique
      row that is variable, given a disting row defined in the unique_columns parameter.

  Example call:
    CALL dataset.superDeduper(
      '`myorg.mydataset.new_rows`',
      '`myorg.mydataset.permanent_table`',
      'ingest_ts',
      'is_latest',
      ['reported_dt', 'cola', 'colb'],
      ['measurement', 'colc']
    );
*/         

DECLARE rxstring_only_unique_columns STRING DEFAULT r'(?i)"(?:' || ARRAY_TO_STRING(ARRAY_CONCAT((SELECT [order_column, latest_flag]), unique_columns), "|") || r')"(?-i):.+?[,}]';
DECLARE rxstring_only_measurement_columns STRING DEFAULT r'(?i)"(?:' || ARRAY_TO_STRING(ARRAY_CONCAT((SELECT [order_column, latest_flag]), measurement_columns), "|") || r')"(?-i):.+?[,}]';
DECLARE query_string STRING;

SET query_string = 
"""
# Create temporary staging table to hold just the incoming rows that are updates to rows in the main table.
CREATE TEMP TABLE update_staging AS (
  # The new rows will be the "latest" ones, so mark it as is_latest = TRUE
  SELECT i.*, TRUE AS """ || latest_flag || """ FROM """ || ingest_table || """ i, """ || target_table || """ m
  WHERE
    # This clause looks for the latest row in the main table where the unique columns match, but the measurement columns differ. Since
    # the current load is more recent, we accept this as the new data, so this goes into the staging table.
    (m.""" || latest_flag || """ = TRUE 
      AND REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_unique_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_unique_columns || """', '')
      AND REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_measurement_columns || """', '') != REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_measurement_columns || """', '')
    )
    # This clause looks for rows in the main table with is_latest = FALSE, indicating historical rows, that match both the unique and measurement
    # columns, indicating that the inbound row is a duplicate of something in the past, and we want to ignore these.
    AND
    REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_unique_columns || """', '') || REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_measurement_columns || """', '')
    NOT IN
    (SELECT REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_unique_columns || """', '') || REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_measurement_columns || """', '')
      FROM """ || ingest_table || """ i, """ || target_table || """ m 
      WHERE (m.""" || latest_flag || """ = FALSE
        AND REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_unique_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_unique_columns || """', '')
        AND REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_measurement_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_measurement_columns || """', ''))
    )
);
""";
EXECUTE IMMEDIATE query_string;

# Invalidate rows in the main table where a match exists in the staging table holding the new updates.
SET query_string = 
"""
MERGE """ || target_table || """ m
USING update_staging u
ON REGEXP_REPLACE(TO_JSON_STRING(u), r'""" || rxstring_only_unique_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_unique_columns || """', '')
AND REGEXP_REPLACE(TO_JSON_STRING(u), r'""" || rxstring_only_measurement_columns || """', '') != REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_measurement_columns || """', '')
AND m.""" || latest_flag || """ = TRUE
WHEN MATCHED THEN UPDATE SET m.""" || latest_flag || """ = FALSE;
""";
EXECUTE IMMEDIATE query_string;

# Load the new updated rows.
SET query_string =
"""
INSERT INTO """ || target_table || """
(SELECT * FROM update_staging);
""";
EXECUTE IMMEDIATE query_string;

# Load rows that are true new rows.
SET query_string = 
"""
MERGE """ || target_table || """ m
USING (SELECT *, TRUE """ || latest_flag || """ FROM """ || ingest_table || """) i
ON REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_unique_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_unique_columns || """', '')
AND REGEXP_REPLACE(TO_JSON_STRING(i), r'""" || rxstring_only_measurement_columns || """', '') = REGEXP_REPLACE(TO_JSON_STRING(m), r'""" || rxstring_only_measurement_columns || """', '')
WHEN NOT MATCHED THEN INSERT ROW;
""";
EXECUTE IMMEDIATE query_string;

END