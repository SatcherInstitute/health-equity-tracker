import logging
from google.cloud import pubsub_v1  # type: ignore


def notify_topic(project_id, topic, **attrs):
    """Publishes a notification on the specified topic using the provided attributes.
    Attributes should include the id of the source that was ingested and the name of
    the bucket the data is located in.

    project_id: The id of the project
    topic: The name of the topic to notify on
    attrs: The attributes to pass through to the message"""
    publisher = pubsub_v1.PublisherClient()
    # For some reason topic_path doesn't show up as a member, but is used in the
    # official documentation:
    # https://googleapis.dev/python/pubsub/latest/publisher/api/client.html?highlight=topic_path#google.cloud.pubsub_v1.publisher.client.Client.publish
    # pylint: disable=no-member
    topic_path = publisher.topic_path(project_id, topic)

    # Not sure if anything here is necessary since we can add attributes
    # directly. For now just adding a message to log.
    data = "Notifying data ingested"
    data = data.encode("utf-8")
    future = publisher.publish(topic_path, data, **attrs)

    try:
        future.result()
    except Exception as e:
        logging.warning("Error publishing message on topic %s: %s", topic, e)
