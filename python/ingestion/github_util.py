from io import BytesIO

import requests
import json
import base64

import pandas

# Functions for interacting with the github api


def decode_json_from_url_into_df(url):
    """Loads a json file from the github api into a dataframe

    url: url to a base64 encoded github file"""
    r = requests.get(url)
    jsn = json.loads(r.text)
    decoded = base64.b64decode(jsn['content'])
    return pandas.read_csv(BytesIO(decoded))


def decode_excel_from_url_into_df(url):
    """Loads an excel file from the github api into a dataframe

    url: url to a base64 encoded github file"""
    r = requests.get(url)
    jsn = json.loads(r.text)
    decoded = base64.b64decode(jsn['content'])
    return pandas.read_excel(BytesIO(decoded))
