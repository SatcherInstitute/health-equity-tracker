from .di_url_file_to_gcs import url_file_to_gcs


def get_census_params_by_county(columns):
    """Returns the base set of params for making a census API call by county.

       columns: The list of columns to request."""
    return {
        'get': ','.join(columns),
        'for': 'county:*',
        'in': 'state:*'
    }


def get_household_income_columns():
    """Returns column names of SAIPE fields and their descriptions."""
    return {
        'COUNTY': 'County FIPS Code',
        'GEOCAT': 'Summary Level',
        'GEOID': 'State+County FIPS Code',
        'SAEMHI_LB90': 'Median Household Income Lower Bound for 90% Confidence Interval',
        'SAEMHI_MOE': 'Median Household Income Margin of Error',
        'SAEMHI_PT': 'Median Household Income Estimate',
        'SAEMHI_UB90': 'Median Household Income Upper Bound for 90% Confidence Interval',
        'SAEPOVALL_LB90': 'All ages in Poverty, Count Lower Bound for 90% Confidence Interval',
        'SAEPOVALL_MOE': 'All ages in Poverty, Count Margin of Error',
        'SAEPOVALL_PT': 'All ages in Poverty, Count Estimate',
        'SAEPOVALL_UB90': 'All ages in Poverty, Count Upper Bound for 90% Confidence Interval',
        'SAEPOVRTALL_LB90': 'All ages in Poverty, Rate Lower Bound for 90% Confidence Interval',
        'SAEPOVRTALL_MOE': 'All ages in Poverty, Rate Margin of Error',
        'SAEPOVRTALL_PT': 'All ages in Poverty, Rate Estimate',
        'SAEPOVRTALL_UB90': 'All ages in Poverty, Rate Upper Bound for 90% Confidence Interval',
        'SAEPOVU_ALL': 'All Ages in Poverty Universe',
        'STABREV': 'Two-letter State Postal abbreviation',
        'STATE': 'FIPS State Code',
        'YEAR': 'Estimate Year',
    }


def upload_household_income(url, gcs_bucket, filename):
    """Uploads household income data from SAIPE to GCS bucket for all available years."""
    year_range = {1989, 1993, *range(1995, 2019)}
    for year in year_range:
        url_params = get_census_params_by_county(
            get_household_income_columns().keys())
        url_params['time'] = year
        url_file_to_gcs(
            url, url_params, gcs_bucket, '{}_{}.json'.format(filename, year))


def upload_state_names(url, gcs_bucket, filename):
    """Uploads state names and FIPS codes from census to GCS bucket."""
    url_params = {'get': 'NAME', 'for': 'state:*'}
    url_file_to_gcs(url, url_params, gcs_bucket, filename)


def upload_county_names(url, gcs_bucket, filename):
    """Uploads county names and FIPS codes from census to GCS bucket."""
    url_params = get_census_params_by_county(['NAME'])
    url_file_to_gcs(url, url_params, gcs_bucket, filename)


def get_population_by_race_columns():
    """Returns population by race column names of ACS fields and their
       descriptions."""
    return {
        'DP05_0070E': 'Population (Total)',
        'DP05_0071E': 'Population (Hispanic or Latino)',
        'DP05_0077E': 'Population (White alone, Non-Hispanic)',
        'DP05_0078E': 'Population (Black or African American alone, Non-Hispanic)',
        'DP05_0080E': 'Population (Asian alone, Non-Hispanic)',

        # These will be grouped into an "Other" category
        'DP05_0079E': 'Population (American Indian and Alaska Native alone, Non-Hispanic)',
        'DP05_0081E': 'Population (Native Hawaiian and Other Pacific Islander alone, Non-Hispanic)',
        'DP05_0082E': 'Population (Some other race alone, Non-Hispanic)',
        'DP05_0083E': 'Population (Two or more races, Non-Hispanic)'
    }


def upload_population_by_race(url, gcs_bucket, filename):
    """Uploads population by county and race from census to GCS bucket."""
    url_params = get_census_params_by_county(
        get_population_by_race_columns().keys())
    url_file_to_gcs(url, url_params, gcs_bucket, filename)
