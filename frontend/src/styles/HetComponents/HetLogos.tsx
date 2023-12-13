import AppbarLogo from '../../assets/AppbarLogo.png'
import PartnerSatcher from '../../assets/PartnerSatcher.png'
import { urlMap } from '../../utils/externalUrls'
import HetLinkButton from './HetLinkButton'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'

export default function HetLogos() {
  return (
    <figure className='flex flex-col items-center gap-2 md:flex-row md:justify-center'>
      <div className='flex w-10/12 flex-nowrap items-center justify-center sm:w-5/12'>
        <HetLinkButton href='/'>
          <img
            src={AppbarLogo}
            className='m-2 mb-0 h-littleHetLogo w-littleHetLogo'
            alt='Health Equity Tracker logo'
          />
        </HetLinkButton>
        <div className='flex items-start justify-start'>
          <div className='w-full'>
            <span
              className='inline-block w-max font-sansTitle text-title font-medium text-alt-green'
              aria-hidden='true'
            >
              Health Equity Tracker
            </span>
            <div className='flex justify-center'>
              <a
                className='mx-[7px] my-0'
                href={urlMap.shliLinkedIn}
                aria-label='Satcher Health on LinkedIn'
              >
                <LinkedInIcon />
              </a>
              <a
                className='mx-[7px] my-0'
                href={urlMap.shliTwitter}
                aria-label='Satcher Health on Twitter'
              >
                <TwitterIcon />
              </a>
              <a
                className='mx-[7px] my-0'
                href={urlMap.shliYoutube}
                aria-label='Satcher Health on YouTube'
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className='grid w-10/12 place-content-center sm:w-5/12'>
        <HetLinkButton href={urlMap.shli}>
          <img
            src={PartnerSatcher}
            alt='Satcher Health Leadership Institute Logo'
            height={60}
            width={216}
          />
        </HetLinkButton>
      </div>
    </figure>
  )
}
