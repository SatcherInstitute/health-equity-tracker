import { useEffect } from 'react';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HetNotice from '../../styles/HetComponents/HetNotice';
import { IconButton } from '@mui/material';

export default function AnnouncementBanner() {
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
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <HetNotice
      className='my-4 xl:mb-3 mx-8 border border-secondaryMain text-left text-small'
      icon={<LightbulbIcon color='primary' />}
      title='Are You Ready to Vote?'
      kind='text-only'
    >
      <p className='w-full'>
        Check your voter registration with the bipartisan Vote.org
      </p>


      <iframe
        title='Vote.org Registration Checker'
        src="https://verify.vote.org/?partner=111111&campaign=free-tools"
        width="100%"
        marginHeight={0}
        frameBorder={0}
        id="frame3"
        scrolling="no"
      ></iframe>

      {/* <IconButton
        href={'/exploredata?mls=1.women_in_gov-3.00&group1=All'}
        className='mx-0 my-0 px-0 text-left text-text rounded-xs'
      >
        Explore the Women in Government Data →
      </IconButton> */}
    </HetNotice>
  );
}
