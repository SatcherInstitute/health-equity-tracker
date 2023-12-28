import { Helmet } from 'react-helmet-async'
import LazyLoad from 'react-lazyload'
import {
  GOOGLE_FELLOWS,
  GRANTORS,
  HET_ALUMNI,
  HE_TASKFORCE,
  LEADERSHIP_TEAM,
  PARTNERS,
} from './OurTeamData'

function OurTeamTab() {
  return (
    <div className='flex justify-center'>
      <Helmet>
        <title>Our Team - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Our Team</h2>
      <div className='flex w-full max-w-xl flex-col p-10'>
        <div className='flex w-full justify-center'>
          <div className='w-full justify-center sm:w-10/12 md:w-6/12 xl:w-8/12'>
            <h3
              id='main'
              className='mb-0
            py-0
            font-serif
            text-biggerHeader
            font-light
            leading-lhSomeSpace
            text-altGreen
            '
            >
              We're working towards a better tomorrow.
            </h3>
            <p className='pb-2 text-left font-sansText text-title font-light leading-lhLoose xl:text-center'>
              We strongly support breaking down systemic barriers in order to
              achieve a more healthy, equitable, and inclusive society.
            </p>
          </div>
        </div>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Leadership Team
          </h3>
          <ul className='grid list-none grid-cols-1 justify-between gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {LEADERSHIP_TEAM.map((leader) => {
              return (
                <li key={leader.name}>
                  <LazyLoad offset={300} height={181} once>
                    <img
                      src={leader.imageUrl}
                      alt=''
                      className='max-w-teamHeadshot rounded-md'
                    />
                  </LazyLoad>
                  <div className='font-medium'>{leader.name}</div>
                  <div className='text-small font-normal'>{leader.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Former SHLI Contributors
          </h3>

          <ul className='grid list-none grid-cols-1 justify-between gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {HET_ALUMNI.map((leader) => {
              return (
                <li key={leader.name}>
                  <div className='font-medium'>{leader.name}</div>
                  <div className='text-small font-normal'>{leader.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Google.org Fellows
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-5 md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5'>
            {GOOGLE_FELLOWS.map((fellow) => {
              return (
                <li key={fellow.name}>
                  {fellow.link && (
                    <a
                      href={fellow.link}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {fellow.text}
                    </a>
                  )}

                  <div className='font-medium'>{fellow.name}</div>
                  <div className='text-small font-normal'>{fellow.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Health Equity Task Force
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {HE_TASKFORCE.map((taskforceName) => (
              <li key={taskforceName}>{taskforceName}</li>
            ))}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Founding Partners
          </h3>

          <LazyLoad offset={300} height={200} once>
            <ul className='grid list-none grid-cols-1 justify-between gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'>
              {PARTNERS.map((partner) => (
                <li key={partner.url}>
                  <a href={partner.url}>
                    <img
                      src={partner.imageUrl}
                      alt={partner.alt}
                      className='max-w-teamLogo'
                    />
                  </a>
                </li>
              ))}
            </ul>
          </LazyLoad>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-b-1 border-[0] border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Grantors
          </h3>

          <ul className='grid list-none grid-cols-3 justify-between gap-5  lg:grid-cols-6 '>
            {GRANTORS.map((grantor) => (
              <li key={grantor.url}>
                <a href={grantor.url}>
                  <img
                    src={grantor.imageUrl}
                    alt={grantor.alt}
                    className='max-w-teamLogo'
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
export default OurTeamTab
