import logging
import os
import requests


def runTests():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL')
    logging.error('SERVICE_URL=%s', service_url)

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
    if not resp.ok:
        logging.error('Request failed with code %s', resp.status_code)
        exit(1)
    if 'Running data server.' not in resp.content:
        logging.error('Unexpected response. Expected: "Running data server."'
                      'Received: %s', resp.content)
        exit(1)
    print('Test completed with no errors')



if '__name__' == 'main':
    runTests()
