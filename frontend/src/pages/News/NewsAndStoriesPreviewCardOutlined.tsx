import LazyLoad from 'react-lazyload'
import { Link } from 'react-router-dom'
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
      className={`h-full text-center text-title no-underline group flex flex-col bg-white rounded-md hover:shadow-raised group border border-solid border-altGreen transition-all duration-300 ease-in-out cursor-pointer ${linkClassName ?? 'mr-4'}`}
    >
      <LazyLoad once offset={300} className='h-full m-0 p-0'>
        <div className='m-0 h-full flex flex-col justify-between'>
          <div
            className='w-full bg-no-repeat bg-cover bg-center rounded-sm'
            style={{
              backgroundImage: `url(${getImageSource()})`,
              height: bgHeight,
            }}
          ></div>
          <div className='flex flex-col m-4 text-center justify-around h-auto'>
            <div className='flex flex-col justify-around h-full'>
              <HetTags tags={tagNames} />
              <h3 className='font-semibold text-text text-left my-2 pt-0 mt-8 leading-lhNormal text-altGreen'>
                {getHtml(article.title.rendered, true)}
              </h3>
            </div>
          </div>
        </div>
      </LazyLoad>
    </Link>
  )
}
