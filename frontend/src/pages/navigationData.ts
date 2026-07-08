import { SATCHER_HET_NEWS_TAB } from '../utils/blogUtils'
import { urlMap } from '../utils/externalUrls'
import {
  ABOUT_SEED_LINK,
  ABOUT_US_PAGE_LINK,
  DATA_CATALOG_PAGE_LINK,
  EXPLORE_DATA_PAGE_LINK,
  FULL_FAQS_LINK,
  GUN_VIOLENCE_POLICY,
  METHODOLOGY_PAGE_LINK,
  SHARE_YOUR_STORY_PATH,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from '../utils/internalRoutes'
import type { NavigationItem } from '../utils/urlutils'

export const NAVIGATION_STRUCTURE: Record<string, NavigationItem> = {
  about: {
    label: 'About',
    pages: {
      [WHAT_IS_HEALTH_EQUITY_PAGE_LINK]: 'What is Health Equity?',
      [ABOUT_US_PAGE_LINK]: 'About Us',
      [ABOUT_SEED_LINK]: 'SEED Program',
    },
  },
  exploreTheData: {
    label: 'Insights Hub',
    pages: {
      [EXPLORE_DATA_PAGE_LINK]: 'Data Dashboard',
      [DATA_CATALOG_PAGE_LINK]: 'Source Files',
      [METHODOLOGY_PAGE_LINK]: 'Methodology',
      [GUN_VIOLENCE_POLICY]: 'Policy Context',
    },
  },
  mediaAndUpdates: {
    label: 'Media & Updates',
    pages: {
      [SATCHER_HET_NEWS_TAB]: {
        label: 'News on Satcher Institute',
      },
      [urlMap.hetYouTubeShorts]: {
        label: 'Videos on YouTube',
      },
      [SHARE_YOUR_STORY_PATH]: {
        label: 'Share Your Story',
      },
    },
  },
  faqs: { label: 'FAQs', link: FULL_FAQS_LINK },
}
