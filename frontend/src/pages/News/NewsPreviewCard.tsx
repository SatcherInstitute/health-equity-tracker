import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { getHtml } from '../../utils/urlutils'
import { type Article } from './NewsPage'
import LazyLoad from 'react-lazyload'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'

interface NewsPreviewCardProps {
  article: Article
}

export default function NewsPreviewCard(props: NewsPreviewCardProps) {
  const { article } = props

  return (
    <HetLinkButton
      href={`${NEWS_PAGE_LINK}/${article.slug}`}
      className='m-0 p-2 text-center text-title'
    >
      <div className='flex flex-nowrap justify-evenly'>
        <div className='flex w-9/12 flex-col items-center justify-center'>
          <LazyLoad once height={100} offset={300}>
            <img
              height='100'
              src={
                article?._embedded?.['wp:featuredmedia']?.[0]?.media_details
                  ?.sizes?.medium?.source_url || AppbarLogo
              }
              className='w-auto rounded-md'
              alt=''
            />
          </LazyLoad>

          <div className='mx-2'>
            <h3 className='m-0 text-center font-serif text-title font-light leading-lhSomeSpace'>
              {getHtml(article.title.rendered, true)}
            </h3>
          </div>
        </div>
      </div>
    </HetLinkButton>
  )
}
