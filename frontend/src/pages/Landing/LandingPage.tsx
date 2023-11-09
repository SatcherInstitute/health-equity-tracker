import styles from './LandingPage.module.scss'
import { ReactRouterLinkButton } from '../../utils/urlutils'
import {
  ARTICLES_KEY_4,
  fetchLandingPageNewsData,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import { Button, TextField, useMediaQuery, useTheme } from '@mui/material'
import {
  EXPLORE_DATA_PAGE_LINK,
  NEWS_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import NewsPreviewCard from '../News/NewsPreviewCard'
import { useQuery } from 'react-query'
import type { Article } from '../News/NewsPage'
import { ArticlesSkeleton } from '../News/AllPosts'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import { urlMap } from '../../utils/externalUrls'

function LandingPage() {
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY_4,
    fetchLandingPageNewsData,
    REACT_QUERY_OPTIONS
  )

  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.only('sm'))
  const pageIsMedium = useMediaQuery(theme.breakpoints.only('md'))
  const pageIsWide = useMediaQuery(theme.breakpoints.up('lg'))

  let numberOfArticlePreviews = 1
  if (pageIsSmall) numberOfArticlePreviews = 2
  if (pageIsMedium) numberOfArticlePreviews = 3
  if (pageIsWide) numberOfArticlePreviews = 4

  const recentArticles = data?.data.slice(0, numberOfArticlePreviews)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <>
      <Helmet>
        <title>Home - Health Equity Tracker</title>
        <link rel='preload' as='image' href='/img/stock/family-laughing.png' />
      </Helmet>

      <h2 className='sr-only'>Home Page</h2>
      <div className='m-auto flex w-full max-w-newsPage flex-wrap'>
        <div className='flex flex-wrap items-center justify-center border-0 border-b border-solid pb-8 pt-4'>
          <div className='w-full px-12 py-4 md:w-7/12'>
            <h3
              id='main'
              className={`
              mb-4 mt-0
              pb-4 pt-12
              ${
                pageIsWide
                  ? 'text-left text-bigHeader'
                  : 'text-center text-header'
              }
              font-serif
              font-light leading-lhModalHeading
              text-alt-green`}
            >
              Advancing Health Justice
            </h3>
            <p
              className={`mt-0 text-left ${
                pageIsWide ? 'text-title' : 'text-text'
              }`}
            >
              The Health Equity Tracker from the Satcher Health Leadership
              Institute aims to address health disparities in the United States
              by identifying at-risk populations and highlighting data
              inequities. By providing policymakers, community leaders, and
              researchers the data they need to make informed decisions, this
              scalable, feature-rich platform supports efforts to achieve health
              equity and justice for all.
            </p>
            <div className={`mb-10 ${pageIsWide ? 'mt-20' : 'mt-10'}`}>
              <Button
                id='landingPageCTA'
                variant='contained'
                className='rounded-2xl px-8 py-5 text-exploreButton text-white'
                href={EXPLORE_DATA_PAGE_LINK}
              >
                Explore the data
              </Button>
            </div>
          </div>
          <div className='w-full border-0 border-l border-solid px-12 py-4 md:w-5/12'>
            <img
              src='/img/stock/family-laughing.png'
              className='border-xl h-auto max-h-headerHeight w-full	max-w-md p-2.5'
              alt=''
            />
          </div>
        </div>

        <div className='border-0 border-b border-solid px-8 py-20'>
          <div className='w-full'>
            <h3 className='m-0 font-serif text-header font-light leading-lhModalHeading text-alt-green'>
              Recent news
            </h3>
          </div>
          <div className='w-full'>
            <p className='m-0 pb-16 text-title'>
              Stories and updates from Morehouse School of Medicine and beyond
            </p>
          </div>
          <div className='w-full'>
            <div className='flex flex-wrap justify-around px-4'>
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
                <ArticlesSkeleton
                  doPulse={!error}
                  numberLoading={numberOfArticlePreviews}
                />
              )}
            </div>
            <div className='mt-10'>
              <div className='mb-4'>
                <ReactRouterLinkButton
                  url={NEWS_PAGE_LINK}
                  className='text-smallestHeader font-medium underline	'
                  displayName='View all articles'
                />
              </div>
            </div>
          </div>
        </div>

        <article className='flex flex-wrap items-center justify-center border-0	border-b border-solid px-8 pb-32 pt-20'>
          <div className='w-full'>
            <h3 className='m-0 pb-16 text-center font-serif text-header font-light text-alt-green'>
              How do I use the Health Equity Tracker?
            </h3>
          </div>

          <ul className='flex flex-col flex-wrap items-center justify-center p-0'>
            <li className='m-2.5 flex w-full list-none items-center justify-around rounded-xl border border-solid border-alt-grey p-2.5'>
              <div className='w-full md:w-1/4'>
                <h4 className='font-sansTitle text-smallestHeader	font-medium md:text-left'>
                  Take a Tour of the Data
                </h4>
                <p className='md:text-left'>
                  New to the Health Equity Tracker? Watch a short video demo
                  that highlights major features of the platform.
                </p>
              </div>
              <div className='w-full md:w-2/3'>
                <iframe
                  className='w-full rounded-xl'
                  height='420px'
                  src='https://www.youtube.com/embed/XBoqT9Jjc8w'
                  title='YouTube video player'
                  loading='lazy'
                  allow='accelerometer; autoplay; clipboard-write;
                encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>
              </div>
            </li>
            <li className='m-2.5 flex w-full list-none items-center justify-around rounded-xl border border-solid border-alt-grey p-2.5'>
              <div className='w-full md:w-1/4'>
                <h4 className='font-sansTitle text-smallestHeader font-medium md:text-left'>
                  Search by completing the sentence
                </h4>
                <p className='md:text-left'>
                  Select variables you’re interested in to complete the sentence
                  and explore the data.
                </p>
              </div>
              <div className='w-full md:w-2/3'>
                <LazyLoad offset={300} once>
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className='h-full w-full p-2.5'
                  >
                    <source src='videos/search-by.mp4' type='video/mp4' />
                  </video>
                </LazyLoad>
              </div>
            </li>
            <li className='m-2.5 flex w-full list-none items-center justify-around rounded-xl border border-solid border-alt-grey p-2.5'>
              <div className='w-full md:w-1/4'>
                <div>
                  <h4 className='font-sansTitle text-smallestHeader font-medium md:text-left'>
                    Use filters to go deeper
                  </h4>
                  <p className='md:text-left'>
                    Where available, the tracker offers breakdowns by race and
                    ethnicity, sex, and age.
                  </p>
                </div>
              </div>
              <div className='w-full md:w-2/3'>
                <LazyLoad offset={300} once>
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className='h-full w-full p-2.5'
                  >
                    <source src='videos/filters.mp4' />
                  </video>
                </LazyLoad>
              </div>
            </li>
            <li className='m-2.5 flex w-full list-none items-center justify-around rounded-xl border border-solid border-alt-grey p-2.5'>
              <div className='w-full md:w-1/4'>
                <div>
                  <h4 className='font-sansTitle text-smallestHeader font-medium md:text-left'>
                    Explore maps and graphs
                  </h4>
                  <p className='md:text-left'>
                    The interactive maps and graphs are a great way to
                    investigate the data more closely. If a state or county is
                    gray, that means there’s no data currently available.
                  </p>
                </div>
              </div>
              <div className='w-full md:w-2/3'>
                <LazyLoad offset={300} once>
                  <video
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    className='h-full w-full p-2.5'
                  >
                    <source src='videos/explore-map.mp4' />
                  </video>
                </LazyLoad>
              </div>
            </li>
          </ul>

          <div className='mt-14'>
            <Button
              variant='contained'
              className='rounded-2xl px-8 py-4 text-title text-white'
              href={EXPLORE_DATA_PAGE_LINK}
            >
              Explore the data
            </Button>
          </div>
        </article>

        <aside className='flex w-full items-center justify-center px-8 pb-2.5 pt-24'>
          <section>
            <div className='w-full'>
              <h3 className='mb-4 mt-8 font-serif text-header font-light text-alt-green'>
                Sign up for our newsletter:
              </h3>
            </div>
            <form
              action={urlMap.newsletterSignup}
              method='post'
              target='_blank'
            >
              <div className='flex content-center justify-center'>
                <div>
                  <TextField
                    id='Enter email address to sign up' // Accessibility label (is it tho?)
                    name='MERGE0'
                    variant='outlined'
                    className={styles.EmailTextField}
                    type='email'
                    aria-label='Enter Email Address for Newsletter signup'
                    placeholder='Enter email address'
                  />
                </div>
                <div>
                  <Button
                    type='submit'
                    variant='contained'
                    className='px-4 py-1.5'
                    aria-label='Sign Up for Newsletter in a new window'
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </aside>
      </div>
    </>
  )
}

export default LandingPage
