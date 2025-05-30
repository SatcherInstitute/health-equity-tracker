import HetAddressBlock from '../../styles/HetComponents/HetAddressBlock'
import HetLazyLoader from '../../styles/HetComponents/HetLazyLoader'
import HetSocialIconLinks from '../../styles/HetComponents/HetSocialIconLinks'
import { urlMap } from '../../utils/externalUrls'
import GoalListItem from './GoalListItem'
import {
  GOOGLE_FELLOWS,
  GRANTORS,
  HET_ALUMNI,
  HET_DEV_PROGRAM,
  HE_TASKFORCE,
  LEADERSHIP_TEAM,
  PARTNERS,
} from './OurTeamData'

export default function AboutUsPage() {
  return (
    <>
      <title>About Us - Health Equity Tracker</title>
      <section className='mx-auto flex w-svw max-w-lg-xl flex-col justify-center px-8 py-16'>
        <header>
          <h1
            id='main'
            className='font-bold font-sans-title text-alt-green text-big-header leading-normal'
          >
            About the Health Equity Tracker
          </h1>
        </header>

        <section className='mx-4 flex flex-col items-center'>
          <p className='max-w-md px-6 text-left'>
            The Health Equity Tracker is a project of the{' '}
            <a href={urlMap.shli}>Satcher Health Leadership Institute (SHLI)</a>{' '}
            at <a href={urlMap.msm}>Morehouse School of Medicine</a>. We aim to
            address health disparities in the United States by identifying
            at-risk populations and highlighting data inequities. By providing
            policymakers, community leaders, and researchers the data they need
            to make informed decisions, this scalable, feature-rich platform
            supports efforts to achieve health equity and justice for all.
          </p>
          <h2 className='font-medium font-sans-title'>
            Morehouse School of Medicine
          </h2>
          <p className='max-w-md px-6 text-left'>
            Morehouse School of Medicine (MSM), located in Atlanta, GA, was
            founded in 1975 as the Medical Education Program at Morehouse
            College. In 1981, MSM became an independently chartered institution.
            MSM is among the nation’s leading educators of primary care
            physicians and was recently recognized as the top institution among
            U.S. medical schools for our social mission. We exist to: improve
            the health and well-being of individuals and communities; increase
            the diversity of the health professional and scientific workforce;
            and address primary health care through programs in education,
            research, and service, all with an emphasis on people of color and
            the underserved urban and rural populations in Georgia, the nation,
            and the world.
          </p>

          <h2 className='font-medium font-sans-title'>
            Satcher Health Leadership Institute
          </h2>

          <p className='max-w-md px-6 text-left'>
            Rooted in the legacy of our founder, the 16th U.S. Surgeon General,
            Dr. David Satcher, SHLI’s mission is to create systemic change at
            the intersection of policy and equity by focusing on three priority
            areas: the political determinants of health, health system
            transformation, and mental and behavioral health. In conjunction
            with key strategic partners, SHLI enhances leadership among diverse
            learners, conducts forward-thinking research on the drivers of
            health inequities, and advances evidence-based policies, all in an
            effort to contribute to the achievement of health equity for all
            population groups.
          </p>

          <h2 className='font-medium font-sans-title'>
            Native Land Acknowledgment
          </h2>

          <p className='max-w-md px-6 text-left'>
            The Health Equity Tracker and Morehouse School of Medicine
            respectfully acknowledge that our work is conducted on the ancestral
            lands of the Mvskoke (Muscogee) people, who have stewarded this land
            since time immemorial. We recognize the enduring relationship
            between the Mvskoke people and these lands and honor their past,
            present, and future contributions to this region.
          </p>
          <p className='max-w-md px-6 text-left'>
            In acknowledging this history, we also commit to actions that
            support Indigenous communities, including advocating for health
            equity, fostering collaborations with Indigenous-led organizations,
            and ensuring that the voices of Native peoples are amplified in our
            work. We understand that true equity requires continuous learning
            and engagement, and we strive to align our efforts with the needs
            and aspirations of Indigenous communities.
          </p>
          <HetAddressBlock className='mt-16 text-center' />
          <HetSocialIconLinks colorOverride='altBlack' />
        </section>
      </section>

      <section className='border-0 border-border-color border-t md:border-solid md:pt-20'>
        <h2 className='mx-4 text-center font-sans-title text-alt-green text-header leading-some-space sm:text-big-header'>
          We are committed to the following ethics
        </h2>
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

      <div className='flex w-full flex-col p-10'>
        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Leadership Team
          </h3>
          <ul className='grid list-none grid-cols-1 justify-between gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {LEADERSHIP_TEAM.map((leader) => {
              return (
                <li key={leader.name}>
                  <HetLazyLoader offset={300} height={181} once>
                    <img
                      src={leader.imageUrl}
                      alt=''
                      className='max-w-team-headshot rounded-md'
                    />
                  </HetLazyLoader>
                  <div className='font-medium'>{leader.name}</div>
                  <div className='font-normal text-small'>{leader.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            HET Software Engineering and Education Development (SEED) Program
          </h3>

          <ul className='grid list-none grid-cols-2 justify-between gap-6 md:grid-cols-4'>
            {HET_DEV_PROGRAM.map((dev) => {
              return (
                <li className='text-left' key={dev.name}>
                  <div className='font-medium'>{dev.name}</div>
                  <div className='font-normal text-small'>{dev.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Former SHLI Contributors
          </h3>

          <ul className='grid list-none grid-cols-2 justify-between gap-6 md:grid-cols-4'>
            {HET_ALUMNI.map((leader) => {
              return (
                <li className='mb-2 text-left' key={leader.name}>
                  <div className='font-medium'>{leader.name}</div>
                  <div className='font-normal text-small'>{leader.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Google.org Fellows
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-6 md:grid-cols-4'>
            {GOOGLE_FELLOWS.map((fellow) => {
              return (
                <li className='mb-2 text-left' key={fellow.name}>
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
                  <div className='font-normal text-small'>{fellow.role}</div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Health Equity Task Force
          </h3>
          <ul className='grid list-none grid-cols-2 justify-between gap-6 md:grid-cols-3'>
            {HE_TASKFORCE.map((taskforceName) => (
              <li className='mb-2 text-left' key={taskforceName}>
                {taskforceName}
              </li>
            ))}
          </ul>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Founding Partners
          </h3>

          <HetLazyLoader offset={300} height={200} once>
            <ul className='grid list-none grid-cols-1 justify-between gap-6 md:grid-cols-2'>
              {PARTNERS.map((partner) => (
                <li className='flex align-start' key={partner.url}>
                  <a href={partner.url}>
                    <img
                      src={partner.imageUrl}
                      alt={partner.alt}
                      className='max-w-team-logo'
                    />
                  </a>
                </li>
              ))}
            </ul>
          </HetLazyLoader>
        </section>

        <section className='flex flex-col pt-8'>
          <h3 className='border-[0] border-black border-b border-solid text-left font-sans-title text-small-header leading-some-more-space'>
            Grantors
          </h3>

          <ul className='grid list-none grid-cols-1 justify-between gap-6 align-center md:grid-cols-2'>
            {GRANTORS.map((grantor) => (
              <li
                className='flex place-content-start items-center align-start'
                key={grantor.url}
              >
                <a href={grantor.url}>
                  <img
                    src={grantor.imageUrl}
                    alt={grantor.alt}
                    className='max-w-team-logo'
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
