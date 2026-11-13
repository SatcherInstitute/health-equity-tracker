from find_abandoned import is_backed, source_table


def test_source_table_plain_export():
    assert source_table("acs_population-race_state_current.json") == ("acs_population", "race_state_current")


def test_source_table_county_split():
    assert source_table("acs_population-race_county_current-06.json") == ("acs_population", "race_county_current")


def test_source_table_keeps_hyphenated_table_suffix():
    assert source_table("cdc_hiv_data-race_and_ethnicity_state_current-with_age_adjust.json") == (
        "cdc_hiv_data",
        "race_and_ethnicity_state_current-with_age_adjust",
    )


def test_source_table_ignores_non_exports():
    assert source_table("manifest.txt") is None
    assert source_table("acs_population/2026-10-22/latest.txt") is None


def test_is_backed_exact_table():
    assert is_backed("race_state_current", {"race_state_current"})


def test_is_backed_alls_from_demographic_table():
    assert is_backed("alls_county_current", {"race_and_ethnicity_county_current"})
    assert is_backed("black_women_by_alls_national_current", {"black_women_by_age_national_current"})


def test_is_backed_rejects_abandoned_names():
    assert not is_backed("race_state_current", {"race_and_ethnicity_state_current"})
    assert not is_backed("alls_county_time_series", {"race_and_ethnicity_county_historical"})
