import os
from ingestion.dataset_utils import ensure_leading_zeros
import json
import pandas as pd

# Current working directory.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DIR = os.path.join(THIS_DIR, os.pardir, "data", "cities")

NAT_COUNTIES = os.path.join(
    TEST_DIR, 'national_county.txt')
NAT_PLACES = os.path.join(
    TEST_DIR, 'national_places.txt')


counties_df = pd.read_csv(
    NAT_COUNTIES,
    dtype=str,
    index_col=False,
    names=[
        "STATE",
        "STATEFP",
        "COUNTYFP",
        "COUNTYNAME",
        "TYPE"])

counties_df["county_fips"] = counties_df["STATEFP"] + counties_df["COUNTYFP"]

counties_df = counties_df[["county_fips", "COUNTYNAME", "STATE"]]


places_df = pd.read_csv(
    NAT_PLACES,
    sep='|',
    index_col=False,
    encoding='latin1',
)


places_df = places_df.assign(
    COUNTY=places_df['COUNTY'].str.split(',')).explode('COUNTY')
places_df = places_df.rename(columns={"COUNTY": "COUNTYNAME"})

places_df = places_df.loc[places_df['FUNCSTAT'] == "A"]

places_df = places_df[["PLACEFP", "COUNTYNAME", "STATE", "PLACENAME"]]
places_df = ensure_leading_zeros(places_df, "PLACEFP", 5)
places_df = places_df.drop_duplicates()

# print("*\n")
# print(counties_df.to_string())
# print("\n\n\n\n")
# print(places_df.to_string())


df = pd.merge(places_df, counties_df, how='inner', on=["COUNTYNAME", "STATE"])

df["city_fips"] = df["county_fips"] + df["PLACEFP"]

df = df[["city_fips", "PLACENAME"]].dropna()
df["PLACENAME"] = df["PLACENAME"].str.replace(" township", "")
df["PLACENAME"] = df["PLACENAME"].str.replace(" town", "")
df["PLACENAME"] = df["PLACENAME"].str.replace(" city", "")
df["PLACENAME"] = df["PLACENAME"].str.replace(" village", "")
df["PLACENAME"] = df["PLACENAME"].str.replace(" charter", "")
df["PLACENAME"] = df["PLACENAME"].str.replace(" borough", "")


data = dict(df.values)

with open('city_fips_map.json', 'w') as fp:
    json.dump(data, fp)
