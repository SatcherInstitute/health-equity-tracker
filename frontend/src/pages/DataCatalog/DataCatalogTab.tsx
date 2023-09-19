import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  METHODOLOGY_PAGE_LINK,
  AGE_ADJUSTMENT_TAB_LINK,
} from '../../utils/internalRoutes'
import styles from '../AboutUs/AboutUsPage.module.scss'
import { Link, Route, Switch } from 'react-router-dom'
import MethodologyTab from './MethodologyTab'
import AgeAdjustmentTab from './AgeAdjustmentTab'
import { useMediaQuery, useTheme } from '@mui/material'

function DataCatalogTab() {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <div className={styles.AboutUsPage}>
      <Route path="/">
        <Tabs
          centered={pageIsWide}
          indicatorColor="primary"
          textColor="primary"
          value={window.location.pathname}
          variant={pageIsWide ? 'standard' : 'fullWidth'}
          scrollButtons={pageIsWide ? 'auto' : undefined}
        >
          <Tab
            value={METHODOLOGY_PAGE_LINK}
            label="Methodology"
            component={Link}
            to={METHODOLOGY_PAGE_LINK}
          />
          <Tab
            value={AGE_ADJUSTMENT_TAB_LINK}
            label="Age-Adjustment"
            component={Link}
            to={AGE_ADJUSTMENT_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${METHODOLOGY_PAGE_LINK}/`}>
          <MethodologyTab />
        </Route>
        <Route path={`${AGE_ADJUSTMENT_TAB_LINK}/`}>
          <AgeAdjustmentTab />
        </Route>
      </Switch>
    </div>
  )
}

export default DataCatalogTab
