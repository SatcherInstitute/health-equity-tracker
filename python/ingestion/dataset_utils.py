def generate_pct_share_col(df, raw_count_col, pct_share_col, breakdown_col, groupby_col):

    def calc_pct_share(record):
        total = 
        record[pct_share_col] = (float(record[raw_count_col]) / float(total)) * 100
        return record

    df = df.apply(calc_pct_share, axis=1)
    return df
