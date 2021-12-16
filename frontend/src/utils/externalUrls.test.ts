import { LinkName, urlMap } from "./externalUrls";

describe("ExternalUrls", () => {
  test("Links all use HTTPS", () => {
    for (const urlName in urlMap) {
      const testUrl = urlMap[urlName as LinkName];
      expect(testUrl).toContain("https://");
    }
  });
});
