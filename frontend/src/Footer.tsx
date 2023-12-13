import {
  EXPLORE_DATA_PAGE_LINK,
  TERMS_OF_USE_PAGE_LINK,
  FAQ_TAB_LINK,
  CONTACT_TAB_LINK,
  NEWS_PAGE_LINK,
  OLD_METHODOLOGY_PAGE_LINK,
} from './utils/internalRoutes'
import { currentYear } from './cards/ui/SourcesHelpers'
import HetReturnToTop from './styles/HetComponents/HetReturnToTop'
import HetLinkButton from './styles/HetComponents/HetLinkButton'
import HetLogos from './styles/HetComponents/HetLogos'

export default function Footer() {
  return (
    <div className='absolute m-auto min-h-[170px] w-full bg-footer-color px-2.5 py-12'>
      <div className='flex flex-col items-center justify-around md:flex-row'>
        <HetLogos />

        <div className='flex min-h-[78px] flex-col md:flex-row md:items-center md:justify-between'>
          {[
            ['Explore Data', EXPLORE_DATA_PAGE_LINK],
            ['Methods', OLD_METHODOLOGY_PAGE_LINK],
            ['News', NEWS_PAGE_LINK],
            ['FAQs', `${FAQ_TAB_LINK}`, 'Frequently Asked Questions'],
            ['Contact Us', `${CONTACT_TAB_LINK}`],
            ['Terms of Use', `${TERMS_OF_USE_PAGE_LINK}`],
          ].map(([label, url, ariaLabel]) => (
            <HetLinkButton
              key={url}
              ariaLabel={ariaLabel}
              href={url}
              className='w-full text-navlink-color no-underline sm:w-1/6'
            >
              {label}
            </HetLinkButton>
          ))}
        </div>
      </div>

      <HetReturnToTop />

      <div className='pt-10 text-small text-alt-dark sm:-mt-6 sm:pr-2'>
        &copy;{currentYear()}
      </div>
    </div>
  )
}
