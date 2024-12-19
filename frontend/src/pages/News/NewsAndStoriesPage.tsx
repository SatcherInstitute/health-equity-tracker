import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import * as blogUtils from '../../utils/blogUtils'
import { fetchNewsData } from '../../utils/blogUtils'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import type { Article } from './ArticleTypes'
import CheckboxDropdown from './CheckboxDropdown'
import NewsAndStoriesPreviewCardOutlined from './NewsAndStoriesPreviewCardOutlined'

export default function NewsAndStoriesPage() {
  const { isLoading, error, data }: any = useQuery(
    blogUtils.ARTICLES_KEY,
    fetchNewsData,
    blogUtils.REACT_QUERY_OPTIONS,
  )
  const [searchParams] = useSearchParams()
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllArticles, setShowAllArticles] = useState(false)
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false)
  const isLgUp = useIsBreakpointAndUp('lg')
  const bgHeight = isLgUp ? '42rem' : '12rem'

  // Fetch and process articles
  useEffect(() => {
    if (data?.data) {
      const articles = data.data
      setAllArticles(articles)

      const authorSet = new Set<string>()
      const categorySet = new Set<string>()

      articles.forEach((article: Article) => {
        if (article.acf?.contributing_author) {
          authorSet.add(article.acf.contributing_author)
        }
        if (article._embedded?.['wp:term']) {
          article._embedded['wp:term'][0]?.forEach((term: { name: string }) =>
            categorySet.add(term.name),
          )
        }
      })

      const sortedAuthors = Array.from(authorSet).sort((a, b) =>
        a.localeCompare(b),
      )
      const sortedCategories = Array.from(categorySet).sort((a, b) =>
        a.localeCompare(b),
      )

      setAuthors(sortedAuthors)
      setCategories(sortedCategories)
    }
  }, [data?.data])

  // Apply filters from URL on load
  useEffect(() => {
    const category = searchParams.get('category')
    const author = searchParams.get('author')

    if (category) {
      setSelectedCategories([category])
    }
    if (author) {
      setSelectedAuthors([author])
    }
  }, [searchParams])

  const filteredArticles =
    allArticles.filter((article: Article) => {
      const matchesAuthor =
        selectedAuthors.length === 0 ||
        selectedAuthors.includes(article.acf?.contributing_author)
      const matchesCategory =
        selectedCategories.length === 0 ||
        article._embedded?.['wp:term'][0]?.some((term: { name: string }) =>
          selectedCategories.includes(term.name),
        )
      return matchesAuthor && matchesCategory
    }) || []

  const filtersApplied =
    selectedAuthors.length > 0 || selectedCategories.length > 0

  const firstFiveArticles = filteredArticles.slice(0, 5)
  const remainingArticles = filteredArticles.slice(5)

  const handleAuthorChange = (selected: string[]) => {
    setSelectedAuthors(selected)
    setShowAllArticles(false)
  }

  const handleCategoryChange = (selected: string[]) => {
    setSelectedCategories(selected)
    setShowAllArticles(false)
  }

  const handleResetFilters = () => {
    setSelectedAuthors([])
    setSelectedCategories([])
    setShowAllArticles(false)
  }

  const handleLoadAllArticles = () => {
    setLoadingMoreArticles(true)

    setTimeout(() => {
      setShowAllArticles(true)
      setLoadingMoreArticles(false)
    }, 1000)
  }

  return (
    <>
      <Helmet>
        <title>News and Stories - Health Equity Tracker</title>
      </Helmet>

      <section
        id='main-content'
        className='mx-auto flex w-svw max-w-lgXl flex-col justify-center px-8 py-16'
      >
        <h2
          id='main'
          className='font-bold font-sansTitle text-altGreen text-bigHeader leading-lhNormal'
        >
          News and Stories
        </h2>
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            We believe in the power of storytelling. The Health Equity Tracker
            is designed to enable transformative change through data, but we
            know that is only part of the picture. Here, you will find news and
            stories from the Satcher Health Leadership Institute, partners,
            guest authors, and other contributors that go beyond the numbers to
            share insights and analysis into the Health Equity movement.
          </p>

          <div className='mt-4 flex w-full flex-col gap-4 md:flex-row'>
            <CheckboxDropdown
              label='Authors'
              options={authors.map((author) => ({
                value: author,
                label: author,
              }))}
              selectedOptions={selectedAuthors}
              onSelectionChange={handleAuthorChange}
            />
            <CheckboxDropdown
              label='Categories'
              options={categories.map((category) => ({
                value: category,
                label: category,
              }))}
              selectedOptions={selectedCategories}
              onSelectionChange={handleCategoryChange}
            />
          </div>

          {isLoading ? (
            <HetPostsLoading className='mt-8' doPulse={!error} />
          ) : (
            <>
              {filteredArticles.length > 0 ? (
                <>
                  {filtersApplied ? (
                    <div className='mt-8 grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                      {filteredArticles.map((article: Article) => (
                        <div key={article.id} className='w-full'>
                          <NewsAndStoriesPreviewCardOutlined
                            article={article}
                            bgHeight='12rem'
                            linkClassName='w-full'
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className='mt-8 grid w-full grid-cols-1 gap-4 smMd:gap-0 lg:grid-cols-5 lg:gap-1'>
                        <>
                          <div className='col-span-1 w-full smMd:mb-4 lg:col-span-2 lg:mb-0'>
                            {firstFiveArticles[0] && (
                              <NewsAndStoriesPreviewCardOutlined
                                article={firstFiveArticles[0]}
                                bgHeight={bgHeight}
                                linkClassName='mx-0 lg:mr-2'
                              />
                            )}
                          </div>

                          <div className='col-span-1 mb-4 grid grid-cols-1 gap-4 smMd:grid-cols-2 md:col-span-3 lg:mb-0'>
                            {firstFiveArticles
                              .slice(1)
                              .map((article: Article) => (
                                <NewsAndStoriesPreviewCardOutlined
                                  key={article.id}
                                  article={article}
                                  bgHeight='12rem'
                                />
                              ))}
                          </div>
                        </>
                      </div>

                      {showAllArticles && (
                        <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:mt-8 lg:grid-cols-3'>
                          {remainingArticles.map((article: Article) => (
                            <NewsAndStoriesPreviewCardOutlined
                              key={article.id}
                              article={article}
                              bgHeight='12rem'
                            />
                          ))}
                        </div>
                      )}

                      {loadingMoreArticles && (
                        <div className='mt-8 w-full'>
                          <HetPostsLoading doPulse={!error} />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className='mt-8 text-center text-gray-500'>
                  No articles found.
                </p>
              )}
            </>
          )}

          <div className='mt-8 flex w-full justify-center'>
            {filtersApplied ? (
              <HetLinkButton
                onClick={handleResetFilters}
                className='px-0 py-0 text-center font-bold leading-lhNormal'
                buttonClassName='mx-auto py-4 px-8'
              >
                Reset Filters
              </HetLinkButton>
            ) : (
              !showAllArticles &&
              remainingArticles.length > 0 && (
                <HetLinkButton
                  onClick={handleLoadAllArticles}
                  className='px-0 py-0 text-center font-bold leading-lhNormal'
                  buttonClassName='mx-auto py-4 px-8'
                >
                  Load All Articles
                </HetLinkButton>
              )
            )}
          </div>
        </section>
      </section>
    </>
  )
}