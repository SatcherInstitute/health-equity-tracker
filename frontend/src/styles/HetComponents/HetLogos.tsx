import AppbarLogo from '../../assets/AppbarLogo.png'
import PartnerSatcher from '../../assets/PartnerSatcher.png'
import { urlMap } from '../../utils/externalUrls'
import HetLinkButton from './HetLinkButton'
import HetSocialIconLinks from './HetSocialIconLinks'

export default function HetLogos() {
  return (
    <figure className='m-0 flex flex-col content-center justify-items-center gap-x-8 gap-y-2 sm:flex-row sm:items-center sm:justify-center'>
      <div className='flex flex-nowrap items-center justify-center'>
        <HetLinkButton href='/'>
          <img
            src={AppbarLogo}
            className='h-little-het-logo m-2 mb-0 object-contain'
            alt='Health Equity Tracker logo'
          />
        </HetLinkButton>
        <div className='flex items-start justify-start'>
          <div className='w-full'>
            <span
              className='font-sans-title text-alt-green text-title inline-block w-max font-medium'
              aria-hidden='true'
            >
              Health Equity Tracker
            </span>
            <HetSocialIconLinks />
          </div>
        </div>
      </div>
      <HetLinkButton href={urlMap.shli} className='min-w-64'>
        <img
          src={PartnerSatcher}
          alt='Satcher Health Leadership Institute Logo'
          height={60}
          width={216}
        />
      </HetLinkButton>
    </figure>
  )
}
