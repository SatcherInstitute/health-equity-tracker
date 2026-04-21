import type React from 'react'
import AppbarLogo from '../../assets/AppbarLogo.png'
import HetLazyLoader from '../../styles/HetComponents/HetLazyLoader'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { SATCHER_NEWS_PAGE } from '../../utils/blogUtils'
import type { WebflowArticle } from './ArticleTypes'

interface WebflowNewsPreviewCardProps {
  article: WebflowArticle
  bgHeight?: string
}

export default function WebflowNewsPreviewCard({
  article,
  bgHeight = '10rem',
}: WebflowNewsPreviewCardProps): React.ReactElement {
  const imageSource = article.thumbnail ?? AppbarLogo
  const tags = article.tags.map((name) => ({ name }))
  const articleUrl = `${SATCHER_NEWS_PAGE}/${article.slug}`

  return (
    <article
      className={
        'group flex h-full flex-col rounded-md border border-alt-green border-solid bg-white text-center text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised'
      }
    >
      <HetLazyLoader once offset={300} className='m-0 h-full p-0'>
        <div className='relative m-0 flex h-full flex-col justify-between'>
          <div
            className='relative overflow-hidden rounded-t-md'
            style={{ height: bgHeight }}
          >
            <div
              className='absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-300 ease-in-out group-hover:scale-110'
              style={{ backgroundImage: `url(${imageSource})` }}
            />
          </div>
          <h2 className='mx-4 mt-8 pt-0 text-left font-semibold text-alt-green text-text leading-normal'>
            <a
              href={articleUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='no-underline group-hover:underline'
            >
              {article.title}
            </a>
          </h2>
          <div className='m-4 flex flex-col justify-end'>
            <HetTags tags={tags} />
          </div>
        </div>
      </HetLazyLoader>
    </article>
  )
}
