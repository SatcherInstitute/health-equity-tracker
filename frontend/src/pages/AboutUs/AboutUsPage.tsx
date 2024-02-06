import { Helmet } from 'react-helmet-async'
import HetEmailSignup from '../../styles/HetComponents/HetEmailSignup'
import GoalListItem from './GoalListItem'
import LazyLoad from 'react-lazyload'
import {
  LEADERSHIP_TEAM,
  HET_ALUMNI,
  GOOGLE_FELLOWS,
  HE_TASKFORCE,
  PARTNERS,
  GRANTORS,
  HET_DEV_PROGRAM,
} from './OurTeamData'

export default function AboutUsPage() {
  return (
    <>
      <Helmet>
        <title>Contact Us - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Contact Us</h2>
      <div className=' flex w-full flex-col content-center items-center'>
        <div className=' flex  w-full '>
          <div className='grid w-full place-content-center border-0 border-b border-borderColor md:w-5/12 md:border-solid'>
            <article className='min-w-fit pb-0 pt-10 text-left text-title md:py-5 lg:text-smallestHeader'>
              Morehouse School of Medicine
              <br />
              Satcher Health Leadership Institute
              <br />
              720 Westview Drive SW
              <br />
              Atlanta, Georgia 30310
              <p>
                <a href='tel:4047528654'>(404) 752-8654</a>
                <br />
                <a href='mailto:info@healthequitytracker.org'>
                  info@healthequitytracker.org
                </a>
              </p>
            </article>
          </div>
          <div className='hidden w-full border-0 border-b border-l border-borderColor md:block md:w-7/12  md:border-solid'>
            <img
              width='870'
              height='644'
              src='/img/stock/women-laughing-in-line.png'
              className='m-10 h-auto w-7/12 max-w-lg rounded-md'
              alt=''
            />
          </div>
        </div>
      </div>

      <section className='border-0 border-t border-borderColor pt-24 md:border-solid'>
        <h3
          id='main'
          className='text-center font-serif text-biggerHeader font-light italic leading-lhSomeSpace text-altGreen'
        >
          We are committed to the following ethics
        </h3>
        <ul className='flex list-none flex-wrap'>
          <GoalListItem
            title='Transparency & Accountability'
            text='We partner closely with diverse communities and are clear
                about who interprets the data and how that shapes the overall
                health narrative.'
          />
          <GoalListItem
            title='Community First'
            text='People and communities drive our work. By making sure we
                collect data from underserved populations, we can help
                highlight what policy changes are needed to boost these
                communities.'
          />
          <GoalListItem
            title='Open Access'
            text='We ensure community leaders partner with us and play an active
                role in determining what data to use in making policy
                recommendations.'
          />
        </ul>

        <HetEmailSignup className='pt-24' id='contact-email-signup' />
      </section>

      <div className='flex w-full  flex-col p-10'>
        <section className='flex flex-col'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
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
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            HET Development Program
          </h3>

          <ul className='grid list-none grid-cols-1 justify-between gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {HET_DEV_PROGRAM.map((dev) => {
              return (
                <li key={dev.name}>
                  <div className='font-medium'>{dev.name}</div>
                  <div className='text-small font-normal'>{dev.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
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
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
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
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
            Health Equity Task Force
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {HE_TASKFORCE.map((taskforceName) => (
              <li key={taskforceName}>{taskforceName}</li>
            ))}
          </ul>
        </section>

        <section className='flex flex-col'>
          <h3 className='border-[0] border-b border-solid border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
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
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-thin leading-lhSomeMoreSpace'>
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
    </>
  )
}
