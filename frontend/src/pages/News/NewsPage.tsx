import { useEffect, useState } from 'react'
import {
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { Tab, Tabs } from '@mui/material'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { Link, Outlet, useLocation } from 'react-router-dom'

export interface Article {
  id: number
  date: string
  modified: string
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  author: number
  featured_media: number
  sticky: boolean
  link: string
  categories: number[]
  acf: {
    contributing_author: string
    post_nominals: string
    additional_contributors: string
    canonical_url: string
    full_article_url: string
    friendly_site_name: string
    hide_on_production: boolean
  }
  _embedded: {
    author: {
      id: number
    }
    'wp:featuredmedia': Array<{
      id: number
      alt_text: string
      source_url: string
      media_details: {
        sizes: {
          medium: {
            source_url: string
          }
          large: {
            source_url: string
          }
          full: {
            source_url: string
          }
        }
      }
    }>
    'wp:term': { 0: Array<{ id: number; name: string; link: string }> }
  }
}

export default function NewsPage() {
  const isSm = useIsBreakpointAndUp('sm')
  const [tabLayout, setTabLayout] = useState({})
  const location = useLocation()

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(isSm ? { centered: true } : { variant: 'fullWidth' })
  }, [isSm])

  const isAllArticlesTab = location.pathname === NEWS_PAGE_LINK
  const isShareYourStoryTab =
    location.pathname === '/news/' + SHARE_YOUR_STORY_TAB_LINK
  const isSingleArticle = !isAllArticlesTab && !isShareYourStoryTab

  return (
    <section>
      <div className='m-auto max-w-lgXl'>
        <div className='flex-col'>
          <Tabs
            {...tabLayout}
            centered={true}
            indicatorColor='primary'
            textColor='primary'
            value={location.pathname}
          >
            <Tab
              value={NEWS_PAGE_LINK}
              label={`${isSingleArticle ? 'Back to ' : ''}All Articles`}
              component={Link}
              to={NEWS_PAGE_LINK}
            />
            {isSingleArticle && (
              <Tab value={location.pathname} label='Current Article' />
            )}
            <Tab
              value={'/news/' + SHARE_YOUR_STORY_TAB_LINK}
              label='Share Your Story'
              component={Link}
              to={SHARE_YOUR_STORY_TAB_LINK}
            />
          </Tabs>

          <Outlet />
        </div>
      </div>
    </section>
  )
}
