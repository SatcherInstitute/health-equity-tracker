/**
 * @jest-environment node
 */

import { urlMap } from "./externalUrls";
import axios from "axios";

// it can take a long time to check every external URL
export const WAIT_FOR_URL_STATUSES = 5 * 60 * 1000;
export const SUCCESS_CODE = 200;

// URL SAFELIST skip some URLs (like linkedin) that block traffic / error out
export const UNTESTABLE_URLS = [
  urlMap.uihiBestPractice,
  urlMap.shliLinkedIn,
  urlMap.shliTwitter,
  urlMap.repJohnLewisTweet,
  "https://www.who.int/healthsystems/topics/equity/en/",
  "https://www.who.int/health-topics/social-determinants-of-health#tab=tab_1",
  "https://www.uclahealth.org/covid19-exposes-how-native-hawaiians-and-pacific-islanders-face-stark-health-care-disparities",
  "https://www.press.jhu.edu/newsroom/political-determinants-health",
  "https://doi.org/10.1016/j.ssmph.2018.08.003",
  "https://doi.org/10.1111/j.1540-5907.2011.00512.x",
  "https://doi.org/10.1146/annurev.polisci.11.053106.123839",
];

// skip some URLs we know don't provide HTTPS
export const KNOWN_INSECURE_URLS = ["http://www.rootsofhealthinequity.org/"];

// accepts an array of urls found on the site, filters out known untestable or insecure sites
export function getTestableUrls(allUrls: string[]): string[] {
  return allUrls.filter(
    (url) =>
      !KNOWN_INSECURE_URLS.includes(url) && !UNTESTABLE_URLS.includes(url)
  );
}

// accepts a url string and returns an awaited status code
export async function getStatus(url: string): Promise<number> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
      },
    });
    return response.status;
  } catch (error) {
    console.error(url, "Error getting response code");
    return 0;
  }
}

const testUrls: string[] = getTestableUrls(Object.values(urlMap));

describe.each(testUrls)("External URL %s", (testUrl) => {
  test.concurrent(
    `should return 200 (SUCCESS)`,
    async () => {
      const urlStatus = await getStatus(testUrl);
      expect(urlStatus).toEqual(SUCCESS_CODE);
    },
    WAIT_FOR_URL_STATUSES
  );
  test("should use HTTPS", () => {
    expect(testUrl.slice(0, 8)).toEqual("https://");
  });
});
