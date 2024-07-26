import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import HetTextArrowLink from '../../styles/HetComponents/HetTextArrowLink'
import { HetTags } from '../../styles/HetComponents/HetTags'
import { reportMappings } from './DefaultHelperBoxData'
import TogglePreview from './TogglePreview'
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 7f8d3e34 (Removes preview cards on mobile (#3501))
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

export default function DefaultHelperBox() {
  const isMobile = !useIsBreakpointAndUp('md')

<<<<<<< HEAD
=======

export default function DefaultHelperBox() {
>>>>>>> 36d1f9b4 (Continues adding custom report cards for explore data page  (#3481))
=======
>>>>>>> 7f8d3e34 (Removes preview cards on mobile (#3501))
  return (
    <div
      className='flex w-full items-center justify-center px-12 pb-0 pt-4 sm:px-20 sm:pt-8'
      aria-labelledby='main-heading'
    >
      <div className='m-0 mb-5 w-full max-w-helperBox content-center items-center justify-evenly justify-items-center rounded-md pb-0'>
        <div className='px-10 py-0 text-left smMd:px-0 md:px-10 xs:px-2'>
          <h1
            id='main-heading'
            className='m-0 font-sansTitle text-header font-bold leading-lhModalHeading text-altGreen text-base text-center'
          >
            Select a topic above
          </h1>
          <p className='text-text text-center'>
            or explore one of the following reports:
          </p>
          <ul
            className='my-0 list-none pl-0 text-left flex flex-wrap'
            aria-labelledby='reports-heading'
          >
            {reportMappings.map((report, index) => (
              <li
                className='my-4 xs:my-2 mx-0 flex flex-col bg-white rounded-md hover:shadow-raised group border border-solid border-altGreen transition-all duration-300 ease-in-out w-full'
                key={index}
                role='listitem'
              >
                <article
                  className='text-left p-4 text-altGreen grid gap-4 md:items-start place-items-center md:grid-cols-[40%_60%] w-full'
                  aria-labelledby={`report-title-${index}`}
                >
                  <a
                    href={EXPLORE_DATA_PAGE_LINK + report.setting}
                    className='bg-cover bg-no-repeat ml-6 px-4 w-full h-[18rem] transition-opacity duration-300 ease-in-out hover:opacity-80 hover:shadow-lg'
                    style={{
                      backgroundImage: `url(${report.previewImg})`,
                    }}
                  >
                    <span className='sr-only'>
                      {report.title} preview image
                    </span>
                  </a>
                  <div className='flex flex-col w-full md:items-start px-4 md:px-12'>
                    <HetTags tags={report.categories} />
                    <h2
                      aria-label={report.title}
                      id={`report-title-${index}`}
                      className='font-medium my-2 md:my-4 text-center md:text-left text-title'
                    >
                      <a
                        href={EXPLORE_DATA_PAGE_LINK + report.setting}
                        className='no-underline'
                      >
                        {report.title} {report.icon && report.icon}
                      </a>
                    </h2>
                    <p className='text-black md:block hidden my-0 md:mb-4'>
                      {report.description}
                    </p>
                    <HetTextArrowLink
                      link={EXPLORE_DATA_PAGE_LINK + report.setting}
                      linkText='Explore this report'
                    />
                  </div>
                </article>
<<<<<<< HEAD
<<<<<<< HEAD
                {report.customCard && !isMobile && (
=======
                {report.customCard && (
>>>>>>> 36d1f9b4 (Continues adding custom report cards for explore data page  (#3481))
=======
                {report.customCard && !isMobile && (
>>>>>>> 7f8d3e34 (Removes preview cards on mobile (#3501))
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
