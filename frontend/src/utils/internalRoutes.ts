// PAGE URLS

export const HET_URL = 'https://healthequitytracker.org'
export const EXPLORE_DATA_PAGE_LINK = '/exploredata'
export const DATA_CATALOG_PAGE_LINK = '/datacatalog'
export const NEWS_PAGE_LINK = '/news'
export const SHARE_YOUR_STORY_PATH = 'shareyourstory'
export const SHARE_YOUR_STORY_TAB_LINK =
  NEWS_PAGE_LINK + '/' + SHARE_YOUR_STORY_PATH
export const POLICY_PAGE_LINK = '/policy'
export const FULL_FAQS_LINK = '/faqs'
export const TERMS_OF_USE_PAGE_LINK = '/termsofuse'
export const ABOUT_US_PAGE_LINK = '/aboutus'
export const OLD_CONTACT_LINK = '/contact'
export const OLD_OURTEAM_LINK = '/ourteam'
export const OLD_AGE_ADJUSTMENT_LINK = '/ageadjustment'
export const OLD_TERMS_OF_SERVICE_LINK = '/termsofservice'

// WIHE TABS
export const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = '/whatishealthequity'
export const HEALTH_EQUITY_GUIDES_TAB =
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK + '/guides'
export const HEALTH_EQUITY_RESOURCES_TAB =
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK + '/external-resources'

// CONTEXT TABS
export const GUN_VIOLENCE_POLICY = POLICY_PAGE_LINK + '/gun-violence'
export const CRISIS_OVERVIEW_TAB = GUN_VIOLENCE_POLICY + '/crisis-overview'
export const DATA_COLLECTION_TAB = GUN_VIOLENCE_POLICY + '/data-collection'
export const OUR_FINDINGS_TAB = GUN_VIOLENCE_POLICY + '/our-findings'
export const CURRENT_EFFORTS_TAB = GUN_VIOLENCE_POLICY + '/current-efforts'
export const REFORM_OPPORTUNITIES_TAB =
  GUN_VIOLENCE_POLICY + '/reform-opportunities'
export const HOW_TO_USE_THE_DATA_TAB =
  GUN_VIOLENCE_POLICY + '/how-to-use-the-data'
export const FAQS_TAB = GUN_VIOLENCE_POLICY + '/faqs'

// METHODOLOGY SECTIONS
export const METHODOLOGY_PAGE_LINK = '/methodology'
export const AGE_ADJUSTMENT_LINK = METHODOLOGY_PAGE_LINK + '/age-adjustment'
export const SOURCES_LINK = METHODOLOGY_PAGE_LINK + '/data-sources'
export const TOPIC_CATEGORIES_LINK = METHODOLOGY_PAGE_LINK + '/topic-categories'
export const LIMITATIONS_LINK = METHODOLOGY_PAGE_LINK + '/limitations'
export const BEHAVIORAL_HEALTH_LINK =
  TOPIC_CATEGORIES_LINK + '/behavioral-health'
export const CHRONIC_DISEASE_LINK = TOPIC_CATEGORIES_LINK + '/chronic-disease'
export const COMMUNITY_SAFETY_LINK = TOPIC_CATEGORIES_LINK + '/community-safety'
export const COVID_19_LINK = TOPIC_CATEGORIES_LINK + '/covid'
export const GLOSSARY_LINK = METHODOLOGY_PAGE_LINK + '/glossary'
export const HIV_LINK = TOPIC_CATEGORIES_LINK + '/hiv'
export const PDOH_LINK = TOPIC_CATEGORIES_LINK + '/pdoh'
export const SDOH_LINK = TOPIC_CATEGORIES_LINK + '/sdoh'
export const MEDICATION_UTILIZATION_LINK =
  TOPIC_CATEGORIES_LINK + '/medication-utilization'
export const DATA_METHOD_DEFINITIONS_LINK =
  METHODOLOGY_PAGE_LINK + '/definitions'
export const METRICS_LINK = DATA_METHOD_DEFINITIONS_LINK + '/metrics'
export const TOPIC_DEFINITIONS_LINK =
  DATA_METHOD_DEFINITIONS_LINK + '/topic-definitions'
export const RACES_AND_ETHNICITIES_LINK =
  DATA_METHOD_DEFINITIONS_LINK + '/races-and-ethnicities'
export const RECOMMENDED_CITATION_LINK =
  METHODOLOGY_PAGE_LINK + '/recommended-citation'

// TRACKER SETTINGS
export const AGE_ADJUST_HIV_DEATHS_US_SETTING =
  '?mls=1.hiv-3.00&group1=All&dt1=hiv_deaths#age-adjusted-ratios'
export const AGE_ADJUST_COVID_DEATHS_US_SETTING =
  '?mls=1.covid-3.00&group1=All&dt1=covid_deaths#age-adjusted-ratios'
export const AGE_ADJUST_COVID_HOSP_US_SETTING =
  '?mls=1.covid-3.00&group1=All&dt1=covid_hospitalizations#age-adjusted-ratios'
export const COVID_HOSP_NY_COUNTY_SETTING =
  '?mls=1.covid_hospitalizations-3.36061'
export const COVID_VAX_US_SETTING = '?mls=1.covid_vaccinations-3.00'
export const COPD_US_SETTING = '?mls=1.copd-3.00'
export const DIABETES_US_SETTING = '?mls=1.diabetes-3.00'
export const UNINSURANCE_US_SETTING = '?mls=1.health_insurance-3.00'
export const POVERTY_US_SETTING = '?mls=1.poverty-3.00'
export const OPIOID_US_SETTING =
  '?dt1=non_medical_drug_use&mls=1.substance-3.00'

export const GUN_DEATHS_YOUNG_ADULTS_USA_SETTING =
  '?mls=1.gun_violence_youth-3.00&group1=All&demo=race_and_ethnicity&dt1=gun_deaths_young_adults#rate-map'
export const HIV_PREVALENCE_RACE_USA_SETTING =
  '?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence'
export const PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING =
  '?mls=1.medicare_hiv-3.00&group1=All&demo=eligibility&dt1=medicare_hiv&multiple-maps=true'

export const PRISON_VS_POVERTY_RACE_GA_SETTING =
  '?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison'
export const UNINSURANCE_SEX_FL_VS_CA_SETTING =
  '?mls=1.health_insurance-3.12-5.06&mlp=comparegeos&demo=sex'

// warm welcome demo setting
export const WARM_WELCOME_DEMO_SETTING =
  '?mls=1.covid-3.00&mlp=disparity&dt1=covid_cases&onboard=true'

// SECTION IDS
export const WHAT_DATA_ARE_MISSING_ID = 'definitions-missing-data'
export const EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK =
  EXPLORE_DATA_PAGE_LINK + '#' + WHAT_DATA_ARE_MISSING_ID
