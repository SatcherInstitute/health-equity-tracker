# pylint: disable=no-member
# NOTE: pylint not treating output from read_json as a df, despite trying chunksize None

import json
import pytest
import re
import pandas as pd
from pandas.testing import assert_frame_equal
from ingestion import gcs_to_bq_util, dataset_utils
import ingestion.standardized_columns as std_col
from ingestion.dataset_utils import (
    combine_race_ethnicity,
    generate_time_df_with_cols_and_types,
    generate_estimated_total_col,
    generate_pct_share_col_of_summed_alls,
    sum_age_groups,
)
from io import StringIO

_fake_race_data = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '660'],
    ['01', 'Alabama', 'Some other race alone', '700'],
    ['01', 'Alabama', 'Two or more races', '919'],
    ['01', 'Alabama', 'An underrepresented race', '1'],
    ['01', 'Alabama', 'ALL', '2280'],
    ['01', 'Alabama', 'UNKNOWN', '30'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['02', 'Alaska', 'ALL', '116'],
    ['02', 'Alaska', 'UNKNOWN', '20'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
    ['04', 'Arizona', 'ALL', '95'],
    ['04', 'Arizona', 'UNKNOWN', '10'],
]

_expected_pct_share_data_without_unknowns = [
    ['state_fips', 'state_name', 'race', 'population', 'pct_share'],
    ['01', 'Alabama', 'Asian alone', '660', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '700', '30.7'],
    ['01', 'Alabama', 'Two or more races', '919', '40.3'],
    ['01', 'Alabama', 'An underrepresented race', '1', '.04'],
    ['01', 'Alabama', 'ALL', '2280', '100'],
    ['02', 'Alaska', 'Asian alone', '45', '38.8'],
    ['02', 'Alaska', 'Some other race alone', '11', '9.5'],
    ['02', 'Alaska', 'Two or more races', '60', '51.7'],
    ['02', 'Alaska', 'ALL', '116', '100'],
    ['04', 'Arizona', 'Asian alone', '23', '24.2'],
    ['04', 'Arizona', 'Some other race alone', '46', '48.4'],
    ['04', 'Arizona', 'Two or more races', '26', '27.4'],
    ['04', 'Arizona', 'ALL', '95', '100'],
]

_expected_pct_share_data_with_unknowns = [
    ['state_fips', 'state_name', 'race', 'population', 'pct_share'],
    ['01', 'Alabama', 'Asian alone', '660', '28.9'],
    ['01', 'Alabama', 'Some other race alone', '700', '30.7'],
    ['01', 'Alabama', 'Two or more races', '919', '40.3'],
    ['01', 'Alabama', 'An underrepresented race', '1', '.04'],
    ['01', 'Alabama', 'ALL', '2280', '100'],
    ['01', 'Alabama', 'UNKNOWN', '30', '1.3'],
    ['02', 'Alaska', 'Asian alone', '45', '38.8'],
    ['02', 'Alaska', 'Some other race alone', '11', '9.5'],
    ['02', 'Alaska', 'Two or more races', '60', '51.7'],
    ['02', 'Alaska', 'ALL', '116', '100'],
    ['02', 'Alaska', 'UNKNOWN', '20', '17.2'],
    ['04', 'Arizona', 'Asian alone', '23', '24.2'],
    ['04', 'Arizona', 'Some other race alone', '46', '48.4'],
    ['04', 'Arizona', 'Two or more races', '26', '27.4'],
    ['04', 'Arizona', 'ALL', '95', '100'],
    ['04', 'Arizona', 'UNKNOWN', '10', '10.5'],
]

_fake_data_without_pct_relative_inequity_col = [
    ['state_fips', 'state_name', 'race', 'pct_share', 'pct_pop'],
    ['01', 'Alabama', 'Race 1', 0, 10.0],
    ['01', 'Alabama', 'Race 2', 10.001, 10.0],
    ['01', 'Alabama', 'Race 3', 60.0, 10.0],
    ['01', 'Alabama', 'Race 4', 60.0, None],
    ['01', 'Alabama', 'Race 5', None, 10.0],
    ['01', 'Alabama', 'Race 6', 100.0, 0],
]

_expected_data_with_pct_relative_inequity_col = [
    [
        'state_fips',
        'state_name',
        'race',
        'pct_share',
        'pct_pop',
        'pct_relative_inequity',
    ],
    ['01', 'Alabama', 'Race 1', 0, 10.0, -100.0],
    ['01', 'Alabama', 'Race 2', 10.001, 10.0, 0.0],
    ['01', 'Alabama', 'Race 3', 60.0, 10.0, 500.0],
    ['01', 'Alabama', 'Race 4', 60.0, None, None],
    ['01', 'Alabama', 'Race 5', None, 10.0, None],
    ['01', 'Alabama', 'Race 6', 100.0, 0, None],
]

_fake_data_with_pct_rel_inequity_with_zero_rates = [
    [
        'time_period',
        'state_fips',
        'state_name',
        'race_category_id',
        'something_per_100k',
        'something_pct_relative_inequity',
        'something_pop_pct',
    ],
    ['2018', '99', 'StateWithRates', 'RaceNoPop', 90_000, None, None],
    ['2019', '01', 'Alabama', 'Race1', 0, -100.0, 10.0],
    ['2019', '01', 'Alabama', 'Race2', 10.001, 0.0, 10.0],
    ['2019', '01', 'Alabama', 'Race3', 60.0, 500.0, 10.0],
    ['2019', '01', 'Alabama', 'Race4', 60.0, None, 10.0],
    ['2019', '01', 'Alabama', 'RaceNoPop', 1, None, None],
    ['2019', '01', 'Alabama', 'Race6', 100.0, None, 10.0],
    ['2020', '01', 'Alabama', 'Race1', 0, -100.0, 10.0],
    ['2020', '01', 'Alabama', 'Race2', 0, 0.0, 10.0],
    ['2020', '01', 'Alabama', 'Race3', 0, 500.0, 10.0],
    ['2020', '01', 'Alabama', 'Race4', 0, None, 10.0],
    ['2020', '01', 'Alabama', 'RaceNoPop', 0, None, None],
    ['2020', '01', 'Alabama', 'Race6', 0, None, 10.0],
    ['2020', '99', 'StateWithRates', 'Race6', 100_000, 50.0, 10.0],
]

_expected_data_with_properly_zeroed_pct_rel_inequity = [
    [
        'time_period',
        'state_fips',
        'state_name',
        'race_category_id',
        'something_per_100k',
        'something_pct_relative_inequity',
        'something_pop_pct',
    ],
    ['2018', '99', 'StateWithRates', 'RaceNoPop', 90_000, None, None],
    ['2019', '01', 'Alabama', 'Race1', 0, -100.0, 10.0],
    ['2019', '01', 'Alabama', 'Race2', 10.001, 0.0, 10.0],
    ['2019', '01', 'Alabama', 'Race3', 60.0, 500.0, 10.0],
    ['2019', '01', 'Alabama', 'Race4', 60.0, None, 10.0],
    ['2019', '01', 'Alabama', 'RaceNoPop', 1, None, None],
    ['2019', '01', 'Alabama', 'Race6', 100.0, None, 10.0],
    # all rates in Alabama in 2020 are zero, so all pct_rel_inequity are ZEROED
    # expect for races where the population_pct_share is null
    ['2020', '01', 'Alabama', 'Race1', 0, 0, 10.0],
    ['2020', '01', 'Alabama', 'Race2', 0, 0, 10.0],
    ['2020', '01', 'Alabama', 'Race3', 0, 0, 10.0],
    ['2020', '01', 'Alabama', 'Race4', 0, 0, 10.0],
    ['2020', '01', 'Alabama', 'RaceNoPop', 0, None, None],
    ['2020', '01', 'Alabama', 'Race6', 0, 0, 10.0],
    # each PLACE/YEAR is considered independently so the fact Race6
    # has a rate in StateWithRates doesn't prevent the zeroing above
    ['2020', '99', 'StateWithRates', 'Race6', 100_000, 50.0, 10.0],
]

_fake_condition_data = [
    ['state_fips', 'state_name', 'race', 'some_condition_total', 'population'],
    ['01', 'Alabama', 'Asian alone', 100, 1000],
    ['01', 'Alabama', 'Some other race alone', 200, 5000],
    ['02', 'Alaska', 'Two or more races', 10, 2000],
    ['02', 'Alaska', 'TOTAL', 100, 4000],
    ['04', 'Arizona', 'Two or more races', 20, 4000],
    ['04', 'Arizona', 'TOTAL', 10, 2000],
]

_fake_condition_data_with_per_100k = [
    [
        'state_fips',
        'state_name',
        'race',
        'some_condition_total',
        'population',
        'condition_per_100k',
    ],
    ['01', 'Alabama', 'Asian alone', 100, 1000, 10000],
    ['01', 'Alabama', 'Some other race alone', 200, 5000, 4000],
    ['02', 'Alaska', 'Two or more races', 10, 2000, 500],
    ['02', 'Alaska', 'TOTAL', 100, 4000, 2500],
    ['04', 'Arizona', 'Two or more races', 20, 4000, 500],
    ['04', 'Arizona', 'TOTAL', 10, 2000, 500],
]

_fake_race_data_without_totals = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '66'],
    ['01', 'Alabama', 'Some other race alone', '70'],
    ['01', 'Alabama', 'Two or more races', '92'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
]

_expected_race_data_with_totals = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['01', 'Alabama', 'Asian alone', '66'],
    ['01', 'Alabama', 'Some other race alone', '70'],
    ['01', 'Alabama', 'Two or more races', '92'],
    ['02', 'Alaska', 'Asian alone', '45'],
    ['02', 'Alaska', 'Some other race alone', '11'],
    ['02', 'Alaska', 'Two or more races', '60'],
    ['04', 'Arizona', 'Asian alone', '23'],
    ['04', 'Arizona', 'Some other race alone', '46'],
    ['04', 'Arizona', 'Two or more races', '26'],
    ['01', 'Alabama', 'ALL', '228'],
    ['02', 'Alaska', 'ALL', '116'],
    ['04', 'Arizona', 'ALL', '95'],
]

_fake_data_missing_zeros = [
    ['state_fips', 'state_name', 'race', 'population'],
    ['1', 'Alabama', 'Asian alone', '66'],
    ['1', 'Alabama', 'Some other race alone', '70'],
    ['1', 'Alabama', 'Two or more races', '92'],
    ['2', 'Alaska', 'Asian alone', '45'],
    ['2', 'Alaska', 'Some other race alone', '11'],
    ['2', 'Alaska', 'Two or more races', '60'],
    ['4', 'Arizona', 'Asian alone', '23'],
    ['4', 'Arizona', 'Some other race alone', '46'],
    ['4', 'Arizona', 'Two or more races', '26'],
]

RACE_NAMES_MAPPING = {
    "American Indian/Alaska Native": std_col.Race.AIAN_NH.value,
    "Asian": std_col.Race.ASIAN_NH.value,
    "Black": std_col.Race.BLACK_NH.value,
    "Multiple/Other": std_col.Race.MULTI_OR_OTHER_STANDARD_NH.value,
    "Native Hawaiian/Other Pacific Islander": std_col.Race.NHPI_NH.value,
    "White": std_col.Race.WHITE_NH.value,
    'Hispanic/Latino': std_col.Race.HISP.value,
}


def testRatioRoundToNone():
    assert dataset_utils.ratio_round_to_None(1, 3) == 0.3
    assert dataset_utils.ratio_round_to_None(1, 11) is None


def testPercentAvoidRoundingToZero():
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 3) == 33.3
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 5000) == 0.02
    assert dataset_utils.percent_avoid_rounding_to_zero(1, 0) is None


def testAddSumOfRows():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_race_data_without_totals))).reset_index(drop=True)

    df['population'] = df['population'].astype(int)
    df = dataset_utils.add_sum_of_rows(df, 'race', 'population', 'ALL')

    expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_expected_race_data_with_totals))).reset_index(
        drop=True
    )

    expected_df['population'] = expected_df['population'].astype(int)

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColWithoutUnknowns():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_race_data))).reset_index(drop=True)

    df = df.loc[df['race'] != 'UNKNOWN']
    df['population'] = df['population'].astype(float)

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_pct_share_data_without_unknowns))
    ).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(float)

    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col_without_unknowns(df, {'population': 'pct_share'}, 'race', 'ALL')

    assert_frame_equal(expected_df, df)


def testGeneratePctShareColWithUnknowns():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_race_data))).reset_index(drop=True)

    df['population'] = df['population'].astype(float)

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_pct_share_data_with_unknowns))
    ).reset_index(drop=True)

    expected_df['population'] = expected_df['population'].astype(float)

    expected_df['pct_share'] = expected_df['pct_share'].astype(float)

    df = dataset_utils.generate_pct_share_col_with_unknowns(df, {'population': 'pct_share'}, 'race', 'ALL', 'UNKNOWN')

    df = df.sort_values(by=['state_fips']).reset_index(drop=True)
    assert_frame_equal(expected_df, df)


def testGeneratePctShareColExtraTotalError():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_race_data))).reset_index(drop=True)

    extra_row = pd.DataFrame(
        [
            {
                'state_fips': '01',
                'state_name': 'Alabama',
                'race': 'ALL',
                'population': '66',
            }
        ]
    )

    df = pd.concat([df, extra_row])

    df = df.loc[df['race'] != 'UNKNOWN']
    df['population'] = df['population'].astype(float)

    expected_error = re.escape("Fips ('01',) has 2 ALL rows, there should be 1")
    with pytest.raises(ValueError, match=expected_error):
        df = dataset_utils.generate_pct_share_col_without_unknowns(df, {'population': 'pct_share'}, 'race', 'ALL')


def testGeneratePer100kCol():
    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_condition_data))).reset_index(drop=True)

    df = dataset_utils.generate_per_100k_col(df, 'some_condition_total', 'population', 'condition_per_100k')

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_fake_condition_data_with_per_100k))
    ).reset_index(drop=True)

    expected_df['condition_per_100k'] = df['condition_per_100k'].astype(float)

    assert_frame_equal(expected_df, df, check_like=True)


def test_generate_pct_rate_col():
    data = [
        {'some_condition_total': 1, 'population': 2},
        {'some_condition_total': 11, 'population': 1000},
        {'some_condition_total': 0, 'population': 1000},
        {'some_condition_total': 1, 'population': 0},
        {'some_condition_total': None, 'population': 1000},
        {'some_condition_total': 1, 'population': 1000},
    ]
    df = pd.DataFrame(data)

    df = dataset_utils.generate_pct_rate_col(df, 'some_condition_total', 'population', 'condition_pct_rate')

    expected_data = [
        {'some_condition_total': 1, 'population': 2, 'condition_pct_rate': 50},
        {'some_condition_total': 11, 'population': 1000, 'condition_pct_rate': 1.0},
        {'some_condition_total': 0, 'population': 1000, 'condition_pct_rate': 0.0},
        {'some_condition_total': 1, 'population': 0, 'condition_pct_rate': None},
        {'some_condition_total': None, 'population': 1000, 'condition_pct_rate': None},
        {'some_condition_total': 1, 'population': 1000, 'condition_pct_rate': 0.0},
    ]
    expected_df = pd.DataFrame(expected_data)
    expected_df['condition_pct_rate'] = expected_df['condition_pct_rate'].astype(float)

    assert_frame_equal(df, expected_df, check_like=True)


def test_ensure_leading_zeros():

    df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_data_missing_zeros))).reset_index(drop=True)
    df = dataset_utils.ensure_leading_zeros(df, "state_fips", 2)

    expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_race_data_without_totals))).reset_index(
        drop=True
    )

    assert_frame_equal(df, expected_df, check_like=True)


def testGeneratePctRelInequityCol():
    df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_fake_data_without_pct_relative_inequity_col))
    ).reset_index(drop=True)
    df = dataset_utils.generate_pct_rel_inequity_col(df, 'pct_share', 'pct_pop', 'pct_relative_inequity')

    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_data_with_pct_relative_inequity_col))
    ).reset_index(drop=True)
    expected_df['pct_relative_inequity'] = expected_df['pct_relative_inequity'].astype(float)

    assert_frame_equal(df, expected_df, check_like=True)


def testZeroOutPctRelInequity():
    df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_fake_data_with_pct_rel_inequity_with_zero_rates))
    ).reset_index(drop=True)
    rate_to_inequity_cols_map = {"something_per_100k": "something_pct_relative_inequity"}
    df = dataset_utils.zero_out_pct_rel_inequity(
        df, 'state', 'race', rate_to_inequity_cols_map, pop_pct_col="something_pop_pct"
    )
    expected_df = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_data_with_properly_zeroed_pct_rel_inequity))
    ).reset_index(drop=True)

    assert_frame_equal(df, expected_df, check_like=True, check_dtype=False)


_fake_wide_short_source_data = [
    [
        'time_period',
        'state_fips',
        'state_name',
        'black_A_100k',
        'white_A_100k',
        'black_B_100k',
        'white_B_100k',
    ],
    ['1999', '88', 'North Somestate', 100, 50, 999, 2222],
    ['1999', '99', 'South Somestate', 101, 51, 998, 2221],
    ['2000', '88', 'North Somestate', 100, 50, 999, 2222],
    ['2000', '99', 'South Somestate', 101, 51, 998, 2221],
]

_expected_HET_style_data = [
    ['time_period', 'state_fips', 'state_name', 'race', 'A_100k', 'B_100k'],
    ['1999', '88', 'North Somestate', 'black', 100, 999],
    ['1999', '88', 'North Somestate', 'white', 50, 2222],
    ['1999', '99', 'South Somestate', 'black', 101, 998],
    ['1999', '99', 'South Somestate', 'white', 51, 2221],
    ['2000', '88', 'North Somestate', 'black', 100, 999],
    ['2000', '88', 'North Somestate', 'white', 50, 2222],
    ['2000', '99', 'South Somestate', 'black', 101, 998],
    ['2000', '99', 'South Somestate', 'white', 51, 2221],
]


def test_melt_to_het_style_df():

    source_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_fake_wide_short_source_data))).reset_index(
        drop=True
    )

    df = dataset_utils.melt_to_het_style_df(
        source_df,
        "race",
        ["time_period", "state_fips", "state_name"],
        {
            "A_100k": {"black_A_100k": "black", "white_A_100k": "white"},
            "B_100k": {"black_B_100k": "black", "white_B_100k": "white"},
        },
    )

    expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_expected_HET_style_data))).reset_index(
        drop=True
    )

    assert_frame_equal(df, expected_df, check_dtype=False)


def test_preserve_only_current_time_period_rows():

    _time_data = [
        ['time_period', 'state_fips', 'state_name', 'race', 'A_100k', 'B_100k'],
        ['1999-01', '88', 'North Somestate', 'black', 100, 999],
        ['1999', '88', 'North Somestate', 'white', 50, 2222],
        ['1999', '99', 'South Somestate', 'black', 101, 998],
        ['1999', '99', 'South Somestate', 'white', 51, 2221],
        ['2000', '88', 'North Somestate', 'black', 100, 999],
        ['2000', '88', 'North Somestate', 'white', 50, 2222],
        ['2000', '99', 'South Somestate', 'black', 101, 998],
        ['2000', '99', 'South Somestate', 'white', 51, 2221],
    ]
    time_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_time_data))).reset_index(drop=True)

    # normal mode: drop time_period
    current_df = dataset_utils.preserve_only_current_time_period_rows(time_df)
    _expected_current_data = [
        ['state_fips', 'state_name', 'race', 'A_100k', 'B_100k'],
        ['88', 'North Somestate', 'black', 100, 999],
        ['88', 'North Somestate', 'white', 50, 2222],
        ['99', 'South Somestate', 'black', 101, 998],
        ['99', 'South Somestate', 'white', 51, 2221],
    ]
    expected_current_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_expected_current_data))).reset_index(
        drop=True
    )

    assert_frame_equal(current_df, expected_current_df, check_like=True)

    # optional mode: keep time_period
    current_df_with_time = dataset_utils.preserve_only_current_time_period_rows(time_df, keep_time_period_col=True)
    _expected_current_data = [
        ['time_period', 'state_fips', 'state_name', 'race', 'A_100k', 'B_100k'],
        ['2000', '88', 'North Somestate', 'black', 100, 999],
        ['2000', '88', 'North Somestate', 'white', 50, 2222],
        ['2000', '99', 'South Somestate', 'black', 101, 998],
        ['2000', '99', 'South Somestate', 'white', 51, 2221],
    ]
    expected_current_df_with_time = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_current_data)), dtype={"time_period": str}
    ).reset_index(drop=True)

    assert_frame_equal(current_df_with_time, expected_current_df_with_time, check_like=True)

    # optional alt name for time_period column
    _time_alt_col_data = [
        [
            'some_other_datetime_col',
            'state_fips',
            'state_name',
            'race',
            'A_100k',
            'B_100k',
        ],
        ['1999-01', '88', 'North Somestate', 'black', 100, 999],
        ['1999', '88', 'North Somestate', 'white', 50, 2222],
        ['1999', '99', 'South Somestate', 'black', 101, 998],
        ['1999', '99', 'South Somestate', 'white', 51, 2221],
        ['2000', '88', 'North Somestate', 'black', 100, 999],
        ['2000', '88', 'North Somestate', 'white', 50, 2222],
        ['2000', '99', 'South Somestate', 'black', 101, 998],
        ['2000', '99', 'South Somestate', 'white', 51, 2221],
    ]
    time_alt_col_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(_time_alt_col_data))).reset_index(drop=True)

    current_df_with_alt_col = dataset_utils.preserve_only_current_time_period_rows(
        time_alt_col_df, time_period_col="some_other_datetime_col"
    )
    _expected_alt_col_current_data = [
        ['state_fips', 'state_name', 'race', 'A_100k', 'B_100k'],
        ['88', 'North Somestate', 'black', 100, 999],
        ['88', 'North Somestate', 'white', 50, 2222],
        ['99', 'South Somestate', 'black', 101, 998],
        ['99', 'South Somestate', 'white', 51, 2221],
    ]
    expected_current_df_with_alt_col = gcs_to_bq_util.values_json_to_df(
        StringIO(json.dumps(_expected_alt_col_current_data))
    ).reset_index(drop=True)
    assert_frame_equal(current_df_with_alt_col, expected_current_df_with_alt_col, check_like=True)

    # expect error
    with pytest.raises(ValueError, match="df does not contain column: BAD_COLUMN_NAME."):
        _ = dataset_utils.preserve_only_current_time_period_rows(time_alt_col_df, time_period_col="BAD_COLUMN_NAME")


def test_combine_race_ethnicity():
    ethnicity_val = 'Hispanic/Latino'

    def test_case(ethnicity, race, expected_combined_value, ethnicity_value=None):
        test_data = [['ethnicity', 'race'], [ethnicity, race]]
        expected_data = [['race_ethnicity_combined'], [expected_combined_value]]

        df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(test_data)), dtype=str).reset_index(drop=True)

        expected_df = gcs_to_bq_util.values_json_to_df(StringIO(json.dumps(expected_data)), dtype=str).reset_index(
            drop=True
        )

        if ethnicity_value:
            df = combine_race_ethnicity(df, RACE_NAMES_MAPPING, ethnicity_value)
        else:
            df = combine_race_ethnicity(df, RACE_NAMES_MAPPING)

        assert_frame_equal(df, expected_df, check_like=True)

    # Default behavior tests (assuming 'Hispanic' as default)
    test_case('Hispanic', 'White', std_col.Race.HISP.value)
    test_case('Hispanic', 'Black', std_col.Race.HISP.value)

    # Specified behavior tests ('Hispanic/Latino')
    test_case('Hispanic/Latino', 'White', std_col.Race.HISP.value, ethnicity_val)
    test_case('Hispanic/Latino', 'Black', std_col.Race.HISP.value, ethnicity_val)

    # Non-Hispanic tests
    test_case('Non-Hispanic/Latino', 'Black', std_col.Race.BLACK_NH.value)
    test_case('Non-Hispanic/Latino', 'White', std_col.Race.WHITE_NH.value)

    # Unknown and Missing tests
    test_case('Unknown', 'Asian', std_col.Race.UNKNOWN.value)
    test_case('Missing', 'Missing', std_col.Race.UNKNOWN.value)


def test_generate_time_df_with_cols_and_types():

    test_data = pd.DataFrame(
        {
            'time_period': ['2020', '2021'],
            'state_name': ['Alabama', 'California'],
            'state_fips': ['01', '02'],
            'age': ['25-30', '31-36'],
            'estimated_total': [100, 200],
            'per_100k': [50, 75],
            'pct_share': [0.5, 0.7],
            'pct_relative_inequity': [0.1, 0.2],
            'population': [1351583, 5168831],
            'population_pct': [0.2, 0.7],
        }
    )

    expected_current_df = pd.DataFrame(
        {
            'state_name': ['California'],
            'state_fips': ['02'],
            'age': ['31-36'],
            'estimated_total': [200.0],
            'per_100k': [75.0],
            'pct_share': [0.7],
            'population_pct': [0.7],
        }
    )
    expected_current_df.reset_index(drop=True)

    expected_historical_df = pd.DataFrame(
        {
            'time_period': ['2020', '2021'],
            'state_name': ['Alabama', 'California'],
            'state_fips': ['01', '02'],
            'age': ['25-30', '31-36'],
            'per_100k': [50.0, 75.0],
            'pct_relative_inequity': [0.1, 0.2],
            'pct_share': [0.5, 0.7],
        }
    )

    expected_current_col_types = {
        'state_name': 'STRING',
        'state_fips': 'STRING',
        'age': 'STRING',
        'estimated_total': 'FLOAT64',
        'per_100k': 'FLOAT64',
        'pct_share': 'FLOAT64',
        'population_pct': 'FLOAT64',
    }

    expected_historical_col_types = {
        'time_period': 'STRING',
        'state_name': 'STRING',
        'state_fips': 'STRING',
        'age': 'STRING',
        'per_100k': 'FLOAT64',
        'pct_relative_inequity': 'FLOAT64',
        'pct_share': 'FLOAT64',
    }

    current_df, current_col_types = generate_time_df_with_cols_and_types(
        test_data,
        ['estimated_total', 'per_100k', 'pct_share', 'population_pct'],  # numerical_cols_to_keep
        'current',  # table_type
        'age',  # dem_col
    )

    historical_df, historical_col_types = generate_time_df_with_cols_and_types(
        test_data,
        ['per_100k', 'pct_relative_inequity', 'pct_share'],  # numerical_cols_to_keep
        'historical',  # table_type
        'age',  # dem_col
    )

    current_df.reset_index(drop=True)

    assert_frame_equal(current_df, expected_current_df, check_like=True)
    assert_frame_equal(historical_df, expected_historical_df, check_like=True)

    assert current_col_types == expected_current_col_types
    assert expected_historical_col_types == historical_col_types


# STATE BY SEX DATA

fake_state_by_sex_data_with_only_rates = {
    'topic_per_100k': [20, 60, 40, 50, 50, 50],
    'sex': ['Male', 'Female', 'All', 'Male', 'Female', 'All'],
    'state_fips': ['01', '01', '01', '02', '02', '02'],
    'state_name': ['Alabama', 'Alabama', 'Alabama', 'Alaska', 'Alaska', 'Alaska'],
}

fake_state_by_sex_data_with_rates_pop_18plus_and_counts = {
    'topic_per_100k': [20, 60, 40, 50, 50, 50],
    'sex': ['Male', 'Female', 'All', 'Male', 'Female', 'All'],
    'state_fips': ['01', '01', '01', '02', '02', '02'],
    'state_name': ['Alabama', 'Alabama', 'Alabama', 'Alaska', 'Alaska', 'Alaska'],
    'population': [1878392.0, 2039058.0, 3917450.0, 294462.0, 261021.0, 555483.0],
    'topic_estimated_total': [376.0, 1223.0, 1567.0, 147.0, 131.0, 278.0],
}

fake_state_by_sex_data_with_rates_pop_18plus_adjusted_all_counts_and_pct_share = {
    'topic_per_100k': [20, 60, 40, 50, 50, 50],
    'sex': ['Male', 'Female', 'All', 'Male', 'Female', 'All'],
    'state_fips': ['01', '01', '01', '02', '02', '02'],
    'state_name': ['Alabama', 'Alabama', 'Alabama', 'Alaska', 'Alaska', 'Alaska'],
    'population': [1878392.0, 2039058.0, 3917450.0, 294462.0, 261021.0, 555483.0],
    'topic_estimated_total': [376.0, 1223.0, 1599.0, 147.0, 131.0, 278.0],  # note the new summed Alls
    'topic_pct_share': [23.5, 76.5, 100.0, 52.9, 47.1, 100.0],
}

# COUNTY BY RACE DATA

fake_county_by_race_data_with_only_rates = {
    'topic_per_100k': [100, 10, 20, 50, 50, 50],
    'race_category_id': ['BLACK_NH', 'WHITE_NH', 'ALL', 'BLACK_NH', 'WHITE_NH', 'ALL'],
    'race_and_ethnicity': [
        'Black or African American (NH)',
        'White (NH)',
        'All',
        'Black or African American (NH)',
        'White (NH)',
        'All',
    ],
    'county_fips': ['01001', '01001', '01001', '01003', '01003', '01003'],
    'county_name': [
        'Autuga County',
        'Autuga County',
        'Autuga County',
        'Baldwin County',
        'Baldwin County',
        'Baldwin County',
    ],
}

fake_county_by_race_data_with_rates_and_counts = {
    'topic_per_100k': [100, 10, 20, 50, 50, 50],
    'race_category_id': ['BLACK_NH', 'WHITE_NH', 'ALL', 'BLACK_NH', 'WHITE_NH', 'ALL'],
    'race_and_ethnicity': [
        'Black or African American (NH)',
        'White (NH)',
        'All',
        'Black or African American (NH)',
        'White (NH)',
        'All',
    ],
    'county_fips': ['01001', '01001', '01001', '01003', '01003', '01003'],
    'county_name': [
        'Autuga County',
        'Autuga County',
        'Autuga County',
        'Baldwin County',
        'Baldwin County',
        'Baldwin County',
    ],
    'population': [11496.0, 42635.0, 58761.0, 19445.0, 192161.0, 233420.0],
    'topic_estimated_total': [11.0, 4.0, 12.0, 10.0, 96.0, 117.0],
}

fake_county_by_race_data_with_rates_adjusted_all_counts_and_pct_share = {
    'topic_per_100k': [20, 60, 40, 50, 50, 50],
    'race_category_id': ['BLACK_NH', 'WHITE_NH', 'ALL', 'BLACK_NH', 'WHITE_NH', 'ALL'],
    'race_and_ethnicity': [
        'Black or African American (NH)',
        'White (NH)',
        'All',
        'Black or African American (NH)',
        'White (NH)',
        'All',
    ],
    'county_fips': ['01001', '01001', '01001', '01003', '01003', '01003'],
    'county_name': [
        'Autuga County',
        'Autuga County',
        'Autuga County',
        'Baldwin County',
        'Baldwin County',
        'Baldwin County',
    ],
    'population': [1878392.0, 2039058.0, 3917450.0, 294462.0, 261021.0, 555483.0],
    'topic_estimated_total': [376.0, 1223.0, 1599.0, 147.0, 131.0, 278.0],  # note the new summed Alls
    'topic_pct_share': [23.5, 76.5, 100.0, 52.9, 47.1, 100.0],
}

# STATE BY SEX TESTS


def test_state_sex_generate_estimated_total_col():
    df = pd.DataFrame(fake_state_by_sex_data_with_only_rates)
    df = generate_estimated_total_col(
        df, {'topic_per_100k': 'topic_estimated_total'}, 'state', 'sex', age_specific_group='18+'
    )
    assert_frame_equal(df, pd.DataFrame(fake_state_by_sex_data_with_rates_pop_18plus_and_counts), check_like=True)


def test_state_sex_generate_pct_share_col_of_summed_alls():
    df = pd.DataFrame(fake_state_by_sex_data_with_rates_pop_18plus_and_counts)
    df = generate_pct_share_col_of_summed_alls(df, {'topic_estimated_total': 'topic_pct_share'}, 'sex')
    assert_frame_equal(
        df,
        pd.DataFrame(fake_state_by_sex_data_with_rates_pop_18plus_adjusted_all_counts_and_pct_share),
        check_like=True,
    )


# COUNTY BY RACE TESTS


def test_county_race_generate_estimated_total_col():
    df = pd.DataFrame(fake_county_by_race_data_with_only_rates)
    df = generate_estimated_total_col(df, {'topic_per_100k': 'topic_estimated_total'}, 'county', 'race_and_ethnicity')
    assert_frame_equal(df, pd.DataFrame(fake_county_by_race_data_with_rates_and_counts), check_like=True)


fake_pop_data_all_ages = {
    'county_fips': ['01001'] * 23,
    'county_name': ['Autuga County '] * 23,
    'race_and_ethnicity': ['Black or African American (NH)'] * 23,
    'race_category_id': ['BLACK_NH'] * 23,
    'sex': ['All'] * 23,
    'age': [
        '0-4',
        '5-9',
        '10-14',
        '15-17',
        '18-19',
        '20-20',
        '21-21',
        '22-24',
        '25-29',
        '30-34',
        '35-39',
        '40-44',
        '45-49',
        '50-54',
        '55-59',
        '60-61',
        '62-64',
        '65-66',
        '67-69',
        '70-74',
        '75-79',
        '80-84',
        '85+',
    ],
    'population': [100] * 23,
}

fake_pop_data_summed_18plus = {
    'county_fips': ['01001'] * 5,
    'county_name': ['Autuga County '] * 5,
    'race_and_ethnicity': ['Black or African American (NH)'] * 5,
    'race_category_id': ['BLACK_NH'] * 5,
    'sex': ['All'] * 5,
    'age': ['0-4', '5-9', '10-14', '15-17', '18+'],
    'population': [100, 100, 100, 100, 1900],
}


def test_sum_age_groups():
    pop_df = pd.DataFrame(fake_pop_data_all_ages)
    pop_df = sum_age_groups(pop_df, '18+')
    expected_summed_pop_df = pd.DataFrame(fake_pop_data_summed_18plus)
    assert_frame_equal(pop_df, expected_summed_pop_df, check_like=True)
