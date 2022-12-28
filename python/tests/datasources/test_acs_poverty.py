import unittest
from datasources.acs_poverty import AcsPovertyIngester
from ingestion.constants import PovertyPopulation

from ingestion.standardized_columns import (
    STATE_FIPS_COL,
    COUNTY_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_NAME_COL,
    SEX_COL,
    AGE_COL,
    ABOVE_POVERTY_COL,
    BELOW_POVERTY_COL,
    Race,
)

expected_default_county_cols = [
    STATE_FIPS_COL,
    STATE_NAME_COL,
    COUNTY_FIPS_COL,
    COUNTY_NAME_COL,
    BELOW_POVERTY_COL,
    ABOVE_POVERTY_COL,
]

expected_default_state_cols = [
    STATE_FIPS_COL,
    STATE_NAME_COL,
    BELOW_POVERTY_COL,
    ABOVE_POVERTY_COL,
]


def pov(above, below):
    return {PovertyPopulation.ABOVE: str(above), PovertyPopulation.BELOW: str(below)}


class AcsPovertyIngesterTest(unittest.TestCase, AcsPovertyIngester):
    def key(
        self, age=None, state_fip=None, county_fip=None, race: Race = None, sex=None
    ):
        if state_fip is not None:
            self.state_fips[state_fip] = state_fip + "_state_name"
        if county_fip is not None:
            self.county_fips[(state_fip, county_fip)
                             ] = county_fip + "_county_name"

        return (
            state_fip,
            county_fip,
            age,
            sex,
            race.race_category_id if race is not None else None,
        )

    def __init__(self, methodName="runTest"):
        unittest.TestCase.__init__(self, methodName)
        self.data = {}
        self.state_fips = {}
        self.county_fips = {}

    def testSingleAccumulation(self):
        self.data[self.key("0-4")] = pov(1, 2)
        self.custom_accumulations()
        self.assertTrue(self.key("0-5"), pov(1, 2))

    def testingDualAccumulations(self):
        self.data[self.key("0-4")] = pov(1, 2)
        self.data[self.key("5")] = pov(3, 5)
        self.custom_accumulations()
        self.assertTrue(self.key("0-5"), pov(4, 7))

    def testingDifferentAccumulations(self):
        self.data[self.key("0-4")] = pov(1, 2)
        self.data[self.key("6-7")] = pov(3, 5)
        self.custom_accumulations()
        self.assertTrue(self.key("0-5"), pov(1, 2))
        self.assertTrue(self.key("6-11"), pov(5, 7))
        self.assertTrue(self.key("57-64"), pov(3, 5))

    def testingBreakingAge(self):
        self.data[self.key("2-11")] = pov(1, 2)
        self.assertRaises(Exception, self.custom_accumulations)

    def testingSplittingIntoUnique_race_age(self):
        self.data[self.key("1-2", race=Race.WHITE)] = pov(1, 2)
        self.data[self.key("1-2", race=Race.BLACK)] = pov(2, 3)
        self.assertTrue(self.key("1-2"), pov(3, 5))
        self.assertTrue(self.key(age=None, race=Race.WHITE), pov(1, 2))
        self.assertTrue(self.key(age=None, race=Race.BLACK), pov(2, 3))

    def testingSplittingIntoUnique_race_sex(self):
        self.data[self.key("1-2", sex="male")] = pov(1, 2)
        self.data[self.key("1-2", sex="female")] = pov(2, 3)
        self.assertTrue(self.key("1-2"), pov(3, 5))
        self.assertTrue(self.key(age=None, sex="male"), pov(1, 2))
        self.assertTrue(self.key(age=None, sex="female"), pov(2, 3))

    def testingSplittingIntoUniqueWithAgeAccumulation(self):
        self.data[self.key("0-4", sex="male")] = pov(1, 2)
        self.data[self.key("5", sex="male")] = pov(2, 3)
        self.data[self.key("0-4", sex="female")] = pov(4, 5)
        self.data[self.key("5", sex="female")] = pov(5, 6)
        self.assertTrue(self.key("0-5"), pov(12, 16))
        self.assertTrue(self.key(age=None, sex="male"), pov(3, 5))
        self.assertTrue(self.key(age=None, sex="female"), pov(9, 11))

    def testingSplittingAllKeys(self):
        self.data[self.key("1", sex="male", race=Race.WHITE)] = pov(1, 2)
        self.data[self.key("1", sex="male", race=Race.BLACK)] = pov(2, 3)
        self.data[self.key("1", sex="female", race=Race.WHITE)] = pov(3, 4)
        self.data[self.key("1", sex="female", race=Race.BLACK)] = pov(5, 6)
        self.data[self.key("10", sex="male", race=Race.WHITE)] = pov(7, 8)
        self.data[self.key("10", sex="male", race=Race.BLACK)] = pov(9, 10)
        self.data[self.key("10", sex="female", race=Race.WHITE)] = pov(11, 12)
        self.data[self.key("10", sex="female", race=Race.BLACK)] = pov(13, 14)

        self.assertTrue(self.key("0-5"), pov(11, 15))
        self.assertTrue(self.key("6-11"), pov(40, 44))

        self.assertTrue(self.key(age=None, sex="male"), pov(19, 23))
        self.assertTrue(self.key(age=None, sex="female"), pov(32, 36))

        self.assertTrue(self.key(age=None, race=Race.WHITE), pov(22, 26))
        self.assertTrue(self.key(age=None, race=Race.BLACK), pov(30, 34))

    def testingColNames(self):
        self.data[self.key(state_fip="01", age=None, sex=None, race=Race.WHITE)] = pov(
            1, 2
        )
        self.data[
            self.key(
                state_fip="01", county_fip="001", age=None, sex=None, race=Race.WHITE
            )
        ] = pov(1, 2)

        self.split_data_frames()

        self.assertEqual(
            list(self.poverty_by_sex_state.columns),
            expected_default_state_cols + [SEX_COL],
        )

        self.assertEqual(
            list(self.poverty_by_sex_county.columns),
            expected_default_county_cols + [SEX_COL],
        )

        self.assertEqual(
            list(self.poverty_by_age_state.columns),
            expected_default_state_cols + [AGE_COL],
        )
        self.assertEqual(
            list(self.poverty_by_age_county.columns),
            expected_default_county_cols + [AGE_COL],
        )

        self.assertEqual(
            list(self.poverty_by_race_state.columns),
            expected_default_state_cols
            + [
                "race_category_id",
                "race_and_ethnicity",
            ],
        )
        self.assertEqual(
            list(self.poverty_by_race_county.columns),
            expected_default_county_cols
            + [
                "race_category_id",
                "race_and_ethnicity",
            ],
        )

    def testingOutputDataframes(self):
        self.data[self.key(state_fip="01", age="1-2",
                           sex=None, race=None)] = pov(1, 2)
        self.data[self.key(state_fip="01", age=None,
                           sex="male", race=None)] = pov(1, 2)
        self.data[self.key(state_fip="01", age=None, sex=None, race=Race.WHITE)] = pov(
            1, 2
        )

        self.data[
            self.key(state_fip="01", county_fip="001",
                     age="1-2", sex=None, race=None)
        ] = pov(1, 2)
        self.data[
            self.key(state_fip="01", county_fip="001",
                     age=None, sex="male", race=None)
        ] = pov(1, 2)
        self.data[
            self.key(
                state_fip="01", county_fip="001", age=None, sex=None, race=Race.WHITE
            )
        ] = pov(1, 2)

        self.split_data_frames()
        self.assertEqual(
            self.poverty_by_sex_state.values.tolist(),
            [["01", "01_state_name", "2", "1", "male"]],
        )
        self.assertEqual(
            list(self.poverty_by_sex_county.values.tolist()),
            [
                [
                    "01",
                    "01_state_name",
                    "01001",
                    "001_county_name",
                    "2",
                    "1",
                    "male",
                ]
            ],
        )

        self.assertEqual(
            list(self.poverty_by_age_state.values.tolist()),
            [["01", "01_state_name", "2", "1", "1-2"]],
        )
        self.assertEqual(
            list(self.poverty_by_age_county.values.tolist()),
            [
                [
                    "01",
                    "01_state_name",
                    "01001",
                    "001_county_name",
                    "2",
                    "1",
                    "1-2",
                ]
            ],
        )

        self.assertEqual(
            list(self.poverty_by_race_state.values.tolist()),
            [["01", "01_state_name", "2", "1", "WHITE", "White"]],
        )
        self.assertEqual(
            list(self.poverty_by_race_county.values.tolist()),
            [
                [
                    "01",
                    "01_state_name",
                    "01001",
                    "001_county_name",
                    "2",
                    "1",
                    "WHITE",
                    "White",
                ]
            ],
        )
