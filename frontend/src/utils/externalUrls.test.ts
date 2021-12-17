/**
 * @jest-environment node
 */

import { LinkName, urlMap } from "./externalUrls";
import axios from "axios";

// it can take a long time to check every external URL
export const TWO_MINUTES = 120_000;
export const SUCCESS_CODE = 200;

// skip some URLs (like linkedin) that block traffic / error out
export const UNTESTABLE_URLS = [urlMap.shliLinkedIn];

describe("ExternalUrls", () => {
  test("Links use HTTPS", () => {
    for (const urlName in urlMap) {
      const testUrl = urlMap[urlName as LinkName];
      const requiredPrefix = "https://";

      expect(testUrl).toMatch(new RegExp(`^${requiredPrefix}?`));
    }
  });

  test("No Duplicate Links", () => {
    // All Urls
    const testUrlsArray = Object.values(urlMap);
    // Remove duplicate by making into a set
    const testUrlsSet = new Set(testUrlsArray);
    // Converting to set shouldn't change the total number of URLs
    expect(testUrlsArray.length).toEqual(testUrlsSet.size);
  });

  test(
    "Links return SUCCESS status code",
    async () => {
      async function getStatus(url: string) {
        try {
          const response = await axios.get(url);
          return response.status;
        } catch (error) {
          console.error(error);
        }
      }

      for (const urlName in urlMap) {
        const testUrl = urlMap[urlName as LinkName];
        if (UNTESTABLE_URLS.includes(testUrl)) continue;

        const urlStatus = await getStatus(testUrl);
        expect(urlStatus).toEqual(SUCCESS_CODE);
      }

      //! MAYBE use Promise.All to await multiple promises ?
    },
    TWO_MINUTES
  );
});
