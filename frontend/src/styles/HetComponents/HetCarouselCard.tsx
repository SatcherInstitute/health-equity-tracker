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
        className='group max-w-tiny border-alt-green bg-alt-white text-title hover:shadow-raised mr-4 flex h-full shrink-0 flex-col overflow-hidden rounded-md border border-solid text-left no-underline transition-all duration-300 ease-in-out'
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
                      className='max-h-40 min-h-36 w-full rounded-sm bg-cover bg-center bg-no-repeat'
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
                      <h3 className='text-alt-green text-text my-2 pt-0 leading-normal font-semibold'>
                        {ariaLabel}
                      </h3>
                    </button>
                    <p className='text-alt-black text-small leading-some-space my-2 hidden text-left md:block'>
                      {description}
                    </p>
                  </div>
                  {readMoreHref && (
                    <div className='mb-4 flex w-full flex-row items-center justify-start gap-2 py-0'>
                      {/* biome-ignore lint/a11y/noAmbiguousAnchorText: accessible name comes from the dynamic aria-label, which Biome can't evaluate statically */}
                      <a
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-small leading-some-space ml-auto font-medium no-underline'
                        aria-label={`Learn more about ${ariaLabel}`}
                        href={readMoreHref}
                      >
                        Learn more
                      </a>
                      <HetLaunchLink
                        svgClassName='flex my-auto text-text'
                        href={readMoreHref}
                      />
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
                    className='h-36 max-h-40 w-full rounded-sm bg-cover bg-center bg-no-repeat'
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
                      <h4 className='text-alt-green text-text my-2 pt-0 leading-normal font-semibold'>
                        {title}
                      </h4>
                    </a>
                    {description && (
                      <p className='text-alt-black text-smallest leading-some-space my-0 hidden md:block'>
                        {description}
                      </p>
                    )}
                  </div>
                  {readMoreHref && (
                    <div className='mb-4 flex w-full flex-row items-center justify-start gap-2 py-0'>
                      {/* biome-ignore lint/a11y/noAmbiguousAnchorText: accessible name comes from the dynamic aria-label, which Biome can't evaluate statically */}
                      <a
                        className='text-small leading-some-space ml-auto font-medium no-underline'
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
        <div className='bg-alt-black bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center'>
          <div className='bg-alt-white relative w-4/5 max-w-6xl rounded-lg p-6 shadow-xl'>
            <button
              onClick={handleClose}
              type='button'
              className='bg-bg-color text-alt-dark hover:bg-alt-gray absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full'
              aria-label='Close modal'
            >
              ×
            </button>

            <h4 className='text-alt-green text-title mb-6 text-center leading-normal font-semibold'>
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
                className='bg-alt-green text-alt-white hover:bg-opacity-90 rounded-md px-4 py-2'
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
