/**
 * @jest-environment node
 */

import { urlMap } from "./externalUrls";

// skip some URLs we know don't provide HTTPS
export const KNOWN_INSECURE_URLS = ["http://www.rootsofhealthinequity.org/"];

// accepts an array of urls found on the site, filters out known untestable or insecure sites
export function getTestableUrls(allUrls: string[]): string[] {
  return allUrls.filter((url) => !KNOWN_INSECURE_URLS.includes(url));
}

const testUrls: string[] = getTestableUrls(Object.values(urlMap));

describe.each(testUrls)("External URL %s", (testUrl) => {
  test("should use HTTPS", () => {
    expect(testUrl.startsWith("https://")).toBe(true);
  });
});
