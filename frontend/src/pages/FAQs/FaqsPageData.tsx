import type { ReactNode } from 'react'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { CITATION_APA } from '../../cards/ui/SourcesHelpers'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { urlMap } from '../../utils/externalUrls'
import {
  ABOUT_US_PAGE_LINK,
  AGE_ADJUSTMENT_LINK,
  DATA_CATALOG_PAGE_LINK,
} from '../../utils/internalRoutes'

// Interface for FAQ mapping
export interface FaqMapping {
  question: string
  answer: JSX.Element
}

// Existing FAQ mappings from the first set of FAQs
export const faqMappings: FaqMapping[] = [
  {
    question: 'What is health equity? Why is it important?',
    answer: <AnswerWhatIsHealthEquity />,
  },
  {
    question: 'What are health disparities?',
    answer: <AnswerWhatAreHealthDisparities />,
  },
  {
    question: 'What data sources did you use? Why?',
    answer: <AnswerWhatDataSources />,
  },
  {
    question: 'What are the limitations in the data?',
    answer: <AnswerAreTheLimitations />,
  },
  {
    question: 'How did you acquire and standardize the data?',
    answer: <AnswerHowDidYouAcquire />,
  },
]

// Answer components for the first set of FAQs
function AnswerWhatIsHealthEquity() {
  return (
    <div className='text-small'>
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
    <div className='text-small'>
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
    <div className='text-small'>
      <p>
        In this tracker, we are using many sources, including{' '}
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
    <div className='text-small'>
      <p>
        Unfortunately, with these publicly available data sets, there are
        crucial gaps, including but not limited to:
      </p>
      <ul>
        <li>comprehensive city-, census tract-, and county-level data</li>
        <li>comprehensive race and ethnicity breakdowns</li>
        <li>comprehensive sex and age breakdowns</li>
      </ul>
      <h4>Known limitations in the data</h4>
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
    <div className='text-small'>
      <ul>
        <li>
          All data presented in the Health Equity Tracker are retrieved from
          publicly sourced application programming interfaces (APIs) and manual
          downloads. These sources are continuously updated to extract the most
          relevant data.
        </li>
        <li>
          Graphic visualizations reflect crude rates (non-age-adjusted), as
          either <HetTerm>per 100k</HetTerm>, <HetTerm>percent rate</HetTerm>,{' '}
          <HetTerm>percent share</HetTerm>, or as an{' '}
          <HetTerm>index score</HetTerm>.
        </li>
        <li>
          Where data are readily available, calculations are made to present
          age-adjusted ratios in separate tables. These calculations are used by
          the Health Equity Tracker to illustrate the disproportionate impact of
          morbidity and mortality among different races and ethnic groups
          throughout the U.S. in comparison to the white (non-Hispanic)
          population. To learn more, please view our{' '}
          <a href={AGE_ADJUSTMENT_LINK}>age-adjustment methodology</a>.
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

export const faqsPageData: FaqMapping[] = [
  {
    question: 'What are the inequities in the data?',
    answer: (
      <ul className='text-small'>
        <li>
          We’ve seen that many agencies do not reliably collect race and
          ethnicity data.
        </li>
        <li>Others that do collect it, fail to report it.</li>
        <li>
          Racial and ethnic categories are often left up to a person’s
          interpretation and may not be accurate.
        </li>
      </ul>
    ),
  },
  {
    question: 'What principles guide you?',
    answer: (
      <>
        <p>
          It is essential that this work and its resulting products are done
          consistently in an ethical manner. One of the core values of the
          Health Equity Task Force charged with developing the Health Equity
          Tracker is the importance of working in a way that garners public
          trust.
        </p>
        <ul>
          <li>Do we have open access and input in place?</li>
          <li>Is there transparency among stakeholders?</li>
          <li>
            Are we using valid and current data that is reflective of the
            realities?
          </li>
          <li>
            Is the community a part of the ownership and authorship of this
            work?
          </li>
          <li>
            Have we created a tool that has real value for all stakeholders,
            including the communities?
          </li>
          <li>Are we holding our partners accountable?</li>
        </ul>
      </>
    ),
  },
]

export const additionalFaqs: FaqMapping[] = [
  {
    question: 'What are the inequities in the data?',
    answer: (
      <ul className='text-small'>
        <li>
          We’ve seen that many agencies do not reliably collect race and
          ethnicity data
        </li>
        <li>Others that do collect it, fail to report it</li>
        <li>
          Racial and ethnic categories are often left up to a person’s
          interpretation and may not be accurate
        </li>
      </ul>
    ),
  },
  {
    question: 'What principles guide you?',
    answer: (
      <>
        <p>
          It is essential that this work and its resulting products are done
          consistently in an ethical manner. One of the core values of the
          Health Equity Task Force charged with developing the Health Equity
          Tracker is the importance of working in a way that garners public
          trust.
        </p>
        <h4>
          These guiding questions help ensure the right standards are in place:
        </h4>
        <ul>
          <li>Do we have open access and input in place?</li>
          <li>Is there transparency among stakeholders?</li>
          <li>
            Are we using valid and current data that is reflective of the
            realities?
          </li>
          <li>
            Is the community a part of the ownership and authorship of this
            work?
          </li>
          <li>
            Have we created a tool that has real value for all stakeholders
            including the communities?
          </li>
          <li>Are we holding our partners accountable?</li>
        </ul>
      </>
    ),
  },
  {
    question: 'What is equity?',
    answer: (
      <p>
        Equity refers to everyone having a fair opportunity to reach their full
        potential and no one being disadvantaged from achieving this potential
        (Dawes D.E., 2020).
      </p>
    ),
  },
  {
    question: 'What is the difference between equality and equity?',
    answer: (
      <p>
        By definition, equality means “the state of being equal, especially in
        status, rights, and opportunities.” Equity, in comparison, “the quality
        of being fair and just.” Equity occurs when everyone has access to the
        necessary tools to achieve their full potential. Equality occurs when
        everyone has the same level and quality of access, which may not yield
        fair results.
      </p>
    ),
  },
  {
    question: 'What are political determinants of health?',
    answer: (
      <>
        <p>
          The political determinants of health create the structural conditions
          and the social drivers – including poor environmental conditions,
          inadequate transportation, unsafe neighborhoods, and lack of healthy
          food options – that affect all other dynamics of health. (Dawes, D.E.
          2020) Political determinants are more than merely separate and
          distinct from social determinants of health; they actually serve as
          the instigators of the social determinants that many people are
          already well acquainted with.
        </p>
        <p>
          By understanding these political determinants, their origins, and
          their impact on the equitable distribution of opportunities and
          resources, we can be better equipped to develop and implement
          actionable solutions to close the health gap.
        </p>
      </>
    ),
  },
  {
    question: 'What are social determinants of health?',
    answer: (
      <p>
        Social determinants of health are conditions in the environments in
        which people are born, live, learn, work, play, worship, and age that
        affect a wide range of health, functioning, and quality-of-life outcomes
        and risks. (Healthy People 2020, CDC)
      </p>
    ),
  },
  {
    question: 'How can I get involved?',
    answer: (
      <>
        <p>
          To advance health equity, we need smart, talented, passionate folks
          like you on board.
        </p>
        <ul>
          <li>
            Sign up for our newsletter to stay up to date with the latest news
          </li>
          <li>Share our site and graphs with your community on social media</li>
          <li>
            <a href={`${ABOUT_US_PAGE_LINK}`}>Share your health equity story</a>
          </li>
        </ul>
      </>
    ),
  },
  {
    question:
      'How do I share or save the visualizations (graphs, charts, maps)?',
    answer: (
      <>
        <p>
          In the top-right of each card, there is an icon button with three
          horizontal dots like this: <MoreHorizIcon />. Clicking on this button
          within each card gives you some options for exporting the content of
          the card. You can:
        </p>
        <ul>
          <li>
            Copy a link that will navigate back to this exact card on this exact
            report
          </li>
          <li>Save an image of the entire card as a PNG file to your device</li>
          <li>
            Share the direct card link to multiple social media platforms as a
            post
          </li>
          <li>
            Compose a new email on your device with a direct link back to this
            card on this report
          </li>
        </ul>
      </>
    ),
  },
  {
    question:
      'What is the recommended citation (APA) for the Health Equity Tracker?',
    answer: <p>{CITATION_APA}</p>,
  },
]

export const consolidatedFaqs: FaqMapping[] = [
  ...faqMappings,
  ...faqsPageData,
  ...additionalFaqs,
]
