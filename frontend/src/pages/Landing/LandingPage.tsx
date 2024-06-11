import {
  ARTICLES_KEY_4,
  fetchLandingPageNewsData,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import {
  EXPLORE_DATA_PAGE_LINK,
  NEWS_PAGE_LINK,
  WARM_WELCOME_DEMO_SETTING,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import NewsPreviewCard from '../News/NewsPreviewCard'
import { useQuery } from 'react-query'
import type { Article } from '../News/NewsPage'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import HetBigCTA from '../../styles/HetComponents/HetBigCTA'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import { ArrowRightAlt } from '@mui/icons-material'

function LandingPage() {
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY_4,
    fetchLandingPageNewsData,
    REACT_QUERY_OPTIONS
  )

  const isSm = useIsBreakpointAndUp('sm')
  const isMd = useIsBreakpointAndUp('md')
  const isLg = useIsBreakpointAndUp('lg')

  let numberOfArticlePreviews = 1
  if (isSm) numberOfArticlePreviews = 2
  if (isMd) numberOfArticlePreviews = 3
  if (isLg) numberOfArticlePreviews = 4

  const recentArticles = data?.data.slice(0, numberOfArticlePreviews)
  const prefersReducedMotion = usePrefersReducedMotion()

<<<<<<< HEAD
  interface ListItemProps {
    title: string;
    description: string;
    videoSrc?: string;
    iframeSrc?: string;
  }

  function ListItem({ title, description, videoSrc, iframeSrc }: ListItemProps) {
    return (

      <li className="mt-8 py-16 px-8 sm:p-8 xs:py-2 xs:px-4 w-full list-none flex items-center justify-around rounded-xl border border-altGrey bg-white md:flex sm:block xs:block">
        <div className="w-full md:w-1/4">
          <h4 className="font-sansTitle text-smallestHeader xs:text-title font-medium md:text-left my-2">
            {title}
          </h4>
          <p className="md:text-left mb-8 sm:text-small xs:text-small">
            {description}
          </p>
          <div className='flex items-center justify-start p-0 m-0  hover:translate-x-1 hover:transition-transform hover:duration-300 '>
            <a
              href={EXPLORE_DATA_PAGE_LINK + WARM_WELCOME_DEMO_SETTING}
              className=' no-underline h-auto font-sansTitle text-small p-0 m-0 text-altGreen font-bold flex items-center justify-start'
            >
              <p className='mr-2 p-0 my-0'> Take a guided tour</p> <ArrowRightAlt />
            </a>
          </div>
        </div>
        <div className="w-full md:w-2/3 ">
          {iframeSrc ? (
            <iframe
              className="w-full rounded-md"
              height="420px"
              src={iframeSrc}
              title="YouTube video player"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <LazyLoad offset={300} once>
              <video
                autoPlay={!prefersReducedMotion}
                loop
                muted
                playsInline
                className="h-full w-full p-2.5"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            </LazyLoad>
          )}
        </div>
      </li>
    );
  };

=======
>>>>>>> bcfcb135 (news section refresh)

  return (
    <>

      <Helmet>
        <title>Home - Health Equity Tracker</title>
        <link rel='preload' as='image' href='/img/stock/family-laughing.png' />
      </Helmet>

      <h2 className='sr-only'>Home Page</h2>
      {/* Refresh */}
<<<<<<< HEAD
      <section className='relative overflow-hidden px-56 py-16 md:px-24 sm:px-16 xs:px-16 min-h-5/6' >
        <img src='/img/graphics/het-hero.png' alt='various charts from the health equity tracker' className='z-0 absolute max-w-4xl top-0 bottom-0 right-0 float-right opacity-35 md:opacity-15 sm:opacity-15 xs:opacity-15'>
        </img>
        <div className='p-0 m-0relative lg:w-1/2 md:w-full sm:w-full text-left'>


          <h1 className='leading-lhSomeSpace font-serif text-black text-bigHeader font-medium text-left mt-4 mb-0'>Where will the <br />
            <span className='text-altGreen'>Health Equity Tracker</span><br /> take you?</h1>
          <HetBigCTA id='landingPageCTA' href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetBigCTA >
          <div className='border-solid border-timberwolf border-l-2 border-0 py-0 pl-2 z-1'>
            <p className='py-0 my-0 z-1'>Data sourced from major public health agencies
            </p>

          </div>
          <div className='flex py-4 flex-wrap gap-6 justify-start w-full'>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cdc.png' alt='US CDC logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_census.png' alt='US Census logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_bjs.png' alt='BJS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cawp.png' alt='CAWP logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_ahr.png' alt='AHR logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cms.png' alt='CMS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_vera.png' alt='VERA logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_kff.png' alt='Kaiser Family Foundation logo'></img></div>
=======
      <section className='relative overflow-hidden px-56 py-16 md:px-24 sm:px-16 xs:px-16' >
        <img src='/img/graphics/het-hero.png' alt='various charts from the health equity tracker' className='z-0 absolute max-w-4xl top-0 bottom-0 right-0 float-right opacity-35 md:opacity-15 sm:opacity-15 xs:opacity-15'>
        </img>
        <div className='relative lg:w-1/2 md:w-full sm:w-full text-left'>


          <h1 className='leading-lhSomeSpace font-serif text-black text-bigHeader font-medium text-left mt-4 mb-0'>Where will the <br />
            <span className='text-altGreen'>Health Equity Tracker</span><br /> take you?</h1>
          <HetBigCTA id='landingPageCTA' href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetBigCTA >
          <div className='border-solid border-timberwolf border-l-2 border-0 py-0 pl-2 z-1'>
            <p className='py-0 my-0 z-1'>Data sourced from major public health agencies
            </p>

          </div>
          <div className='flex py-4 flex-wrap gap-6 justify-start w-full'>
<<<<<<< HEAD
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_cdc.png' alt='US CDC logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_census.png' alt='US Census logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_bjs.png' alt='BJS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_cawp.png' alt='CAWP logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_ahr.png' alt='AHR logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_cms.png' alt='CMS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_vera.png' alt='VERA logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/public/img/graphics/logo_kff.png' alt='Kaiser Family Foundation logo'></img></div>
>>>>>>> 1a1887f9 (add new hero and update landing page headers)
=======
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cdc.png' alt='US CDC logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_census.png' alt='US Census logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_bjs.png' alt='BJS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cawp.png' alt='CAWP logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_ahr.png' alt='AHR logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_cms.png' alt='CMS logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_vera.png' alt='VERA logo'></img></div>
            <div className='max-h-4'><img className='h-4' src='/img/graphics/logo_kff.png' alt='Kaiser Family Foundation logo'></img></div>
>>>>>>> 1e69bb24 (landing page revisions)

          </div>
        </div>

      </section>
      {/* Refresh */}

      <div className='flex w-full flex-wrap items-center justify-center '>
<<<<<<< HEAD
        <div className='flex md:flex xs:block sm:block items-center justify-center p-16 bg-[#F0F1EF]/[0.8] mx-auto my-0 w-full min-h-[60vh] h-auto space-8 lg:space-24'>
=======
        <div className='flex md:flex xs:block sm:block items-center justify-center p-16 bg-ashgray30 mx-auto my-0 w-full space-8 lg:space-24'>
>>>>>>> 1a1887f9 (add new hero and update landing page headers)

          <img
            src='/img/graphics/banner.png'
            className='md:w-2/5 w-full'
            alt='phone and laptop mockups displaying the health equity tracker'
          />

          <div className='flex w-full flex-col justify-center items-center md:block sm:block'>
<<<<<<< HEAD
            <h2 id='main' className='m-0 font-sansTitle text-bigHeader font-bold leading-lhModalHeading text-altGreen text-center'>
              Advancing Health Justice
            </h2>

            <p className='lg:text-left lg:text-title mt-4 mb-16 text-title'>
=======
            <h3
              id='main'
              className='mb-4 mt-0 pb-4 pt-12 text-header font-sansTitle font-bold text-altGreen leading-lhModalHeading lg:text-left lg:text-bigHeader'
            >
              Advancing Health Justice
            </h3>
            <p className='lg:text-left lg:text-title'>
>>>>>>> 1a1887f9 (add new hero and update landing page headers)
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

        <div className='flex flex-wrap px-56 pt-24 md:px-32 sm:px-24 xs:px-16'>
          <div className='w-full'>
            <h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
              Recent news
            </h3>
          </div>
          <div className='w-full'>
<<<<<<< HEAD
            <p className='mt-4 mb-16 text-text'>
=======
            <p className='mt-4 pb-16 text-title'>
>>>>>>> bcfcb135 (news section refresh)
              Stories and updates from Morehouse School of Medicine and beyond
            </p>
          </div>
          <div className='w-full'>
            <div className='flex flex-wrap px-4 '>
              {recentArticles && !isLoading ? (
                recentArticles.map((article: Article) => {
                  return (
                    <div
                      key={article.id}
                      className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
                    >
                      <NewsPreviewCard article={article} />
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
              <div className='flex items-center justify-center my-4 mx-auto hover:translate-x-1 hover:transition-transform hover:duration-300 w-max h-full'>

                <a
                  href={NEWS_PAGE_LINK}
                  className='m-8 px-24 py-4 xs:px-8 no-underline h-auto font-sansTitle text-smallestHeader font-bold tracking-wide text-altGreen lg:w-80 xs:w-auto xs:text-title'
                >
                  <span className='mr-4 xs:mr-2'> View all articles </span> <ArrowRightAlt />
                </a>
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
<<<<<<< HEAD
        <article className="flex flex-wrap items-center justify-center py-24 px-16 sm:px-24 md:px-32 lg:px-56 bg-footerColor">
          <div className="w-full">

            <h3 className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen'>
=======
        <article className='flex flex-wrap items-center justify-center border-0	border-b border-solid px-56 pb-32 pt-20'>
=======
        <article className='flex flex-wrap items-center justify-center border-0	border-b border-solid p-24'>
>>>>>>> 1e69bb24 (landing page revisions)
          <div className='w-full'>
            <h3 className='m-0 pb-16 text-center font-sansTitle text-header text-altGreen'>
>>>>>>> 1a1887f9 (add new hero and update landing page headers)
              How do I use the Health Equity Tracker?
            </h3>
          </div>

          <ul className="flex flex-col items-center justify-center p-0">
            <ListItem
              title="Take a Tour of the Data"
              description="New to the Health Equity Tracker? Watch a short video demo that highlights major features of the platform."
              iframeSrc="https://www.youtube.com/embed/XBoqT9Jjc8w" videoSrc={undefined} />
            <ListItem
              title="Search by completing the sentence"
              description="Select topics and locations you’re interested in to complete the sentence and explore the data."
              videoSrc="videos/search-by.mp4" iframeSrc={undefined} />
            <ListItem
              title="Use filters to go deeper"
              description="Where available, the tracker offers breakdowns by race and ethnicity, sex, and age."
              videoSrc="videos/filters.mp4" iframeSrc={undefined} />
            <ListItem
              title="Explore maps and graphs"
              description="The interactive maps and graphs are a great way to investigate the data more closely. If a state or county is gray, that means there’s no data currently available."
              videoSrc="videos/explore-map.mp4" iframeSrc={undefined} />
          </ul>

<<<<<<< HEAD
          <div className="mt-14">
            <HetBigCTA href={EXPLORE_DATA_PAGE_LINK}>
              Explore the data
            </HetBigCTA>
          </div>
        </article>
<<<<<<< HEAD
=======
=======
        </article>
        <div className='mt-14'>
          <HetBigCTA href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetBigCTA>
        </div>
>>>>>>> 1e69bb24 (landing page revisions)


<<<<<<< HEAD
          <section>
            <div className='w-full'>
              <h3 className='mb-4 mt-8 font-sansTitle text-header text-altGreen'>
                Sign up for our newsletter:
              </h3>
            </div>

            <HetEmailSignup id='landing-email-signup' />
          </section>
        </aside>
>>>>>>> 1a1887f9 (add new hero and update landing page headers)
=======
>>>>>>> 1e69bb24 (landing page revisions)
      </div>
    </>
  )
}

export default LandingPage
