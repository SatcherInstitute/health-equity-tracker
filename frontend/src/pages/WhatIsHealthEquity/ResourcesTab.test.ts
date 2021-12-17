/**
 * @jest-environment node
 */

import { RESOURCES } from "./ResourcesTab";
import axios from "axios";
import {
  WAIT_FOR_URL_STATUSES,
  SUCCESS_CODE,
  getTestableUrls,
} from "../../utils/externalUrls.test";

// All Resources Urls
const testUrls = getTestableUrls(RESOURCES.map((resource) => resource.url));

describe("Resource Urls", () => {
  test("Links use HTTPS", () => {
    for (const testUrl of testUrls) {
      console.log(testUrl);
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
        console.log(testUrl, urlStatus);
        expect(urlStatus).toEqual(SUCCESS_CODE);
      }

      //! MAYBE use Promise.All to await multiple promises ?
    },
    WAIT_FOR_URL_STATUSES
  );
});
