import { Helmet } from 'react-helmet-async'
import { error } from 'vega'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import type { Article } from './ArticleTypes'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useQuery } from 'react-query'
import * as blogUtils from '../../utils/blogUtils'
import { fetchLandingPageNewsData } from '../../utils/blogUtils'
import NewsAndStoriesPreviewCard from './NewsAndStoriesPreviewCard'
import NewsAndStoriesPreviewCardOutlined from './NewsAndStoriesPreviewCardOutlined'

export default function NewsAndStoriesPage() {
  const ARTICLES_KEY_5 = 'cached_wp_articles_first_five'
  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY_5, // Updated key
    fetchLandingPageNewsData, // Updated function
    blogUtils.REACT_QUERY_OPTIONS,
  )
  const isSm = useIsBreakpointAndUp('sm')
  const isMd = useIsBreakpointAndUp('md')
  const isLg = useIsBreakpointAndUp('lg')
  const numberOfArticlePreviews = 5

  const recentArticles = data?.data?.slice(0, numberOfArticlePreviews) || []

  const centerArticle = recentArticles[0]
  const leftArticles = recentArticles.slice(1, 3)
  const rightArticles = recentArticles.slice(3, 5)

  const fourFeaturedArticles = recentArticles.slice(1, 5)

  return (
    <>
      <Helmet>
        <title>News and Stories - Health Equity Tracker</title>
      </Helmet>

      <section
        id='main-content'
        aria-labelledby='main-content'
        tabIndex={-1}
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'
      >
        <h1
          id='main'
          tabIndex={-1}
          className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'
        >
          News and Stories
        </h1>
        <h2 className='sr-only'>News and Stories</h2>
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            We believe in the power of storytelling. The Health Equity Tracker
            is designed to enable transformative change through data, but we
            know that is only part of the picture. Here, you will find news and
            stories from the Satcher Health Leadership Institute, partners,
            guest authors, and other contributors that go beyond the numbers to
            share insights and analysis into the Health Equity movement.
          </p>
          <h3 className='font-sansTitle font-medium'>Recent News</h3>
          <div className='flex w-full flex-wrap items-center justify-center'>
            <div className='flex flex-wrap '>
              {isLoading ? (
                <HetPostsLoading
                  className='w-full'
                  doPulse={!error}
                  numberLoading={numberOfArticlePreviews}
                />
              ) : (
                <div className='flex flex-col items-center w-full'>
                  <div className='flex w-full justify-evenly'>
                    {/* Left articles */}
                    <div className='flex flex-row w-1/3'>
                      {leftArticles.map((article: Article) => (
                        <NewsAndStoriesPreviewCard
                          key={article.id}
                          article={article}
                          divClassName='mx-2'
                        />
                      ))}
                    </div>

                    {/* Center article */}
                    <div className='w-2/5'>
                      {centerArticle && (
                        <NewsAndStoriesPreviewCard
                          article={centerArticle}
                          divClassName='mx-0'
                        />
                      )}
                    </div>

                    {/* Right articles */}
                    <div className='flex flex-row w-1/3'>
                      {rightArticles.map((article: Article) => (
                        <NewsAndStoriesPreviewCard
                          key={article.id}
                          article={article}
                          divClassName='mx-2'
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-5 gap-1 w-full'>
            {isLoading ? (
              <HetPostsLoading
                className='w-full'
                doPulse={!error}
                numberLoading={numberOfArticlePreviews}
              />
            ) : (
              <>
                <div className='col-span-2 w-full'>
                  {centerArticle && (
                    <NewsAndStoriesPreviewCardOutlined
                      article={centerArticle}
                      bgHeight='30rem'
                    />
                  )}
                </div>

                <div className='col-span-3 grid grid-cols-2 gap-4'>
                  {fourFeaturedArticles.map((article: Article) => (
                    <NewsAndStoriesPreviewCardOutlined
                      key={article.id}
                      article={article}
                      bgHeight='10rem'
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </section>
    </>
  )
}
