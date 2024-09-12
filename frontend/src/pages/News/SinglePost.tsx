import { Skeleton } from '@mui/material'
import { useState, useEffect } from 'react'
import { getHtml } from '../../utils/urlutils'
import {
  fetchNewsData,
  ARTICLES_KEY,
  REACT_QUERY_OPTIONS,
} from '../../utils/blogUtils'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import hetLogo from '../../assets/AppbarLogo.png'
import SignupSection from '../ui/SignupSection'
import ShareButtons, {
  ARTICLE_DESCRIPTION,
} from '../../reports/ui/ShareButtons'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetPaginationButton from '../../styles/HetComponents/HetPaginationButton'
import HetCTABig from '../../styles/HetComponents/HetCTABig'
import { Link, useParams, useNavigate } from 'react-router-dom'
import type { Article } from './ArticleTypes'

function prettyDate(dateString: string) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options as any)
}

export default function SinglePost() {
  const navigate = useNavigate()

  const [fullArticle, setFullArticle] = useState<Article>()
  const [prevArticle, setPrevArticle] = useState<Article>()
  const [nextArticle, setNextArticle] = useState<Article>()

  const { slug }: { slug?: string } = useParams()

  function goNext() {
    if (nextArticle) {
      navigate(NEWS_PAGE_LINK + '/' + nextArticle.slug)
    }
  }

  function goPrevious() {
    if (prevArticle) {
      navigate(NEWS_PAGE_LINK + '/' + prevArticle.slug)
    }
  }

  // FETCH ARTICLES
  const { data, isLoading, isError } = useQuery(
    ARTICLES_KEY,
    fetchNewsData,
    REACT_QUERY_OPTIONS,
  )

  // on page load, get prev, full, next article based on fullArticle URL slug
  useEffect(() => {
    if (data?.data) {
      const fullArticleIndex = data.data.findIndex(
        (article: Article) => article.slug === slug,
      )
      setFullArticle(data.data[fullArticleIndex])
      // previous and next articles wrap around both ends of the array
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

    paginationButtons.forEach(button => {
      const buttonText = button.textContent || ''
      button.textContent = truncateText(buttonText, 42)
    })
  }, [prevArticle, nextArticle])

  return (
    <>
      <Helmet>
        <title>{`News${
          fullArticle ? ` - ${fullArticle?.title?.rendered}` : ''
        } - Health Equity Tracker`}</title>
        {/* if cross-posted from external site, should be input on WP as canonical_url */}
        {fullArticle && (
          <link
            rel='canonical'
            href={fullArticle.acf?.canonical_url ?? fullArticle.link}
          />
        )}
        <meta name='description' content={ARTICLE_DESCRIPTION} />
      </Helmet>

      {/* PAGE CONTENT */}
      <div className='flex flex-wrap justify-center text-left text-title leading-lhSomeMoreSpace'>
        {/* HEADER ROW */}
        <div
          className='
            flex
            w-full
            flex-row
            flex-wrap
            items-center
            justify-center
            border-0
            border-b
            border-solid
            border-borderColor px-10
            md:px-0
        '
        >
          {/* IMAGE SECTION OF HEADER OR LOADING INDICATOR */}
          <div className='flex w-10/12 items-center justify-center md:w-1/3'>
            {isLoading && (
              <Skeleton
                width={300}
                height={300}
                animation='wave'
                className='m-10'
              ></Skeleton>
            )}
            {isError && (
              <img
                src={hetLogo}
                className='mt-8 h-auto w-3/5 max-w-md rounded-md object-contain md:mt-0 md:max-h-articleLogo'
                alt={''}
                width={200}
                height={100}
              />
            )}
            {!isLoading && !isError && articleImage && (
              <img
                src={articleImage}
                className='mt-8 hidden h-auto w-3/5 max-w-md rounded-md object-contain sm:block md:mt-0 md:max-h-articleLogo'
                alt={articleImageAltText}
                width={200}
                height={100}
              />
            )}
          </div>

          {/* TEXT SECTION OF HEADER */}
          <div
            className='
              flex
              w-full
              flex-col
              flex-wrap
              justify-center
              border-0
              border-solid
              border-borderColor
              px-16
              pt-8
              md:w-2/3
              md:border-l
              md:px-16
              md:py-24
          '
          >
            {/* ARTICLE TITLE OR LOADING INDICATOR */}
            <div
              className='
              m-auto
              flex
              w-full
              flex-wrap
              justify-start
              pb-4
              text-left
              font-serif
              text-smallHeader
              font-light
              leading-lhTight
              text-altGreen sm:text-header md:text-bigHeader

            '
            >
              {isLoading ? (
                <>
                  <Skeleton animation='wave' width={'100%'} height={'60'} />
                  <Skeleton animation='wave' width={'100%'} height={'60'} />
                </>
              ) : (
                getHtml(fullArticle?.title?.rendered ?? '')
              )}
            </div>

            {/* AUTHOR(S) OR LOADING OR NOTHING */}
            <div className='text-start text-text text-altDark'>
              {fullArticle?.acf?.contributing_author ? (
                <>
                  Authored by{' '}
                  <Link
                    className='cursor-pointer'
                    to={`${NEWS_PAGE_LINK}?author=${fullArticle.acf.contributing_author}`}
                  >
                    {fullArticle.acf.contributing_author}
                  </Link>
                </>
              ) : isLoading ? (
                <Skeleton></Skeleton>
              ) : (
                <></>
              )}

              {fullArticle?.acf?.contributing_author &&
              fullArticle?.acf?.post_nominals
                ? `, ${fullArticle.acf.post_nominals}`
                : ''}
              {fullArticle?.acf?.additional_contributors ? (
                <div className='text-start text-text text-altDark'>
                  Contributors: {fullArticle.acf.additional_contributors}
                </div>
              ) : (
                ''
              )}
            </div>

            {/* PUBLISH DATE WITH LOADING INDICATOR */}
            <div className='text-start text-text text-altDark'>
              {fullArticle?.date ? (
                <>Published {prettyDate(fullArticle.date)}</>
              ) : (
                <Skeleton width='50%'></Skeleton>
              )}
            </div>

            {/* OPTIONAL ARTICLE CATEGORIES */}
            {articleCategories ? (
              <div className='text-start text-text text-altDark'>
                Categorized under:{' '}
                {articleCategories.map((categoryChunk, i) => (
                  <span key={categoryChunk.id}>
                    <Link
                      to={`${NEWS_PAGE_LINK}?category=${categoryChunk.name}`}
                    >
                      {categoryChunk.name}
                    </Link>
                    {i < articleCategories.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <Skeleton width='50%'></Skeleton>
            )}

            {/* SOCIAL MEDIA ICONS */}
            <div className='w-full py-6 text-left md:w-1/4'>
              <ShareButtons isMobile={false} article={fullArticle} />
            </div>
          </div>
        </div>

        {/* ARTICLE CONTENT SECTION */}
        <article className='fetched-wordpress-html m-20 flex min-h-preload-article w-full flex-col break-words'>
          {/* RENDER WP ARTICLE HTML */}
          {fullArticle ? (
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: fullArticle.content?.rendered }}
            />
          ) : (
            <Skeleton
              animation='wave'
              width={'100%'}
              height={'100%'}
              className='m-10'
            />
          )}

          {/* OPTIONALLY RENDER CONTINUE READING BUTTON */}
          {fullArticle?.acf?.full_article_url && (
            <div>
              <HetCTABig
                href={fullArticle.acf.full_article_url}
                className='mt-10'
              >
                Continue Reading
                {fullArticle?.acf?.friendly_site_name
                  ? ` on ${fullArticle.acf.friendly_site_name}`
                  : ''}{' '}
                <OpenInNewIcon />
              </HetCTABig>
            </div>
          )}

          {/* OPTIONALLY RENDER REPRINT NOTICE */}
          <div className='mt-10'>
            <div className='text-left font-sansText text-text font-medium'>
              {fullArticle?.acf?.canonical_url && (
                <span className='text-small italic'>
                  Note: this article was originally published on{' '}
                  <a href={fullArticle?.acf?.canonical_url}>another site</a>,
                  and is reprinted here with permission.
                </span>
              )}
            </div>
          </div>
        </article>

        {/* PREV / NEXT ARTICLES NAV */}
        <div className='mx-10 grid max-w-md grid-cols-1 items-center justify-center border-0 border-t border-solid border-altGrey pt-24 md:grid-cols-3'>
          {prevArticle && (
            <HetPaginationButton
              direction='previous'
              onClick={() => {
                goPrevious()
              }}
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
              onClick={() => {
                goNext()
              }}
              data-pagination-content='true'
            >
              {getHtml(nextArticle?.title?.rendered ?? '')}
            </HetPaginationButton>
          )}
        </div>
        {/* EMAIL SIGNUP  */}
        <SignupSection />
      </div>
    </>
  )
}