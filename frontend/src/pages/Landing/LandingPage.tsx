import { useQuery } from '@tanstack/react-query'
import HetCTABig from '../../styles/HetComponents/HetCTABig'
import HetLazyLoader from '../../styles/HetComponents/HetLazyLoader'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import {
  ARTICLES_KEY_4,
  REACT_QUERY_OPTIONS,
  fetchLandingPageNewsData,
} from '../../utils/blogUtils'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import {
  EXPLORE_DATA_PAGE_LINK,
  NEWS_PAGE_LINK,
  WARM_WELCOME_DEMO_SETTING,
} from '../../utils/internalRoutes'
import type { Article } from '../News/ArticleTypes'
import NewsAndStoriesPreviewCardOutlined from '../News/NewsAndStoriesPreviewCardOutlined'

function LandingPage() {
  const { isLoading, error, data }: any = useQuery({
    queryKey: [ARTICLES_KEY_4],
    queryFn: fetchLandingPageNewsData,
    ...REACT_QUERY_OPTIONS,
  })

  const isMd = useIsBreakpointAndUp('md')
  const isLg = useIsBreakpointAndUp('lg')

  let numberOfArticlePreviews = 1
  if (isMd) numberOfArticlePreviews = 2
  if (isLg) numberOfArticlePreviews = 3

  const recentArticles = data?.data?.slice(0, numberOfArticlePreviews)
  const prefersReducedMotion = usePrefersReducedMotion()

  interface ListItemProps {
    title: string
    description: string
    videoSrc?: string
    iframeSrc?: string
    itemNumber?: number
    customClassName?: string
  }

  function ListItem({
    title,
    description,
    videoSrc,
    iframeSrc,
    itemNumber,
    customClassName,
  }: ListItemProps) {
    return (
      <li
        className={`sticky top-[0] mx-24 my-12 flex h-auto xs:h-auto min-h-[55vh] min-w-full list-none xs:flex-col items-center justify-around rounded-xl bg-white p-8 xs:px-4 xs:py-2 shadow-raised sm:flex-col sm:p-8 lg:flex-row xl:flex-row ${customClassName}`}
      >
        <div className='mx-4 flex w-1/3 xs:w-auto flex-col justify-between sm:w-auto md:w-auto '>
          <p className='xs:my-0 xs:py-0 text-left font-bold font-sans-title text-alt-green text-small'>
            {itemNumber}/4
          </p>
          <div className='mb-4 xs:mb-0 w-full min-w-1/2'>
            <h4 className='my-2 font-medium font-sans-title text-smallest-header xs:text-title md:text-left'>
              {title}
            </h4>
            <p className='mb-8 xs:mb-4 xs:text-small sm:text-small md:text-left'>
              {description}
            </p>
            <HetTextArrowLink
              link={`${EXPLORE_DATA_PAGE_LINK}${WARM_WELCOME_DEMO_SETTING}`}
              linkText='Take a guided tour'
            />
          </div>
        </div>
        <div className='h-auto w-full'>
          {iframeSrc ? (
            <iframe
              className='xs:h-[25vh] max-h-[40vh] w-full max-w-[60vw] rounded-md sm:h-[25vh] md:h-[25vh] lg:min-h-[40vh] xl:min-h-[40vh]'
              src={iframeSrc}
              title='YouTube video player'
              loading='lazy'
              allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
              allowFullScreen
            ></iframe>
          ) : (
            <HetLazyLoader offset={300} once>
              <video
                autoPlay={!prefersReducedMotion}
                loop
                muted
                playsInline
                className='h-auto max-h-[40vh] min-h-[30vh] w-full'
              >
                <source src={videoSrc} type='video/mp4' />
              </video>
            </HetLazyLoader>
          )}
        </div>
      </li>
    )
  }

  return (
    <main className='relative' aria-label='Main Content'>
      <title>Home - Health Equity Tracker</title>

      <section className='relative min-h-5/6 overflow-hidden px-56 xs:px-16 py-16 sm:px-16 md:px-24'>
        <img
          src='/img/graphics/het-hero.png'
          alt='various charts from the health equity tracker'
          className='absolute top-0 right-0 bottom-0 z-0 float-right mx-24 max-w-4xl opacity-35 xs:opacity-15 sm:opacity-15 md:opacity-15'
        ></img>
        <div className='relative m-0 p-0 text-left sm:w-full md:w-full lg:w-3/4'>
          <h1 className='mt-4 mb-0 text-left font-medium font-serif text-black xs:text-header leading-lh-some-space sm:text-big-header lg:text-hero-header'>
            Where will the <br aria-hidden />
            <span className='font-medium font-serif text-alt-green xs:text-header leading-lh-some-space sm:text-big-header lg:text-hero-header'>
              Health Equity Tracker
            </span>
            <br aria-hidden /> take you?
          </h1>
          <HetCTABig id='landingPageCTA' href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetCTABig>
          <div className='z-1 border-0 border-timberwolf border-l-2 border-solid py-0 pl-2'>
            <p className='z-1 my-0 py-0'>
              Data sourced from major public health agencies
            </p>
          </div>
          <div className='flex w-full flex-wrap justify-start gap-6 py-4'>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_cdc.png'
                alt='US CDC logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_census.png'
                alt='US Census logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_bjs.png'
                alt='BJS logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_cawp.png'
                alt='CAWP logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_ahr.png'
                alt='AHR logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_cms.png'
                alt='CMS logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_vera.png'
                alt='VERA logo'
              ></img>
            </div>
            <div className='max-h-4'>
              <img
                className='h-4'
                src='/img/graphics/logo_kff.png'
                alt='Kaiser Family Foundation logo'
              ></img>
            </div>
          </div>
        </div>
      </section>

      <section className='flex w-full flex-wrap items-center justify-center'>
        <div className='space-8 lg:space-24 mx-auto my-0 xs:block flex h-auto min-h-[60vh] w-full items-center justify-center bg-white-smoke80 p-16 sm:block md:flex'>
          <img
            src='/img/graphics/banner.png'
            className='w-full md:w-2/5'
            alt='phone and laptop mockups displaying the health equity tracker'
          />

          <div className='flex w-full flex-col items-center justify-center sm:block md:block'>
            <h2
              id='main'
              className='m-0 text-center font-bold font-sans-title text-alt-green text-big-header xs:text-header leading-lh-modal-heading'
            >
              Advancing Health Justice
            </h2>

            <p className='mt-4 mb-16 text-title lg:text-left lg:text-title'>
              The Health Equity Tracker from the Satcher Health Leadership
              Institute aims to address health disparities in the United States
              by identifying at-risk populations and highlighting data
              inequities. By providing policymakers, community leaders, and
              researchers the data they need to make informed decisions, this
              scalable, feature-rich platform supports efforts to achieve health
              equity and justice for all.
            </p>
          </div>
        </div>
      </section>

      <section className='h-full xs:px-4 pt-8 pb-0'>
        <div className=' m-0 py-0'>
          <div className='m-0 flex flex-col items-center justify-center p-0 '>
            <div className='w-full'>
              <h3 className='m-0 font-bold font-sans-title text-alt-green text-header leading-lh-modal-heading'>
                How do I use the Health Equity Tracker?
              </h3>
            </div>
            <p className='text-text'>
              Scroll down to learn more about the platform.
            </p>
          </div>

          <div className='relative flex xs:max-h-[75vh] xs:min-h-[75vh] flex-col items-center justify-center overflow-y-auto py-4'>
            <ul className='scrollbar-hide absolute top-[0] flex w-full flex-col items-center justify-center px-8 xs:px-4 py-0 pb-8'>
              <ListItem
                title='Take a tour of the data'
                description='New to the Health Equity Tracker? Watch a short video demo that highlights major features of the platform.'
                iframeSrc='https://www.youtube.com/embed/XBoqT9Jjc8w'
                videoSrc={undefined}
                itemNumber={1}
              />

              <ListItem
                title='Search by completing the sentence'
                description='Select topics and locations you’re interested in to complete the sentence and explore the data.'
                videoSrc='videos/search-by.mp4'
                iframeSrc={undefined}
                itemNumber={2}
              />

              <ListItem
                title='Use filters to go deeper'
                description='Where available, the tracker offers breakdowns by race and ethnicity, sex, and age.'
                videoSrc='videos/filters.mp4'
                iframeSrc={undefined}
                itemNumber={3}
              />

              <ListItem
                title='Explore maps and graphs'
                description='The interactive maps and graphs are a great way to investigate the data more closely. If a state or county is gray, that means there’s no data currently available.'
                videoSrc='videos/explore-map.mp4'
                iframeSrc={undefined}
                itemNumber={4}
                customClassName='xs:mt-4 xs:mb-12'
              />
            </ul>
          </div>
        </div>
        <div className='my-0 py-0 xs:py-0'>
          <HetCTABig href={EXPLORE_DATA_PAGE_LINK}>Explore the data</HetCTABig>
        </div>
      </section>

      <section className='flex w-full flex-wrap items-center justify-center'>
        <div className='flex flex-wrap px-56 xs:px-16 py-24 sm:px-24 md:px-32'>
          <div className='w-full'>
            <h3 className='m-0 font-bold font-sans-title text-alt-green text-header leading-lh-modal-heading'>
              Recent news
            </h3>
          </div>
          <div className='w-full'>
            <p className='mt-4 mb-16 text-text'>
              Stories and updates from Morehouse School of Medicine and beyond
            </p>
          </div>
          <div className='w-full'>
            <div className='mt-8 grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:mt-8 lg:grid-cols-3'>
              {recentArticles && !isLoading ? (
                recentArticles.map((article: Article) => {
                  return (
                    <div key={article.id}>
                      <NewsAndStoriesPreviewCardOutlined
                        article={article}
                        bgHeight='14rem'
                      />
                    </div>
                  )
                })
              ) : (
                <HetPostsLoading
                  className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
                  doPulse={!error}
                  numberLoading={numberOfArticlePreviews}
                />
              )}
            </div>
            <div>
              <HetTextArrowLink
                link={NEWS_PAGE_LINK}
                linkText='View all articles'
                containerClassName='flex items-center justify-center mt-16 mx-auto '
                linkClassName='font-sans-title text-smallest-header'
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
