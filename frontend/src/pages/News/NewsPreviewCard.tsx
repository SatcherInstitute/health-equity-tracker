import { NEWS_PAGE_LINK } from '../../utils/internalRoutes'
import AppbarLogo from '../../assets/AppbarLogo.png'
import { getHtml } from '../../utils/urlutils'
import { type Article } from './NewsPage'
import LazyLoad from 'react-lazyload'

interface NewsPreviewCardProps {
  article: Article
}

export default function NewsPreviewCard(props: NewsPreviewCardProps): JSX.Element {
  const { article } = props

  const getImageSource = (): string => {
    const imageSource = article?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full?.source_url
    return imageSource || AppbarLogo
  }

  const CategoryNames: React.FC<{ article: Article }> = ({ article }) => {
    const categoryNames = article?._embedded?.['wp:term']?.[0]?.map(term => term.name) || [];

    return (
      <div className='flex flex-wrap mt-2'>
        {categoryNames.map((name, index) => (
          <span key={index} className="category-span text-[10px] uppercase text-[#282c25] font-sansTitle font-bold bg-ashgray30 rounded-sm py-1 px-2 mr-2 mt-1">
            {name}
          </span>
        ))}
      </div>
    );
  };

  return (
<<<<<<< HEAD
    <a
      href={`${NEWS_PAGE_LINK}/${article.slug}`}
      className='h-full text-center text-title no-underline '
    >
      <LazyLoad once offset={300}>
        <div className='mx-8 0 flex flex-col items-left rounded-md hover:scale-105 hover:transition-transform hover:duration-30 '>
          <div className='news-preview-card-image min-h-40 h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm shadow-raised-tighter mb-4 ' style={{ backgroundImage: `url(${getImageSource()})` }} >
          </div>

          <CategoryNames article={article} />
          <h3 className='p-0 text-left font-sansText text-text font-bold text-black leading-lhSomeMoreSpace'>
            {getHtml(article.title.rendered, true)}
          </h3>
        </div>
      </LazyLoad>
    </a >
=======
    <div className='mx-8 0 flex flex-col items-left rounded-md '>
      <a
        href={`${NEWS_PAGE_LINK}/${article.slug}`}
        className='h-full text-center text-title no-underline '
      ><LazyLoad once offset={300}>
          <div className='news-preview-card-image min-h-40 h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm shadow-raised-tighter mb-4 hover:scale-105 hover:transition-transform hover:duration-30 ' style={{ backgroundImage: `url(${getImageSource()})` }} >
          </div>

        </LazyLoad>
      </a>
      <CategoryNames article={article} />
      <h3 className='p-0 text-left font-sansText text-text font-bold text-black leading-lhSomeMoreSpace'>
        {getHtml(article.title.rendered, true)}
      </h3>
    </div>
>>>>>>> bcfcb135 (news section refresh)
  )
}