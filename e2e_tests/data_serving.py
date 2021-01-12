import os

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession


def runTests():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL').strip('"')
    print('SERVICE_URL={}'.format(service_url))

    # Get service account credentials to make request to private URL
    creds = service_account.IDTokenCredentials.from_service_account_file(
        os.environ.get('PATH_TO_SA_CREDS'), target_audience=service_url)

    authed_session = AuthorizedSession(creds)

    resp = authed_session.get(service_url)
    if not resp.ok:
        print('Request failed with code {}'.format(resp.status_code))
        exit(1)
    if b'Running data server.' not in resp.content:
        print('Unexpected response. Expected: "Running data server."'
              'Received: {}'.format(resp.content))
        exit(1)
    print('Test completed with no errors')


if __name__ == '__main__':
    runTests()
