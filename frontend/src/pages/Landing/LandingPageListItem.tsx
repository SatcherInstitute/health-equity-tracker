import { useState } from 'react'
import HetLazyLoader from '../../styles/HetComponents/HetLazyLoader'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import {
  EXPLORE_DATA_PAGE_LINK,
  WARM_WELCOME_DEMO_SETTING,
} from '../../utils/internalRoutes'

interface LandingPageListItemProps {
  title: string
  description: string
  videoSrc?: string
  youtubeId?: string
  itemNumber?: number
  customClassName?: string
  prefersReducedMotion: boolean
}

export default function LandingPageListItem({
  title,
  description,
  videoSrc,
  youtubeId,
  itemNumber,
  customClassName,
  prefersReducedMotion,
}: LandingPageListItemProps) {
  const [embedLoaded, setEmbedLoaded] = useState(false)

  return (
    <li
      className={`sticky top-[0] mx-24 my-12 flex h-auto xs:h-auto min-h-[55vh] min-w-full list-none xs:flex-col items-center justify-around rounded-xl bg-alt-white p-8 xs:px-4 xs:py-2 shadow-raised sm:flex-col sm:p-8 lg:flex-row xl:flex-row ${customClassName}`}
    >
      <div className='mx-4 flex w-1/3 xs:w-auto flex-col justify-between sm:w-auto md:w-auto'>
        <p className='xs:my-0 xs:py-0 text-left font-bold font-sans-title text-alt-green text-small'>
          {itemNumber}/4
        </p>
        <div className='mb-4 xs:mb-0 w-full min-w-1/2'>
          <h4 className='my-2 font-medium font-sans-title text-smallest-header xs:text-title md:text-left'>
            {title}
          </h4>
          <p className='mb-8 xs:mb-4 xs:text-small sm:text-small md:text-left'>
            {description}
          </p>
          <HetTextArrowLink
            link={`${EXPLORE_DATA_PAGE_LINK}${WARM_WELCOME_DEMO_SETTING}`}
            linkText='Take a guided tour'
          />
        </div>
      </div>
      <div className='flex h-auto w-full items-center justify-center'>
        {youtubeId ? (
          embedLoaded ? (
            <iframe
              className='mx-auto xs:h-[25vh] max-h-[40vh] w-full max-w-[60vw] rounded-md sm:h-[25vh] md:h-[25vh] lg:min-h-[40vh] xl:min-h-[40vh]'
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title='YouTube video player'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          ) : (
            <button
              type='button'
              aria-label='Play video'
              className='group relative mx-auto block xs:h-[25vh] max-h-[40vh] w-full max-w-[60vw] cursor-pointer overflow-hidden rounded-md border-0 p-0'
              onClick={() => setEmbedLoaded(true)}
            >
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt='Video thumbnail'
                className='h-full w-full object-cover'
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30'>
                <svg
                  viewBox='0 0 68 48'
                  className='h-12 w-20 drop-shadow-lg'
                  aria-hidden='true'
                >
                  <path
                    d='M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z'
                    fill='#f00'
                  />
                  <path d='M45 24 27 14v20' fill='#fff' />
                </svg>
              </div>
            </button>
          )
        ) : (
          <HetLazyLoader offset={300} once>
            <video
              autoPlay={!prefersReducedMotion}
              loop
              muted
              playsInline
              className='h-auto max-h-[40vh] min-h-[30vh] w-full'
            >
              <source src={videoSrc} type='video/mp4' />
            </video>
          </HetLazyLoader>
        )}
      </div>
    </li>
  )
}
