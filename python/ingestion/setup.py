from setuptools import setup

setup(
    name='ingestion',
    package_dir={'ingestion': ''},
    packages=['ingestion'],
    include_package_data=True,
    package_data={'ingestion': ['merge_data/*.csv']},
)
