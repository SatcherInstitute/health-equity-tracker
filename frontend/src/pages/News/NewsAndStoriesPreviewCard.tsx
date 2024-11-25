import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { getHtml } from '../../utils/urlutils'
import LazyLoad from 'react-lazyload'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { Link } from 'react-router-dom'
import type { Article } from './ArticleTypes'

interface NewsAndStoriesPreviewCardProps {
  article: Article
  divClassName?: string
}

export default function NewsAndStoriesPreviewCard({
  article,
  divClassName = '',
}: NewsAndStoriesPreviewCardProps): JSX.Element {
  const getImageSource = (): string => {
    const imageSource =
      article?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full
        ?.source_url
    return imageSource || AppbarLogo
  }

  const tagNames =
    article?._embedded?.['wp:term']?.[0]?.map((term) => term.name) || []

  return (
    <Link
      to={`${NEWS_PAGE_LINK}/${article.slug}`}
      className='h-full text-center text-title no-underline group'
    >
      <LazyLoad once offset={300}>
        <div
          className={`flex flex-col items-left rounded-md hover:scale-105 hover:transition-transform hover:duration-30 ${
            !divClassName ? 'mx-8' : divClassName
          }`}
        >
          <div
            className='min-h-40 h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm shadow-raised-tighter mb-4 relative flex flex-col justify-end'
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) 15%, rgba(0, 0, 0, 0.8) 84%), url(${getImageSource()})`,
            }}
          >
            <h4 className='pl-2 text-left font-sansText text-text font-bold text-white leading-lhNormal group-hover:underline'>
              {getHtml(article.title.rendered, true)}
            </h4>
          </div>
        </div>
      </LazyLoad>
    </Link>
  )
}
