// PAGE URLS
export const HET_URL = 'https://healthequitytracker.org';
export const EXPLORE_DATA_PAGE_LINK = '/exploredata';
export const DATA_CATALOG_PAGE_LINK = '/datacatalog';
export const NEWS_PAGE_LINK = '/news';
export const SHARE_YOUR_STORY_TAB_LINK = '/shareyourstory';
export const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = '/whatishealthequity';
export const FAQ_TAB_LINK = '/faqs';
export const TERMS_OF_USE_PAGE_LINK = '/termsofuse';
export const ABOUT_US_PAGE_LINK = '/aboutus';
export const CONTACT_SECTION_LINK = ABOUT_US_PAGE_LINK + '#contact';
export const OURTEAM_SECTION_LINK = ABOUT_US_PAGE_LINK + '#ourteam';

export const OLD_AGE_ADJUSTMENT_LINK = '/ageadjustment';

// NEW METHODOLOGY SECTIONS
export const METHODOLOGY_PAGE_LINK = '/methodology';

export const AGE_ADJUSTMENT_LINK =
	METHODOLOGY_PAGE_LINK + '/age-adjustment';
export const SOURCES_LINK = METHODOLOGY_PAGE_LINK + '/data-sources';
export const TOPIC_CATEGORIES_LINK =
	METHODOLOGY_PAGE_LINK + '/topic-categories';
export const LIMITATIONS_LINK = METHODOLOGY_PAGE_LINK + '/limitations';
export const BEHAVIORAL_HEALTH_LINK =
	TOPIC_CATEGORIES_LINK + '/behavioral-health';
export const CHRONIC_DISEASE_LINK = TOPIC_CATEGORIES_LINK + '/chronic-disease';
export const COVID_19_LINK = TOPIC_CATEGORIES_LINK + '/covid';
export const GLOSSARY_LINK = METHODOLOGY_PAGE_LINK + '/glossary';
export const HIV_LINK = TOPIC_CATEGORIES_LINK + '/hiv';
export const PDOH_LINK = TOPIC_CATEGORIES_LINK + '/pdoh';
export const SDOH_LINK = TOPIC_CATEGORIES_LINK + '/sdoh';
export const MEDICATION_UTILIZATION_LINK =
	TOPIC_CATEGORIES_LINK + '/medication-utilization';
export const DATA_METHOD_DEFINITIONS_LINK =
	METHODOLOGY_PAGE_LINK + '/definitions';
export const METRICS_LINK = DATA_METHOD_DEFINITIONS_LINK + '/metrics';
export const TOPIC_DEFINITIONS_LINK =
	DATA_METHOD_DEFINITIONS_LINK + '/topic-definitions';
export const RACES_AND_ETHNICITIES_LINK =
	DATA_METHOD_DEFINITIONS_LINK + '/races-and-ethnicities';
export const RECOMMENDED_CITATION_LINK =
	METHODOLOGY_PAGE_LINK + '/recommended-citation';

// TRACKER SETTINGS
export const AGE_ADJUST_HIV_DEATHS_US_SETTING =
	'?mls=1.hiv-3.00&group1=All&dt1=hiv_deaths#age-adjusted-ratios';
export const AGE_ADJUST_COVID_DEATHS_US_SETTING =
	'?mls=1.covid-3.00&group1=All&dt1=covid_deaths#age-adjusted-ratios';
export const AGE_ADJUST_COVID_HOSP_US_SETTING =
	'?mls=1.covid-3.00&group1=All&dt1=covid_hospitalizations#age-adjusted-ratios';
export const COVID_HOSP_NY_COUNTY_SETTING =
	'?mls=1.covid_hospitalizations-3.36061';
export const COVID_VAX_US_SETTING = '?mls=1.covid_vaccinations-3.00';
export const COPD_US_SETTING = '?mls=1.copd-3.00';
export const DIABETES_US_SETTING = '?mls=1.diabetes-3.00';
export const UNINSURANCE_US_SETTING = '?mls=1.health_insurance-3.00';
export const POVERTY_US_SETTING = '?mls=1.poverty-3.00';
export const OPIOID_US_SETTING =
	'?dt1=non_medical_drug_use&mls=1.substance-3.00';

export const HIV_PREVALANCE_RACE_USA_SETTING =
	'?mls=1.hiv-3.00&mlp=disparity&dt1=hiv_prevalence';
export const PHRMA_HIV_ELIGIBILITY_USA_MULTIMAP_SETTING =
	'?mls=1.medicare_hiv-3.00&group1=All&demo=eligibility&dt1=medicare_hiv&multiple-maps=true';
export const COVID_DEATHS_AGE_FULTON_COUNTY_SETTING =
	'?mls=1.covid-3.13121&group1=All&group2=All&dt1=covid_deaths&demo=age';
export const PRISON_VS_POVERTY_RACE_GA_SETTING =
	'?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison';
export const UNINSURANCE_SEX_FL_VS_CA_SETTING =
	'?mls=1.health_insurance-3.12-5.06&mlp=comparegeos&demo=sex';

// warm welcome demo setting
export const WARM_WELCOME_DEMO_SETTING =
	'?mls=1.covid-3.00&mlp=disparity&dt1=covid_cases&onboard=true';

// SECTION IDS
export const WHAT_DATA_ARE_MISSING_ID = 'definitions-missing-data';
export const EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK =
	EXPLORE_DATA_PAGE_LINK + '#' + WHAT_DATA_ARE_MISSING_ID;
export const WIHE_JOIN_THE_EFFORT_SECTION_ID = 'join';
