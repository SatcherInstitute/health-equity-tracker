import type React from 'react'
import { useState, useEffect } from 'react'
import FlagIcon from '@mui/icons-material/Flag'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import { IconButton } from '@mui/material'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { Close } from '@mui/icons-material'

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
      className='bg-infobarColor p-4 text-center'
      aria-labelledby='banner-heading'
    >
      <div className='flex justify-between'>
        <div className='m-0 flex flex-wrap items-center justify-start px-2 md:items-center lg:flex-row lg:justify-start'>
          <FlagIcon
            className='mr-2 hidden text-alertColor lg:visible'
            aria-hidden='true'
          />
          <p
            className='my-0 p-0 text-left text-small lg:mr-8'
            id='banner-heading'
          >
            <span className='m-0 p-0 font-bold font-sansTitle text-small lg:text-text'>
              Major gaps in the data:
            </span>{' '}
            Structural racism causes health inequities. We’re closing these gaps
            to improve U.S. health policies.
          </p>
          <HetTextArrowLink
            link={`${METHODOLOGY_PAGE_LINK}/limitations#missing-data`}
            linkText='Learn more about the data limitations'
            containerClassName='block md:mx-2 md:my-0 mx-0 my-4'
            linkClassName='text-black'
          />
        </div>
        <IconButton
          onClick={handleClose}
          className='banner-close-button mb-auto p-2.5 md:my-auto'
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
