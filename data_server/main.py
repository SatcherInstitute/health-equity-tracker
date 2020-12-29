import logging
import os

from flask import Flask, Response, request
import google.cloud.exceptions
from werkzeug.datastructures import Headers

from data_server.dataset_cache import DatasetCache
import data_server.gcs_utils as gcs_utils

app = Flask(__name__)
cache = DatasetCache()


@app.route('/', methods=['GET'])
def get_program_name():
    return 'Running data server.'


@app.route('/metadata', methods=['GET'])
def get_metadata():
    """Downloads and returns metadata about available download files."""
    try:
        metadata = cache.getDataset(os.environ.get('GCS_BUCKET'),
                                    os.environ.get('METADATA_FILENAME'))
    except Exception as err:
        logging.error(err)
        return 'Internal server error: {}'.format(err), 500

    def generate_response(data: bytes):
        next_row = b'['
        for row in data.splitlines():
            yield next_row
            next_row = row + b','
        yield next_row.rstrip(b',') + b']'
    headers = Headers()
    headers.add('Content-Disposition', 'attachment',
                filename=os.environ.get('METADATA_FILENAME'))
    return Response(generate_response(metadata), mimetype='application/json',
                    headers=headers)


@app.route('/dataset', methods=['GET'])
def get_dataset():
    """Downloads and returns the requested dataset if it exists."""
    dataset_name = request.args.get('name')
    if dataset_name is None:
        return 'Request missing required url param \'name\'', 400

    try:
        dataset = gcs_utils.download_blob_as_bytes(
            os.environ.get('GCS_BUCKET'), dataset_name)
    except google.cloud.exceptions.NotFound:
        return 'Dataset {} not found'.format(dataset_name), 404

    def generate_response(data: bytes):
        next_row = b'['
        for row in dataset.splitlines():
            yield next_row
            next_row = row + b','
        yield next_row.rstrip(b',') + b']'
    headers = Headers()
    headers.add('Content-Disposition', 'attachment', filename=dataset_name)
    headers.add('Access-Control-Allow-Origin', '*')
    headers.add('Vary', 'Accept-Encoding, Origin')

    if dataset_name.endswith('.csv'):
        return Response(dataset, mimetype='text/csv', headers=headers)

    return Response(generate_response(dataset), mimetype='application/json',
                    headers=headers)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
