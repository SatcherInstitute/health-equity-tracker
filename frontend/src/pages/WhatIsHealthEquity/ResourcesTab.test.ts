/**
 * @jest-environment node
 */

import { RESOURCES } from "./ResourcesTab";
import {
  WAIT_FOR_URL_STATUSES,
  SUCCESS_CODE,
  getTestableUrls,
  getStatus,
} from "../../utils/externalUrls.test";

// All Resources Urls
const testUrls: string[] = getTestableUrls(
  RESOURCES.map((resource) => resource.url)
);

describe.each(testUrls)("Resources URL %s", (testUrl) => {
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
