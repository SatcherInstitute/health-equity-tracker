import { Dialog, DialogContent } from '@mui/material'
import { useEffect } from 'react'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import HetMobileDrawer from '../../styles/HetComponents/HetMobileDrawer'
import { colors } from '../../styles/tokens/colors'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { useParamState } from '../../utils/hooks/useParamState'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'

export default function VoteDotOrgModal() {
  const [modalIsOpen, setModalIsOpen] = useParamState(VOTE_DOT_ORG_PARAM_KEY)
  const isSmAndUp = useIsBreakpointAndUp('sm')

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

  const iframe = (
    <iframe
      title='Vote.org Registration Checker'
      src='https://verify.vote.org/?partner=111111&campaign=free-tools'
      width='100%'
      height={isSmAndUp ? '100%' : '600'}
      id='voteDotOrgIframe'
      className='mt-2 border-0 bg-explore-bg-color p-2 md:px-24'
    />
  )

  if (!isSmAndUp) {
    return (
      <HetMobileDrawer open={Boolean(modalIsOpen)} onClose={close}>
        <div className='p-4'>
          <HetCloseButton
            className='text-alt-black'
            onClick={close}
            ariaLabel='close modal'
          />
          {iframe}
        </div>
      </HetMobileDrawer>
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
          },
        },
      }}
    >
      <DialogContent dividers={true}>
        <HetCloseButton
          className='text-alt-black'
          onClick={close}
          ariaLabel='close modal'
        />
        {iframe}
      </DialogContent>
    </Dialog>
  )
}
