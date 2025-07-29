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
  iframeSrc?: string
  itemNumber?: number
  customClassName?: string
  prefersReducedMotion: boolean
}

export default function LandingPageListItem({
  title,
  description,
  videoSrc,
  iframeSrc,
  itemNumber,
  customClassName,
  prefersReducedMotion,
}: LandingPageListItemProps) {
  return (
    <li
      className={`sticky top-[0] mx-24 my-12 flex h-auto xs:h-auto min-h-[55vh] min-w-full list-none xs:flex-col items-center justify-around rounded-xl bg-white p-8 xs:px-4 xs:py-2 shadow-raised sm:flex-col sm:p-8 lg:flex-row xl:flex-row ${customClassName}`}
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
      <div className='h-auto w-full'>
        {iframeSrc ? (
          <iframe
            className='xs:h-[25vh] max-h-[40vh] w-full max-w-[60vw] rounded-md sm:h-[25vh] md:h-[25vh] lg:min-h-[40vh] xl:min-h-[40vh]'
            src={iframeSrc}
            title='YouTube video player'
            loading='lazy'
            allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
            allowFullScreen
          ></iframe>
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
