export type LinkName =
  | "newsletterSignup"
  | "cdcCovidDataInfo"
  | "cdcWonder"
  | "shliTwitter"
  | "shliLinkedIn"
  | "shliYoutube"
  | "shli"
  | "youtubeAllegoryOfTheOrchard"
  | "youtubeJessicasStory"
  | "ncrn"
  | "shliPdohLab"
  | "shliUber"
  | "acs5"
  | "censusVoting"
  | "cdcBrfss"
  | "hetGitHub"
  | "uihiBestPractice"
  | "shliGitHubSuppressCovidCases"
  | "shliGitHubSuppressCovidDeaths"
  | "cdcVaxTrends"
  | "cdcVaxCounty"
  | "cdcCovidRestricted"
  | "kffCovid"
  | "amr"
  | "amrMethodology"
  | "lifeline"
  | "doi1"
  | "doi2"
  | "doi3"
  | "cawp"
  | "propublica"
  | "repJohnLewisTweet"
  | "deniedVoting"
  | "aafp"
  | "rwjf"
  | "childrenInPrison"
  | "prisonPolicy";

export const urlMap: Record<LinkName, string> = {
  prisonPolicy: "https://www.prisonpolicy.org/reports/youth2019.html",
  childrenInPrison: "https://eji.org/issues/children-in-prison/",
  rwjf: "https://www.rwjf.org/en/library/research/2019/01/mass-incarceration-threatens-health-equity-in-america.html",
  aafp: "https://www.aafp.org/about/policies/all/incarceration.html",
  deniedVoting:
    "https://www.sentencingproject.org/publications/locked-out-2020-estimates-of-people-denied-voting-rights-due-to-a-felony-conviction/",
  repJohnLewisTweet:
    "https://twitter.com/repjohnlewis/status/758023941998776321?lang=en",
  newsletterSignup:
    "https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&",
  censusVoting: "https://www.census.gov/topics/public-sector/voting.html",
  cdcCovidDataInfo:
    "https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html",
  cdcWonder: "https://wonder.cdc.gov/mcd.html",
  shliLinkedIn: "https://www.linkedin.com/in/satcherhealth",
  shliTwitter: "https://twitter.com/SatcherHealth",
  shliYoutube: "https://www.youtube.com/channel/UC2sNXCD2KGLdyjqe6FGzMiA",
  shli: "https://satcherinstitute.org",
  youtubeAllegoryOfTheOrchard: "https://www.youtube.com/embed/mux1c73fJ78",
  youtubeJessicasStory: "https://www.youtube.com/embed/cmMutvgQIcU",
  ncrn: "https://ncrn.msm.edu/",
  shliPdohLab:
    "https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/",
  shliUber: "https://satcherinstitute.org/uberrideshare/",
  acs5: "https://www.census.gov/data/developers/data-sets/acs-5year.html",
  cdcBrfss: "https://www.cdc.gov/brfss/index.html",
  hetGitHub: "https://github.com/SatcherInstitute/health-equity-tracker",
  uihiBestPractice:
    "https://www.uihi.org/resources/best-practices-for-american-indian-and-alaska-native-data-collection/",
  shliGitHubSuppressCovidCases:
    "https://satcherinstitute.github.io/analysis/cdc_case_data",
  shliGitHubSuppressCovidDeaths:
    "https://satcherinstitute.github.io/analysis/cdc_death_data",
  cdcVaxTrends:
    "https://covid.cdc.gov/covid-data-tracker/#vaccination-demographics-trends",
  kffCovid: "https://www.kff.org/state-category/covid-19/",
  cdcVaxCounty:
    "https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh",
  amr: "https://www.americashealthrankings.org/explore/annual/measure/Overall_a/state/ALL",
  amrMethodology:
    "https://www.americashealthrankings.org/about/methodology/data-sources-and-measures",
  cdcCovidRestricted:
    "https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t",
  lifeline: "https://suicidepreventionlifeline.org/",
  doi1: "https://doi.org/10.1016/j.ssmph.2018.08.003",
  doi2: "https://doi.org/10.1111/j.1540-5907.2011.00512.x",
  doi3: "https://doi.org/10.1146/annurev.polisci.11.053106.123839",
  cawp: "https://cawpdata.rutgers.edu/",
  propublica:
    "https://www.propublica.org/datastore/api/propublica-congress-api",
};
