import { useState } from 'react'
import LazyLoad from 'react-lazyload'
import AppbarLogo from '../../assets/AppbarLogo.png'
import HetLaunchLink from '../../styles/HetComponents/HetLaunchLink'
import { HetTags } from '../../styles/HetComponents/HetTags'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

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

  const handleOpen = () => {
    if (isVideo) {
      setOpen(true)
    }
  }

  const handleClose = () => setOpen(false)

  const getImageSource = (): string => imgSrc || AppbarLogo

  return (
    <>
      <div
        className='text-title no-underline text-left mr-4 max-w-80 flex-shrink-0 flex flex-col bg-white rounded-md hover:shadow-raised group border border-solid border-altGreen transition-all duration-300 ease-in-out h-full cursor-pointer'
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
        {isVideo ? (
          <div className='m-0 h-full flex flex-col justify-between'>
            {imgSrc ? (
              <div
                className='min-h-36 max-h-40 w-full bg-no-repeat bg-cover bg-center rounded-sm'
                style={{ backgroundImage: `url(${getImageSource()})` }}
              ></div>
            ) : (
              <iframe
                className='w-full rounded-md'
                height='200px'
                src={href}
                title={ariaLabel}
                loading='lazy'
                allow='accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture'
                allowFullScreen
              />
            )}
            <div className='flex flex-col h-auto p-4 text-center justify-between'>
              <p className='text-black text-text leading-lhSomeSpace md:block hidden my-2'>
                {description}
              </p>
              {readMoreHref && (
                <div className='flex flex-row w-full justify-start items-center gap-2 mb-4 py-0'>
                  <a
                    className='ml-auto leading-lhSomeSpace text-small font-medium no-underline'
                    aria-label={ariaLabel}
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
          <LazyLoad
            offset={300}
            once
            className='h-full flex flex-col justify-start my-0 py-0'
          >
            <div
              className='min-h-40 max-h-56 w-full bg-no-repeat bg-cover bg-center rounded-sm'
              style={{ backgroundImage: `url(${getImageSource()})` }}
            ></div>
            <div className='mx-4 mt-0 h-full flex flex-col justify-between'>
              <div className='flex flex-col justify-start h-full py-4'>
                {categories && <HetTags tags={categories} />}
                <h4 className='font-semibold text-text my-2 pt-0 leading-lhNormal text-altGreen'>
                  {title}
                </h4>
                {description && (
                  <p className='text-black text-smallest leading-lhSomeSpace md:block hidden my-0'>
                    {description}
                  </p>
                )}
              </div>
              {readMoreHref && (
                <div className='flex flex-row w-full justify-start items-center gap-2 mb-4 py-0'>
                  <a
                    className='ml-auto leading-lhSomeSpace text-small font-medium no-underline'
                    aria-label={ariaLabel}
                    href={readMoreHref}
                  >
                    Learn more
                  </a>
                  <HetLaunchLink href={readMoreHref} />
                </div>
              )}
            </div>
          </LazyLoad>
        )}
      </div>

      {isVideo && (
        <Modal open={open} onClose={handleClose}>
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
            <h4 className='font-semibold text-title my-8 leading-lhNormal text-altGreen text-center'>
              {title}
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
