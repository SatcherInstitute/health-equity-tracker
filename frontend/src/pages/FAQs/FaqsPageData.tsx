import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { CITATION_APA } from '../../cards/ui/SourcesHelpers'
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'
import HetDivider from '../../styles/HetComponents/HetDivider'
import HetLaunchLink from '../../styles/HetComponents/HetLaunchLink'
import HetTerm from '../../styles/HetComponents/HetTerm'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { urlMap } from '../../utils/externalUrls'
import {
  ABOUT_US_PAGE_LINK,
  AGE_ADJUSTMENT_LINK,
  DATA_CATALOG_PAGE_LINK,
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import ResourceItem from '../Policy/policyComponents/ResourceItem'

export interface Faq {
  question: string
  answer: React.ReactNode | string
}

interface IndentedItemProps {
  label: React.ReactNode | string
  pClassName?: string
}
export const IndentedItem = ({ label, pClassName }: IndentedItemProps) => (
  <p className={`my-2 ml-4 text-small leading-lhNormal ${pClassName}`}>
    {label}
  </p>
)

export const faqMappings: Faq[] = [
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

function AnswerWhatIsHealthEquity() {
  return (
    <div>
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
    <div>
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
    <>
      <p>
        In this tracker, we use a variety of reputable data sources, including{' '}
        <HetTerm>American Community Survey 5-year estimates </HetTerm>
        <HetLaunchLink
          label={'American Community Survey 5-year estimates'}
          href={urlMap.acs5}
        />
        , multiple datasets from the CDC, such as the{' '}
        <HetTerm>
          CDC’s Behavioral Risk Factor Surveillance System (BRFSS) data set{' '}
        </HetTerm>
        <HetLaunchLink label={`CDC’s BRFSS data set`} href={urlMap.cdcBrfss} />,
        sourced via America's Health Rankings, among others.
      </p>

      <p>
        These sources are chosen for their rigorous methodologies, national
        reach, and focus on public health and social determinants of health,
        which provide a reliable foundation for understanding health equity.
      </p>
      <p>
        Sources are refreshed when update notifications are received. While some
        sources are updated bi-weekly, other essential data—such as information
        on social determinants of health—may lag from weeks to years. We strive
        to refresh our data sources within a few days of new releases, ensuring
        that the tracker provides the most current insights possible.
      </p>

      <p>
        Seeking the latest information? Detailed information on the update
        frequency for each source is available on our{' '}
        <a href={DATA_CATALOG_PAGE_LINK}>Data Downloads</a> page. A direct link
        is provided for each of our data sources.
      </p>
      <div className='flex justify-center'>
        <HetButtonSecondary href={DATA_CATALOG_PAGE_LINK}>
          Browse our Data Sources
        </HetButtonSecondary>
      </div>
    </>
  )
}

function AnswerAreTheLimitations() {
  return (
    <>
      <p>
        Unfortunately, with these publicly available data sets, there are
        significant gaps, including but not limited to data:
      </p>

      <IndentedItem
        label={'covering all cities, census tracts, and counties,'}
      />
      <IndentedItem
        label={'providing detailed race and ethnicity breakdowns, and'}
      />
      <IndentedItem label={'including thorough sex and age breakdowns.'} />
      <p className='font-semibold text-altBlack text-text'>
        Known limitations in the data
      </p>
      <p>
        To protect individual privacy, COVID-19 data may be suppressed in
        counties with low case counts, hospitalizations, and deaths.
      </p>
      <p>
        Additionally, HIV is criminalized in certain regions, meaning that
        individuals living with HIV may face legal repercussions, including
        potential prosecution, for non-disclosure, exposure, or transmission of
        the virus, even in cases where there is no intent to harm. This
        criminalization discourages people from seeking testing or care,
        resulting in incomplete or skewed data that may underrepresent the true
        impact of HIV, particularly within marginalized communities.
      </p>
      <div className='flex justify-center'>
        <HetTextArrowLink
          link={`${NEWS_PAGE_LINK}/hiv-criminalization-in-georgia-a-call-for-reform`}
          linkText={'Read our article on HIV Criminalization in Georgia'}
        />
      </div>
      <p>
        Specific racial and ethnic categories (e.g., “Native Hawaiian,” “Alaska
        Native”) differ by source and can sometimes be obscured within broader
        categories (e.g., “Other,” “Asian”), reducing granularity.
      </p>
      <p>
        National statistics are often aggregations of state-level data, and when
        state data is missing, these figures may be incomplete, affecting the
        accuracy of national insights.
      </p>
    </>
  )
}

function AnswerHowDidYouAcquire() {
  return (
    <>
      <p>
        The data presented in the Health Equity Tracker are retrieved from
        publicly sourced application programming interfaces (APIs) and manual
        downloads, ensuring that our sources remain up-to-date with the most
        relevant information available.
      </p>
      <p>
        Graphic visualizations reflect crude rates (non-age-adjusted), as either{' '}
        <HetTerm>per 100,000</HetTerm>, <HetTerm>percent rate</HetTerm>,{' '}
        <HetTerm>percent share</HetTerm>, or as an{' '}
        <HetTerm>index score</HetTerm>.
      </p>
      <p>
        When possible, we also calculate age-adjusted ratios to illustrate the
        disproportionate impact of morbidity and mortality among different
        racial and ethnic groups in comparison to the white (non-Hispanic)
        population, which can be further explored in our age-adjusted
        methodology.
      </p>
      <div className='flex justify-center'>
        <HetButtonSecondary href={AGE_ADJUSTMENT_LINK}>
          Browse our Methodology
        </HetButtonSecondary>
      </div>
      <HetDivider className='my-8' />
      <p>
        The Health Equity Tracker is fully open-source, with its entire codebase
        publicly available on <a href={urlMap.hetGitHub}>GitHub</a>.
      </p>
      <p>
        Open-sourcing our work is a key component of maintaining transparency
        and standardization, allowing researchers and developers to inspect,
        contribute, and improve the code and methodologies we use. This openness
        not only supports the integrity of the tracker but also encourages
        collaboration from the public and research communities, making it a more
        robust and trustworthy tool for tracking health equity. Contributions
        are welcome through our GitHub repository.
      </p>
      <div className='flex justify-center'>
        <HetTextArrowLink
          link={urlMap.hetGitHub}
          linkText={'Contribute to our GitHub repository'}
        />
      </div>
    </>
  )
}

export const additionalFaqs: Faq[] = [
  {
    question: 'What are the inequities in the data?',
    answer: (
      <>
        <p>
          Many agencies fail to reliably collect race and ethnicity data, and
          even when collected, it is often inconsistently reported.{' '}
        </p>
        <p>
          Additionally, the categorization of racial and ethnic identities is
          frequently left open to individual interpretation, which can lead to
          inaccuracies and misrepresentation in the data.
        </p>
      </>
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

        <p className='font-semibold text-altBlack text-text'>
          These guiding questions help ensure the right standards are in place:
        </p>

        <IndentedItem label={'Do we have open access and input in place?'} />
        <IndentedItem label={'Is there transparency among stakeholders?'} />
        <IndentedItem
          label={`Are we using valid and current data that is reflective of the
            realities?`}
        />
        <IndentedItem
          label={`Is the community a part of the ownership and authorship of this
            work?`}
        />
        <IndentedItem
          label={` Have we created a tool that has real value for all stakeholders
            including the communities?`}
        />
        <IndentedItem label={`Are we holding our partners accountable?`} />

        <HetDivider className='my-8' />
        <p className='font-semibold text-altBlack text-text'>
          We are committed to the following ethics:
        </p>
        <div className='ml-2'>
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Transparency & Accountability
          </h3>
          <IndentedItem
            label={`
          We partner closely with diverse communities and are clear about who
          interprets the data and how that shapes the overall health narrative.
        `}
          />
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Community First
          </h3>
          <IndentedItem
            label={`People and communities drive our work. By making sure we collect data
          from underserved populations, we can help highlight what policy
          changes are needed to boost these communities.
        `}
          />
          <h3 className='my-0 font-medium text-altGreen text-title'>
            Open Access
          </h3>
          <IndentedItem
            label={`We ensure community leaders partner with us and play an active role in
          determining what data to use in making policy recommendations.
        `}
          />
          <div className='mt-8 flex justify-center'>
            <HetButtonSecondary href={ABOUT_US_PAGE_LINK}>
              Learn more about the Health Equity Tracker
            </HetButtonSecondary>
          </div>
        </div>
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
      <>
        <p>
          By definition, equality means “the state of being equal, especially in
          status, rights, and opportunities.”
        </p>
        <p>
          Equity, in comparison, “the quality of being fair and just.” Equity
          occurs when everyone has access to the necessary tools to achieve
          their full potential. Equality occurs when everyone has the same level
          and quality of access, which may not yield fair results.
        </p>
      </>
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
          Your passion and talents can help drive real change in health equity!
          By joining our community, you can play a crucial role in amplifying
          the visibility of health disparities and promoting solutions. Here’s
          how you can make a difference:
        </p>
        <ResourceItem
          title={'Spread the Word'}
          description={`Share our site and visualizations with your network on social media. Together, we can raise awareness and spark important conversations in communities everywhere.`}
        />

        <ResourceItem
          title={'Tell Your Story'}
          description={`Share your personal health equity story. Real-life experiences are powerful and help shape the broader narrative around health equity challenges and progress.`}
        />
        <ResourceItem
          title={'Volunteer for UX Testing'}
          description={
            <>
              We’re always seeking dedicated individuals to help improve the
              Health Equity Tracker experience. Interested in participating in
              ongoing user experience testing? Email us at{' '}
              <a href='mailto:info@healthequitytracker.org'>
                info@healthequitytracker.org
              </a>{' '}
              to volunteer and become part of our mission to make health equity
              data accessible, insightful, and impactful for all.
            </>
          }
        />

        <p>Join us, and let’s advance health equity together!</p>

        <div className='flex justify-center'>
          <HetButtonSecondary href={SHARE_YOUR_STORY_TAB_LINK}>
            Share your health equity story
          </HetButtonSecondary>
        </div>
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
          horizontal dots like this: <MoreHorizIcon />.
        </p>
        <div className='mb-8 flex justify-center'>
          <img
            src={'/img/screenshots/card-menu-options.png'}
            aria-label='options on card menu'
            className='rounded-md shadow-raised-tighter '
          />
        </div>
        <p>
          Clicking on this button within each card gives you some options for
          exporting the content of the card. You can:
        </p>

        <div className='flex flex-col gap-0'>
          <IndentedItem
            label={`Copy a link that will navigate back to this exact card on this exact
            report`}
          />
          <IndentedItem
            label={`Save an image of the entire card as a PNG file to your device`}
          />
          <IndentedItem
            label={`Share the direct card link to multiple social media platforms as a
            post`}
          />
          <IndentedItem
            label={`Compose a new email on your device with a direct link back to this
            card on this report`}
          />
        </div>
      </>
    ),
  },
  {
    question:
      'What is the recommended citation (APA) for the Health Equity Tracker?',
    answer: <p>{CITATION_APA}</p>,
  },
]

export const consolidatedFaqs: Faq[] = [...faqMappings, ...additionalFaqs]

export const dataFaqGroup: Faq[] = [
  faqMappings[2],
  faqMappings[3],
  faqMappings[4],
  additionalFaqs[0],
  additionalFaqs[8],
]
export const definitionsFaqGroup: Faq[] = [
  faqMappings[0],
  faqMappings[1],
  additionalFaqs[3],
  additionalFaqs[4],
  additionalFaqs[5],
]

export const methodsFaqGroup: Faq[] = [
  additionalFaqs[1],
  additionalFaqs[6],
  additionalFaqs[7],
]
