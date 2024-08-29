import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { ArrowDownwardRounded, AttachMoneyRounded, Diversity3Rounded, GavelRounded, PsychologyRounded, SchoolRounded } from '@mui/icons-material'
import { Link as ScrollLink, Events } from 'react-scroll'
import { useState, useEffect, type ReactNode } from 'react'
import { useScrollToAnchor } from '../../../utils/hooks/useScrollToAnchor'
import FactCard from '../policyComponents/FactCard'
import { youthFatalitiesFacts, homicideFacts, suicideFacts, economicResources, educationalResources, justiceResources, mentalHealthResources, communityResources } from '../policyContent/AddressingInequitiesContent'
import ResourceItem from '../policyComponents/ResourceItem'
import CustomRateTrendsLineChart from '../../../reports/CustomRateTrendsLineChart'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { RACE } from '../../../data/utils/Constants'
import { Fips } from '../../../data/utils/Fips'
import CustomShareTrendsLineChart from '../../../reports/CustomShareTrendsLineChart'
import CustomDisparityBarChart from '../../../reports/CustomDisparityBarChart'

interface CombinedLinkProps {
  to: string
  isScrollLink: boolean
  children: ReactNode
  [x: string]: any
}

function CombinedLink(props: CombinedLinkProps) {
  const { to, isScrollLink, children, ...rest } = props
  const scrollToAnchor = useScrollToAnchor()
  if (isScrollLink) {
    return (
		<div onClick={() => scrollToAnchor(to)} role='link' {...rest}>
        {children}
      </div>
    )
  }
  return null
}

export default function AddressingInequitiesTab() {
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const scrollToAnchor = useScrollToAnchor()

  useEffect(() => {
    const storedActiveLink = sessionStorage.getItem('activeLink')
    if (storedActiveLink) {
      setActiveLink(storedActiveLink)
    }

    // Scroll event listener
    Events.scrollEvent.register('end', () => {
      const activeLinkElement = document.querySelector('.active')
      if (activeLinkElement) {
        const newActiveLink = activeLinkElement.getAttribute('to')
        if (newActiveLink) {
          setActiveLink(newActiveLink)
          sessionStorage.setItem('activeLink', newActiveLink)
        }
      }
    })

    // Cleanup scroll event listener
    return () => {
      Events.scrollEvent.remove('end')
    }
  }, [])

  const handleClick = (path: string) => {
    setActiveLink(path)
    sessionStorage.setItem('activeLink', path)
    scrollToAnchor(path)
  }

  const links = [
    { path: '#economic-inequality', label: 'Economic Inequality' },
    { path: '#educational-opportunities', label: 'Educational Opportunities' },
    { path: '#racial-and-social-justice', label: 'Racial & Social Justice' },
    { path: '#mental-health-services', label: 'Mental Health Services' },
    { path: '#community-engagement', label: 'Community Engagement' },
  ]

  return (
    <>
      <Helmet>
        <title>Addressing Inequities - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Addressing Inequities</h2>
      <section id='health-inequities-definition'>
        <article className='rounded-md border border-solid border-methodologyGreen shadow-raised-tighter bg-white p-4 group mb-0 mt-4'>
          <p>
            <HetTerm>Health inequities</HetTerm> <em>(noun)</em>: Unfair and
            avoidable differences in health status across various groups,
            influenced by social, economic, and environmental factors.
          </p>
        </article>
        <p>
          Addressing the root causes of gun violence involves understanding:
        </p>
        <div className='flex flex-col'>
          {links.map((link) => (
            <CombinedLink
              key={link.path}
              to={link.path}
              isScrollLink
              smooth
              duration={200}
              onClick={() => handleClick(link.path)}
              tabIndex={0}
			  className='hover:cursor-pointer'
            >
              <div className='rounded-md border border-solid border-methodologyGreen my-2 duration-300 ease-in-out hover:shadow-raised shadow-raised-tighter group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row items-center justify-between text-exploreButton py-2 px-2 smMd:px-8 group no-underline hover:scale-105 hover:transition-transform hover:duration-30 fade-in-up-blur'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen group-hover:scale-110 flex flex-row items-center justify-start gap-1 smMd:gap-4'>
                  {link.path === '#economic-inequality' && (
                    <AttachMoneyRounded className='text-title smMd:text-smallestHeader' />
                  )}
                  {link.path === '#educational-opportunities' && (
                    <SchoolRounded className='text-title smMd:text-smallestHeader' />
                  )}
                  {link.path === '#racial-and-social-justice' && (
                    <GavelRounded className='text-title smMd:text-smallestHeader' />
                  )}
                  {link.path === '#mental-health-services' && (
                    <PsychologyRounded className='text-title smMd:text-smallestHeader' />
                  )}
                  {link.path === '#community-engagement' && (
                    <Diversity3Rounded className='text-title smMd:text-smallestHeader' />
                  )}
                  <p className='smMd:text-exploreButton text-small font-semibold leading-lhNormal text-black py-0 my-0 w-full ml-2'>
                    {link.label}
                  </p>
                </div>
                <p className='text-smallest font-semibold tracking-normal py-0 my-0'>
                  Jump to section <ArrowDownwardRounded className='text-text' />
                </p>
              </div>
            </CombinedLink>
          ))}
        </div>
        <p>
          By recognizing these interconnections, the Health Equity Tracker not
          only provides data but also underscores the multi-faceted nature of
          gun violence.
          </p>
          <p>
          
          This approach advocates for holistic solutions that address the root
          causes of gun violence, which are often found in the systemic
          inequities plaguing these communities.The patterns observed in Atlanta
          reflect a broader narrative of health inequity, where the determinants
          of health unfairly disadvantage certain groups, leading to disparities
          in violence exposure.
        </p>
      </section>
      <section id='#ga-youth-fatalities'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Youth Fatality Rates
          </h3>
          <ul className='list-none pl-0 grid gap-4 sm:grid-cols-2 grid-cols-1 py-4 my-0'>
            {youthFatalitiesFacts.map((youthFatalitiesFact, index) => (
              <li
                key={index}
                className={`fade-in-up-blur`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FactCard key={index} content={youthFatalitiesFact.content} />
                
              </li>
            ))}
          </ul>
          <CustomRateTrendsLineChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Rates of gun deaths among children over time in Georgia'
      />
                 <CustomDisparityBarChart
        fips={new Fips('13')}
        dataTypeConfig={METRIC_CONFIG['gun_violence_youth'][0]}
        demographicType={RACE}
        reportTitle='Population vs. distribution of total gun deaths among children in Georgia'
      />
        </div>
      </section>
      <section id='#ga-homicides'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Homicide Rates
          </h3>

          <ul className='list-none pl-0 grid gap-4 sm:grid-cols-2 grid-cols-1 py-4 my-0'>
            {homicideFacts.map((homicideFact, index) => (
              <li
                key={index}
                className={`fade-in-up-blur`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FactCard key={index} content={homicideFact.content} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id='#economic-inequality'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Economic Inequality
        </h3>
        <p>
          Organizations focusing on reducing economic inequality are crucial in
          the fight against gun violence, as poverty and lack of opportunities
          can contribute to crime.
        </p>
        <ul className='list-none'>
          {economicResources.map((economicResource, index) => (
            <ResourceItem
              key={index}
              title={economicResource.title}
              description={economicResource.description}
              link={economicResource.link}
            />
          ))}
        </ul>
      </section>
      <section id='#educational-opportunities'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Educational Opportunities
        </h3>
        <p>
          Improving access to education is a vital step in preventing gun
          violence.
        </p>
        <ul className='list-none'>
          {educationalResources.map((educationalResource, index) => (
            <ResourceItem
              key={index}
              title={educationalResource.title}
              description={educationalResource.description}
              link={educationalResource.link}
            />
          ))}
        </ul>
      </section>
      <section id='#racial-and-social-justice'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Racial and Social Justice
        </h3>
        <p>
          Tackling systemic racial and social injustice is a fundamental aspect
          of addressing the root causes of gun violence.
        </p>
        <ul className='list-none'>
          {justiceResources.map((justiceResource, index) => (
            <ResourceItem
              key={index}
              title={justiceResource.title}
              description={justiceResource.description}
              link={justiceResource.link}
            />
          ))}
        </ul>
      </section>
      <section id='#ga-suicides'>
        <div className='mb-0'>
          <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
            OUR FINDINGS
          </p>
          <h3 className='my-0 text-title font-medium text-altGreen'>
            Georgia's Suicide Rates
          </h3>
          <ul className='list-none pl-0 grid gap-4 sm:grid-cols-2 grid-cols-1 py-4 my-0'>
            {suicideFacts.map((suicideFact, index) => (
              <li
                key={index}
                className={`fade-in-up-blur`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FactCard key={index} content={suicideFact.content} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id='#mental-health-services'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Mental Health Services
        </h3>
        <p>
          Expanded access to mental health services is essential in addressing
          the trauma and stress that can lead to violence.
        </p>
        <ul className='list-none'>
          {mentalHealthResources.map((mentalHealthResource, index) => (
            <ResourceItem
              key={index}
              title={mentalHealthResource.title}
              description={mentalHealthResource.description}
              link={mentalHealthResource.link}
            />
          ))}
        </ul>
      </section>
      <section id='#community-engagement'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Community Engagement
        </h3>
        <p>
          Organizations that encourage community involvement in safety and
          prevention initiatives are key players.
        </p>

        <ul className='list-none'>
          {communityResources.map((communityResource, index) => (
            <ResourceItem
              key={index}
              title={communityResource.title}
              description={communityResource.description}
              link={communityResource.link}
            />
          ))}
        </ul>
      </section>
    </>
  )
}
