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
import { useLocation } from 'react-router-dom'

export default function NewsAndStoriesPage() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const { isLoading, error, data }: any = useQuery(
    blogUtils.ARTICLES_KEY,
    fetchNewsData,
    blogUtils.REACT_QUERY_OPTIONS,
  )

  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllArticles, setShowAllArticles] = useState(false)
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false)
  const isLgUp = useIsBreakpointAndUp('lg')
  const bgHeight = isLgUp ? '42rem' : '12rem'
  useEffect(() => {
    const authorParam = query.get('author')
    const categoryParam = query.get('category')

    if (authorParam) {
      const authors = authorParam.split(',').map(decodeURIComponent)
      setSelectedAuthors(authors)
    } else {
      setSelectedAuthors([])
    }

    if (categoryParam) {
      const categories = categoryParam.split(',').map(decodeURIComponent)
      setSelectedCategories(categories)
    } else {
      setSelectedCategories([])
    }
  }, [location.search])
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
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'
      >
        <h1
          id='main'
          className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'
        >
          News and Stories
        </h1>
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left leading-lhDefaultMobile md:leading-lhDefault'>
            We believe in the power of storytelling. The Health Equity Tracker
            is designed to enable transformative change through data, but we
            know that is only part of the picture. Here, you will find news and
            stories from the Satcher Health Leadership Institute, partners,
            guest authors, and other contributors that go beyond the numbers to
            share insights and analysis into the Health Equity movement.
          </p>

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

          {isLoading ? (
            <HetPostsLoading className='w-full mt-8' doPulse={!error} />
          ) : (
            <>
              {filteredArticles.length > 0 ? (
                <>
                  {filtersApplied ? (
                    <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full'>
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
                      <div className='grid grid-cols-1 lg:grid-cols-5 lg:gap-1 gap-4 w-full mt-8 smMd:gap-0'>
                        <>
                          <div className='col-span-1 lg:col-span-2 w-full smMd:mb-4 lg:mb-0'>
                            {firstFiveArticles[0] && (
                              <NewsAndStoriesPreviewCardOutlined
                                article={firstFiveArticles[0]}
                                bgHeight={bgHeight}
                                linkClassName='mx-0 lg:mr-2'
                              />
                            )}
                          </div>

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
