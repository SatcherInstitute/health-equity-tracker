from datasources.data_sources import DATA_SOURCES_DICT

source = DATA_SOURCES_DICT["CDC_VACCINATION_NATIONAL"]
source.write_to_bq("", "", write_local_instead_of_bq=True)
