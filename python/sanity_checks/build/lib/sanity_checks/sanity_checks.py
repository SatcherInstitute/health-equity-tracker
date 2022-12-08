import numpy as np
import pandas as pd


# def check_pct_values(df):
#     df_all = df.loc[df['sex'] == 'All']

#     cols = df.columns.to_series(
#     ).loc[df.columns.str.contains('share')].tolist()

#     df_copy = df.loc[df['sex'] == 'All']
#     for col in cols:
#         df_copy.loc[df_copy[col] < 100.0, col] = np.nan
#         df_copy.loc[df_copy[col] >= 101.0, col] = np.nan

#     print("DataFrame Copy")
#     print(df_copy)

#     print("DataFrame")
#     print(df)

#     # print(df)

#     return df_all

def check_pct_values(df):
    df_all = df.loc[df['sex'] == 'All']

    cols = df.columns.to_series(
    ).loc[df.columns.str.contains('share')].tolist()

    df_copy = df.loc[df['sex'] == 'All']

    for col in cols:
        df_copy.loc[df_copy[col] < 100.0,
                    col] = np.nan
        df_copy.loc[df_copy[col] >= 101.0, col] = np.nan

    df_copy.replace(np.nan, 'NAN', inplace=True)
    df.update(df_copy)
    df.replace('NAN', np.nan,  inplace=True)

    print("/n")
    print(df_copy)

    print("/n")
    print(df)

    # print(df)

    return df_all
