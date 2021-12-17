/**
 * @jest-environment node
 */

import { urlMap } from "./externalUrls";
import axios from "axios";

// it can take a long time to check every external URL
export const TWO_MINUTES = 120_000;
export const SUCCESS_CODE = 200;

// skip some URLs (like linkedin) that block traffic / error out
export const UNTESTABLE_URLS = [urlMap.shliLinkedIn];

// skip some URLs we know don't provide HTTPS
export const KNOWN_INSECURE_URLS = ["http://www.rootsofhealthinequity.org/"];

export function getTestableUrls(allUrls: string[]): string[] {
  return allUrls.filter(
    (url) =>
      !KNOWN_INSECURE_URLS.includes(url) && !UNTESTABLE_URLS.includes(url)
  );
}

// collect Urls
const testUrls: string[] = getTestableUrls(Object.values(urlMap));

describe("ExternalUrls", () => {
  test("Links use HTTPS", () => {
    for (const testUrl of testUrls) {
      expect(testUrl.slice(0, 8)).toEqual("https://");
    }
  });

  test("No Duplicate Links", () => {
    // Remove duplicate by making into a set
    const testUrlsSet = new Set(testUrls);
    // Converting to set shouldn't change the total number of URLs
    expect(testUrls.length).toEqual(testUrlsSet.size);
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

      for (const testUrl of testUrls) {
        const urlStatus = await getStatus(testUrl);
        expect(urlStatus).toEqual(SUCCESS_CODE);
      }

      //! MAYBE use Promise.All to await multiple promises ?
    },
    TWO_MINUTES
  );
});
