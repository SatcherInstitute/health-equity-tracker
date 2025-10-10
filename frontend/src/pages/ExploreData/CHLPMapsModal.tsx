import { Button, Dialog, DialogContent } from '@mui/material'
import { type SetStateAction, useEffect, useState } from 'react'
import { het } from '../../styles/DesignTokens'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetGalleryDotNav from '../../styles/HetComponents/HetGalleryDotNav'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsModal() {
  const [modalIsOpen, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)
  const [currentMapIndex, setCurrentMapIndex] = useState(0)

  const mapData = [
    {
      id: 1,
      title: 'HIV Exposure and Transmission Offenses',
      imageUrl: '/img/graphics/exposure_and_transmission_offenses.png',
    },
    {
      id: 2,
      title: 'Sex Work Penalty Enhancements',
      imageUrl: '/img/graphics/sex_work_penalty_ehancements.png',
    },
    {
      id: 3,
      title: 'Bodily Fluid Penalty Enhancements',
      imageUrl: '/img/graphics/bodily_fluid_penalty_enhancements.png',
    },
    {
      id: 4,
      title: 'General Criminal Law Penalty Enhancements',
      imageUrl: '/img/graphics/general_criminal_law_penalty_enhancements.png',
    },
    {
      id: 5,
      title: 'Needle/Syringe Sharing Penalty Enhancements',
      imageUrl: '/img/graphics/needle_syringe_sharing_penalty_enhancements.png',
    },
  ]

  const handleNext = () => {
    setCurrentMapIndex((prev) => (prev === mapData.length - 1 ? 0 : prev + 1))
  }

  const handlePrevious = () => {
    setCurrentMapIndex((prev) => (prev === 0 ? mapData.length - 1 : prev - 1))
  }

  const handleMapSelect = (index: SetStateAction<number>) => {
    setCurrentMapIndex(index)
  }

  useEffect(() => {
    // Function to load the external script
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.type = 'text/javascript'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    // Load the iframeResizer script and initialize it
    const initializeIframeResizer = async () => {
      try {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js',
        )
        // Initialize the iframeResizer after the script is loaded
        // @ts-expect-error
        if (window.iFrameResize) {
          // @ts-expect-error
          window.iFrameResize({ log: true, checkOrigin: false })
        }
      } catch (error) {
        console.error('Failed to load iframeResizer script:', error)
      }
    }

    initializeIframeResizer()
  }, [])

  return (
    <Dialog
      open={Boolean(modalIsOpen)}
      onClose={() => {
        setModalIsOpen(false)
      }}
      scroll='paper'
      className='h-full'
      slotProps={{
        paper: {
          style: {
            backgroundColor: het.standardInfo,
            height: '95vh',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogContent
        dividers={true}
        className='flex flex-col items-center justify-center'
      >
        <HetCloseButton
          className='absolute top-2 right-2 text-alt-black'
          onClick={() => setModalIsOpen(false)}
          ariaLabel='close modal'
        />
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <div className='flex w-full grow flex-col items-center justify-center py-8'>
            <div className='relative flex w-full items-center justify-center'>
              <img
                src={mapData[currentMapIndex].imageUrl}
                alt={`CHLP HIV Map: ${mapData[currentMapIndex].title}`}
                className='max-h-[60vh] max-w-full rounded-lg object-contain shadow-md'
              />
            </div>

            {/* Navigation Controls */}
            <div className='mt-6 flex items-center justify-center'>
              <Button
                className='mx-4 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300'
                onClick={handlePrevious}
                aria-label='Previous map'
              >
                ←
              </Button>

              {/* Map Navigation Dots*/}
              <HetGalleryDotNav
                items={mapData}
                currentIndex={currentMapIndex}
                onSelect={(index) => handleMapSelect(index)}
                className='mx-2'
              />

              <Button
                className='mx-4 rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300'
                onClick={handleNext}
                aria-label='Next map'
              >
                →
              </Button>
            </div>
          </div>

          {/* View Full PDF Link */}
          <div className='mb-6 text-center'>
            <a
              href='https://www.hivlawandpolicy.org/maps'
              target='_blank'
              rel='noopener noreferrer'
              className='rounded px-4 py-2 text-dark-green hover:underline'
            >
              Learn more at hivlawandpolicy.org
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
