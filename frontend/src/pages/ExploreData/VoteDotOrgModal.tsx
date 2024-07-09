import { Dialog, DialogActions, DialogContent } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import { useEffect } from 'react'
import { VOTE_DOT_ORG_PARAM_KEY } from '../../utils/urlutils'

export default function VoteDotOrgModal() {
  const [modalIsOpen, setModalIsOpen] =
    useParamState(VOTE_DOT_ORG_PARAM_KEY)




  useEffect(() => {
    // Function to load the external script
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Load the iframeResizer script and initialize it
    const initializeIframeResizer = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.3/iframeResizer.min.js');
        // Initialize the iframeResizer after the script is loaded
        // @ts-ignore
        if (window.iFrameResize) {
          // @ts-ignore
          window.iFrameResize({ log: true, checkOrigin: false });
        }
      } catch (error) {
        console.error('Failed to load iframeResizer script:', error);
      }
    };

    initializeIframeResizer();

    console.log('modalIsOpen', modalIsOpen)
  }, []); // Empty dependency array ensures this runs only once when the component mounts


  return (
    <Dialog
      open={Boolean(modalIsOpen)}
      onClose={() => {
        setModalIsOpen(false);
      }}
      maxWidth={'lg'}
      scroll='paper'
      style={{ height: '90vh' }} // Set the height to 75% of the viewport height
      PaperProps={{
        style: {
          height: '90vh', // Ensure the dialog content also respects the height
        },
      }}
    >
      <DialogContent dividers={false}>
        <iframe
          title='Vote.org Registration Checker'
          src="https://verify.vote.org/?partner=111111&campaign=free-tools"
          width="100%"
          height="100%" // Make iframe take the full height of the dialog content
          id="frame3"
          className='p-2 md:px-24'
        ></iframe>
      </DialogContent>
      <DialogActions>
        <HetCloseButton onClick={() => setModalIsOpen(false)} ariaLabel='close modal' />
      </DialogActions>
    </Dialog>
  )
}
