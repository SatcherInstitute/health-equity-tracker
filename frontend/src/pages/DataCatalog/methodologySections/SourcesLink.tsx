import { Grid } from '@mui/material'
import styles from '../DataCatalogPage.module.scss'
import { urlMap } from '../../../utils/externalUrls'
import { AGE_ADJUSTMENT_TAB_LINK } from '../../../utils/internalRoutes'

const SourcesLink = () => {
  return (
    <section>
      <article>
        <h1>Source Acquisition</h1>
        <h2 className={styles.MethodologyQuestion}>
          How did you acquire and standardize the data?
        </h2>
        <div className={styles.MethodologyAnswer}>
          <ul>
            <li>
              All data presented in the Health Equity Tracker are retrieved from
              publicly sourced application programming interfaces (APIs) and
              manual downloads. These sources are continuously updated to
              extract the most relevant data.
            </li>
            <li>
              Graphic visualizations reflect crude rates (non-age-adjusted), as
              either <b>per 100k</b>, <b>percent rate</b>, <b>percent share</b>,
              or as an <b>index score</b>.
            </li>
            <li>
              Where data are readily available, calculations are made to present
              age-adjusted ratios in separate tables. These calculations are
              used by the Health Equity Tracker to illustrate the
              disproportionate impact of morbidity and mortality among different
              races and ethnic groups throughout the U.S. in comparison to the
              white (non-Hispanic) population. To learn more, please view our{' '}
              <a href={`${AGE_ADJUSTMENT_TAB_LINK}`}>
                age-adjustment methodology
              </a>
              .
            </li>
            <li>
              Sources are refreshed when update notifications are received
            </li>
            <li>
              The entire Health Equity Tracker codebase is publicly available
              and open-source; contributions are welcome via{' '}
              <a href={`${urlMap.hetGitHub}`}>GitHub</a>.
            </li>
          </ul>
        </div>
      </article>
    </section>
  )
}

export default SourcesLink
