import { useEffect, useState } from "react";
import axios from "axios";
import {
  ALL_PAGES,
  BLOG_URL,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  WP_API,
} from "../utils/urlutils";

export const PAGE_IDS = {
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK: 37,
};

export interface PageDetail {
  id: number;
  pageUrl: string;
  fallbackCopy: any;
}

export const pageDetails: PageDetail[] = [
  {
    id: 37,
    pageUrl: WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
    fallbackCopy: {
      section2_headingLevel2: "Health equity resources --- Fallback Text",
      section4_headingLevel2: "How do I join the movement? --- Fallback Text",
      section4_heading2_text:
        "To advance health equity, we need smart, talented, passionate folks like you on board. --- Fallback Text",
      section4_a_headingLevel3:
        "Learn to create actionable solutions --- Fallback Text",
      section4_a_heading3_text:
        "Apply to our Political Determinants of Health Learning Laboratory Fellowship. We seek to partner and support diverse groups in building equitable and sustainable pathways for healthy communities. --- Fallback Text",
      section4_a_heading3_link: {
        title: "Learn More --- Fallback Text",
        url:
          "https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/",
        target: "_blank",
      },
      section4_b_headingLevel3: "Give back to your community --- Fallback Text",
      section4_b_heading3_text:
        "Are you a community leader interested in expanding transportation access to vaccine sites within your community? Complete our inquiry form to receive information on our vaccine rideshare efforts and opportunities. --- Fallback Text",
      section4_b_heading3_link: {
        title: "Sign Up*",
        url: "https://satcherinstitute.org/uberrideshare/",
        target: "_blank",
      },
      section4_c_headingLevel3: "Sign up for our newsletter --- Fallback Text",
      section4_c_heading3_text:
        "Want updates on the latest news in health equity? Sign up for our Satcher Health Leadership Institute newsletter. --- Fallback Text",
    },
  },
];

export default function useFetchCopy(requestedPageUrl: string) {
  const page = pageDetails.find(
    (pageItem) => pageItem.pageUrl === requestedPageUrl
  );
  const id = page?.id;
  const fallbackCopy = page?.fallbackCopy;
  const [wordpressCopy, setWordpressCopy] = useState(fallbackCopy);

  // load dynamic copy from Wordpress Page
  useEffect(() => {
    function fetchWordpressCopy() {
      try {
        axios.get(`${BLOG_URL + WP_API + ALL_PAGES}/${id}`).then((res) => {
          //   console.log(res.data.acf);
          setWordpressCopy(res.data.acf);
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchWordpressCopy();
  }, [id]);
  return wordpressCopy;
}
