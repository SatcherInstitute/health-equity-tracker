import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { getHtml } from '../../utils/urlutils'
import LazyLoad from 'react-lazyload'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { Link } from 'react-router-dom'
import type { Article } from './ArticleTypes'

interface NewsPreviewCardProps {
  article: Article
}

export default function NewsPreviewCard(
  props: NewsPreviewCardProps,
): JSX.Element {
  const { article } = props

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
      className='h-full text-center text-title no-underline '
    >
      <LazyLoad once offset={300}>
        <div className='0 items-left mx-8 flex flex-col rounded-md hover:scale-105 hover:transition-transform hover:duration-30 '>
          <div
            className='news-preview-card-image mb-4 h-56 min-h-40 w-full rounded-sm bg-center bg-cover bg-no-repeat shadow-raised-tighter '
            style={{ backgroundImage: `url(${getImageSource()})` }}
          ></div>

          <HetTags tags={tagNames} />
          <h3 className='p-0 text-left font-bold font-sansText text-black text-text leading-lhSomeMoreSpace'>
            {getHtml(article.title.rendered, true)}
          </h3>
        </div>
      </LazyLoad>
    </Link>
  )
}
