import { GOOGLE_FELLOWS, PARTNERS } from "./OurTeamData";
import { getTestableUrls } from "../../utils/externalUrls.test";

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
  test("should use HTTPS", () => {
    expect(testUrl.startsWith("https://")).toBe(true);
  });
});
