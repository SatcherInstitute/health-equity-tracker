import { HetTags } from '../../styles/HetComponents/HetTags'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { reportMappings } from './DefaultHelperBoxData'
import TogglePreview from './TogglePreview'

export default function DefaultHelperBox() {
  const isMobile = !useIsBreakpointAndUp('md')

  return (
    <div className='flex w-full items-center justify-center px-4 pt-4 pb-0 sm:px-12 sm:pt-8'>
      <div className='max-w-helper-box m-0 mb-5 w-full content-center items-center justify-evenly justify-items-center rounded-md pb-0'>
        <div className='xs:px-2 smplus:px-0 px-10 py-0 text-left md:px-10'>
          <h1
            id='main-heading'
            className='font-sans-title text-alt-green text-title md:text-header md:leading-modal-heading m-0 text-center leading-tight font-bold'
          >
            Select a topic
          </h1>
          <p className='text-text mt-1 mb-2 text-center md:my-4'>
            <span className='md:hidden'>or explore these reports:</span>
            <span className='hidden md:inline'>
              or explore one of the following reports:
            </span>
          </p>
          <ul
            className='my-0 flex list-none flex-wrap pl-0 text-left'
            aria-labelledby='reports-heading'
          >
            {reportMappings.map((report, index) => (
              <li
                className='group xs:my-2 border-alt-green bg-alt-white hover:shadow-raised mx-0 my-4 flex w-full flex-col rounded-md border border-solid transition-all duration-300 ease-in-out'
                key={report.title}
              >
                <article
                  className='text-alt-green grid w-full place-items-center gap-4 p-4 text-left md:grid-cols-[40%_60%] md:items-start'
                  aria-labelledby={`report-title-${index}`}
                >
                  <a
                    href={EXPLORE_DATA_PAGE_LINK + report.setting}
                    className='ml-6 h-72 w-full bg-cover bg-center bg-no-repeat px-4 transition-opacity duration-300 ease-in-out hover:opacity-80 hover:shadow-lg'
                    style={{
                      backgroundImage: `url(${report.previewImg})`,
                    }}
                  >
                    <span className='sr-only'>
                      {report.title} preview image
                    </span>
                  </a>
                  <div className='flex w-full flex-col px-4 md:items-start md:px-12'>
                    <HetTags tags={report.categories} />
                    <h2
                      aria-label={report.title}
                      id={`report-title-${index}`}
                      className='text-title my-2 text-center font-medium md:my-4 md:text-left'
                    >
                      <a
                        href={EXPLORE_DATA_PAGE_LINK + report.setting}
                        className='no-underline'
                      >
                        {report.title} {report.icon && report.icon}
                      </a>
                    </h2>
                    <p className='text-alt-black my-0 hidden md:mb-4 md:block'>
                      {report.description}
                    </p>
                    <HetTextArrowLink
                      link={EXPLORE_DATA_PAGE_LINK + report.setting}
                      linkText='Explore this report'
                    />
                  </div>
                </article>
                {report.customCard && !isMobile && (
                  <TogglePreview index={index} report={report} />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
