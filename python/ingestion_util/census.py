
def get_census_params_by_county(columns):
    """Returns the base set of params for making a census API call by county.

       columns: The list of columns to request."""
    return {
        'get': ','.join(columns),
        'for': 'county:*',
        'in': 'state:*'
    }
