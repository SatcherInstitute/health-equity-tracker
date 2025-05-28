import { HetTags } from '../../styles/HetComponents/HetTags'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { reportMappings } from './DefaultHelperBoxData'
import TogglePreview from './TogglePreview'

export default function DefaultHelperBox() {
  const isMobile = !useIsBreakpointAndUp('md')

  return (
    <div
      className='flex w-full items-center justify-center px-12 pt-4 pb-0 sm:px-20 sm:pt-8'
      aria-labelledby='main-heading'
    >
      <div className='m-0 mb-5 w-full max-w-helper-box content-center items-center justify-evenly justify-items-center rounded-md pb-0'>
        <div className='px-10 xs:px-2 py-0 text-left smMd:px-0 md:px-10'>
          <h1
            id='main-heading'
            className='m-0 text-center font-bold font-sans-title text-alt-green text-base text-header leading-lh-modal-heading'
          >
            Select a topic above
          </h1>
          <p className='text-center text-text'>
            or explore one of the following reports:
          </p>
          <ul
            className='my-0 flex list-none flex-wrap pl-0 text-left'
            aria-labelledby='reports-heading'
          >
            {reportMappings.map((report, index) => (
              <li
                className='group mx-0 my-4 xs:my-2 flex w-full flex-col rounded-md border border-alt-green border-solid bg-white transition-all duration-300 ease-in-out hover:shadow-raised'
                key={report.title}
              >
                <article
                  className='grid w-full place-items-center gap-4 p-4 text-left text-alt-green md:grid-cols-[40%_60%] md:items-start'
                  aria-labelledby={`report-title-${index}`}
                >
                  <a
                    href={EXPLORE_DATA_PAGE_LINK + report.setting}
                    className='ml-6 h-72 w-full bg-center bg-cover bg-no-repeat px-4 transition-opacity duration-300 ease-in-out hover:opacity-80 hover:shadow-lg'
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
                      className='my-2 text-center font-medium text-title md:my-4 md:text-left'
                    >
                      <a
                        href={EXPLORE_DATA_PAGE_LINK + report.setting}
                        className='no-underline'
                      >
                        {report.title} {report.icon && report.icon}
                      </a>
                    </h2>
                    <p className='my-0 hidden text-black md:mb-4 md:block'>
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
