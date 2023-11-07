import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { getHtml, ReactRouterLinkButton } from '../../utils/urlutils'
import { type Article } from './NewsPage'
import LazyLoad from 'react-lazyload'

interface NewsPreviewCardProps {
  article: Article
  arrow?: 'prev' | 'next'
}

export default function NewsPreviewCard(props: NewsPreviewCardProps) {
  const { article } = props

  return (
    <ReactRouterLinkButton
      url={`${NEWS_PAGE_LINK}/${article.slug}`}
      className='font-title m-0 p-4 text-center'
    >
      <div className='flex flex-nowrap justify-evenly'>
        {/* Optional "Left/Previous" Arrow */}
        <div className='flex w-1/12 flex-col items-center justify-center'>
          {props.arrow === 'prev' ? (
            <div className='font-serif text-bigHeader font-medium'>«</div>
          ) : (
            ' '
          )}
        </div>

        <div className='flex w-9/12 flex-col items-center justify-center'>
          <LazyLoad once height={100} offset={300}>
            <img
              height='100'
              src={
                article?._embedded?.['wp:featuredmedia']?.[0]?.media_details
                  ?.sizes?.medium?.source_url || AppbarLogo
              }
              className='max-h-28 w-auto rounded-md'
              alt=''
            />
          </LazyLoad>

          <div className='mx-2'>
            <h3
              className='
              font-title
              m-0
              p-4
              text-center
              font-serif
              text-title
              font-light
              leading-lhModalHeading
          '
            >
              {getHtml(article.title.rendered, true)}
            </h3>
          </div>
        </div>

        {/* Optional "Right/Next" Arrow */}
        <div className='flex w-1/12 flex-col items-center justify-center'>
          {props.arrow === 'next' ? (
            <div className='font-serif text-bigHeader font-medium'>»</div>
          ) : (
            ' '
          )}
        </div>
      </div>
    </ReactRouterLinkButton>
  )
}
