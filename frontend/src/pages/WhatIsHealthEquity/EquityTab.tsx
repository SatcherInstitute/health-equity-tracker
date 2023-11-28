import Button from '@mui/material/Button'
import FaqSection from '../ui/FaqSection'
import {
  DYNAMIC_COPY_KEY,
  fetchCopyData,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import {
  NEWS_PAGE_LINK,
  WIHE_JOIN_THE_EFFORT_SECTION_ID,
} from '../../utils/internalRoutes'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import { useQuery } from 'react-query'
import { urlMap } from '../../utils/externalUrls'
import HetEmailSignup from '../../styles/HetComponents/HetEmailSignup'
import { Link } from 'react-router-dom'

interface WIHEWordpressCopy {
  section2_headingLevel2: string
  section4_headingLevel2: string
  section4_heading2_text: string
  section4_a_headingLevel3: string
  section4_a_heading3_text: string
  section4_a_heading3_link: {
    title: string
    url: string
    target: string
  }
  section4_b_headingLevel3: string
  section4_b_heading3_text: string
  section4_b_heading3_link: {
    title: string
    url: string
    target: string
  }
  section4_c_headingLevel3: string
  section4_c_heading3_text: string
}

/*
Some of the copy for this tab page is loaded from https://hetblog.dreamhosters.com/wp-json/wp/v2/pages/37
The object below provides fallback if that fetch fails
*/

export const WIHEFallbackCopy: WIHEWordpressCopy = {
  section2_headingLevel2: 'Health equity learning',
  section4_headingLevel2: 'How do I join the movement?',
  section4_heading2_text:
    'To advance health equity, we need smart, talented, passionate folks like you on board.',
  section4_a_headingLevel3: 'Learn to create actionable solutions',
  section4_a_heading3_text:
    'Apply to our Political Determinants of Health Learning Laboratory Fellowship. We seek to partner and support diverse groups in building equitable and sustainable pathways for healthy communities.',
  section4_a_heading3_link: {
    title: 'Learn More',
    url: 'https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/',
    target: '_blank',
  },
  section4_b_headingLevel3: 'Give back to your community',
  section4_b_heading3_text:
    'Are you a community leader interested in expanding transportation access to vaccine sites within your community? Complete our inquiry form to receive information on our vaccine rideshare efforts and opportunities.',
  section4_b_heading3_link: {
    title: 'Sign Up*',
    url: 'https://satcherinstitute.org/uberrideshare/',
    target: '_blank',
  },
  section4_c_headingLevel3: 'Sign up for our newsletter',
  section4_c_heading3_text:
    'Want updates on the latest news in health equity? Sign up for our Satcher Health Leadership Institute newsletter.',
}

function JoinTheEffortContainer(props: {
  imageUrl: string
  imageAlt: string
  imageBackground: string
  textTitle: string
  content: JSX.Element
}) {
  return (
    <div className='flex w-full items-center justify-around border-0 border-t border-solid border-alt-dark py-8'>
      <div
        className={`hidden h-joinEffortLogo w-full items-center justify-center rounded-xl md:flex md:w-5/12 lg:w-5/12 ${props.imageBackground}`}
      >
        <LazyLoad offset={300} height={500} once>
          <img
            src={props.imageUrl}
            alt={props.imageAlt}
            className='h-auto max-h-sm max-w-equityLogo'
          />
        </LazyLoad>
      </div>
      <div className='items-left flex w-full flex-col justify-center p-2.5 text-left sm:w-full md:w-1/2'>
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

  let wordpressCopy: WIHEWordpressCopy = WIHEFallbackCopy
  const { data }: any = useQuery(
    DYNAMIC_COPY_KEY,
    async () => await fetchCopyData(),
    REACT_QUERY_OPTIONS
  )
  if (data) wordpressCopy = data.data?.acf

  return (
    <>
      <div>
        <Helmet>
          <title>What is Health Equity? - Health Equity Tracker</title>
        </Helmet>
        <div className='m-auto flex w-full max-w-newsPage flex-wrap'>
          <div className='flex w-full items-center justify-center border-0 border-b border-solid border-border-color'>
            <figure className='mx-auto mt-0 hidden w-full text-left md:block md:w-1/3'>
              <LazyLoad offset={300} height={760} once>
                <img
                  alt=''
                  className='h-auto w-full max-w-equityLogo rounded-xl p-2.5'
                  src='/img/stock/woman-in-wheelchair-with-tea.png'
                />
              </LazyLoad>
            </figure>

            <div className='w-full border-0 px-15p py-8 md:w-2/3 md:border-l md:border-solid md:px-16 md:py-28'>
              <header className='mb-10'>
                <h2
                  id='main'
                  className='mb-4 mt-0 text-left font-serif text-biggerHeader font-light leading-lhNormal text-alt-green'
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
                <span className='text-small text-alt-dark'>
                  Health Equity Leadership & Exchange Network, 2020
                </span>
              </p>
              <div className='flex w-full flex-wrap items-start justify-between text-left'>
                {/* PDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-alt-green'>
                    Political determinants of health
                  </h3>
                  <p className='mb-2 mt-2 text-small leading-lhLoose'>
                    The Political determinants of health involve the systematic
                    process of structuring relationships, distributing
                    resources, and administering power, operating simultaneously
                    in ways that mutually reinforce or influence one another to
                    shape opportunities that either advance health equity or
                    exacerbate health inequities.
                  </p>
                  <span className='text-small text-alt-dark'>
                    Daniel Dawes, 2020
                  </span>
                </section>
                {/* SDOH */}
                <section className='w-full p-4 pl-0 md:w-1/2'>
                  <h3 className='m-0 pt-4 font-serif text-title font-light leading-lhLoose text-alt-green'>
                    Social determinants of health
                  </h3>
                  <p className='mb-2 mt-2 text-small leading-lhLoose'>
                    The conditions in the environments in which people are born,
                    live, learn, work, play, worship, and age that affect a wide
                    range of health, functioning, and quality-of-life outcomes
                    and risks.
                  </p>
                  <span className='text-small text-alt-dark'>
                    Healthy People 2020, CDC
                  </span>
                </section>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col flex-wrap items-center justify-center'>
            <div className='flex w-full flex-wrap justify-center py-5'>
              <section>
                <h3 className='m-0 text-center font-serif text-biggerHeader font-light leading-lhLoose text-alt-green'>
                  {wordpressCopy?.section2_headingLevel2}
                </h3>
              </section>
              <div className='flex w-full flex-wrap justify-around py-5 text-left'>
                <div className='flex w-full flex-col  items-start p-4 text-left md:w-3/4'>
                  <iframe
                    className='w-full rounded-xl'
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
                    <aside
                      className='flex flex-col items-start p-4 text-left'
                      aria-label="Jessica's Story Video"
                    >
                      <iframe
                        className='h-44 w-full rounded-xl'
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
                      <a href={urlMap.ncrn} className='text-black	no-underline'>
                        <LazyLoad offset={300} height={200} once>
                          <img
                            className='h-44 w-full rounded-xl'
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
                <h3 className='m-0 pb-2 text-center font-serif text-biggerHeader font-light text-alt-green'>
                  News and stories
                </h3>
                <p className='text-left font-sansText text-title font-light text-black'>
                  Read the{' '}
                  <Link className='text-alt-green' to={NEWS_PAGE_LINK}>
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
                        className='h-auto w-full rounded-xl'
                        src='/img/stock/kid-gets-a-mask.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='text-alt-green no-underline hover:underline'
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
                        className='h-auto w-full rounded-xl'
                        src='/img/stock/girls-studying.jpg'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='text-alt-green no-underline hover:underline'
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
                        className='w-full rounded-xl'
                        src='/img/stock/filling-in-forms.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='text-alt-green no-underline hover:underline'
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
                        className='w-full rounded-xl'
                        src='/img/stock/kids-ukulele.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='text-alt-green no-underline hover:underline'
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
                        className='w-full rounded-xl'
                        src='/img/graphics/laptop-HET.png'
                        alt=''
                      />
                    </a>
                    <h4 className='my-4 text-center font-serif text-smallestHeader font-light leading-lhSomeMoreSpace'>
                      <a
                        className='text-alt-green no-underline hover:underline'
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
          <div className='flex w-full items-center justify-center border-0 border-b border-solid py-12'>
            <section className='w-full md:w-5/6'>
              <FaqSection />
            </section>
          </div>
        </div>

        <div className='flex w-full flex-col items-center justify-center px-8'>
          <section className='flex w-full flex-col items-center justify-center py-16'>
            <h3
              id={WIHE_JOIN_THE_EFFORT_SECTION_ID}
              className='m-0 mb-4 text-center font-serif text-biggerHeader font-light leading-lhModalHeading text-alt-green'
            >
              {wordpressCopy?.section4_headingLevel2}
            </h3>
            <span className='text-left font-sansText text-title font-normal leading-lhLoose'>
              {wordpressCopy?.section4_heading2_text}
            </span>
          </section>

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? 'img/HET-lines-no-motion.gif'
                : 'img/animations/HET-lines.gif'
            }
            imageBackground='bg-join-effort-bg1'
            imageAlt=''
            textTitle={wordpressCopy?.section4_a_headingLevel3}
            content={
              <>
                <p className='my-4 py-2.5 font-sansTitle text-title font-normal leading-lhLoose'>
                  {wordpressCopy?.section4_a_heading3_text}
                </p>
                <p>
                  <Button
                    className='text-smallestHeader underline'
                    href={wordpressCopy?.section4_a_heading3_link?.url}
                    target={wordpressCopy?.section4_a_heading3_link?.target}
                  >
                    {wordpressCopy?.section4_a_heading3_link?.title}
                  </Button>
                </p>
              </>
            }
          />

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? 'img/HET-fields-no-motion.gif'
                : 'img/animations/HET-fields.gif'
            }
            imageBackground='bg-join-effort-bg2'
            imageAlt=''
            textTitle={wordpressCopy?.section4_b_headingLevel3}
            content={
              <>
                <p className='my-4 py-2.5 font-sansTitle text-title font-normal leading-lhLoose'>
                  Are you a community leader interested in expanding
                  transportation access to vaccine sites within your community?
                  Complete our inquiry form to receive information on our
                  vaccine rideshare efforts and opportunities.
                </p>
                <p>
                  <Button
                    className='text-smallestHeader underline'
                    aria-label='Sign Up - vaccine rideshare program'
                    href='https://satcherinstitute.org/uberrideshare/'
                  >
                    Sign Up
                  </Button>
                </p>
              </>
            }
          />

          <JoinTheEffortContainer
            imageUrl={
              prefersReducedMotion
                ? 'img/HET-dots-no-motion.gif'
                : 'img/animations/HET-dots.gif'
            }
            imageBackground='bg-join-effort-bg3'
            imageAlt=''
            textTitle={wordpressCopy?.section4_c_headingLevel3}
            content={
              <div className='flex flex-col items-start'>
                <p className='my-4 py-2.5 font-sansTitle text-title font-normal leading-lhLoose'>
                  {wordpressCopy?.section4_c_heading3_text}
                </p>
                <HetEmailSignup id='wihe-email-signup' />
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}
export default EquityTab
