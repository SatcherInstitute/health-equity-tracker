import os
import requests


def runTests():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL')

    # Get an auth token for making the request
    metadata_server_token_url = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience='
    token_request_url = metadata_server_token_url + service_url
    token_request_headers = {'Metadata-Flavor': 'Google'}

    token_response = requests.get(token_request_url,
                                  headers=token_request_headers)
    jwt = token_response.content.decode("utf-8")

    # Make the request. This is currently the only test. In the future, tests
    # should be split out into their own functions.
    request_headers = {'Authorization': f'bearer {jwt}'}
    resp = requests.get(service_url, headers=request_headers)
    assert 'Running data server.' in resp.content


if '__name__' == 'main':
    runTests()
