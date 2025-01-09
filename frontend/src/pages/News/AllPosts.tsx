import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import {
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  fetchNewsData,
} from '../../utils/blogUtils'
import { useUrlSearchParams } from '../../utils/urlutils'
import type { Article } from './ArticleTypes'
import NewsAndStoriesPreviewCardOutlined from './NewsAndStoriesPreviewCardOutlined'

export const ARTICLES_TERM = 'Articles'

function AllPosts() {
  // articles matching client applied filters (author, category, etc)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('')

  const categoryParam: string | null = useUrlSearchParams().get('category')
  const authorParam: string | null = useUrlSearchParams().get('author')

  const { isLoading, error, data }: any = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS,
  )

  useEffect(() => {
    // filter articles by category query param if present
    if (categoryParam) {
      setSelectedCategory(
        categories.find((category: string) => {
          return category === categoryParam
        }) as string,
      )
      setSelectedAuthor('')

      if (selectedCategory && data?.data) {
        setFilteredArticles(
          data.data.filter((article: Article) =>
            article._embedded['wp:term'][0]?.some(
              (term: { name: string }) => term.name === selectedCategory,
            ),
          ),
        )
      }
    } else {
      if (data?.data?.length > 0) {
        setFilteredArticles(
          data.data.filter((article: Article) => !article.sticky),
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
        }) as string,
      )
      setSelectedCategory('')

      if (selectedAuthor) {
        setFilteredArticles(
          data?.data.filter(
            (article: Article) =>
              article.acf.contributing_author === selectedAuthor,
          ),
        )
      }
    } else {
      if (data?.data?.length > 0) {
        setFilteredArticles(
          data.data.filter((article: Article) => !article.sticky),
        )
      }
      setSelectedAuthor('')
    }
  }, [data?.data, authorParam, authors, selectedAuthor])

  // extract and populate list of authors (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allAuthorsSet = new Set()

    data?.data?.forEach(
      (article: Article) =>
        article.acf.contributing_author &&
        allAuthorsSet.add(article.acf.contributing_author),
    )

    setAuthors(Array.from(allAuthorsSet) as string[])
  }, [data?.data])

  // extract and populate list of categories (from ALL posts, not just filtered ones)
  useEffect(() => {
    const allCategoriesSet = new Set()

    data?.data?.forEach((article: Article) => {
      if (article._embedded['wp:term'] !== undefined) {
        article._embedded['wp:term'][0].forEach((term: { name: string }) =>
          allCategoriesSet.add(term.name),
        )
      }
    })

    setCategories(Array.from(allCategoriesSet) as string[])
  }, [data?.data])
  return (
    <div className='flex w-full flex-wrap justify-center'>
      <Helmet>
        <title>News - Health Equity Tracker</title>
      </Helmet>

      <div className='w-full md:w-3/4'>
        <div className='flex flex-wrap justify-center'>
          <div className='m-10 flex w-full justify-start'>
            <span className='inline px-4 py-1.5 font-medium font-sansText text-small normal-case tracking-wide no-underline '>
              {selectedAuthor?.length > 0 && `Author: ${selectedAuthor}`}
              {selectedCategory?.length > 0 && `Category: ${selectedCategory}`}
            </span>
          </div>

          {/* all posts matching client applied filters */}
          <div className='flex flex-wrap items-start justify-between'>
            {filteredArticles?.slice(5, -1).map((post: any) => {
              return (
                <div
                  className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4'
                  key={post.id}
                >
                  <div className='my-4'>
                    <NewsAndStoriesPreviewCardOutlined article={post} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className='flex flex-wrap items-start justify-between'>
            {isLoading && (
              <>
                <HetPostsLoading
                  doPulse={true}
                  className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4'
                />
                <div className='m-10'>
                  <i>Updating articles...</i>
                </div>
              </>
            )}
            {error && !isLoading && (
              <div className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4'>
                <div className='m-10'>
                  <i>Problem updating articles.</i>
                </div>
                <HetPostsLoading doPulse={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllPosts
