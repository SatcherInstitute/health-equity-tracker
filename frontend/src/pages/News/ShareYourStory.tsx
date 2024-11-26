import { Helmet } from 'react-helmet-async'
import { submissionGuidelines } from './ShareYourStoryContent'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import CardLeftNumber from './CardLeftNumber'
import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'

export default function ShareYourStory() {
  const isMdAndUp = useIsBreakpointAndUp('md')
  return (
    <>
      <Helmet>
        <title>Share Your Story - Health Equity Tracker</title>
      </Helmet>

      <section
        id='main-content'
        className='flex flex-col w-svw justify-center max-w-lgXl py-16 px-8 mx-auto'
      >
        <h1
          id='main'
          className='font-sansTitle text-bigHeader font-bold leading-lhNormal text-altGreen'
        >
          Share Your Story
        </h1>
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            We believe that everyone's voice matters when it comes to health
            equity and ending the HIV epidemic. We invite community members,
            advocates, and individuals directly affected by HIV to share their
            personal stories, insights, and experiences on our ‘New and Stories’
            page. By contributing, you can help raise awareness, foster
            understanding, and inspire positive change in underserved
            communities. To ensure the quality and credibility of the content,
            we kindly ask you to follow the guidelines outlined below.
          </p>
          <HetButtonSecondary
            className='md:px-40 px-32 py-4 mb-10'
            text={'Share your story'}
            href='mailto:info@healthequitytracker.org'
          />
          <div className='mt-5 flex w-full items-center'>
            <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
            <h3 className='m-0 pe-4 ps-4  text-altGreen text-title md:text-smallestHeader font-bold md:font-medium leading-lhSomeMoreSpace'>
              Submission guidelines
            </h3>
            <div className='flex-1 border-0 border-t border-solid border-altGrey'></div>
          </div>

          <ul className='mt-4 mb-8 grid grid-cols-1 md:grid-cols-2 list-none ml-0 gap-2 max-w-md px-6 '>
            {submissionGuidelines.map((submissionGuideline, index) => {
              const isMobileShadow = !isMdAndUp && index % 2 === 0
              const isDesktopShadow =
                isMdAndUp &&
                ((Math.floor(index / 2) % 2 === 0 && index % 2 === 0) ||
                  (Math.floor(index / 2) % 2 !== 0 && index % 2 !== 0))

              return (
                <div
                  key={submissionGuideline.title}
                  className={`fade-in-up-blur rounded-md p-8 ${
                    isMobileShadow || isDesktopShadow ? 'shadow-raised' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <CardLeftNumber
                    number={submissionGuideline.number}
                    title={submissionGuideline.title}
                    description={submissionGuideline.description}
                  />
                </div>
              )
            })}
          </ul>

          <p className='max-w-md px-6 '>
            Thank you for considering sharing your story with us. Your voice can
            make a difference in advancing health equity for all people. We look
            forward to hearing from you and appreciate your support in creating
            a more inclusive and informed community.
          </p>
          <HetButtonSecondary
            className='md:px-40 px-32 py-4 mt-10'
            text={'Share your story'}
            href='mailto:info@healthequitytracker.org'
          />
        </section>
      </section>
    </>
  )
}
