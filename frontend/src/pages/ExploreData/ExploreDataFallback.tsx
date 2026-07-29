import { useEffect, useRef } from 'react'
import HetCTASmall from '../../styles/HetComponents/HetCTASmall'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { deriveReportIntent, type ReportIntent } from './deriveReportIntent'

const exploreLabel = (intent: ReportIntent) =>
  `Explore ${intent.topicLabel}${intent.placeLabel ? ` in ${intent.placeLabel}` : ''}`

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
        className='m-0 font-bold font-sans-title text-alt-green text-header leading-modal-heading focus-visible:outline-none'
      >
        This report could not be displayed
      </h1>
      <HetNotice kind='technical-error' role='alert'>
        <p className='mt-0'>
          Something went wrong while building this report. Your link has not
          been changed, so you can try it again, or share it with us when
          reporting the problem.
        </p>
        {intent && <p>You may have been looking for:</p>}
        {/* every action below is a plain href or a reload, never a router
            Link: navigating client-side within this route would leave the
            error boundary in its failed state */}
        <div className='flex flex-wrap items-center gap-2'>
          {intent && (
            <HetLinkButton href={intent.href} ariaLabel={exploreLabel(intent)}>
              {exploreLabel(intent)}
            </HetLinkButton>
          )}
          <HetLinkButton
            onClick={() => window.location.reload()}
            ariaLabel='Try this link again'
          >
            Try this link again
          </HetLinkButton>
          <HetCTASmall href={EXPLORE_DATA_PAGE_LINK}>
            Start a new report
          </HetCTASmall>
        </div>
      </HetNotice>
    </section>
  )
}
