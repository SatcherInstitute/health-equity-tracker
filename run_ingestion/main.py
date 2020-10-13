import logging
import os
import ingestion.util as util
from flask import Flask, request
app = Flask(__name__)


@app.route('/', methods=['POST'])
def ingest_data():
    """Main function for data ingestion. Receives Pub/Sub trigger and triages to the
       appropriate data ingestion workflow.

       Returns 400 for a bad request or 204 for success."""
    envelope = request.get_json()
    if not envelope:
        logging.error('No Pub/Sub message received.')
        return ('', 400)

    if not isinstance(envelope, dict) or 'message' not in envelope:
        logging.error('Invalid Pub/Sub message format')
        return ('', 400)

    event = envelope['message']
    logging.info(f"message: {event}")

    try:
        util.ingest_data_to_gcs(event)
        return ('', 204)
    except Exception as e:
        logging.exception(e)
        return ('', 400)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
