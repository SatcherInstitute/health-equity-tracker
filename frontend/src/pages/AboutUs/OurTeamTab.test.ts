/**
 * @jest-environment node
 */

import { GOOGLE_FELLOWS, PARTNERS } from "./OurTeamTab";
import {
  WAIT_FOR_URL_STATUSES,
  SUCCESS_CODE,
  getTestableUrls,
  getStatus,
} from "../../utils/externalUrls.test";

// Collect all OurTeam URLS
const allUrls: string[] = [];
for (const fellow of GOOGLE_FELLOWS) {
  if (fellow.link) allUrls.push(fellow.link);
}
for (const partner of PARTNERS) {
  if (partner.url) allUrls.push(partner.url);
}

const testUrls = getTestableUrls(allUrls);

describe.each(testUrls)("OurTeamTab URL %s", (testUrl) => {
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
