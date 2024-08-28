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

    if (currentPath === '/exploredata' && currentSearch === '' && !bannerClosed) {
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
    <section className='bg-infobarColor text-center p-4' aria-labelledby='banner-heading'>
      <div className='flex justify-between'>
        <div className='flex lg:flex-row flex-wrap items-center justify-start md:items-center lg:justify-start m-0 px-2'>
          <FlagIcon
            className='lg:visible hidden mr-2 text-alertColor'
            aria-hidden='true'
          />
          <p className='text-small p-0 my-0 text-left lg:mr-8' id='banner-heading'>
            <span className='font-sansTitle text-small lg:text-text font-bold m-0 p-0'>
              Major gaps in the data:
            </span>{' '}
            Structural racism causes health inequities. We’re closing these gaps to improve U.S. health policies.
          </p>
          <HetTextArrowLink
            link={`${METHODOLOGY_PAGE_LINK}/limitations#missing-data`}
            linkText='Learn more'
            containerClassName='block md:mx-2 md:my-0 mx-0 my-4'
            linkClassName='text-black'
          />
        </div>
        <IconButton
          onClick={handleClose}
          className='banner-close-button p-2.5 md:my-auto mb-auto'
          aria-label='Close banner'
          sx={{ borderRadius: 1 }}
        >
          <Close/>
        </IconButton>
      </div>
    </section>
  )
}

export default Banner