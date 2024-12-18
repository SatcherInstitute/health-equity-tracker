import { Tab, Tabs } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import {
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'

export default function NewsPage() {
  const isSm = useIsBreakpointAndUp('sm')
  const [tabLayout, setTabLayout] = useState({})
  const location = useLocation()

  // when screen width changes, update tab spacing MUI attribute
  useEffect(() => {
    setTabLayout(isSm ? { centered: true } : { variant: 'fullWidth' })
  }, [isSm])

  const isAllArticlesTab = location.pathname === NEWS_PAGE_LINK
  const isShareYourStoryTab = location.pathname === SHARE_YOUR_STORY_TAB_LINK
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
              value={SHARE_YOUR_STORY_TAB_LINK}
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
