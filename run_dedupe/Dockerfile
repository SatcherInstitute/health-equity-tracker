# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.8-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY ./run_dedupe ./run_dedupe
COPY ./python ./python

# Install production dependencies.
RUN python -m pip install --upgrade pip
RUN pip install -r run_dedupe/requirements.txt

# Install shared packages
RUN pip install ./python/ingestion
RUN pip install ./python/datasources

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 --chdir run_dedupe main:app
