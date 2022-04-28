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
  | "fail";

export const urlMap: Record<LinkName, string> = {
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
  fail: "https://fail.fail/",
};
