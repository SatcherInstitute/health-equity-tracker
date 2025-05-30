import HetButtonSecondary from '../../styles/HetComponents/HetButtonSecondary'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'
import CardLeftNumber from './CardLeftNumber'
import { submissionGuidelines } from './ShareYourStoryContent'

export default function ShareYourStory() {
  const isMdAndUp = useIsBreakpointAndUp('md')
  return (
    <>
      <title>Share Your Story - Health Equity Tracker</title>

      <section
        id='main-content'
        className='mx-auto flex w-svw max-w-lg-xl flex-col justify-center px-8 py-16'
      >
        <h1
          id='main'
          className='font-bold font-sans-title text-alt-green text-big-header leading-normal'
        >
          Share Your Story
        </h1>
        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            We believe that everyone's voice matters when it comes to health
            equity and ending the HIV epidemic. We invite community members,
            advocates, and individuals directly affected by HIV to share their
            personal stories, insights, and experiences on our ‘News and
            Stories’ page. By contributing, you can help raise awareness, foster
            understanding, and inspire positive change in underserved
            communities. To ensure the quality and credibility of the content,
            we kindly ask you to follow the guidelines outlined below.
          </p>
          <HetButtonSecondary
            buttonClassName='md:px-40 px-32 py-4 mb-10'
            href='mailto:info@healthequitytracker.org'
          >
            Share your story
          </HetButtonSecondary>

          <div className='mt-5 flex w-full items-center'>
            <div className='flex-1 border-0 border-alt-grey border-t border-solid'></div>
            <h2 className='m-0 ps-4 pe-4 font-bold text-alt-green text-title leading-some-more-space md:font-medium md:text-smallest-header'>
              Submission guidelines
            </h2>
            <div className='flex-1 border-0 border-alt-grey border-t border-solid'></div>
          </div>
          <ul className='mt-4 mb-8 ml-0 grid max-w-md list-none grid-cols-1 gap-2 px-6 md:grid-cols-2'>
            {submissionGuidelines.map((submissionGuideline, index) => {
              const isMobileShadow = !isMdAndUp && index % 2 === 0
              const isDesktopShadow =
                isMdAndUp &&
                ((Math.floor(index / 2) % 2 === 0 && index % 2 === 0) ||
                  (Math.floor(index / 2) % 2 !== 0 && index % 2 !== 0))

              return (
                <div
                  key={submissionGuideline.title}
                  className={`fade-in-up-blur rounded-md p-2 md:p-8 ${
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

          <p className='max-w-md px-6'>
            Thank you for considering sharing your story with us. Your voice can
            make a difference in advancing health equity for all people. We look
            forward to hearing from you and appreciate your support in creating
            a more inclusive and informed community.
          </p>
          <HetButtonSecondary
            buttonClassName='md:px-40 px-32 py-4 mt-10'
            href='mailto:info@healthequitytracker.org'
          >
            Share Your Story
          </HetButtonSecondary>
        </section>
      </section>
    </>
  )
}
