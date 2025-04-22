from setuptools import setup

setup(
    name="ingestion",
    package_dir={"ingestion": ""},
    packages=["ingestion"],
    include_package_data=True,
    package_data={
        "ingestion": [
            "acs_population/*",
            "ahr_config/*",
            "decia_2010_territory_population/*",
            "decia_2020_territory_population/*",
            "fips_codes/*",
        ]
    },
)
