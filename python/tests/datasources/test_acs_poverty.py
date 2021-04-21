import unittest
from datasources.acs_poverty import AcsPovertyIngestor
from ingestion.constants import PovertyPopulation


def pov(above, below):
    return {PovertyPopulation.ABOVE: str(above), PovertyPopulation.BELOW: str(below)}


def key(age, state_fips=None, county_fips=None, race=None, sex=None):
    return (state_fips, county_fips, age, sex, race)


class AcsPovertyIngestorTest(unittest.TestCase, AcsPovertyIngestor):
    def testSingleAccumulation(self):
        self.data = {}
        self.data[key("0-4")] = pov(1, 2)
        self.custom_accumulations()
        self.assertTrue(key("0-5"), pov(1, 2))

    def testingDualAccumulations(self):
        self.data = {}
        self.data[key("0-4")] = pov(1, 2)
        self.data[key("5")] = pov(3, 5)
        self.custom_accumulations()
        self.assertTrue(key("0-5"), pov(4, 7))

    def testingDifferentAccumulations(self):
        self.data = {}
        self.data[key("0-4")] = pov(1, 2)
        self.data[key("6-7")] = pov(3, 5)
        self.custom_accumulations()
        self.assertTrue(key("0-5"), pov(1, 2))
        self.assertTrue(key("6-11"), pov(5, 7))

    def testingOutsideAccumulations(self):
        self.data = {}
        self.data[key("67+")] = pov(1, 2)
        self.data[key("57-64")] = pov(3, 5)
        self.custom_accumulations()
        self.assertTrue(key("67+"), pov(1, 2))
        self.assertTrue(key("57-64"), pov(3, 5))

    def testingBreakingAge(self):
        self.data = {}
        self.data[key("2-11")] = pov(1, 2)
        self.assertRaises(Exception, self.custom_accumulations)
