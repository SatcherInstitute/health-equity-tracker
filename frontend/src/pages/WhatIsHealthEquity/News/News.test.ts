import {
  ALL_PAGES,
  ALL_POSTS,
  MAX_FETCH,
  NEWS_URL,
  WIHE_PAGE_ID,
  WP_API,
  WP_EMBED_PARAM,
  WP_PER_PAGE_PARAM,
} from "../../../utils/urlutils";
import {
  WAIT_FOR_URL_STATUSES,
  SUCCESS_CODE,
  getStatus,
} from "../../../utils/externalUrls.test";

const wordpressArticlesEndpoint = `${
  NEWS_URL + WP_API + ALL_POSTS
}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`;
const wordpressDynamicCopyEndpoint = `${
  NEWS_URL + WP_API + ALL_PAGES
}/${WIHE_PAGE_ID}`;

const testUrls = [wordpressArticlesEndpoint, wordpressDynamicCopyEndpoint];

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
