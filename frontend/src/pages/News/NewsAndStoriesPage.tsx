import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetPostsLoading from '../../styles/HetComponents/HetPostsLoading'
import * as blogUtils from '../../utils/blogUtils'
import { fetchNewsData } from '../../utils/blogUtils'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import type { Article } from './ArticleTypes'
import CheckboxDropdown from './CheckboxDropdown'
import NewsAndStoriesPreviewCardOutlined from './NewsAndStoriesPreviewCardOutlined'

interface AuthorItem {
  value: string
  label: string
}

export default function NewsAndStoriesPage() {
  const { isLoading, error, data }: any = useQuery({
    queryKey: [blogUtils.ARTICLES_KEY],
    queryFn: fetchNewsData,
    ...blogUtils.REACT_QUERY_OPTIONS,
  })

  const [searchParams] = useSearchParams()
  const [allArticles, setAllArticles] = useState<Article[]>([])

  const [authors, setAuthors] = useState<AuthorItem[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllArticles, setShowAllArticles] = useState(false)
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false)
  const isMdAndUp = useIsBreakpointAndUp('md')
  const isLgAndUp = useIsBreakpointAndUp('lg')
  const bgHeight = isLgAndUp ? '42rem' : '12rem'

  useEffect(() => {
    if (data?.data) {
      const articles = data.data
      setAllArticles(articles)

      const authorMap = new Map<string, string>()
      const categorySet = new Set<string>()

      articles.forEach((article: Article) => {
        if (article.acf?.contributing_author) {
          const fullAuthor = article.acf.contributing_author.trim()

          if (!authorMap.has(fullAuthor)) {
            const truncated =
              !isMdAndUp && fullAuthor.length > 27
                ? `${fullAuthor.substring(0, 27)}...`
                : fullAuthor

            authorMap.set(fullAuthor, truncated)
          }
        }

        if (article._embedded?.['wp:term']) {
          article._embedded['wp:term'][0]?.forEach((term: { name: string }) => {
            categorySet.add(term.name)
          })
        }
      })

      const authorItems: AuthorItem[] = Array.from(authorMap.entries()).map(
        ([value, label]) => ({ value, label }),
      )
      authorItems.sort((a, b) => a.label.localeCompare(b.label))

      const sortedCategories = Array.from(categorySet).sort((a, b) =>
        a.localeCompare(b),
      )

      setAuthors(authorItems)
      setCategories(sortedCategories)
    }
  }, [data?.data, isMdAndUp])

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
      const fullAuthor = article.acf?.contributing_author
      const matchesAuthor =
        selectedAuthors.length === 0 ||
        (fullAuthor && selectedAuthors.includes(fullAuthor))

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
      <title>News and Stories - Health Equity Tracker</title>

      <section
        id='main-content'
        className='mx-auto flex w-svw max-w-lg-xl flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-bold font-sans-title text-alt-green text-big-header leading-lh-normal'
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

          <div className='mt-4 flex w-full flex-col gap-4 md:flex-row'>
            <CheckboxDropdown
              label='Authors'
              options={authors.map((a) => ({
                value: a.value,
                label: a.label,
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
                            {firstFiveArticles.slice(1).map((article) => (
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
                className='px-0 py-0 text-center font-bold leading-lh-normal'
                buttonClassName='mx-auto py-4 px-8'
              >
                Reset Filters
              </HetLinkButton>
            ) : (
              !showAllArticles &&
              remainingArticles.length > 0 && (
                <HetLinkButton
                  onClick={handleLoadAllArticles}
                  className='px-0 py-0 text-center font-bold leading-lh-normal'
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
