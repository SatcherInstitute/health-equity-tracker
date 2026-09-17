import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'

const Banner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const currentPath = window.location.pathname
    const currentSearch = window.location.search
    const bannerClosed = sessionStorage.getItem('bannerClosed')

    if (
      currentPath === '/exploredata' &&
      currentSearch === '' &&
      !bannerClosed
    ) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [window.location.pathname, window.location.search])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('bannerClosed', 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <section
      className='bg-infobar-color px-4 py-1 text-center md:px-4 md:py-2'
      aria-labelledby='banner-heading'
    >
      <div className='flex justify-between'>
        <p className='m-0 px-2 text-left text-small' id='banner-heading'>
          <span className='font-bold font-sans-title text-small lg:text-text'>
            Major gaps in the data:
          </span>{' '}
          <span className='md:hidden'>
            Structural racism causes health inequities in the U.S.{' '}
          </span>
          <span className='hidden md:inline'>
            Structural racism causes health inequities. We&apos;re closing these
            gaps to improve U.S. health policies.{' '}
          </span>
          <a
            href={`${METHODOLOGY_PAGE_LINK}/limitations#missing-data`}
            className='inline-flex items-center gap-1 font-bold font-sans-title text-alt-green no-underline'
          >
            <span className='md:hidden'>About data limitations</span>
            <span className='hidden md:inline'>
              Learn more about the data limitations
            </span>
            <ArrowForward className='text-text' />
          </a>
        </p>
        <IconButton
          onClick={handleClose}
          className='banner-close-button self-start p-2.5 md:self-center'
          aria-label='Close banner'
          sx={{ borderRadius: 1 }}
        >
          <Close />
        </IconButton>
      </div>
    </section>
  )
}

export default Banner
