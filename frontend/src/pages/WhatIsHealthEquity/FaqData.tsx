import { urlMap } from '../../utils/externalUrls'
import {
  AGE_ADJUSTMENT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
} from '../../utils/internalRoutes'
import styles from '../ui/FaqSection.module.scss'

export interface FAQ {
  questionText: string
  answer: JSX.Element
}

export const selectFAQs: FAQ[] = [
  {
    questionText: 'What is health equity? Why is it important?',
    answer: <AnswerWhatIsHealthEquity />,
  },
  {
    questionText: 'What are health disparities',
    answer: <AnswerWhatAreHealthDisparities />,
  },
  {
    questionText: 'What data sources did you use? Why?',
    answer: <AnswerWhatDataSources />,
  },
  {
    questionText: 'What are the limitations in the data?',
    answer: <AnswerAreTheLimitations />,
  },
  {
    questionText: 'How did you acquire and standardize the data?',
    answer: <AnswerHowDidYouAcquire />,
  },
]

function AnswerWhatIsHealthEquity() {
  return (
    <div className={styles.FaqAnswer}>
      <p>
        The World Health Organization defines health equity “as the absence of
        unfair and avoidable or remediable differences in health among
        population groups defined socially, economically, demographically or
        geographically”.
      </p>

      <p>
        Health Equity exists when all people, regardless of race, sex,
        socio-economic status, geographic location, or other societal constructs
        have the same access, opportunity, and resources to achieve their
        highest potential for health (Health Equity Leadership and Exchange
        Network).
      </p>

      <p>
        Health equity is important because everyone, regardless of race,
        ethnicity, sex, or socioeconomic status, should have the opportunity to
        reach their full potential and achieve optimal health.
      </p>
    </div>
  )
}

function AnswerWhatAreHealthDisparities() {
  return (
    <div className={styles.FaqAnswer}>
      <p>
        Health disparities are preventable differences in the burden of disease,
        injury, violence, or in opportunities to achieve optimal health
        experienced by socially disadvantaged racial, ethnic, and other
        population groups, and communities (CDC).
      </p>
    </div>
  )
}

function AnswerWhatDataSources() {
  return (
    <div className={styles.FaqAnswer}>
      <p>
        In this tracker, we are using many sources, including
        <a href={urlMap.acs5}>American Community Survey 5-year estimates</a>,
        multiple datasets from the CDC including the{' '}
        <a href={urlMap.cdcBrfss}>CDC’s BRFSS data set</a> via America's Health
        Rankings, and many more. Some sources are updated bi-weekly, while other
        important data (such as information around social determinants of
        health) can lag from weeks to years. Specific information on update
        frequencies by source can be found on our{' '}
        <a href={DATA_CATALOG_PAGE_LINK}>Data Downloads</a> page.
      </p>
    </div>
  )
}

function AnswerAreTheLimitations() {
  return (
    <div className={styles.FaqAnswer}>
      <p>
        Unfortunately, with these publicly available data sets, there are
        crucial gaps, including but not limited to:
      </p>
      <ul>
        <li>comprehensive city-, census tract-, and county-level data</li>
        <li>comprehensive race and ethnicity breakdowns</li>
        <li>comprehensive sex and age breakdowns</li>
      </ul>
      <h4 className={styles.FaqSubheaderText}>Known limitations in the data</h4>
      <ul>
        <li>
          To protect the privacy of affected individuals, COVID-19 data may be
          hidden in counties with smaller numbers of COVID-19 cases,
          hospitalizations and deaths.
        </li>
        <li>
          Specific racial and ethnic categories (e.g. “Native Hawaiian,” “Alaska
          Native”) differ by source and can be inappropriately obscured by
          broader categories (e.g. “Other,” “Asian”).
        </li>
        <li>
          National statistics are aggregations of state-wide data. If state data
          is not available, these aggregations may be incomplete and potentially
          skewed.
        </li>
        <li>
          We typically refresh our data sources with newly available data within
          a few days. Seeking the latest information? A direct link is provided
          for each of our <a href='/datacatalog'>data sources</a>.
        </li>
      </ul>
    </div>
  )
}

function AnswerHowDidYouAcquire() {
  return (
    <div className={styles.FaqAnswer}>
      <ul>
        <li>
          All data presented in the Health Equity Tracker are retrieved from
          publicly sourced application programming interfaces (APIs) and manual
          downloads. These sources are continuously updated to extract the most
          relevant data.
        </li>
        <li>
          Graphic visualizations reflect crude rates (non-age-adjusted), as
          either <b>per 100k</b>, <b>percent rate</b>, <b>percent share</b>, or
          as an <b>index score</b>.
        </li>
        <li>
          Where data are readily available, calculations are made to present
          age-adjusted ratios in separate tables. These calculations are used by
          the Health Equity Tracker to illustrate the disproportionate impact of
          morbidity and mortality among different races and ethnic groups
          throughout the U.S. in comparison to the white (non-Hispanic)
          population. To learn more, please view our{' '}
          <a href={AGE_ADJUSTMENT_TAB_LINK}>age-adjustment methodology</a>.
        </li>
        <li>Sources are refreshed when update notifications are received</li>
        <li>
          The entire Health Equity Tracker codebase is publicly available and
          open-source; contributions are welcome via{' '}
          <a href={urlMap.hetGitHub}>GitHub</a>.
        </li>
      </ul>
    </div>
  )
}
