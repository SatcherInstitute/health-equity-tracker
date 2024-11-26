import { Helmet } from 'react-helmet-async'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import type { Article } from './ArticleTypes'
import { useQuery } from 'react-query'
import * as blogUtils from '../../utils/blogUtils'
import { fetchNewsData } from '../../utils/blogUtils'
import NewsAndStoriesPreviewCardOutlined from './NewsAndStoriesPreviewCardOutlined'
import CheckboxDropdown from './CheckboxDropdown'
import { useState, useEffect } from 'react'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
export default function NewsAndStoriesPage() {
  const { isLoading, error, data }: any = useQuery(
    blogUtils.ARTICLES_KEY,
    fetchNewsData,
    blogUtils.REACT_QUERY_OPTIONS,
  )

  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllArticles, setShowAllArticles] = useState(false)
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false)
  const isLgUp = useIsBreakpointAndUp('lg')
  const bgHeight = isLgUp ? '42rem' : '12rem'

  // Extract authors and categories from all articles
  useEffect(() => {
    if (data?.data) {
      const authorSet = new Set<string>()
      const categorySet = new Set<string>()

      data.data.forEach((article: Article) => {
        if (article.acf?.contributing_author) {
          authorSet.add(article.acf.contributing_author)
        }
        if (article._embedded?.['wp:term']) {
          article._embedded['wp:term'][0]?.forEach((term: { name: string }) =>
            categorySet.add(term.name),
          )
        }
      })

      setAuthors(Array.from(authorSet))
      setCategories(Array.from(categorySet))
    }
  }, [data?.data])

  // Filtering logic
  const filteredArticles =
    data?.data?.filter((article: Article) => {
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

  // Determine if filters are applied
  const filtersApplied =
    selectedAuthors.length > 0 || selectedCategories.length > 0

  // Split articles into first five and remaining if no filters are applied
  const firstFiveArticles = filtersApplied ? [] : filteredArticles.slice(0, 5)
  const remainingArticles = filtersApplied
    ? filteredArticles
    : filteredArticles.slice(5)

  const handleAuthorChange = (selected: string[]) => {
    setSelectedAuthors(selected)
    setShowAllArticles(false) // Reset to show only first five when filters change
  }

  const handleCategoryChange = (selected: string[]) => {
    setSelectedCategories(selected)
    setShowAllArticles(false) // Reset to show only first five when filters change
  }

  const handleResetFilters = () => {
    setSelectedAuthors([])
    setSelectedCategories([])
    setShowAllArticles(false)
  }

  const handleLoadAllArticles = () => {
    setLoadingMoreArticles(true)
    // Simulate a delay to represent data fetching
    setTimeout(() => {
      setShowAllArticles(true)
      setLoadingMoreArticles(false)
    }, 1000) // Adjust the delay as needed
  }

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
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            We believe in the power of storytelling. The Health Equity Tracker
            is designed to enable transformative change through data, but we
            know that is only part of the picture. Here, you will find news and
            stories from the Satcher Health Leadership Institute, partners,
            guest authors, and other contributors that go beyond the numbers to
            share insights and analysis into the Health Equity movement.
          </p>

          {/* Author and Category Filters */}
          <div className='flex flex-col md:flex-row gap-4 w-full mt-4'>
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

          {/* Displaying Articles */}
          {isLoading ? (
            <HetPostsLoading className='w-full mt-8' doPulse={!error} />
          ) : (
            <>
              {filteredArticles.length > 0 ? (
                <>
                  {filtersApplied ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
                      {filteredArticles.map((article: Article) => (
                        <NewsAndStoriesPreviewCardOutlined
                          key={article.id}
                          article={article}
                          bgHeight='12rem'
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Default view with featured article and next four */}
                      {/* First 5 Articles Section */}
                      <div className='grid grid-cols-1 lg:grid-cols-5 lg:gap-1 gap-4 w-full mt-8 smMd:gap-0'>
                        <>
                          {/* Featured Article */}
                          <div className='col-span-1 lg:col-span-2 w-full smMd:mb-4'>
                            {firstFiveArticles[0] && (
                              <NewsAndStoriesPreviewCardOutlined
                                article={firstFiveArticles[0]}
                                bgHeight={bgHeight}
                                linkClassName='smMd:mx-0 w-[28rem]'
                              />
                            )}
                          </div>

                          {/* Next Four Articles */}
                          <div className='col-span-1 md:col-span-3 grid smMd:grid-cols-2 grid-cols-1 gap-4 lg:mb-0 mb-4'>
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

                      {/* Remaining Articles */}
                      {showAllArticles && (
                        <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:mt-8'>
                          {remainingArticles.map((article: Article) => (
                            <NewsAndStoriesPreviewCardOutlined
                              key={article.id}
                              article={article}
                              bgHeight='12rem'
                            />
                          ))}
                        </div>
                      )}

                      {/* Loading Spinner for Remaining Articles */}
                      {loadingMoreArticles && (
                        <div className='mt-8'>
                          <HetPostsLoading
                            className='w-full'
                            doPulse={!error}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className='text-center text-gray-500 mt-8'>
                  No articles found.
                </p>
              )}
            </>
          )}

          {/* Bottom Centered Button */}
          <div className='flex justify-center w-full mt-8'>
            {filtersApplied ? (
              <HetLinkButton
                onClick={handleResetFilters}
                className='font-bold text-center leading-lhNormal py-0 px-0'
                buttonClassName='mx-auto py-4 px-8'
              >
                Reset Filters
              </HetLinkButton>
            ) : (
              !showAllArticles &&
              remainingArticles.length > 0 && (
                <HetLinkButton
                  onClick={handleLoadAllArticles}
                  className='font-bold text-center leading-lhNormal py-0 px-0'
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
