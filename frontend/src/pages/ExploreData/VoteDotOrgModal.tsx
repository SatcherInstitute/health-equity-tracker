import { useEffect } from 'react'
import HetResponsiveDialog from '../../styles/HetComponents/HetResponsiveDialog'
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

  return (
    <HetResponsiveDialog
      open={Boolean(modalIsOpen)}
      onClose={close}
      onCloseLabel='close modal'
      maxWidth={false}
      dialogPaperStyle={{ height: '95vh' }}
    >
      <iframe
        title='Vote.org Registration Checker'
        src='https://verify.vote.org/?partner=111111&campaign=free-tools'
        width='100%'
        height={isSmAndUp ? '100%' : '600'}
        id='voteDotOrgIframe'
        className='mt-2 border-0 p-2 md:px-24'
      />
    </HetResponsiveDialog>
  )
}
