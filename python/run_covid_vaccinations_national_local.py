from datasources.cdc_vaccination_national import CDCVaccinationNational

source = CDCVaccinationNational()
source.run_local_pipeline()
