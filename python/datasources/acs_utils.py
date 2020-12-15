import requests
import json
import pandas
from ingestion import census
from datasources.standardized_columns import STATE_FIPS_COL, COUNTY_FIPS_COL, STATE_NAME_COL, COUNTY_NAME_COL

# TODO consider using the groups metadata rather than variables metadata. Both work, just seems cleaner.

# ------- ACS download utils -------- #

def fetchAcsVariables(variable_ids, county_level):
    resp2 = requests.get(
        "https://api.census.gov/data/2018/acs/acs5",
        params=census.get_census_params(variable_ids, county_level))
    json_result = resp2.json()
    json_string = json.dumps(json_result)
    return json_string

def fetchAcsMetadata():
    resp = requests.get("https://api.census.gov/data/2018/acs/acs5/variables.json")
    return resp.json()

def fetchAcsGroup(group_concept, var_map, num_breakdowns, county_level):
    group_vars = getVarsForGroup(group_concept, var_map, num_breakdowns)
    json_string = fetchAcsVariables(list(group_vars.keys()), county_level)
    return json_string




# Returns a map of variable ids to metadata for that variable, filtered to
# specified groups.
def parseAcsMetadata(acs_metadata, groups):
    output_vars = {}
    for variable_id, metadata in acs_metadata['variables'].items():
        group = metadata.get('group')
        if group in groups and metadata['label'].startswith("Estimate!!Total"):
            output_vars[variable_id] = metadata
    return output_vars

# Returns a map of ACS variable id to an ordered list of the attributes that
# variable describes. num_breakdowns describes the number of breakdowns this
# group uses.
# For example, getVarsForGroup("SEX BY AGE", var_map, 2) would return a map
# like:
# {
#   'B01001_011E': ['Male', '25 to 29 years'],
#   'B01001_012E': ['Male', '30 to 34 years'],
#   ...
# }
def getVarsForGroup(group_concept, var_map, num_breakdowns):
    group_vars = {}
    for group, metadata in var_map.items():
        if metadata.get('concept') == group_concept:
            # TODO switch to use explicit prefix to handle median, etc
            parts = metadata['label'].split("!!")
            # If length is greater than (2 + num_breakdowns), it means it's a
            # sub-category, which we don't need to include. If the length is less than
            # (2 + num_breakdowns), it means it's a combination of others, which should
            # be requested separately.
            num_parts = 2 + num_breakdowns
            if len(parts) == num_parts:
                group_vars[group] = parts[2:num_parts]
    return group_vars

def acsJsonToDataFrame(acs_json_string):
    frame = pandas.read_json(acs_json_string, orient='values')
    frame.rename(columns=frame.iloc[0], inplace=True)
    frame.drop([0], inplace=True)

    colTypes = {}
    for col in frame.columns:
        if col != "NAME" and col != "state" and col != "county":
            colTypes[col] = "int64"
    frame = frame.astype(colTypes)

    return frame

# Examples:
# One dimension:
#   standardizeFrame(frame, group_vars, [RACE], county_level, POPULATION_COL)
# Two dimensions:
#   standardizeFrame(frame, group_vars, [HISPANIC_COL, RACE_COL], county_level, POPULATION_COL)
def standardizeFrame(frame, var_to_labels_map, breakdowns, county_level, measured_var):
    # First, "melt" the frame so that each column other than the geo identifier
    # gets converted to a value with the column name "variable"
    id_cols = ["state", "county", "NAME"] if county_level else ["state", "NAME"]
    sort_cols = ["state", "county", "variable"] if county_level else ["state", "variable"]
    df = frame.melt(id_vars=id_cols)
    df = df.sort_values(sort_cols)

    # Now, create new columns for each breakdown, using the values from
    # var_to_labels_map, and then delete the original variable ids.
    for index, breakdown in enumerate(breakdowns):
        renaming = {k: v[index] for k, v in var_to_labels_map.items()}
        df[breakdown] = df['variable'].replace(renaming)
    df = df.drop("variable", axis=1)

    # Standardize column names and move the measured variable to the end.
    reorder_cols = list(df.columns)
    reorder_cols.remove('value')
    reorder_cols.append('value')
    df = df[reorder_cols]
    df = df.rename(columns={
        'state': STATE_FIPS_COL,
        'county': COUNTY_FIPS_COL,
        'NAME': COUNTY_NAME_COL if county_level else STATE_NAME_COL,
        'value': measured_var
    })

    # Make the county FIPS code fully qualified.
    if county_level:
        df[COUNTY_FIPS_COL] = df[STATE_FIPS_COL] + df[COUNTY_FIPS_COL]

    return df

