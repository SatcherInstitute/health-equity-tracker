import LazyLoad from 'react-lazyload'
import styles from './ExploreDataPage.module.scss'
import covidClick from '../../assets/screengrabs/covidClick.mp4'

export function getOnboardingSteps(pageIsWide: boolean) {
  const steps = [
    onboardingStep(
      '.covid_cases-dropdown-topic',
      'Start Your Search',
      <>
        <p>
          Select a topic (and region) to start your search, such as{' '}
          <i>
            ‘Investigate rates of <b>COVID-19</b> in the <b>United States</b>’
          </i>
          .
        </p>
        <LazyLoad offset={300} height={300} once>
          <video
            autoPlay={true}
            loop
            muted
            playsInline
            className={styles.HowToStepImg}
          >
            <source src={covidClick} type="video/mp4" />
          </video>
        </LazyLoad>
      </>,
      /* hideCloseButton= */ true,
      /* placement= */ undefined
    ),
    onboardingStep(
      pageIsWide ? '.mode-selector-box' : '.mode-selector-box-mobile',
      'Compare demographics, locations, and health topics',
      <ul>
        <li>
          Where available, view by race and ethnicity, sex, and age breakdowns.
        </li>
        <li>
          Compare mode offers even more ways to search, such as{' '}
          <i>
            <b>’Compare rates of Poverty between Georgia and Florida’</b>
          </i>{' '}
          or{' '}
          <i>
            <b>
              ‘Explore relationships between Poverty and COVID-19 in Los Angeles
              County, California’
            </b>
          </i>
          .
        </li>
      </ul>,
      /* hideCloseButton= */ true,
      /* placement= */ undefined
    ),
    onboardingStep(
      '#AIAN-alert',
      'Limits in the data',
      <>
        <p>
          The Tracker ingests and standardizes many data sets, but unfortunately
          there is missing, incomplete, or misclassified data in our sources.
        </p>
        <p>
          We acknowledge that deep inequities exist in the collection of data in
          the United States. We are committed to highlighting these inequities
          wherever possible.
        </p>
      </>,
      /* hideCloseButton= */ false,
      /* placement= */ undefined
    ),
    onboardingStep(
      '#madlib-box',
      'Explore the data',
      <>
        <p>
          Close this window to explore the data yourself, starting with{' '}
          <b>COVID-19</b> in the <b>United States</b>. Want to see more? Watch
          our demo video:
        </p>
        <div className={styles.StepVideoBox}>
          <iframe
            className={styles.ResourceVideoEmbed}
            src="https://www.youtube.com/embed/XBoqT9Jjc8w"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </>,
      /* hideCloseButton= */ false,
      /* placement= */ undefined
    ),
  ]
  return steps
}

function onboardingStep(
  targetId: string,
  title: string,
  content: JSX.Element,
  hideCloseButton: boolean,
  placement:
    | 'auto'
    | 'left-start'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'center'
    | undefined
) {
  return {
    hideCloseButton,
    target: targetId,
    placement,
    content: (
      <div style={{ textAlign: 'left' }}>
        <h4>{title}</h4>
        {content}
      </div>
    ),
    disableBeacon: true,
  }
}
