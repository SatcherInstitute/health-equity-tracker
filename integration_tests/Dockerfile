# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.8-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY ./integration_tests ./integration_tests

# Install dependencies.
RUN python -m pip install --upgrade pip
RUN pip install -r integration_tests/requirements.txt

# Kick off the integration tests.
CMD exec python integration_tests/data_serving.py