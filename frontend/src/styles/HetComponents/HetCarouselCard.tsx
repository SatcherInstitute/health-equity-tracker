import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
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
  const cardRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => {
    if (isVideo) {
      setOpen(true)
    }
  }

  const handleClose = () => setOpen(false)

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
      <div
        ref={cardRef}
        className='group mr-4 flex h-full max-w-tiny flex-shrink-0 cursor-pointer flex-col rounded-md border border-altGreen border-solid bg-white text-left text-title no-underline transition-all duration-300 ease-in-out hover:shadow-raised'
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleOpen()
          }
        }}
        // biome-ignore lint/a11y/useSemanticElements: <explanation>
        role='button'
        tabIndex={0}
        aria-label={ariaLabel}
      >
        {isVisible && (
          <>
            {isVideo ? (
              <div className='m-0 flex h-full flex-col justify-between'>
                {imgSrc ? (
                  <div
                    className='max-h-40 min-h-36 w-full rounded-sm bg-center bg-cover bg-no-repeat'
                    style={{ backgroundImage: `url(${getImageSource()})` }}
                  />
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
                    <h4 className='my-2 pt-0 font-semibold text-altGreen text-text leading-lhNormal'>
                      {ariaLabel}
                    </h4>
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
                <div
                  className='h-36 max-h-40 w-full rounded-sm bg-center bg-cover bg-no-repeat'
                  style={{ backgroundImage: `url(${getImageSource()})` }}
                />
                <div className='mx-4 mt-0 flex min-h-52 flex-col justify-between'>
                  <div className='flex h-full flex-col justify-start py-4'>
                    {categories && <HetTags tags={categories} />}
                    <h4 className='my-2 pt-0 font-semibold text-altGreen text-text leading-lhNormal'>
                      {title}
                    </h4>
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
      </div>

      {isVideo && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby='video-modal-title'
        >
          <Box
            className='modal-container'
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70vw',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: '8px',
              p: 4,
              outline: 'none',
            }}
          >
            <h4
              id='video-modal-title'
              className='my-8 text-center font-semibold text-altGreen text-title leading-lhNormal'
            >
              {ariaLabel}
            </h4>
            <iframe
              className='w-full rounded-md'
              height='500px'
              src={href}
              title={ariaLabel}
              loading='lazy'
              allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
              allowFullScreen
            />
            <Button onClick={handleClose}>Close</Button>
          </Box>
        </Modal>
      )}
    </>
  )
}
