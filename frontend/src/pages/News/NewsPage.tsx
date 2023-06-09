import { lazy, useEffect, useState } from 'react'
import styles from './NewsPage.module.scss'
import Grid from '@mui/material/Grid'
import { Link, Route, Switch } from 'react-router-dom'
import {
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import ShareYourStory from './ShareYourStory'

const AllPosts = lazy(async () => await import('./AllPosts'))
const SinglePost = lazy(async () => await import('./SinglePost'))

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

interface NewsPageProps {
  isMobile: boolean
}

export default function NewsPage(props: NewsPageProps) {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))
  const [tabLayout, setTabLayout] = useState({})

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: 'fullWidth' })
  }, [pageIsWide])

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.ResourcesAndNewsRow}
          direction="column"
          justifyContent="center"
        >
          <Route path="/">
            <Tabs
              {...tabLayout}
              centered={true}
              indicatorColor="primary"
              textColor="primary"
              value={window.location.pathname}
            >
              <Tab
                value={NEWS_PAGE_LINK}
                label="All Articles"
                component={Link}
                to={NEWS_PAGE_LINK}
              />
              <Tab
                value={SHARE_YOUR_STORY_TAB_LINK}
                label="Share Your Story"
                component={Link}
                to={SHARE_YOUR_STORY_TAB_LINK}
              />
            </Tabs>
          </Route>

          <Switch>
            <Route path={`${NEWS_PAGE_LINK}/:slug`}>
              <SinglePost isMobile={props.isMobile} />
            </Route>
            <Route path={`${NEWS_PAGE_LINK}/`}>
              <AllPosts />
            </Route>
            <Route path={`${SHARE_YOUR_STORY_TAB_LINK}/`}>
              <ShareYourStory />
            </Route>
          </Switch>
        </Grid>
      </Grid>
    </div>
  )
}
