import numpy as np
import pandas as pd


def check_pct_values(df):
    cols = df.columns.to_series(
    ).loc[df.columns.str.contains('share')].tolist()
    print(cols)
    testing = ['county_fips', 'sex']
    new_cols = cols + testing

    # Return DF with select columns
    df_test = df[new_cols]
    # Remove all rows with All demographic
    df_test = df_test[df_test['sex'] != 'All']
    # Group rows by county fips and sum the rows
    df_test = df_test.groupby(['county_fips']).sum().reset_index()
    print("/n")
    print(df_test)
    # Return the row that does not equal 100
    # df_test = df_test.loc[(df_test['covid_cases_share']
    #                        < 99.0) | (df_test['covid_cases_share'] > 101)]

    df_test = df_test.loc[([['covid_cases_share']]
                           < 99.0) | ([['covid_cases_share']] > 101)]
    # df_chain = df_test.loc[lambda df_test: cols < 99]
    # print(df_chain)

    # df_chain = df_test[cols].applymap(lambda x: x if x >= 100 else None)
    # print(df_chain)

    # Return False if percent share does not equal 100
    if len(df_test) > 0:
        print('These percent share values do not equal 100%')
        print(df_test['county_fips'].to_list())
        return False

    return True
