from setuptools import setup

setup(
    name='ingestion',
    package_dir={'ingestion': ''},
    packages=['ingestion'],
    package_data={'ingestion': ['state_fips_codes.csv', 'county_fips_codes.csv']},
)
