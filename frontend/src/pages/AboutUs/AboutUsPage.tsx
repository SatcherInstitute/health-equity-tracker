import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useUrlSearchParams } from '../../utils/urlutils'
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB_LINK,
  OURTEAM_TAB_LINK,
} from '../../utils/internalRoutes'
import styles from './AboutUsPage.module.scss'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { lazy } from 'react'

const OurTeamTab = lazy(async () => await import('./OurTeamTab'))
const ContactUsTab = lazy(async () => await import('./ContactUsTab'))
const TheProjectTab = lazy(async () => await import('./TheProjectTab'))

export default function AboutUsPage() {
  return (
    <div className={styles.AboutUsPage}>
      {/*  intercept old CONTACT via query params for backwards compatible links */}
      {useUrlSearchParams().get('tab') === '2' && (
        <Redirect
          to={{
            pathname: CONTACT_TAB_LINK,
          }}
        />
      )}
      <Route path="/">
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          centered
          value={window.location.pathname}
        >
          <Tab
            value={ABOUT_US_PAGE_LINK}
            label="The Project"
            component={Link}
            to={ABOUT_US_PAGE_LINK}
          />
          <Tab
            value={OURTEAM_TAB_LINK}
            label="Our Team"
            component={Link}
            to={OURTEAM_TAB_LINK}
          />
          <Tab
            value={CONTACT_TAB_LINK}
            label="Contact Us"
            component={Link}
            to={CONTACT_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${OURTEAM_TAB_LINK}/`}>
          <OurTeamTab />
        </Route>
        <Route path={`${CONTACT_TAB_LINK}/`}>
          <ContactUsTab />
        </Route>
        <Route path={`${ABOUT_US_PAGE_LINK}/`}>
          <TheProjectTab />
        </Route>
      </Switch>
    </div>
  )
}
