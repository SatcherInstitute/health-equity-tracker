/**
 * @jest-environment node
 */

import { GOOGLE_FELLOWS, PARTNERS } from "./OurTeamTab";
import axios from "axios";
import {
  WAIT_FOR_URL_STATUSES,
  SUCCESS_CODE,
  getTestableUrls,
} from "../../utils/externalUrls.test";

// Collect all URLS
const allUrls: string[] = [];
for (const fellow of GOOGLE_FELLOWS) {
  if (fellow.link) allUrls.push(fellow.link);
}
for (const partner of PARTNERS) {
  if (partner.url) allUrls.push(partner.url);
}

const testUrls = getTestableUrls(allUrls);

describe("ExternalUrls", () => {
  // Links must use HTTPS (unless they've been whitelisted in UNTESTABLE_LINKS)
  test("All links use HTTPS", () => {
    for (const testUrl of testUrls) {
      console.log(testUrl);
      expect(testUrl.slice(0, 8)).toEqual("https://");
    }
  });

  test("No Duplicate Links", () => {
    // Remove any potential duplicates
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
