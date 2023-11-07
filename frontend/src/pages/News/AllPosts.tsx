import { Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useUrlSearchParams, LinkWithStickyParams } from '../../utils/urlutils'
import {
  fetchNewsData,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import {
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import ArticleFilters from './ArticleFilters'
import NewsPreviewCard from './NewsPreviewCard'
import { useQuery } from 'react-query'
import { type Article } from './NewsPage'
import SignupSection from '../ui/SignupSection'
import { Link } from 'react-router-dom'
import { getCssVar } from '../../utils/designUtils'

export const ARTICLES_TERM = 'Articles'
const NUM_OF_LOADING_SKELETONS = 6

/*
displays several loading indicator elements while blog content is fetched
*/

export function ArticlesSkeleton(props: {
  doPulse: boolean
  numberLoading?: number
}) {
  const numberLoadingSkeletons = props.numberLoading ?? NUM_OF_LOADING_SKELETONS

  return (
    <div className='grid grid-flow-row justify-between gap-1'>
      {[...Array(numberLoadingSkeletons)].map((_, i) => {
        return (
          <div
            className='flex w-full flex-col items-center sm:w-5/12 md:w-1/4'
            key={i}
          >
            <Skeleton
              animation={props.doPulse && 'wave'}
              variant='rectangular'
              height={100}
              width={150}
            ></Skeleton>
            <Skeleton
              animation={false}
              variant='text'
              height={36}
              width={200}
            ></Skeleton>
            <div className='mb-10'>
              <Skeleton
                animation={props.doPulse && 'wave'}
                variant='text'
                height={36}
                width={175}
              ></Skeleton>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface PinnedArticlesProps {
  articles: Article[]
}

function PinnedArticles(props: PinnedArticlesProps) {
  const { articles } = props

  return articles?.length > 0 ? (
    <div className='shadow-md'>
      <h6 className='m-0 text-center font-serif font-light text-alt-green'>
        Featured:
      </h6>
      <div className='flex'>
        {articles.map((post: any) => {
          return (
            <div className='w-full sm:w-1/2' key={post.id}>
              <NewsPreviewCard article={post} />
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <></>
  )
}

function AllPosts() {
  // articles matching client applied filters (author, category, etc)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('')

  const categoryParam: string | null = useUrlSearchParams().get('category')
  const authorParam: string | null = useUrlSearchParams().get('author')

  // TODO: once MUI is removed, these colors should be applied via tailwind directly
  const altGreenRgb = getCssVar<string>('alt-green')

  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS
  )

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: string) => {
          return category === categoryParam
        }) as string
      )
      setSelectedAuthor('')

      if (selectedCategory && data?.data) {
        setFilteredArticles(
          data.data.filter(
            (article: Article) =>
              article._embedded['wp:term'][0]?.some(
                (term: { name: string }) => term.name === selectedCategory
              )
          )
        )
      }
    } else {
      if (data?.data?.length > 0) {
        setFilteredArticles(
          data.data.filter((article: Article) => !article.sticky)
        )
      }
      setSelectedCategory('')
    }
  }, [data?.data, categories, categoryParam, selectedCategory])

  useEffect(() => {
    // filter articles by author query param if present
    if (authorParam) {
      setSelectedAuthor(
        authors.find((author: string) => {
          return author === authorParam
        }) as string
      )
      setSelectedCategory('')

      if (selectedAuthor) {
        setFilteredArticles(
          data?.data.filter(
            (article: Article) =>
              article.acf.contributing_author === selectedAuthor
          )
        )
      }
    } else {
      if (data?.data?.length > 0) {
        setFilteredArticles(
          data.data.filter((article: Article) => !article.sticky)
        )
      }
      setSelectedAuthor('')
    }
  }, [data?.data, authorParam, authors, selectedAuthor])

  // extract and populate list of authors (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allAuthorsSet = new Set()

    data?.data.forEach(
      (article: Article) =>
        article.acf.contributing_author &&
        allAuthorsSet.add(article.acf.contributing_author)
    )

    setAuthors(Array.from(allAuthorsSet) as string[])
  }, [data?.data])

  // extract and populate list of categories (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allCategoriesSet = new Set()

    data?.data.forEach((article: Article) => {
      if (article._embedded['wp:term'] !== undefined) {
        article._embedded['wp:term'][0].forEach((term: { name: string }) =>
          allCategoriesSet.add(term.name)
        )
      }
    })

    setCategories(Array.from(allCategoriesSet) as string[])
  }, [data?.data])

  // featured "sticky" articles
  const pinnedArticles = data?.data?.filter((post: Article) => post?.sticky)

  if (data?.data.length === 0) return <></>

  return (
    <div className='flex w-full flex-wrap'>
      <Helmet>
        <title>News - Health Equity Tracker</title>
      </Helmet>
      <div
        className='
        flex
        flex-wrap
        border-0
        border-b
        border-solid
        border-alt-grey
        px-5
        py-12
      '
      >
        <div
          className='
          hidden
          w-full
          flex-col
          flex-wrap
          md:block
          md:w-1/4
        '
        >
          <ArticleFilters filterType={'category'} filterOptions={categories} />
          <ArticleFilters filterType={'author'} filterOptions={authors} />
        </div>

        <div className='w-full md:w-3/4'>
          <div className='mx-10'>
            <div>
              <div>
                <h2
                  id='main'
                  style={{ color: `rgb(${altGreenRgb})` }}
                  className='
                    m-0
                    text-center
                    font-serif
                    text-bigHeader
                    font-light'
                >
                  News and Stories
                </h2>
              </div>
              <div>
                <p
                  className='
                    leading-6
                    text-left
                    font-sansText
                    text-title
                    font-light
                '
                >
                  We believe in the power of storytelling. The Health Equity
                  Tracker is designed to enable transformative change through
                  data, but we know that is only part of the picture. Here, you
                  will find news and stories from the Satcher Health Leadership
                  Institute, partners, guest authors, and other contributors
                  that go beyond the numbers to share insights and analysis into
                  the Health Equity movement.
                </p>

                <p
                  className='
                    leading-6
                    text-left
                    font-sansText
                    text-title
                    font-light
                '
                >
                  Health Equity is a transformative pursuit that empowers all
                  people: giving their voices the platform to be heard and their
                  experiences the visibility they deserve. We encourage your to{' '}
                  <LinkWithStickyParams to={SHARE_YOUR_STORY_TAB_LINK}>
                    share your story
                  </LinkWithStickyParams>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap justify-center'>
            <div className='m-10'>
              {/* show featured card with "sticky" articles marked PIN TO TOP if any */}
              {selectedAuthor?.length === 0 &&
                selectedCategory?.length === 0 && (
                  <PinnedArticles articles={pinnedArticles} />
                )}

              {/* if there is a filter in place, show breadcrumbs type menu */}
              {(selectedAuthor || selectedCategory) && (
                <>
                  <Link
                    to={NEWS_PAGE_LINK}
                    className='
                    leading-7
                    inline
                    px-4
                    py-1.5
                    font-sansText
                    text-small
                    font-medium
                    normal-case
                    tracking-wide
                    no-underline
                '
                  >
                    {ARTICLES_TERM}
                  </Link>
                  <span
                    className='
                      leading-7
                      inline
                      px-4
                      py-1.5
                      font-sansText
                      text-small
                      font-medium
                      normal-case
                      tracking-wide
                      no-underline
                  '
                  >
                    ›
                  </span>
                </>
              )}
              <span
                className='
                      leading-7
                      inline
                      px-4
                      py-1.5
                      font-sansText
                      text-small
                      font-medium
                      normal-case
                      tracking-wide
                      no-underline
                  '
              >
                {selectedAuthor?.length > 0 && `Author: ${selectedAuthor}`}
                {selectedCategory?.length > 0 &&
                  `Category: ${selectedCategory}`}
              </span>
            </div>

            {/* all posts matching client applied filters */}
            <div className='flex flex-wrap items-start justify-between'>
              {filteredArticles?.map((post: any) => {
                return (
                  <div className='w-full sm:w-1/2' key={post.id}>
                    <div className='my-4'>
                      <NewsPreviewCard article={post} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='flex flex-col justify-center'>
              {isLoading && (
                <>
                  <ArticlesSkeleton doPulse={true} />
                  <div className='m-10'>
                    <i>Updating articles...</i>
                  </div>
                </>
              )}
              {error && !isLoading && (
                <>
                  <div className='m-10'>
                    <i>Problem updating articles.</i>
                  </div>
                  <ArticlesSkeleton doPulse={false} />
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className='
            flex
            w-full
            flex-wrap
            content-center
            justify-around
            md:hidden
        '
        >
          <div className='w-full'>
            <div className='mt-16 border-0	border-t border-solid border-alt-grey p-4'></div>
          </div>
          <div className='flex w-full justify-center sm:w-1/2'>
            <ArticleFilters
              filterType={'category'}
              filterOptions={categories}
            />
          </div>
          <div className='flex w-full justify-center sm:w-1/2'>
            <ArticleFilters filterType={'author'} filterOptions={authors} />
          </div>
        </div>
      </div>

      <SignupSection />
    </div>
  )
}

export default AllPosts
