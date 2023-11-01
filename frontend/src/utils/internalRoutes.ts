// PAGE URLS
export const HET_URL = 'https://healthequitytracker.org'

export const EXPLORE_DATA_PAGE_LINK = '/exploredata'
export const DATA_CATALOG_PAGE_LINK = '/datacatalog'
export const NEWS_PAGE_LINK = '/news'
export const ABOUT_US_PAGE_LINK = '/aboutus'
export const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = '/whatishealthequity'
export const TERMS_OF_USE_PAGE_LINK = '/termsofuse'
export const METHODOLOGY_PAGE_LINK = '/methodology'
export const METHODOLOGY_TAB_LINK = METHODOLOGY_PAGE_LINK // Remove
export const DATA_TAB_LINK = DATA_CATALOG_PAGE_LINK // Remove
// TAB URLS
export const FAQ_TAB_LINK = '/faqs'
export const RESOURCES_TAB_LINK = '/resources'
export const CONTACT_TAB_LINK = '/contact'
export const OURTEAM_TAB_LINK = '/ourteam'
export const SHARE_YOUR_STORY_TAB_LINK = '/shareyourstory'

// METHODOLOGY SECTIONS
export const AGE_ADJUSTMENT_LINK = METHODOLOGY_PAGE_LINK + '/ageadjustment'

export const AGE_ADJUSTMENT_TAB_LINK = AGE_ADJUSTMENT_LINK // TODO: Remove

export const SOURCES_LINK = METHODOLOGY_PAGE_LINK + '/data-sources'
export const TOPICS_LINK = METHODOLOGY_PAGE_LINK + '/topics'
export const BEHAVIORAL_HEALTH_LINK = TOPICS_LINK + '/behavioral-health'
export const CHRONIC_DISEASE_LINK = TOPICS_LINK + '/chronic-disease'
export const COVID_19_LINK = TOPICS_LINK + '/covid'
export const GLOSSARY_LINK = METHODOLOGY_PAGE_LINK + '/glossary'
export const HIV_LINK = TOPICS_LINK + '/hiv'
export const PDOH_LINK = TOPICS_LINK + '/pdoh'
export const SDOH_LINK = TOPICS_LINK + '/sdoh'
export const DATA_METHOD_DEFINITIONS_LINK =
  METHODOLOGY_PAGE_LINK + '/definitions'
export const METRICS_LINK = DATA_METHOD_DEFINITIONS_LINK + '/metrics'
export const CONDITION_VARIABLES_LINK =
  DATA_METHOD_DEFINITIONS_LINK + '/condition-variables'
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

export const HIV_PREVALANCE_RACE_USA_SETTING =
  '?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence'
export const COVID_DEATHS_AGE_FULTON_COUNTY_SETTING =
  '?mls=1.covid-3.13121&group1=All&group2=All&dt1=covid_deaths&demo=age'
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
export const WIHE_JOIN_THE_EFFORT_SECTION_ID = 'join'
