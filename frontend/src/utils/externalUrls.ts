type linkName =
  | "newsletterSignup"
  | "cdcCovidDataInfo"
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
  | "cdcBrfss"
  | "hetGitHub"
  | "uihiBestPractice";

export const url: Record<linkName, string> = {
  newsletterSignup:
    "https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&",
  cdcCovidDataInfo:
    "https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html",
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
};
