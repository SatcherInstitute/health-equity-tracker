/**
 * @jest-environment node
 */

import { urlMap } from "./externalUrls";
import axios from "axios";

// it can take a long time to check every external URL
export const WAIT_FOR_URL_STATUSES = 5 * 60 * 1000;
export const SUCCESS_CODE = 200;

// skip some URLs (like linkedin) that block traffic / error out
export const UNTESTABLE_URLS = [urlMap.shliLinkedIn];

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
    const response = await axios.get(url);
    return response.status;
  } catch (error) {
    console.error(error);
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
