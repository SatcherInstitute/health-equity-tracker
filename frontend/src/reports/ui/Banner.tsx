import ArrowForward from '@mui/icons-material/ArrowForward'
import Close from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'

const LIMITATIONS_HREF = `${METHODOLOGY_PAGE_LINK}/limitations#missing-data`
const LIMITATIONS_LINK_TEXT = 'About Data Limitations'

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
      className='bg-infobar-color px-4 py-2 text-center lg:py-3'
      aria-label='Major gaps in the data'
    >
      <div className='flex items-center justify-between'>
        {/* Mobile / tablet: single inline paragraph */}
        <p className='m-0 px-2 text-left text-small md:hidden'>
          <span className='font-bold font-sans-title text-small'>
            Major gaps in the data:
          </span>{' '}
          Structural racism causes health inequities in the U.S.{' '}
          <a href={LIMITATIONS_HREF} className='text-alt-green underline'>
            {LIMITATIONS_LINK_TEXT}
          </a>
        </p>

        {/* Desktop: text + HetTextArrowLink on its own line */}
        <div className='hidden items-center justify-start px-2 md:flex md:flex-row'>
          <p className='my-0 p-0 text-left text-small lg:mr-8'>
            <span className='font-bold font-sans-title lg:text-text'>
              Major gaps in the data:
            </span>{' '}
            Structural racism causes health inequities. We&apos;re closing these
            gaps to improve U.S. health policies.
          </p>
          <a
            href={LIMITATIONS_HREF}
            className='mx-2 inline-flex items-center gap-0.5 whitespace-nowrap font-bold font-sans-title text-alt-green text-text no-underline'
          >
            {LIMITATIONS_LINK_TEXT}
            <ArrowForward fontSize='inherit' />
          </a>
        </div>

        <IconButton
          onClick={handleClose}
          className='banner-close-button self-center p-2.5'
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
