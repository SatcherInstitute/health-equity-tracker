from io import BytesIO

import requests
import json
import base64

import pandas

# Functions for interacting with the github api


def load_json_as_df_from_web_based_on_key(url, key):
    """Loads json data from the web underneath a given key into a dataframe

    url: url to download the json from
    key: key in the json in which all data underneath will be loaded into the dataframe"""
    r = requests.get(url)
    jsn = json.loads(r.text)
    return pandas.DataFrame(jsn[key])


def decode_json_from_url_into_df(url):
    """Loads a file from the github api into a dataframe

    url: url to a base64 encoded github file"""
    r = requests.get(url)
    jsn = json.loads(r.text)
    decoded = base64.b64decode(jsn['content'])
    return pandas.read_csv(BytesIO(decoded))
