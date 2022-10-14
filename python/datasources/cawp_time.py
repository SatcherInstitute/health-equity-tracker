from datasources.data_source import DataSource
from ingestion.constants import NATIONAL_LEVEL, STATE_LEVEL, STATE_LEVEL_FIPS_LIST, US_ABBR
import ingestion.standardized_columns as std_col
from ingestion import gcs_to_bq_util, merge_utils
import pandas as pd


class CAWPTimeData(DataSource):

    @ staticmethod
    def get_id():
        return 'CAWP_TIME_DATA'

    @ staticmethod
    def get_table_name():
        return 'cawp_time_data'

    def upload_to_gcs(self, _, **attrs):
        raise NotImplementedError(
            'upload_to_gcs should not be called for CAWPTimeData')

    def write_to_bq(self, dataset, gcs_bucket, **attrs):

        # for geo_level in [STATE_LEVEL, NATIONAL_LEVEL]:
        for geo_level in [STATE_LEVEL]:
            time_periods = ["2009", "2021", "2022"]
            table_name = f'race_and_ethnicity_{geo_level}'

            # start with single column of all state-level fips
            df = pd.DataFrame(
                {
                    std_col.STATE_FIPS_COL: [*STATE_LEVEL_FIPS_LIST],
                })

            # explode to every combo of state/year
            df[std_col.TIME_PERIOD_COL] = [time_periods] * len(df)
            df = df.explode(std_col.TIME_PERIOD_COL).reset_index(drop=True)

            raw_historical_congress_json = gcs_to_bq_util.fetch_json_from_web(
                "https://theunitedstates.io/congress-legislators/legislators-historical.json")

            raw_current_congress_json = gcs_to_bq_util.fetch_json_from_web(
                "https://theunitedstates.io/congress-legislators/legislators-current.json")

            raw_terms_json = list(
                map((lambda x: x["terms"]), raw_historical_congress_json)) + list(
                map((lambda x: x["terms"]), raw_current_congress_json))

            us_congress_totals_list_of_dict = []

            for term_list in raw_terms_json:
                for term in term_list:
                    years = list(
                        range(int(term["start"][:4]), int(term["end"][:4])+1))
                    for year in years:
                        year = str(year)
                        if year in time_periods:
                            # add entry for each state's count
                            us_congress_totals_list_of_dict.append({
                                std_col.STATE_POSTAL_COL: term["state"],
                                std_col.TIME_PERIOD_COL: year
                            })
                            # and to the national count
                            # us_congress_totals_list_of_dict.append({
                            #     std_col.STATE_POSTAL_COL: US_ABBR,
                            #     std_col.TIME_PERIOD_COL: year
                            # })

            us_congress_total_count_df = pd.DataFrame.from_dict(
                us_congress_totals_list_of_dict)

            us_congress_total_count_df = us_congress_total_count_df.groupby(
                [std_col.STATE_POSTAL_COL, std_col.TIME_PERIOD_COL]).size().reset_index().rename(
                columns={0: 'total_us_congress_count'})

            us_congress_total_count_df = merge_utils.merge_state_fips_codes(
                us_congress_total_count_df, keep_postal=True)

            merge_cols = [std_col.TIME_PERIOD_COL, std_col.STATE_FIPS_COL]
            df = pd.merge(df, us_congress_total_count_df, on=merge_cols)

            gcs_to_bq_util.add_df_to_bq(
                df, dataset, table_name)
