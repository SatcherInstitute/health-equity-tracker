import requests
import json
from ingestion.standardized_columns import (
    STATE_FIPS_COL,
    COUNTY_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_NAME_COL,
)


def get_census_params_by_county(columns):
    """Returns the base set of params for making a census API call by county.

    columns: The list of columns to request."""
    return {"get": ",".join(columns), "for": "county:*", "in": "state:*"}


def get_census_params(variable_ids, county_level=False):
    """Gets census url params to make an API call.

    variable_ids: The ids of the variables to request. Automatically includes
        NAME.
    county_level: Whether to request at the county level, or the state level."""
    keys = variable_ids.copy()
    keys.append("NAME")
    params = {"get": ",".join(keys)}
    params["for"] = "county:*" if county_level else "state:*"
    return params


def get_all_params_for_group(group, county_level=False):
    """Gets census url params to get all variables for a group.

       group: String group ID to get variables for.
       county_level: Whether to request at the county or state level."""
    geo = 'county' if county_level else 'state'
    return {'get': f'group({group})', 'for': geo}


def fetch_acs_variables(base_acs_url, variable_ids, county_level):
    """Fetches ACS variables and returns them as a json string.

    base_acs_url: The base ACS url to use. This is used to specify which year or
        version of ACS.
    variable_ids: The ids of the variables to request. Automatically includes
        NAME.
    county_level: Whether to request at the county level, or the state level."""
    resp2 = requests.get(
        base_acs_url, params=get_census_params(variable_ids, county_level)
    )
    json_result = resp2.json()
    json_string = json.dumps(json_result)
    return json_string


def fetch_acs_metadata(base_acs_url):
    """Fetches ACS variable metadata as json.

    base_acs_url: The base ACS url to use. This is used to specify which year or
        version of ACS."""
    resp = requests.get(base_acs_url + "/variables.json")
    return resp.json()


def fetch_acs_group(base_acs_url, group_concept, var_map, num_breakdowns, county_level):
    """Fetches a group of ACS variables and returns them as a json string.

    base_acs_url: The base ACS url to use. This is used to specify which year or
        version of ACS.
    group_concept: The concept label of the group. Eg "SEX BY AGE"
    var_map: The ACS variable metadata map, as returned by `parse_acs_metadata`
    num_breakdowns: The number of breakdowns for the group. For example, "RACE"
        has one breakdown while "SEX BY AGE" has two.
    county_level: Whether to request at the county level, or the state level."""
    group_vars = get_vars_for_group(group_concept, var_map, num_breakdowns)
    json_string = fetch_acs_variables(
        base_acs_url, list(group_vars.keys()), county_level
    )
    return json_string


def parse_acs_metadata(acs_metadata, groups):
    """Returns a map of variable ids to metadata for that variable, filtered to
       specified groups.

    acs_metadata: The ACS metadata as json.
    groups: The list of group ids to include."""
    output_vars = {}
    for variable_id, metadata in acs_metadata["variables"].items():
        group = metadata.get("group")
        if group in groups and metadata["label"].startswith("Estimate!!Total"):
            output_vars[variable_id] = metadata
    return output_vars


def get_vars_for_group(group_concept, var_map, num_breakdowns):
    """Returns a map of ACS variable id to an ordered list of the attributes that
       variable describes. num_breakdowns describes the number of breakdowns this
       group uses.
       For example, get_vars_for_group("SEX BY AGE", var_map, 2) would return a map
       like:
         {
           'B01001_011E': ['Male', '25 to 29 years'],
           'B01001_012E': ['Male', '30 to 34 years'],
            ...
         }

    group_concept: The concept label of the group. Eg "SEX BY AGE"
    var_map: The ACS variable metadata map, as returned by `parse_acs_metadata`
    num_breakdowns: The number of breakdowns for the group. For example, "RACE"
        has one breakdown while "SEX BY AGE" has two."""
    group_vars = {}
    for group, metadata in var_map.items():
        if metadata.get("concept") == group_concept:
            # TODO switch to use explicit prefix to handle median, etc
            parts = metadata["label"].split("!!")
            # If length is greater than (2 + num_breakdowns), it means it's a
            # sub-category, which we don't need to include. If the length is
            # less than (2 + num_breakdowns), it means it's a combination of
            # others, which should be requested separately.
            num_parts = 2 + num_breakdowns
            if len(parts) == num_parts:
                attributes = parts[2:num_parts]
                attributes = [a[:-1] if a.endswith(":") else a for a in attributes]
                group_vars[group] = attributes
    return group_vars


def standardize_frame(df, var_to_labels_map, breakdowns, county_level, measured_var):
    """Standardizes an ACS frame that measures one variable across different
       breakdowns by reshaping so that the variable columns are converted into
       breakdown columns. For example:
       One dimension:
           standardize_frame(frame, group_vars, ["race"], False, "population")
       Two dimensions:
           standardize_frame(frame, group_vars, [
                             "hispanic", "race"], False, "population")
       This will convert an ACS frame into one with columns for "hispanic" and
       "race" and "population".

    frame: The DataFrame in the format returned by ACS API calls.
    var_to_labels_map: Map of variable to labels, as returned by
        `get_vars_for_group`
    breakdowns: The number of breakdowns for the group. For example, "RACE"
        has one breakdown while "SEX BY AGE" has two.
    county_level: Whether the data is at the county level vs the state level
    measured_var: The column name of the measured variable."""
    # First, "melt" the frame so that each column other than the geo identifier
    # gets converted to a value with the column name "variable"
    id_cols = ["state", "county"] if county_level else ["state"]
    if 'NAME' in df.columns:
        id_cols.append('NAME')
    sort_cols = (
        ["state", "county", "variable"] if county_level else ["state", "variable"]
    )

    df = df.melt(id_vars=id_cols)
    df = df.sort_values(sort_cols)

    # Now, create new columns for each breakdown, using the values from
    # var_to_labels_map, and then delete the original variable ids.
    for index, breakdown in enumerate(breakdowns):
        renaming = {k: v[index] for k, v in var_to_labels_map.items()}
        df[breakdown] = df["variable"].replace(renaming)
    df = df.drop("variable", axis=1)

    # Standardize column names and move the measured variable to the end.
    reorder_cols = list(df.columns)
    reorder_cols.remove("value")
    reorder_cols.append("value")
    df = df[reorder_cols]
    df = df.rename(
        columns={
            "state": STATE_FIPS_COL,
            "county": COUNTY_FIPS_COL,
            "NAME": COUNTY_NAME_COL if county_level else STATE_NAME_COL,
            "value": measured_var,
        }
    )

    # Make the county FIPS code fully qualified.
    if county_level:
        df[COUNTY_FIPS_COL] = df[STATE_FIPS_COL] + df[COUNTY_FIPS_COL]

    return df.reset_index(drop=True)


# Pull the State_Fips map Code->Name from ACS
def get_state_fips_mapping(base_url):
    params = {"for": "state", "get": "NAME"}
    resp = requests.get(base_url, params=params)
    json_formatted_response = resp.json()
    state_fips = {}
    for row in json_formatted_response[1::]:
        state_name, fip_code = row
        state_fips[fip_code] = state_name

    return state_fips


# Pull the County Fips map Code->Name from ACS
def get_county_fips_mapping(base_url):
    params = {"for": "county", "get": "NAME"}
    resp = requests.get(base_url, params=params)
    json_formatted_response = resp.json()
    county_fips = {}
    for row in json_formatted_response[1::]:
        county_name, state_fip, county_fip = row
        county_fips[(state_fip, county_fip)] = county_name

    return county_fips
