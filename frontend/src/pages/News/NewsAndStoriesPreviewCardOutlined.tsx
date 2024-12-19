import LazyLoad from 'react-lazyload';
import { Link } from 'react-router-dom';
import AppbarLogo from '../../assets/AppbarLogo.png';
import { HetTags } from '../../styles/HetComponents/HetTags';
import { NEWS_PAGE_LINK } from '../../utils/internalRoutes';
import { getHtml } from '../../utils/urlutils';
import type { Article } from './ArticleTypes';

interface NewsAndStoriesPreviewCardOutlinedProps {
  article: Article;
  bgHeight?: string;
  linkClassName?: string;
}

export default function NewsAndStoriesPreviewCardOutlined({
  article,
  bgHeight = '10rem',
  linkClassName = '',
}: NewsAndStoriesPreviewCardOutlinedProps): JSX.Element {
  const getImageSource = (): string => {
    const imageSource =
      article?._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full
        ?.source_url;
    return imageSource || AppbarLogo;
  };

  const tagNames =
    article?._embedded?.['wp:term']?.[0]?.map((term) => term.name) || [];

  // Transform tagNames into the expected structure for HetTags
  const tags = tagNames.map((tag) => ({ name: tag }));

  return (
    <Link
      to={`${NEWS_PAGE_LINK}/${article.slug}`}
      className={`group group flex h-full cursor-pointer flex-col rounded-md border border-altGreen border-solid bg-white text-center text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised ${linkClassName ?? 'mr-4'}`}
    >
      <LazyLoad once offset={300} className="m-0 h-full p-0">
        <div className="m-0 flex h-full flex-col justify-between">
          <div
            className="w-full rounded-sm bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${getImageSource()})`,
              height: bgHeight,
            }}
          ></div>
          <div className="m-4 flex h-auto flex-col justify-around text-center">
            <div className="flex h-full flex-col justify-around">
              {/* Pass the transformed tags array */}
              <HetTags tags={tags} />
              <h3 className="my-2 mt-8 pt-0 text-left font-semibold text-altGreen text-text leading-lhNormal">
                {getHtml(article.title.rendered, true)}
              </h3>
            </div>
          </div>
        </div>
      </LazyLoad>
    </Link>
  );
}