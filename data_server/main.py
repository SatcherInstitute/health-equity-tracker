import os
from flask import Flask
app = Flask(__name__)


@app.route('/', methods=['GET'])
def get_program_name():
    return 'Running data server.'


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
