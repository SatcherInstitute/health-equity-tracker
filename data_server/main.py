import logging
import os

from flask import Flask, Response
from werkzeug.datastructures import Headers

from data_server.dataset_cache import DatasetCache

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
        for row in data.splitlines():
            yield row + b'\n'
    headers = Headers()
    headers.add('Content-Disposition', 'attachment',
                filename=os.environ.get('METADATA_FILENAME'))
    return Response(generate_response(metadata), mimetype='application/json',
                    headers=headers)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
