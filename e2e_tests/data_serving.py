import os
import requests


def runTests():
    # Get the url of the service.
    service_url = os.environ.get('SERVICE_URL').strip('"')
    print('SERVICE_URL={}'.format(service_url))

    resp = requests.get(service_url)
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
