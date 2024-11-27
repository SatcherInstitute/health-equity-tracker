import logging
import os

from google.cloud import secretmanager
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from werkzeug.datastructures import Headers

from data_server.dataset_cache import DatasetCache

app = Flask(__name__)
CORS(app)
cache = DatasetCache()


@app.route('/', methods=['GET'])
def get_program_name():
    return 'Running data server.'


@app.route('/metadata', methods=['GET'])
def get_metadata():
    """Downloads and returns metadata about available download files."""
    try:
        metadata = cache.getDataset(os.environ.get('GCS_BUCKET'), os.environ.get('METADATA_FILENAME'))
    except Exception as err:
        logging.error(err)
        return f'Internal server error: {err}', 500

    def generate_response(data: bytes):
        next_row = b'['
        for row in data.splitlines():
            yield next_row
            next_row = row + b','
        yield next_row.rstrip(b',') + b']'

    headers = Headers()
    headers.add('Content-Disposition', 'attachment', filename=os.environ.get('METADATA_FILENAME'))
    headers.add('Vary', 'Accept-Encoding')
    return Response(generate_response(metadata), mimetype='application/json', headers=headers)


@app.route('/dataset', methods=['GET'])
def get_dataset():
    """Downloads and returns the requested dataset if it exists."""
    dataset_name = request.args.get('name')
    if dataset_name is None:
        return 'Request missing required url param \'name\'', 400

    try:
        dataset = cache.getDataset(os.environ.get('GCS_BUCKET'), dataset_name)
    except Exception as err:
        logging.error(err)
        return f'Internal server error: {err}', 500

    def generate_response():
        next_row = b'['
        for row in dataset.splitlines():
            yield next_row
            next_row = row + b','
        yield next_row.rstrip(b',') + b']'

    headers = Headers()
    headers.add('Content-Disposition', 'attachment', filename=dataset_name)
    headers.add('Vary', 'Accept-Encoding')
    # Allow browsers to cache datasets for 2 hours, the same as the DatasetCache
    # TODO: If we want to make sure this stays in sync with the DatasetCache
    # TTL, move this to a constant that's shared between them.
    headers.add('Cache-Control', 'public, max-age=7200')

    if dataset_name.endswith('.csv'):
        return Response(dataset, mimetype='text/csv', headers=headers)

    return Response(generate_response(), mimetype='application/json', headers=headers)


@app.route('/get-api-key', methods=['GET'])
def get_api_key():
    """Fetches the OpenAI API key from Google Cloud Secret Manager."""
    try:
        client = secretmanager.SecretManagerServiceClient()

        secret_name = "projects/585592748590/secrets/openai-api-key/versions/latest"
        response = client.access_secret_version(name=secret_name)
        api_key = response.payload.data.decode("UTF-8")

        return jsonify({"apiKey": api_key})
    except Exception as e:
        logging.error(f"Error retrieving API key from Secret Manager: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
