import { LinkName, url as externalUrlMap } from "./externalUrls";

describe("ExternalUrls", () => {
  test("Links all use HTTPS", () => {
    for (const urlName in externalUrlMap) {
      const testUrl = externalUrlMap[urlName as LinkName];
      expect(testUrl).toContain("https://");
    }
  });
});
