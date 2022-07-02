import os
import pandas
import requests

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession


def testUnauthed_permissionDenied():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL').strip('"')
    print('SERVICE_URL={}'.format(service_url))

    resp = requests.get(service_url)
    assert resp.status_code == 403


def testDataServerDataServing():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL').strip('"')
    print('SERVICE_URL={}'.format(service_url))

    # Get service account credentials to make request to private URL
    creds = service_account.IDTokenCredentials.from_service_account_file(
        os.environ.get('PATH_TO_SA_CREDS'), target_audience=service_url)

    authed_session = AuthorizedSession(creds)

    resp = authed_session.get(service_url)
    assert resp.ok
    assert b'Running data server.' in resp.content


def testDataServingThroughFrontend():
    # Get the url of the frontend.
    frontend_url = os.environ.get('FRONTEND_URL').strip('"') + '/api/dataset?name=acs_population-by_sex_state.json'
    print('FRONTEND_URL={}'.format(frontend_url))

    frame = pandas.read_json(frontend_url, orient='values')
    assert len(frame.index) == 156
    assert frame.columns.size == 6
    assert frame.columns[0] == 'state_fips'
    assert frame.columns[1] == 'state_name'
    assert frame.columns[2] == 'sex'
    assert frame.columns[3] == 'population'
    assert frame.columns[4] == 'population_pct'
