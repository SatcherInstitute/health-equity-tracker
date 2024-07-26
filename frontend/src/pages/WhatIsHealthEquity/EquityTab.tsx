import FaqSection from '../ui/FaqSection'
import {
  NEWS_PAGE_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
} from '../../utils/internalRoutes'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import { urlMap } from '../../utils/externalUrls'
import { Link } from 'react-router-dom'
import HetEmailSignup from '../../styles/HetComponents/HetEmailSignup'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'

function JoinTheEffortContainer(props: {
  imageUrl: string
  imageAlt: string
  imageBackground: string
  textTitle: string
  content: JSX.Element
}) {
  return (
    <div className='flex w-full items-center justify-around border-0 border-t border-solid border-altDark py-8'>
      <div
        className={`hidden h-joinEffortLogo w-full items-center justify-center rounded-md md:flex md:w-5/12 lg:w-5/12 ${props.imageBackground}`}
      >
        <LazyLoad offset={300} height={500} once>
          <img
            src={props.imageUrl}
            alt={props.imageAlt}
            className='h-auto max-h-sm max-w-equityLogo'
          />
        </LazyLoad>
      </div>
      <div className='flex w-full flex-col items-start justify-center p-2.5 text-left sm:w-full md:w-1/2'>
        <h4 className='m-0 py-2.5 font-serif text-bigHeader font-light leading-lhModalHeading'>
          {props.textTitle}
        </h4>
        {props.content}
      </div>
    </div>
  )
}

function EquityTab() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <>
      <div>
        <Helmet>
          <title>What is Health Equity? - Health Equity Tracker</title>
        </Helmet>
        <div className='m-auto flex w-full max-w-lgXl flex-wrap'>
          <div className='flex w-full items-center justify-center border-0 border-b border-solid border-borderColor'>
            <figure className='mx-auto mt-0 hidden p-2 text-left md:block md:w-1/3'>
              <LazyLoad
                offset={300}
                height={760}
                once
                className='flex justify-center'
              >
                <img
                  alt=''
                  className='m-5 h-auto w-9/12 max-w-equityLogo rounded-md'
                  src='/img/stock/woman-in-wheelchair-with-tea.png'
                />
              </LazyLoad>
            </figure>

            <div className='w-full border-0 px-15p py-8 md:w-2/3 md:border-l md:border-solid md:px-16 md:py-28'>
              <header className='mb-10'>
                <h2
                  id='main'
                  className='mb-4 mt-0 text-left font-serif text-header font-light leading-lhNormal text-altGreen sm:text-bigHeader md:text-biggerHeader'
                >
                  What is Health Equity?
                </h2>
              </header>
              <p className='mb-4 mt-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                <b>Health Equity</b> exists when all people, regardless of race,
                sex, sexual orientation, disability, socio-economic status,
                geographic location, or other societal constructs have fair and
                just access, opportunity, and resources to achieve their highest
                potential for health.
              </p>
              <p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                Unfortunately, social and political determinants of health
                negatively affect many communities, their people, and their
                ability to lead healthy lives.
              </p>
              <p className='m-0 text-left font-sansText text-title font-normal leading-lhLoose'>
                <span className='text-small text-altDark'>
                  Health Equity Leadership & Exchange Network, 2020
                </span>
              </p>
              <div className='flex w-full flex-wrap items-start justify-between text-left'>
                {/* PDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
                    Political determinants of health
                  </h3>
                  <p className='my-2 text-small leading-lhLoose'>
                    The Political determinants of health involve the systematic
                    process of structuring relationships, distributing
                    resources, and administering power, operating simultaneously
                    in ways that mutually reinforce or influence one another to
                    shape opportunities that either advance health equity or
                    exacerbate health inequities.
                  </p>
                  <span className='text-small text-altDark'>
                    Daniel Dawes, 2020
                  </span>
                </section>
                {/* SDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-altGreen'>
                    Social determinants of health
                  </h3>
                  <p className='my-2 text-small leading-lhLoose'>
                    The conditions in the environments in which people are born,
                    live, learn, work, play, worship, and age that affect a wide
                    range of health, functioning, and quality-of-life outcomes
                    and risks.
                  </p>
                  <span className='text-small text-altDark'>
                    Healthy People 2020, CDC
                  </span>
                </section>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col flex-wrap items-center justify-center'>
            <div className='flex w-full flex-wrap justify-center py-5'>
              <section>
                <h3 className='m-0 text-center font-serif text-header font-light leading-lhLoose text-altGreen sm:text-bigHeader md:text-biggerHeader'>
                  Health equity learning
                </h3>
              </section>
              <div className='flex w-full flex-wrap justify-around py-5 text-left'>
                <div className='flex w-full flex-col  items-start p-4 text-left md:w-3/4'>
                  <iframe
                    className='w-full rounded-md'
                    height='633px'
                    src='https://www.youtube.com/embed/mux1c73fJ78'
                    title='YouTube video player -
                          The Allegory of the Orchard'
                    loading='lazy'
                    allow='accelerometer; autoplay; clipboard-write;
                          encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                  <h4 className='my-4 font-sansText text-smallHeader font-medium'>
                    Learn about the Political Determinants of Health through the{' '}
                    <b>Allegory of the Orchard</b>
                  </h4>
                  <p className='m-0 font-sansText text-title font-light'>
                    Girding all health determinants is one that rarely gets
                    addressed but which has power over all aspects of health:
                    political determinants of health.
                  </p>
                </div>
                <section className='w-full md:w-1/4'>
                  <div className='flex w-full flex-col flex-wrap items-center justify-evenly'>
                    <aside className='flex flex-col items-start p-4 text-left'>
                      <iframe
                        aria-label="Jessica's Story Video"
                        className='h-44 w-full rounded-md'
                        src='https://www.youtube.com/embed/cmMutvgQIcU'
                        title="YouTube video player -
                              Jessica's Story"
                        loading='lazy'
                        allow='accelerometer; autoplay; clipboard-write;
                              encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      />
                      <h4 className='my-4 font-sansText text-title font-medium'>
                        Jessica's Story
                      </h4>
                      <p className='m-0 font-light'>
                        How political determinants of health operate and the
                        impact they have on BIPOC communities.
                      </p>
                    </aside>
                    <aside
                      className='flex flex-col items-start p-4 text-left'
                      aria-label='NCRN Information'
                    >
                      <a
                        href={urlMap.ncrn}
                        className='text-black	no-underline'
                      >
                        <LazyLoad offset={300} height={200} once>
                          <img
                            className='h-44 w-full rounded-md'
                            src='/img/graphics/NCRN.png'
                            alt='Header for Morehouse School of Medicine National COVID-19 Resiliency Network'
                          />
                        </LazyLoad>
                        <h4 className='my-4 font-sansText text-title font-medium'>
                          Morehouse School of Medicine National COVID-19
                          Resiliency Network (NCRN)
                        </h4>
                        <p className='font-light'>
                          We provide awareness and linkage to critical health
                          information and services, helping families recover
                          from difficulties that may have been caused or
                          worsened by the Coronavirus (COVID-19) pandemic.
                        </p>
                      </a>
                    </aside>
                  </div>
                </section>
              </div>
            </div>
            <div className='flex w-full flex-wrap justify-center py-5'>
              <section>
                <h3 className='m-0 pb-2 text-center font-serif text-header font-light text-altGreen sm:text-bigHeader md:text-biggerHeader'>
                  News and stories
                </h3>
                <p className='text-left font-sansText text-title font-light text-black'>
                  Read the{' '}
                  <Link to={NEWS_PAGE_LINK}>
                    latest news, posts, and stories
                  </Link>{' '}
                  related to health equity, or learn more from the articles
                  below.
                </p>
              </section>
              <LazyLoad offset={300} height={700} once>
                <div className='flex w-full flex-wrap items-start justify-between'>
                  <article className='flex w-full flex-col items-center justify-center p-8 md:w-1/2'>
                    <a
                      href='https://satcherinstitute.org/hetblog2/'
                      aria-label='Satcher Blog Post on Why Data Matters'
                    >
                      <img
                        className='h-auto w-full rounded-md'
                        src='/img/stock/kid-gets-a-mask.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='no-underline'
                        href='https://satcherinstitute.org/hetblog2/'
                        aria-label='Satcher Blog Post on Why Data Matters'
                      >
                        Why it matters that information on race, ethnicity,
                        gender and disability are measured accurately and
                        completely
                      </a>
                    </h4>
                    <p className='m-0 text-left text-text'>
                      Why ongoing data on health and well-being metrics could be
                      used in targeting federal resources and programs to
                      address inequities due to social and economic factors.{' '}
                      <a
                        className='text-left text-black'
                        href='https://satcherinstitute.org/hetblog2/'
                        aria-label='Satcher Blog Post on Why Data Matters'
                      >
                        Read article at SatcherInstitute.org
                      </a>
                    </p>
                  </article>
                  <article className='flex w-full flex-col items-center justify-center p-8 sm:w-1/2 md:w-1/2'>
                    <a
                      href='https://satcherinstitute.org/hetblog3/'
                      aria-label='Satcher Blog Post on Health Equity Data'
                    >
                      <img
                        className='h-auto w-full rounded-md'
                        src='/img/stock/girls-studying.jpg'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='no-underline'
                        href='https://satcherinstitute.org/hetblog3/'
                        aria-label='Satcher Blog Post on Why Data Matters'
                      >
                        How can we use data to inform practices to advance
                        health equity?
                      </a>
                    </h4>
                    <p className='m-0 text-left text-text'>
                      In public health, much of our work depends on having
                      accurate data, so we know what’s happening both on the
                      ground and at a population level.{' '}
                      <a
                        className='text-black'
                        href='https://satcherinstitute.org/hetblog3/'
                        aria-label='Satcher Blog Post on Health Equity Data'
                      >
                        Read article at SatcherInstitute.org
                      </a>
                    </p>
                  </article>
                  <article className='flex w-full flex-col items-center justify-center p-8 sm:w-1/2 md:w-1/3'>
                    <a
                      href='https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/'
                      aria-label='Read Scientific American Article'
                    >
                      <img
                        className='w-full rounded-md'
                        src='/img/stock/filling-in-forms.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='no-underline'
                        href='https://www.scientificamerican.com/article/data-and-technology-can-help-us-make-progress-on-covid-inequities/'
                        aria-label='Read Scientific American Article'
                      >
                        Data and technology can help us make progress on COVID
                        inequities
                      </a>
                    </h4>
                  </article>
                  <article className='flex w-full flex-col items-center justify-center p-8 sm:w-1/2 md:w-1/3'>
                    <a
                      href='https://satcherinstitute.github.io/analysis/cdc_case_data'
                      aria-label='Satcher Post on COVID Data Completeness'
                    >
                      <img
                        className='w-full rounded-md'
                        src='/img/stock/kids-ukulele.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='no-underline'
                        href='https://satcherinstitute.github.io/analysis/cdc_case_data'
                        aria-label='Satcher Post on COVID Data Completeness'
                      >
                        How complete are the CDC's COVID-19 case surveillance
                        datasets for race/ethnicity at the state and county
                        levels?
                      </a>
                    </h4>
                  </article>
                  <article className='flex w-full flex-col items-center justify-center p-8 sm:w-1/2 md:w-1/3'>
                    <a
                      href='https://www.kennedysatcher.org/blog/the-mental-fitness-of-our-children'
                      aria-label='Kennedy Satcher Article: The Mental Fitness of Our Children'
                    >
                      <img
                        className='w-full rounded-md'
                        src='/img/graphics/laptop-HET.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='no-underline'
                        href='https://www.kennedysatcher.org/blog/the-mental-fitness-of-our-children'
                        aria-label='Kennedy Satcher Article: The Mental Fitness of Our Children'
                      >
                        The mental fitness of our children
                      </a>
                    </h4>
                  </article>
                </div>
              </LazyLoad>
            </div>
          </div>
          <div className='flex w-full items-center justify-center py-12'>
            <section className='w-full md:w-5/6'>
              <FaqSection />
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
export default EquityTab
