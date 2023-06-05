import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { DATA_SOURCE_PRE_FILTERS, useSearchParams } from '../../utils/urlutils'
import {
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
  AGE_ADJUSTMENT_TAB_LINK,
} from '../../utils/internalRoutes'
import styles from '../AboutUs/AboutUsPage.module.scss'
import { Link, Route, Switch } from 'react-router-dom'

// can't lazy load (yet) due to scss loading issues
import DatasetExplorer from './dataset_explorer/DatasetExplorer'
import MethodologyTab from './MethodologyTab'
import AgeAdjustmentTab from './AgeAdjustmentTab'
import { useMediaQuery, useTheme } from '@mui/material'

function DataCatalogTab() {
  const theme = useTheme()
  const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))

  const params = useSearchParams()
  const datasets = params[DATA_SOURCE_PRE_FILTERS]
    ? params[DATA_SOURCE_PRE_FILTERS].split(',')
    : []
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
            value={DATA_CATALOG_PAGE_LINK}
            label="Data Downloads"
            component={Link}
            to={DATA_CATALOG_PAGE_LINK}
          />
          <Tab
            value={METHODOLOGY_TAB_LINK}
            label="Methodology"
            component={Link}
            to={METHODOLOGY_TAB_LINK}
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
        <Route path={`${METHODOLOGY_TAB_LINK}/`}>
          <MethodologyTab />
        </Route>
        <Route path={`${DATA_CATALOG_PAGE_LINK}/`}>
          <DatasetExplorer preFilterDataSourceIds={datasets} />
        </Route>
        <Route path={`${AGE_ADJUSTMENT_TAB_LINK}/`}>
          <AgeAdjustmentTab />
        </Route>
      </Switch>
    </div>
  )
}

export default DataCatalogTab
