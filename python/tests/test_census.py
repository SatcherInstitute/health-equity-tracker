import unittest
import json
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from ingestion import census, gcs_to_bq_util


class GcsToBqTest(unittest.TestCase):

    _fake_metadata = {
        "variables": {
            "B01001_011E": {
                "label": "Estimate!!Total:!!Male:!!25 to 29 years",
                "concept": "SEX BY AGE",
                "group": "B01001",
            },
            "B01001_012E": {
                "label": "Estimate!!Total:!!Male:!!30 to 34 years",
                "concept": "SEX BY AGE",
                "group": "B01001",
            },
            "B01001_042E": {
                "label": "Estimate!!Total:!!Female:!!60 and 61 years",
                "concept": "SEX BY AGE",
                "group": "B01001",
            },
            "B01001_041E": {
                "label": "Estimate!!Total:!!Female:!!55 to 59 years",
                "concept": "SEX BY AGE",
                "group": "B01001",
            },
            "B02001_001E": {
                "label": "Estimate!!Total:",
                "concept": "RACE",
                "group": "B02001",
            },
            "B02001_005E": {
                "label": "Estimate!!Total:!!Asian alone",
                "concept": "RACE",
                "group": "B02001",
            },
            "B02001_007E": {
                "label": "Estimate!!Total:!!Some other race alone",
                "concept": "RACE",
                "group": "B02001",
            },
            "B02001_008E": {
                "label": "Estimate!!Total:!!Two or more races:",
                "concept": "RACE",
                "group": "B02001",
            },
            "B01001B_029E": {
                "label": "Estimate!!Total:!!Female:!!65 to 74 years",
                "concept": "SEX BY AGE (BLACK OR AFRICAN AMERICAN ALONE)",
                "group": "B01001B",
            }
        }
    }

    _fake_sex_by_age_data = [
        ["NAME", "B01001_011E", "B01001_012E",
            "B01001_042E", "B01001_041E", "state"],
        ["Alabama", "20", "15", "42", "70", "01"],
        ["Alaska", "5", "8", "19", "100", "02"],
        ["Arizona", "26", "200", "83", "123", "04"],
    ]

    _expected_sex_by_age_data = [
        ["state_fips", "state_name", "sex", "age", "population"],
        ["01", "Alabama", "Male", "25 to 29 years", "20"],
        ["01", "Alabama", "Male", "30 to 34 years", "15"],
        ["01", "Alabama", "Female", "55 to 59 years", "70"],
        ["01", "Alabama", "Female", "60 and 61 years", "42"],
        ["02", "Alaska", "Male", "25 to 29 years", "5"],
        ["02", "Alaska", "Male", "30 to 34 years", "8"],
        ["02", "Alaska", "Female", "55 to 59 years", "100"],
        ["02", "Alaska", "Female", "60 and 61 years", "19"],
        ["04", "Arizona", "Male", "25 to 29 years", "26"],
        ["04", "Arizona", "Male", "30 to 34 years", "200"],
        ["04", "Arizona", "Female", "55 to 59 years", "123"],
        ["04", "Arizona", "Female", "60 and 61 years", "83"],
    ]

    _fake_race_data = [
        ["NAME", "B02001_005E", "B02001_007E", "B02001_008E", "state"],
        ["Alabama", "66", "70", "92", "01"],
        ["Alaska", "45", "11", "60", "02"],
        ["Arizona", "23", "46", "26", "04"],
    ]

    _expected_race_data = [
        ["state_fips", "state_name", "race", "population"],
        ["01", "Alabama", "Asian alone", "66"],
        ["01", "Alabama", "Some other race alone", "70"],
        ["01", "Alabama", "Two or more races", "92"],
        ["02", "Alaska", "Asian alone", "45"],
        ["02", "Alaska", "Some other race alone", "11"],
        ["02", "Alaska", "Two or more races", "60"],
        ["04", "Arizona", "Asian alone", "23"],
        ["04", "Arizona", "Some other race alone", "46"],
        ["04", "Arizona", "Two or more races", "26"],
    ]

    def testAcsMetadata(self):
        """Tests parsing ACS metadata and retrieving group variables from it"""
        metadata = census.parse_acs_metadata(
            self._fake_metadata, ["B02001", "B01001"])
        self.assertEqual(
            "Estimate!!Total:!!Male:!!25 to 29 years",
            metadata["B01001_011E"]["label"])
        self.assertEqual(
            "Estimate!!Total:!!Two or more races:",
            metadata["B02001_008E"]["label"])
        # Wasn't specified in the groups to include.
        self.assertIsNone(metadata.get("B01001B_029E"))

        group_vars = census.get_vars_for_group("SEX BY AGE", metadata, 2)
        self.assertDictEqual({
            "B01001_011E": ["Male", "25 to 29 years"],
            "B01001_012E": ["Male", "30 to 34 years"],
            "B01001_041E": ["Female", "55 to 59 years"],
            "B01001_042E": ["Female", "60 and 61 years"]
        }, group_vars)

        group_vars = census.get_vars_for_group("RACE", metadata, 1)
        self.assertDictEqual({
            "B02001_005E": ["Asian alone"],
            "B02001_007E": ["Some other race alone"],
            "B02001_008E": ["Two or more races"]
        }, group_vars)

    def testStandarizeFrameOneDim(self):
        """Tests standardizing an ACS DataFrame"""
        metadata = census.parse_acs_metadata(
            self._fake_metadata, ["B02001", "B01001"])
        group_vars = census.get_vars_for_group("RACE", metadata, 1)

        df = gcs_to_bq_util.values_json_to_df(
            json.dumps(self._fake_race_data))
        df = census.standardize_frame(
            df, group_vars, ["race"], False, "population")
        expected_df = gcs_to_bq_util.values_json_to_df(
            json.dumps(self._expected_race_data)).reset_index(drop=True)
        assert_frame_equal(expected_df, df)

    def testStandarizeFrameTwoDims(self):
        """Tests standardizing an ACS DataFrame"""
        metadata = census.parse_acs_metadata(
            self._fake_metadata, ["B02001", "B01001"])
        group_vars = census.get_vars_for_group("SEX BY AGE", metadata, 2)

        df = gcs_to_bq_util.values_json_to_df(
            json.dumps(self._fake_sex_by_age_data))
        df = census.standardize_frame(
            df, group_vars, ["sex", "age"], False, "population")
        expected_df = gcs_to_bq_util.values_json_to_df(
            json.dumps(self._expected_sex_by_age_data)).reset_index(drop=True)
        assert_frame_equal(expected_df, df)


if __name__ == '__main__':
    unittest.main()
