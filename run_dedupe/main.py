import os
from flask import Flask

app = Flask(__name__)


@app.route('/', methods=['POST'])
def run_dedupe():
    """Executes the procedure for removing duplicate data and marking data rows as most current."""
    # TODO: implement
    pass


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
