
import pandas
import requests
import json
import numpy
from datetime import datetime
import math


RACE_OR_HISPANIC_COL = "race_and_ethnicity"
STATE_NAME_COL = "state_name"


state_abbrs = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District of Columbia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'PR': 'Puerto Rico',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'AS': 'American Samoa',
  'GU': 'Guam',
  'MP': 'Northern Mariana Islands',
  'VI': 'U.S. Virgin Islands'
}


def reshapeCovidFrame(df, rename_race):
  df = df.melt(id_vars=["Date", "State"])
  df["variable_type"] = df.apply(lambda row: row["variable"].split("_", 1)[0], axis=1)
  df[RACE_OR_HISPANIC_COL] = df.apply(lambda row: row["variable"].split("_", 1)[1], axis=1)
  df = df.drop("variable", axis=1)
  df = df.pivot(index=["Date", "State", RACE_OR_HISPANIC_COL], columns="variable_type", values='value')
  df = df.reset_index()

  df = df.rename(columns={
    'State': STATE_NAME_COL,
    'Date': 'date'
  })

  df[STATE_NAME_COL] = df.apply(lambda row: state_abbrs[row[STATE_NAME_COL]], axis=1)
  df['date'] = df.apply(lambda row: datetime.strptime(str(row['date']), '%Y%m%d').strftime('%Y-%m-%d'), axis=1)
  df[RACE_OR_HISPANIC_COL] = df.apply(lambda row: rename_race[row[RACE_OR_HISPANIC_COL]], axis=1)
  return df

def fixNumber(num):
  return num.replace(',', '') if isinstance(num, str) else num


def getCovidData():
  df = pandas.read_csv("CRDT Data - CRDT.csv")

  countCols = list(filter(lambda c: c not in ["Date", "State"], df.columns))

  # A few of the columns have numbers as strings with commas. Fix these before
  # converting to numbers.
  for col in countCols:
    df[col] = df[col].transform(fixNumber)

  colTypes = {}
  for col in countCols:
    colTypes[col] = "float"
  df = df.astype(colTypes)

  # Drop LatinX col as it seems to almost always equal the Hispanic/Latino col
  # except in cases which appear to be bad data.
  withLatinX = df[pandas.notnull(df['Cases_LatinX'])]
  withoutLatinX = df[pandas.isnull(df['Cases_LatinX'])]
  prefixes = ['Cases_', 'Deaths_', 'Hosp_']
  latinXCols = [col + 'LatinX' for col in prefixes]
  withLatinX = withLatinX.drop(latinXCols, axis=1)
  withoutLatinX = withoutLatinX.drop(latinXCols, axis=1)

  # If LatinX is NaN, use race categories that include Hispanic
  rename_race_without_latinX = {
    'AIAN': 'American Indian and Alaska Native alone',
    'Asian': 'Asian alone',
    'Black': 'Black or African American alone',
    'Ethnicity_Hispanic': 'Hispanic or Latino',
    'Ethnicity_NonHispanic': 'Not Hispanic or Latino',
    'Ethnicity_Unknown': 'Unknown Hispanic or Latino',
    'Multiracial': 'Two or more races',
    'NHPI': 'Native Hawaiian and Other Pacific Islander alone',
    'Other': 'Some other race alone',
    'Total': 'Total',
    'White': 'White alone',
    'Unknown': 'Unknown',
  }

  # Else, LatinX should equal Ethnicity_Hispanic, and we should use race
  # categories that don't include Hispanic
  rename_race_with_latinX = {
    'AIAN': 'American Indian and Alaska Native alone (Non-Hispanic)',
    'Asian': 'Asian alone (Non-Hispanic)',
    'Black': 'Black or African American alone (Non-Hispanic)',
    'Ethnicity_Hispanic': 'Hispanic or Latino',
    'Ethnicity_NonHispanic': 'Not Hispanic or Latino',
    'Ethnicity_Unknown': 'Unknown Hispanic or Latino',
    'Multiracial': 'Two or more races (Non-Hispanic)',
    'NHPI': 'Native Hawaiian and Other Pacific Islander alone (Non-Hispanic)',
    'Other': 'Some other race alone (Non-Hispanic)',
    'Total': 'Total',
    'White': 'White alone (Non-Hispanic)',
    'Unknown': 'Unknown',
  }

  reshaped1 = reshapeCovidFrame(withLatinX, rename_race_with_latinX)
  reshaped2 = reshapeCovidFrame(withoutLatinX, rename_race_without_latinX)
  reshaped = pandas.concat([reshaped1, reshaped2])

  reshaped.to_json("covid_by_state.json", orient="records")
  reshaped.to_csv("covid_by_state.csv", index=False)


getCovidData()


