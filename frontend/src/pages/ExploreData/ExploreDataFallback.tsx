import { useEffect, useRef } from 'react'
import HetCTASmall from '../../styles/HetComponents/HetCTASmall'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { deriveReportIntent } from './deriveReportIntent'

export default function ExploreDataFallback() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const intent = deriveReportIntent(window.location.search)

  // the report is replaced in place, so move focus or screen reader users are
  // left reading a page that silently changed underneath them
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className='mx-auto my-16 max-w-md px-4'>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className='m-0 font-bold font-sans-title text-alt-green text-header leading-modal-heading focus:outline-none'
      >
        This report could not be displayed
      </h1>
      <HetNotice kind='technical-error'>
        <p className='mt-0'>
          Something went wrong while building this report. Your link has not
          been changed, so you can reload the page to try again, or share the
          link with us when reporting the problem.
        </p>
        {intent && <p>You may have been looking for this report:</p>}
        <div className='flex flex-wrap items-center gap-2'>
          {/* plain href, not a router Link: navigating client-side to the same
              route would leave the error boundary in its failed state */}
          <HetCTASmall href={intent?.href ?? EXPLORE_DATA_PAGE_LINK}>
            {intent
              ? `Explore ${intent.topicLabel}${intent.placeLabel ? ` in ${intent.placeLabel}` : ''}`
              : 'Select a new topic'}
          </HetCTASmall>
          <HetLinkButton
            onClick={() => window.location.reload()}
            ariaLabel='Reload this report'
          >
            Reload this report
          </HetLinkButton>
        </div>
      </HetNotice>
    </section>
  )
}
