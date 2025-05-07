import { Dialog, DialogContent } from '@mui/material'
import { useEffect } from 'react'
import { het } from '../../styles/DesignTokens'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import { useParamState } from '../../utils/hooks/useParamState'
import { CHLP_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function CHLPMapsModal() {
  const [modalIsOpen, setModalIsOpen] = useParamState(CHLP_MAPS_PARAM_KEY)

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
        // @ts-ignore
        if (window.iFrameResize) {
          // @ts-ignore
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
          },
        },
      }}
    >
      <DialogContent dividers={true}>
        <HetCloseButton
          className='text-altBlack'
          onClick={() => setModalIsOpen(false)}
          ariaLabel='close modal'
        />
        <div className='flex h-full flex-col'>
          <iframe
            title='CHLP HIV Criminalization Maps'
            src='https://www.hivlawandpolicy.org/sites/default/files/2025-03/Mapping%20HIV%20Criminalization%20Laws%20in%20the%20US%2C%20CHLP%202025.pdf'
            width='100%'
            height='100%'
            id='chlpMapsIframe'
            className='mt-2 border-0 bg-standardInfo p-2 md:px-24'
          ></iframe>
          <div className='mt-4 text-center'>
            <a
              href='https://www.hivlawandpolicy.org/sites/default/files/2025-03/Mapping%20HIV%20Criminalization%20Laws%20in%20the%20US%2C%20CHLP%202025.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='rounded px-4 py-2 text-methodology-green'
            >
              View Full PDF
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
