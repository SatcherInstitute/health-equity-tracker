/**
 * @jest-environment node
 */

import { RESOURCES } from "./ResourcesTab";
import axios from "axios";
import {
  TWO_MINUTES,
  SUCCESS_CODE,
  UNTESTABLE_URLS,
  getTestableUrls,
} from "../../utils/externalUrls.test";

// All Resources Urls
const testUrls = getTestableUrls(RESOURCES.map((resource) => resource.url));

describe("Resource Urls", () => {
  test("Links use HTTPS", () => {
    for (const resource of RESOURCES) {
      const testUrl = resource.url;
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

      for (const resource of RESOURCES) {
        const testUrl = resource.url;
        if (UNTESTABLE_URLS.includes(testUrl)) continue;

        const urlStatus = await getStatus(testUrl);
        expect(urlStatus).toEqual(SUCCESS_CODE);
      }

      //! MAYBE use Promise.All to await multiple promises ?
    },
    TWO_MINUTES
  );
});
