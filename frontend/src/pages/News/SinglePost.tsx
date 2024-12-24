import { Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import hetLogo from '../../assets/AppbarLogo.png'
import ShareButtons, {
  ARTICLE_DESCRIPTION,
} from '../../reports/ui/ShareButtons'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetModal from '../../styles/HetComponents/HetModal'
import { HetOverline } from '../../styles/HetComponents/HetOverline'
import HetPaginationButton from '../../styles/HetComponents/HetPaginationButton'
import { HetTags } from '../../styles/HetComponents/HetTags'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import {
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
  fetchNewsData,
} from '../../utils/blogUtils'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { getHtml } from '../../utils/urlutils'
import type { Article } from './ArticleTypes'

interface Tag {
  name: string
  link?: string
}

const standardizeTags = (tags: (string | Tag)[]): Tag[] =>
  tags.map((tag) => (typeof tag === 'string' ? { name: tag } : tag))

function prettyDate(dateString: string) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options as any)
}

export default function SinglePost() {
  const [isModalOpen, setModalOpen] = useState(false)
  const handleModalOpen = () => setModalOpen(true)
  const handleModalClose = () => setModalOpen(false)
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  const [fullArticle, setFullArticle] = useState<Article>()
  const [prevArticle, setPrevArticle] = useState<Article>()
  const [nextArticle, setNextArticle] = useState<Article>()

  function goNext() {
    if (nextArticle) {
      navigate(`${NEWS_PAGE_LINK}/${nextArticle.slug}`)
    }
  }

  function goPrevious() {
    if (prevArticle) {
      navigate(`${NEWS_PAGE_LINK}/${prevArticle.slug}`)
    }
  }

  const { data, isLoading, isError } = useQuery(
    [ARTICLES_KEY, slug],
    fetchNewsData,
    REACT_QUERY_OPTIONS,
  )

  useEffect(() => {
    if (data?.data) {
      const fullArticleIndex = data.data.findIndex(
        (article: Article) => article.slug === slug,
      )
      setFullArticle(data.data[fullArticleIndex])
      setPrevArticle(
        data.data[
          fullArticleIndex - 1 >= 0
            ? fullArticleIndex - 1
            : data.data.length - 1
        ],
      )
      setNextArticle(data.data[(fullArticleIndex + 1) % data.data.length])
    }
  }, [data?.data, slug])

  const articleCategories = fullArticle?._embedded?.['wp:term']?.[0]

  const articleImage =
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes
      ?.large?.source_url ??
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes
      ?.full?.source_url

  const articleImageAltText =
    fullArticle?._embedded?.['wp:featuredmedia']?.[0]?.alt_text ?? ''

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  useEffect(() => {
    const paginationButtons = document.querySelectorAll(
      '[data-pagination-content="true"]',
    )
    paginationButtons.forEach((button) => {
      const buttonText = button.textContent || ''
      button.textContent = truncateText(buttonText, 42)
    })
  }, [prevArticle, nextArticle])

  return (
    <div key={slug}>
      <Helmet>
        <title>{`News${
          fullArticle ? ` - ${fullArticle?.title?.rendered}` : ''
        } - Health Equity Tracker`}</title>
        {fullArticle && (
          <link
            rel='canonical'
            href={fullArticle.acf?.canonical_url ?? fullArticle.link}
          />
        )}
        <meta name='description' content={ARTICLE_DESCRIPTION} />
      </Helmet>

      <div className='flex flex-wrap justify-center text-left text-title leading-lhSomeMoreSpace'>
        <div className='mx-2 flex w-full flex-col-reversereverse items-center justify-between smMd:mx-16 md:flex-row md:px-0'>
          <div className='flex h-auto w-full flex-col px-4 md:px-16 lg:px-24'>
            {fullArticle?.date ? (
              <HetOverline text={prettyDate(fullArticle.date)} />
            ) : (
              <Skeleton width='50%' />
            )}
            <div className='flex w-full flex-wrap justify-start py-2 text-left font-bold font-sansTitle text-altGreen text-header xs:text-smallestHeader leading-lhNormal smMd:py-8 md:text-bigHeader'>
              {isLoading ? (
                <>
                  <Skeleton animation='wave' width='100%' height='60' />
                  <Skeleton animation='wave' width='100%' height='60' />
                </>
              ) : (
                getHtml(fullArticle?.title?.rendered ?? '')
              )}
            </div>

            <div className='group text-start font-medium text-altDark text-text'>
              {fullArticle?.acf?.contributing_author ? (
                <>
                  by{' '}
                  <Link
                    className='my-2 cursor-pointer text-center text-text no-underline group-hover:underline md:my-4 md:text-left'
                    to={`${NEWS_PAGE_LINK}?author=${encodeURIComponent(
                      fullArticle.acf.contributing_author,
                    )}`}
                  >
                    {fullArticle.acf.contributing_author}
                  </Link>
                </>
              ) : isLoading ? (
                <Skeleton />
              ) : null}

              {fullArticle?.acf?.contributing_author &&
              fullArticle?.acf?.post_nominals
                ? `, ${fullArticle.acf.post_nominals}`
                : ''}
              {fullArticle?.acf?.additional_contributors && (
                <div className='text-start text-altDark text-text'>
                  Contributors: {fullArticle.acf.additional_contributors}
                </div>
              )}
            </div>

            <div className='w-full py-6 pb-0 text-left'>
              <ShareButtons isMobile={false} article={fullArticle} />
            </div>
          </div>

          <button
            className='hidden w-1/2 appearance-none items-center justify-center rounded-sm border-none bg-transparent py-16 outline-none focus:outline-none smMd:flex'
            onClick={handleModalOpen}
            type='button'
            style={{ cursor: articleImage ? 'pointer' : 'default' }}
            disabled={!articleImage}
            aria-label='Open image in modal'
          >
            {isLoading && (
              <Skeleton
                width={300}
                height={300}
                animation='wave'
                className='m-10'
              />
            )}
            {isError && (
              <img
                src={hetLogo}
                className='mt-8 h-auto w-3/5 max-w-md rounded-md object-contain md:mt-0 md:max-h-articleLogo'
                alt=''
                width={200}
                height={100}
              />
            )}
            {!isLoading && !isError && articleImage && (
              <div
                aria-label={articleImageAltText}
                className='hidden h-56 w-full rounded-md bg-center bg-cover bg-no-repeat shadow-raised-tighter smMd:block md:h-96'
                style={{
                  backgroundImage: `url(${articleImage})`,
                  backgroundClip: 'border-box',
                  borderRadius: '8px',
                }}
              ></div>
            )}
          </button>

          {articleImage && (
            <HetModal
              open={isModalOpen}
              onClose={handleModalClose}
              imageUrl={articleImage}
              altText={articleImageAltText}
            />
          )}
        </div>

        <article className='fetched-wordpress-html m-8 flex min-h-preload-article w-full flex-col break-words md:m-20'>
          {fullArticle ? (
            getHtml(fullArticle.content?.rendered ?? '')
          ) : (
            <Skeleton
              animation='wave'
              width='100%'
              height='100%'
              className='m-10'
            />
          )}

          {fullArticle?.acf?.full_article_url && (
            <div>
              <HetTextArrowLink
                link={fullArticle.acf.full_article_url}
                linkText={`Continue Reading${
                  fullArticle?.acf?.friendly_site_name
                    ? ` on ${fullArticle.acf.friendly_site_name}`
                    : ''
                }`}
                containerClassName='my-2'
                linkClassName='flex items-center'
                textClassName='mr-2'
              />
            </div>
          )}

          <div className='mt-4 text-left font-medium font-sansText text-text'>
            {fullArticle?.acf?.canonical_url && (
              <span className='text-small italic'>
                Note: this article was originally published on{' '}
                <a href={fullArticle?.acf?.canonical_url}>another site</a>, and
                is reprinted here with permission.
              </span>
            )}
          </div>

          {articleCategories ? (
            <div className='text-start text-altDark text-text'>
              Tagged:
              <HetTags
                tags={standardizeTags(
                  articleCategories.map((categoryChunk) => ({
                    name: categoryChunk.name,
                    link: `${NEWS_PAGE_LINK}?category=${encodeURIComponent(
                      categoryChunk.name,
                    )}`,
                  })),
                )}
              />
            </div>
          ) : (
            <Skeleton width='50%' />
          )}
        </article>

        <div className='mx-10 mb-10 grid max-w-md grid-cols-1 items-center justify-center border-0 border-altGrey border-t border-solid pt-10 md:grid-cols-3'>
          {prevArticle && (
            <HetPaginationButton
              direction='previous'
              onClick={goPrevious}
              data-pagination-content='true'
            >
              {getHtml(prevArticle?.title?.rendered ?? '')}
            </HetPaginationButton>
          )}

          <p className='text-center'>
            <HetLinkButton href={NEWS_PAGE_LINK}>All Posts</HetLinkButton>
          </p>

          {nextArticle && (
            <HetPaginationButton
              direction='next'
              onClick={goNext}
              data-pagination-content='true'
            >
              {getHtml(nextArticle?.title?.rendered ?? '')}
            </HetPaginationButton>
          )}
        </div>
      </div>
    </div>
  )
}
