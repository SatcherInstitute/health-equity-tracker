import logging
import os
from ingestion import util
from flask import Flask, request
app = Flask(__name__)


@app.route('/', methods=['POST'])
def ingest_bucket_to_bq():
    """Main function for moving data from buckets to bigquery. Triggered by
       notify-data-ingested topic."""
    envelope = request.get_json()
    if not envelope:
        logging.error('No Pub/Sub message received.')
        return ('', 400)

    if not isinstance(envelope, dict) or 'message' not in envelope:
        logging.error('Invalid Pub/Sub message format')
        return ('', 400)

    event = envelope['message']
    logging.info(f"Received message: {event}")

    try:
        util.ingest_bucket_to_bq(event)
        return ('', 204)
    except Exception as e:
        logging.exception(e)
        return ('', 400)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
