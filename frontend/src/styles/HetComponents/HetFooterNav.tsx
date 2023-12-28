import {
  EXPLORE_DATA_PAGE_LINK,
  TERMS_OF_USE_PAGE_LINK,
  FAQ_TAB_LINK,
  CONTACT_TAB_LINK,
  OLD_METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes'
import HetCopyright from './HetCopywright'
import HetLinkButton from './HetLinkButton'
export default function HetFooterLinks() {
  return (
    <nav
      aria-label='footer site navigation'
      className='flex flex-col items-center lg:items-end'
    >
      <ul className='flex min-h-[78px] list-none flex-col  p-0 sm:flex-row'>
        {[
          ['Explore Data', EXPLORE_DATA_PAGE_LINK],
          ['Methods', OLD_METHODOLOGY_PAGE_LINK],
          ['FAQs', `${FAQ_TAB_LINK}`, 'Frequently Asked Questions'],
          ['Contact Us', `${CONTACT_TAB_LINK}`],
          ['Terms of Use', `${TERMS_OF_USE_PAGE_LINK}`],
        ].map(([label, url, ariaLabel]) => (
          <li key={url} className='grid lg:place-content-end'>
            <HetLinkButton
              ariaLabel={ariaLabel}
              href={url}
              className='w-full text-navlinkColor no-underline md:w-auto '
            >
              {label}
            </HetLinkButton>
          </li>
        ))}
      </ul>
      <HetCopyright />
    </nav>
  )
}
