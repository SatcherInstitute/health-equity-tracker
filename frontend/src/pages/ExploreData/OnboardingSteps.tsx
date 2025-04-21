import LazyLoad from 'react-lazyload'
import covidClick from '../../assets/screengrabs/covidClick.mp4'

import type { JSX } from "react";

export function getOnboardingSteps(pageIsWide: boolean) {
  const steps = [
    onboardingStep(
      '#madlib-box',
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
            className='h-full max-h-[206px] w-full p-3'
          >
            <source src={covidClick} type='video/mp4' />
          </video>
        </LazyLoad>
      </>,
      /* hideCloseButton= */ true,
      /* placement= */ undefined,
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
      /* placement= */ undefined,
    ),
    onboardingStep(
      '#unknown-bubbles-alert',
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
      /* placement= */ undefined,
    ),
    onboardingStep(
      '#root',
      'Explore the data',
      <>
        <p>
          Hit "Last" to close this window and explore the data yourself,
          starting with <b>COVID-19 Cases</b> in the <b>United States</b>. Want
          to learn more? Watch our demo video:
        </p>
        <div className='flex justify-center'>
          <iframe
            src='https://www.youtube.com/embed/XBoqT9Jjc8w'
            title='YouTube video player'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            loading='lazy'
            className='rounded-lg'
          ></iframe>
        </div>
      </>,
      /* hideCloseButton= */ false,
      /* placement= */ undefined,
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
    | undefined,
) {
  return {
    hideCloseButton,
    target: targetId,
    placement,
    content: (
      <div style={{ textAlign: 'left' }}>
        <h4 aria-label={title}>{title}</h4>
        {content}
      </div>
    ),
    disableBeacon: true,
  }
}
