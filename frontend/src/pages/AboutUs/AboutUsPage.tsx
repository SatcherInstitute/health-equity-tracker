import { Helmet } from 'react-helmet-async'
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
import { urlMap } from '../../utils/externalUrls'
import HetAddressBlock from '../../styles/HetComponents/HetAddressBlock'
import HetSocialIconLinks from '../../styles/HetComponents/HetSocialIconLinks'

export default function AboutUsPage() {
  return (
    <>
      <Helmet>
        <title>About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Contact Us</h2>
      <header className=' flex w-full flex-col content-center items-center'>
        <div className=' flex  w-full '>
          <div className='hidden w-full  place-content-center border-0 border-b border-borderColor md:grid md:w-5/12 md:border-solid'>
            <HetAddressBlock />
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
      </header>

      <section className='mx-4 flex flex-col items-center  md:pt-20'>
        <h3
          id='main'
          className='mx-4 text-center font-serif  text-header font-light italic leading-lhSomeSpace text-altGreen md:text-bigHeader'
        >
          About the Health Equity Tracker
        </h3>
        <HetAddressBlock className='block md:hidden' />
        <p className='max-w-md px-6 text-left'>
          The Health Equity Tracker is a project of the{' '}
          <a href={urlMap.shli}>Satcher Health Leadership Institute (SHLI)</a>{' '}
          at <a href={urlMap.msm}>Morehouse School of Medicine</a>. We aim to
          address health disparities in the United States by identifying at-risk
          populations and highlighting data inequities. By providing
          policymakers, community leaders, and researchers the data they need to
          make informed decisions, this scalable, feature-rich platform supports
          efforts to achieve health equity and justice for all.
        </p>
        <h4 className='font-sansTitle font-medium'>
          Morehouse School of Medicine
        </h4>
        <p className='max-w-md px-6 text-left'>
          Morehouse School of Medicine (MSM), located in Atlanta, Ga., was
          founded in 1975 as the Medical Education Program at Morehouse College.
          In 1981, MSM became an independently chartered institution. MSM is
          among the nation’s leading educators of primary care physicians and
          was recently recognized as the top institution among U.S. medical
          schools for our social mission. We exist to: improve the health and
          well-being of individuals and communities; increase the diversity of
          the health professional and scientific workforce; and address primary
          health care through programs in education, research, and service, all
          with an emphasis on people of color and the underserved urban and
          rural populations in Georgia, the nation, and the world.
        </p>

        <h4 className='font-sansTitle font-medium'>
          Satcher Health Leadership Institute
        </h4>

        <p className='max-w-md px-6 text-left'>
          Rooted in the legacy of our founder, the 16th U.S. Surgeon General,
          Dr. David Satcher, SHLI’s mission is to create systemic change at the
          intersection of policy and equity by focusing on three priority areas:
          the political determinants of health, health system transformation,
          and mental and behavioral health. In conjunction with key strategic
          partners, SHLI enhances leadership among diverse learners, conducts
          forward-thinking research on the drivers of health inequities, and
          advances evidence-based policies; all in an effort to contribute to
          the achievement of health equity for all population groups.
        </p>

        <HetSocialIconLinks className='py-16' colorOverride='altBlack' />
      </section>

      <section className='border-0 border-t border-borderColor md:border-solid  md:pt-20'>
        <h3 className='mx-4 text-center font-serif  text-header font-light italic leading-lhSomeSpace text-altGreen sm:text-bigHeader'>
          We are committed to the following ethics
        </h3>
        <ul className='mx-4 flex list-none flex-wrap pl-0'>
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
      </section>

      <div className='flex w-full  flex-col p-10'>
        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
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

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
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

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
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

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
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

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
            Health Equity Task Force
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
            {HE_TASKFORCE.map((taskforceName) => (
              <li key={taskforceName}>{taskforceName}</li>
            ))}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
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

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-b border-solid   border-black text-left font-serif text-smallHeader font-light leading-lhSomeMoreSpace'>
            Grantors
          </h3>

          <ul className='grid list-none grid-cols-1 justify-between gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'>
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
