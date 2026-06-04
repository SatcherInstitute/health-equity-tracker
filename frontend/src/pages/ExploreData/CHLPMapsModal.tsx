import { Button, Dialog, DialogContent, Drawer } from '@mui/material'
import { type SetStateAction, useEffect, useState } from 'react'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetGalleryDotNav from '../../styles/HetComponents/HetGalleryDotNav'
import { colors } from '../../styles/tokens/colors'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsModal() {
  const [modalIsOpen, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)
  const [currentMapIndex, setCurrentMapIndex] = useState(0)
  const isSmAndUp = useIsBreakpointAndUp('sm')

  const mapData = [
    {
      id: 1,
      title: 'HIV Exposure and Transmission Offenses',
      imageUrl: '/img/graphics/exposure_and_transmission_offenses.png',
    },
    {
      id: 2,
      title: 'Sex Work Penalty Enhancements',
      imageUrl: '/img/graphics/sex_work_penalty_enhancements.png',
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

    const initializeIframeResizer = async () => {
      try {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js',
        )
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

  const close = () => setModalIsOpen(false)

  const galleryContent = (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex w-full grow flex-col items-center justify-center py-8'>
        <div className='relative flex w-full items-center justify-center'>
          <img
            src={mapData[currentMapIndex].imageUrl}
            alt={`CHLP HIV Map: ${mapData[currentMapIndex].title}`}
            className='max-h-[60vh] max-w-full rounded-lg object-contain shadow-md'
          />
        </div>

        <div className='mt-6 flex items-center justify-center'>
          <Button
            className='mx-4 rounded-full bg-alt-white p-2 text-alt-dark hover:bg-alt-gray'
            onClick={handlePrevious}
            aria-label='Previous map'
          >
            ←
          </Button>

          <HetGalleryDotNav
            items={mapData}
            currentIndex={currentMapIndex}
            onSelect={(index) => handleMapSelect(index)}
            className='mx-2'
          />

          <Button
            className='mx-4 rounded-full bg-alt-white p-2 text-alt-dark hover:bg-alt-gray'
            onClick={handleNext}
            aria-label='Next map'
          >
            →
          </Button>
        </div>
      </div>

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
  )

  if (!isSmAndUp) {
    return (
      <Drawer
        anchor='bottom'
        open={Boolean(modalIsOpen)}
        onClose={close}
        slotProps={{
          paper: {
            style: {
              backgroundColor: colors.exploreBgColor,
              borderRadius: '16px 16px 0 0',
              maxHeight: '90vh',
            },
          },
        }}
      >
        <div className='overflow-y-auto p-4'>
          <HetCloseButton
            className='absolute top-4 right-4 text-alt-black'
            onClick={close}
            ariaLabel='close modal'
          />
          {galleryContent}
        </div>
      </Drawer>
    )
  }

  return (
    <Dialog
      open={Boolean(modalIsOpen)}
      onClose={close}
      scroll='paper'
      className='h-full'
      slotProps={{
        paper: {
          style: {
            backgroundColor: colors.exploreBgColor,
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
          className='absolute top-4 right-4 text-alt-black'
          onClick={close}
          ariaLabel='close modal'
        />
        {galleryContent}
      </DialogContent>
    </Dialog>
  )
}
