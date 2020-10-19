from ingestion import di_url_file_to_gcs
from ingestion import constants


_FILEPATH = '{}-{}.xlsx'
_URL1 = ("https://www.countyhealthrankings.org/sites/default/files/media/"
         "document/2020 County Health Rankings {} Data - v1.xlsx")
_URL2 = ("https://www.countyhealthrankings.org/sites/default/files/media/"
         "document/2020 County Health Rankings {} Data - v1_0.xlsx")


def upload_primary_care_access(gcs_bucket, fileprefix):
    """Uploads one file containing primary care access info for each state."""

    for state in constants.STATE_NAMES:
        di_url_file_to_gcs.download_first_url_to_gcs(
            [_URL1.format(state), _URL2.format(state)],
            gcs_bucket,
            _FILEPATH.format(fileprefix, state)
        )
