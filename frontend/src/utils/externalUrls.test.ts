import { LinkName, urlMap } from "./externalUrls";

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
});
