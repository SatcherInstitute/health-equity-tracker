type linkName = "newsletterSignup" | "cdcCovidDataInfo";
type linkUrl =
  | "https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&"
  | "https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html";

export const externalUrls: Record<linkName, linkUrl> = {
  newsletterSignup:
    "https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&",
  cdcCovidDataInfo:
    "https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/about-us-cases-deaths.html",
};
