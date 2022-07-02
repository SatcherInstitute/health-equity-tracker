/**
 * @jest-environment node
 */

import { RESOURCES } from "./ResourcesData";
import { getTestableUrls } from "../../utils/externalUrls.test";

// All Resources Urls
const testUrls: string[] = getTestableUrls(
  RESOURCES.map((resource) => resource.url)
);

describe.each(testUrls)("Resources URL %s", (testUrl) => {
  test("should use HTTPS", () => {
    expect(testUrl.startsWith("https://")).toBe(true);
  });
});
