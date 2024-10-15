import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import FaqSection from '../ui/FaqSection'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { urlMap } from '../../utils/externalUrls'
import { EquityTabNewsCard } from './EquityTabNewsCard'
import { NEWS_ARTICLES } from './EquityTabNewsCardData'
import { HetOverline } from '../../styles/HetComponents/HetOverline'
import { HetTermRaised } from '../../styles/HetComponents/HetTermRaised'

export default function EquityTab() {
  return (
    <>
      <Helmet>
        <title>What is Health Equity? - Health Equity Tracker</title>
      </Helmet>
      <section className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'>
        <header>
          <h1
            id='main'
            className='font-sansTitle text-bigHeader font-bold leading-lhNormal'
          >
            What is Health Equity?
          </h1>
        </header>
        <h2 className='sr-only'>What is Health Equity?</h2>
        <div className='flex grow smMd:flex-col xs:block text-left items-center my-4'>
          <HetTermRaised
            term={'Health equity'}
            termType={'noun'}
            emphasizedText={
              'have fair and just access, opportunity, and resources'
            }
            emphasizedTextPosition={'middle'}
            description={`exists when all people, regardless of race, sex, sexual orientation, disability, socio-economic status, geographic location, or other societal constructs have fair and just access, opportunity, and resources to achieve their highest potential for health.`}
            source={'Health Equity Leadership & Exchange Network, 2020'}
          />

          <p className='text-center text-title p-4'>
            Unfortunately, social and political determinants of health
            negatively affect many communities, their people, and their ability
            to lead healthy lives.
          </p>
        </div>
        <div className='flex flex-row justify-between gap-4 text-left'>
          <HetTermRaised
            term={'Political determinants of health'}
            termType={'noun'}
            emphasizedText={
              'structuring relationships, distributing resources, and administering power.'
            }
            emphasizedTextPosition={'middle'}
            description={`involve the systematic process of structuring relationships, distributing resources, and administering power. These processes operate simultaneously, mutually reinforcing or influencing one another to shape opportunities that either advance health equity or exacerbate health inequities.`}
            source={'Daniel Dawes, 2020'}
          />
          <HetTermRaised
            term={'Social determinants of health'}
            termType={'noun'}
            emphasizedText={'conditions in the environments'}
            emphasizedTextPosition={'middle'}
            description={`The conditions in the environments in which people are born, live,
              learn, work, play, worship, and age that affect a wide range of
              health, functioning, and quality-of-life outcomes and risks.`}
            source={'Healthy People 2020, CDC'}
          />
        </div>
      </section>
      <div className='flex w-full flex-col flex-wrap items-center justify-center'>
        <div className='flex w-full flex-wrap justify-center py-5'>
          <section>
            <HetOverline text={'Trending Topics'} className='text-center' />
            <h3 className='m-0 pb-5 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-center'>
              Don't know where to start?
            </h3>
            <p className='text-center my-4 text-title'>
              Discover how the Health Equity Tracker can be your tool to drive
              change and advance health equity in your community.
            </p>
          </section>
          <div className='flex w-full flex-wrap justify-around py-5 text-left'>
            <article className='flex w-full flex-col items-start p-4 text-left md:w-3/4'>
              <iframe
                className='w-full rounded-md'
                height='633px'
                src='https://www.youtube.com/embed/mux1c73fJ78'
                title='YouTube video player - The Allegory of the Orchard'
                loading='lazy'
                allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
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
            </article>
            <section className='w-full md:w-1/4'>
              <div className='flex w-full flex-col flex-wrap items-center justify-evenly'>
                <article className='flex flex-col items-start p-4 text-left'>
                  <iframe
                    aria-label={`Jessica's Story Video`}
                    className='md:h-44 xs:h-80 w-full rounded-md'
                    src='https://www.youtube.com/embed/cmMutvgQIcU'
                    title={`YouTube video player - Jessica's Story`}
                    loading='lazy'
                    allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
                    allowFullScreen
                  />
                  <h4 className='my-4 font-sansText text-title font-medium'>
                    Jessica's Story
                  </h4>
                  <p className='m-0 font-light'>
                    How political determinants of health operate and the impact
                    they have on BIPOC communities.
                  </p>
                </article>
                <article
                  className='flex flex-col items-start p-4 text-left'
                  aria-label='NCRN Information'
                >
                  <a href={urlMap.ncrn} className='text-black no-underline'>
                    <LazyLoad offset={300} height={200} once>
                      <img
                        className='md:h-44 sm:h-80 xs:h-40 w-full rounded-md'
                        src='/img/graphics/NCRN.png'
                        alt='Header for Morehouse School of Medicine National COVID-19 Resiliency Network'
                      />
                    </LazyLoad>
                    <h4 className='my-4 font-sansText text-title font-medium'>
                      Morehouse School of Medicine National COVID-19 Resiliency
                      Network (NCRN)
                    </h4>
                    <p className='font-light'>
                      We provide awareness and linkage to critical health
                      information and services, helping families recover from
                      difficulties that may have been caused or worsened by the
                      Coronavirus (COVID-19) pandemic.
                    </p>
                  </a>
                </article>
              </div>
            </section>
          </div>
        </div>

        <section className='bg-whiteSmoke80 py-16'>
          <div className='mx-0 flex flex-wrap'>
            <div className='w-full mt-4 mb-16 '>
              <h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
                News and stories
              </h3>
              <p className='text-text'>
                Read the{' '}
                <Link to={NEWS_PAGE_LINK}>latest news, posts, and stories</Link>{' '}
                related to health equity, or learn more from the articles below.
              </p>
            </div>
            <LazyLoad offset={300} height={700} once>
              <div className='grid gap-6'>
                <>
                  <div className='grid md:grid-cols-2 gap-6 xs:grid-cols-1'>
                    {NEWS_ARTICLES.slice(0, 2).map((article) => (
                      <EquityTabNewsCard
                        key={article.title}
                        href={article.href}
                        ariaLabel={article.ariaLabel}
                        imgSrc={article.imgSrc}
                        imgAlt={article.imgAlt}
                        title={article.title}
                        description={article.description}
                        readMoreHref={article.readMoreHref}
                      />
                    ))}
                  </div>
                  <div className='grid md:grid-cols-3 gap-6 xs:grid-cols-1 mt-6'>
                    {NEWS_ARTICLES.slice(2).map((article) => (
                      <EquityTabNewsCard
                        key={article.title}
                        href={article.href}
                        ariaLabel={article.ariaLabel}
                        imgSrc={article.imgSrc}
                        imgAlt={article.imgAlt}
                        title={article.title}
                        description={article.description}
                        readMoreHref={article.readMoreHref}
                      />
                    ))}
                  </div>
                </>
              </div>
            </LazyLoad>
          </div>
          <HetTextArrowLink
            link={NEWS_PAGE_LINK}
            linkText='View all articles'
            containerClassName='flex items-center justify-center mt-16 mx-auto '
            linkClassName='font-sansTitle text-smallestHeader'
          />
        </section>
      </div>

      <div className='flex w-full items-center justify-center py-12'>
        <section className='w-full md:w-5/6'>
          <FaqSection />
        </section>
      </div>
    </>
  )
}
