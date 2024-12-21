import LazyLoad from 'react-lazyload'
import { Link, useNavigate } from 'react-router-dom'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import { getHtml } from '../../utils/urlutils'
import type { Article } from './ArticleTypes'

interface NewsAndStoriesPreviewCardOutlinedProps {
  article: Article
  bgHeight?: string
  linkClassName?: string
}

export default function NewsAndStoriesPreviewCardOutlined({
  article,
  bgHeight = '10rem',
  linkClassName = '',
}: NewsAndStoriesPreviewCardOutlinedProps): JSX.Element {
  const navigate = useNavigate()
  const getImageSource = (): string => {
    const imageSource =
      article?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full
        ?.source_url
    return imageSource || AppbarLogo
  }

  const tagNames =
    article?._embedded?.['wp:term']?.[0]?.map((term) => term.name) || []

  const tags = tagNames.map((tag) => ({ name: tag }))
  const handleTagClick = (tagName: string) => {
    navigate(`${NEWS_PAGE_LINK}?category=${encodeURIComponent(tagName)}`)
  }
  return (
    <div
      className={`group flex h-full flex-col rounded-md border border-altGreen border-solid bg-white text-center text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised ${linkClassName ?? 'mr-4'}`}
    >
      <LazyLoad once offset={300} className='m-0 h-full p-0'>
        <div className='relative m-0 flex h-full flex-col justify-between'>
          <div
            className='relative overflow-hidden rounded-t-md'
            style={{ height: bgHeight }}
          >
            <div
              className='absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-300 ease-in-out group-hover:scale-110'
              style={{
                backgroundImage: `url(${getImageSource()})`,
              }}
            ></div>
          </div>
          <h3 className='mx-4 mt-8 pt-0 text-left font-semibold text-altGreen text-text leading-lhNormal'>
            <Link
              to={`${NEWS_PAGE_LINK}/${article.slug}`}
              className='no-underline group-hover:underline'
            >
              {getHtml(article.title.rendered, true)}
            </Link>
          </h3>

          <div className='m-4 flex flex-col justify-end'>
            <HetTags tags={tags} onTagClick={handleTagClick} />
          </div>
        </div>
      </LazyLoad>
    </div>
  )
}
