import logging
import os
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from werkzeug.datastructures import Headers
from data_server.dataset_cache import DatasetCache
import requests

# Constants
OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
OPENAI_MODEL = 'gpt-3.5-turbo'


def create_app(testing=False):
    app = Flask(__name__)
    app.config['TESTING'] = testing

    # Configure CORS
    if app.config['TESTING']:
        CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "OPTIONS"], "allow_headers": ["Content-Type"]}})
    else:
        CORS(
            app,
            resources={
                r"/*": {
                    "origins": [
                        "https://dev.healthequitytracker.org",
                        "https://deploy-preview-3824--health-equity-tracker.netlify.app",
                        "http://localhost:3000",
                    ],
                    "methods": ["GET", "OPTIONS"],
                    "allow_headers": ["Content-Type", "Authorization"],
                }
            },
        )

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
        headers.add('Cache-Control', 'public, max-age=7200')

        if dataset_name.endswith('.csv'):
            return Response(dataset, mimetype='text/csv', headers=headers)

        return Response(generate_response(), mimetype='application/json', headers=headers)

    @app.route('/fetch-ai-insight/<string:prompt>', methods=['GET'])
    def fetch_ai_insight(prompt):
        """Fetches AI insight based on the user input."""
        try:
            api_key = get_api_key()
            response = call_openai_api(prompt, api_key)
            return jsonify({"content": response})
        except ValueError as ve:
            logging.error(f"Validation error: {ve}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            logging.error(f"Error processing prompt: {prompt}. Exception: {e}")
            return jsonify({"error": "Internal server error"}), 500

    def get_api_key():
        """Helper function to retrieve the API key."""
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("API key not found in environment variables.")
        return api_key

    def call_openai_api(prompt, api_key):
        """Call the OpenAI API and extract the response content."""
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": "You are an expert in public health and health disparities."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 150,
            "temperature": 0.7,
        }

        try:
            response = requests.post(url=OPENAI_URL, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except requests.exceptions.Timeout:
            raise ValueError("Request to OpenAI API timed out.")
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Request to OpenAI API failed: {e}")

    return app


# For production use
app = create_app()
cache = DatasetCache()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
