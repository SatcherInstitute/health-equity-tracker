/**
 * @jest-environment jsdom
 */

import axios from "axios";
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

// accepts a url string and returns an awaited status code
export async function getResponse(url: string): Promise<any> {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error(url, "Error getting response");
    return 0;
  }
}

const wordpressArticlesEndpoint = `${
  NEWS_URL + WP_API + ALL_POSTS
}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`;
const wordpressDynamicCopyEndpoint = `${
  NEWS_URL + WP_API + ALL_PAGES
}/${WIHE_PAGE_ID}`;

const testEndpoints = [wordpressArticlesEndpoint, wordpressDynamicCopyEndpoint];

describe.each(testEndpoints)(
  "Headless Wordpress API Endpoint %s",
  (endpoint) => {
    test.concurrent(
      `should return 200 (SUCCESS)`,
      async () => {
        const urlResponse = await getResponse(endpoint);
        expect(urlResponse.status).toEqual(200);
      },
      5 * 60 * 1000
    );
    test("should use HTTPS", () => {
      expect(endpoint.startsWith("https://")).toBe(true);
    });
  }
);

describe("Article array retrieved from Headless Wordpress", () => {
  test(
    "Should not be empty",
    async () => {
      const urlResponse = await getResponse(wordpressArticlesEndpoint);
      expect(urlResponse.data.length).toBeGreaterThan(0);
    },
    5 * 60 * 1000
  );
});
