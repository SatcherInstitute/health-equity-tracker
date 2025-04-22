import { useEffect, useRef, useState } from 'react'
import AppbarLogo from '../../assets/AppbarLogo.png'
import HetLaunchLink from '../../styles/HetComponents/HetLaunchLink'
import { HetTags } from '../../styles/HetComponents/HetTags'

interface HetCarouselCardProps {
  href: string
  ariaLabel: string
  imgSrc: string
  imgAlt: string
  title: string
  description?: string
  readMoreHref?: string
  categories?: string[]
  isVideo?: boolean
}

export function HetCarouselCard({
  href,
  ariaLabel,
  imgSrc,
  title,
  description,
  readMoreHref,
  categories,
  isVideo = false,
}: HetCarouselCardProps) {
  const [open, setOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const handleOpen = () => {
    if (isVideo) {
      setOpen(true)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }
  }

  const handleClose = () => {
    setOpen(false)
    document.body.style.overflow = 'auto' // Restore scrolling
  }

  const getImageSource = (): string => imgSrc || AppbarLogo

  // IntersectionObserver logic for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <>
      <article
        ref={cardRef}
        className='group mr-4 flex h-full max-w-tiny flex-shrink-0 flex-col rounded-md border border-altGreen border-solid bg-white text-left text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised'
      >
        {isVisible && (
          <>
            {isVideo ? (
              <div className='m-0 flex h-full flex-col justify-between'>
                {imgSrc ? (
                  <button
                    type='button'
                    onClick={handleOpen}
                    className='cursor-pointer border-none bg-transparent p-0'
                    aria-label={`Open video: ${ariaLabel}`}
                  >
                    <div
                      className='max-h-40 min-h-36 w-full rounded-sm bg-center bg-cover bg-no-repeat'
                      style={{ backgroundImage: `url(${getImageSource()})` }}
                    />
                  </button>
                ) : (
                  <iframe
                    rel='noopener noreferrer'
                    className='w-full rounded-md'
                    height='200px'
                    src={href}
                    title={ariaLabel}
                    loading='lazy'
                    allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
                    allowFullScreen
                  />
                )}
                <div className='flex h-52 flex-col justify-around px-4 pt-0 pb-4 text-center'>
                  <div className='mt-0 flex h-full flex-col justify-start pt-2'>
                    <button
                      type='button'
                      onClick={handleOpen}
                      className='cursor-pointer border-none bg-transparent p-0 text-left'
                      aria-label={`Open video: ${ariaLabel}`}
                    >
                      <h3 className='my-2 pt-0 font-semibold text-altGreen text-text leading-lhNormal'>
                        {ariaLabel}
                      </h3>
                    </button>
                    <p className='my-2 hidden text-left text-black text-small leading-lhSomeSpace md:block'>
                      {description}
                    </p>
                  </div>
                  {readMoreHref && (
                    <div className='mb-4 flex w-full flex-row items-center justify-start gap-2 py-0'>
                      <a
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ml-auto font-medium text-small leading-lhSomeSpace no-underline'
                        aria-label={`Learn more about ${ariaLabel}`}
                        href={readMoreHref}
                      >
                        Learn more
                      </a>
                      <HetLaunchLink href={readMoreHref} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='my-0 flex h-full flex-col justify-start py-0'>
                <a
                  href={href}
                  aria-label={ariaLabel}
                  className='cursor-pointer no-underline'
                >
                  <div
                    className='h-36 max-h-40 w-full rounded-sm bg-center bg-cover bg-no-repeat'
                    style={{ backgroundImage: `url(${getImageSource()})` }}
                  />
                </a>
                <div className='mx-4 mt-0 flex min-h-52 flex-col justify-between'>
                  <div className='flex h-full flex-col justify-start py-4'>
                    {categories && <HetTags tags={categories} />}
                    <a
                      href={href}
                      aria-label={ariaLabel}
                      className='cursor-pointer no-underline'
                    >
                      <h4 className='my-2 pt-0 font-semibold text-altGreen text-text leading-lhNormal'>
                        {title}
                      </h4>
                    </a>
                    {description && (
                      <p className='my-0 hidden text-black text-smallest leading-lhSomeSpace md:block'>
                        {description}
                      </p>
                    )}
                  </div>
                  {readMoreHref && (
                    <div className='mb-4 flex w-full flex-row items-center justify-start gap-2 py-0'>
                      <a
                        className='ml-auto font-medium text-small leading-lhSomeSpace no-underline'
                        aria-label={`Learn more about ${ariaLabel}`}
                        href={readMoreHref}
                      >
                        Learn more
                      </a>
                      <HetLaunchLink href={readMoreHref} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </article>

      {/* Custom modal using HTML and Tailwind instead of MUI */}
      {isVideo && open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-4/5 max-w-6xl rounded-lg bg-white p-6 shadow-xl'>
            <button
              onClick={handleClose}
              type='button'
              className='absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300'
              aria-label='Close modal'
            >
              ×
            </button>

            <h4 className='mb-6 text-center font-semibold text-altGreen text-title leading-lhNormal'>
              {ariaLabel}
            </h4>

            <div className='aspect-video w-full'>
              <iframe
                className='h-full w-full rounded-md'
                src={href}
                title={ariaLabel}
                loading='lazy'
                allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
                allowFullScreen
              />
            </div>

            <div className='mt-6 flex justify-end'>
              <button
                onClick={handleClose}
                type='button'
                className='rounded-md bg-altGreen px-4 py-2 text-white hover:bg-opacity-90'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
