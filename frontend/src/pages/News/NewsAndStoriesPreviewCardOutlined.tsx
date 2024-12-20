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
  const navigate = useNavigate();
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
    navigate(`${NEWS_PAGE_LINK}?category=${encodeURIComponent(tagName)}`);
  };
  return (
    <div
      className={`group group flex h-full cursor-pointer flex-col rounded-md border border-altGreen border-solid bg-white text-center text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised ${linkClassName ?? 'mr-4'}`}
    >
      <LazyLoad once offset={300} className='m-0 h-full p-0'>
        <div className='m-0 flex h-full flex-col justify-between'>
          <div
            className='w-full rounded-sm bg-center bg-cover bg-no-repeat'
            style={{
              backgroundImage: `url(${getImageSource()})`,
              height: bgHeight,
            }}
          ></div>
          <div className='m-4 flex h-auto flex-col justify-around text-center'>
            <div className='flex h-full flex-col justify-around'>
              <HetTags tags={tags} onTagClick={handleTagClick}/>
              <h3 className='my-2 mt-8 pt-0 text-left font-semibold text-altGreen text-text leading-lhNormal no-underline'>
                <Link
                  to={`${NEWS_PAGE_LINK}/${article.slug}`}
                  className='no-underline hover:underline'
                >
                  {getHtml(article.title.rendered, true)}
                </Link>
              </h3>
            </div>
          </div>
        </div>
      </LazyLoad>
    </div>
  )
}