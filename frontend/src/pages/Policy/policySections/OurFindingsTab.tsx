import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
<<<<<<< HEAD
import {
  ArrowDownwardRounded,
  AttachMoneyRounded,
  Diversity3Rounded,
  GavelRounded,
  PsychologyRounded,
  SchoolRounded,
} from '@mui/icons-material'
import { Link as ScrollLink, Events } from 'react-scroll'
import { useState, useEffect, type ReactNode } from 'react'
import { useScrollToAnchor } from '../../../utils/hooks/useScrollToAnchor'
import FactCard from '../policyComponents/FactCard'
=======
import { ArrowDownwardRounded, AttachMoneyRounded, Diversity3Rounded, GavelRounded, PsychologyRounded, SchoolRounded } from '@mui/icons-material'
import { Link as ScrollLink, Events } from 'react-scroll'
import { useState, useEffect, ReactNode } from 'react'
import { useScrollToAnchor } from '../../../utils/hooks/useScrollToAnchor'
import FactCard from '../policyComponents/FactCard'
<<<<<<< HEAD:frontend/src/pages/Policy/policySections/AddressingInequitiesTab.tsx
import { youthFatalitiesFacts, homicideFacts, suicideFacts, economicResources, educationalResources, justiceResources, mentalHealthResources, communityResources } from '../policyContent/AddressingInequitiesContent'
=======
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
import {
  youthFatalitiesFacts,
  homicideFacts,
  suicideFacts,
  economicResources,
  educationalResources,
  justiceResources,
  mentalHealthResources,
  communityResources,
} from '../policyContent/OurFindingsContent'
<<<<<<< HEAD
=======
>>>>>>> ad9403cb (Policy hub content enhancements and route config updates (#3625)):frontend/src/pages/Policy/policySections/OurFindingsTab.tsx
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
import ResourceItem from '../policyComponents/ResourceItem'

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
<<<<<<< HEAD
      <div onClick={() => scrollToAnchor(to)} role='link' {...rest}>
=======
		<div onClick={() => scrollToAnchor(to)} role='link' {...rest}>
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
        {children}
      </div>
    )
  }
  return null
}

export default function OurFindingsTab() {
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
<<<<<<< HEAD
    <>
      <Helmet>
        <title>Addressing Inequities - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Addressing Inequities</h2>
      <section id='health-inequities-definition'>
        <p>
          <HetTerm>Health inequities</HetTerm> <em>(noun)</em>: Unfair and
          avoidable differences in health status across various groups,
          influenced by social, economic, and environmental factors.
          <br />
          <br />
          Addressing the root causes of gun violence involves a comprehensive
          approach that includes:
        </p>

        <div className='mb-8 grid lg:grid-cols-5 gap-4 sm:grid-cols-3 xs:grid-cols-2'>
          {links.map((link) => (
            <CombinedLink
              key={link.path}
              to={link.path}
              isScrollLink
              smooth
              duration={200}
              onClick={() => handleClick(link.path)}
              tabIndex={0}
              className={
                activeLink === link.path
                  ? 'font-semibold text-altGreen'
                  : 'hover:cursor-pointer text-altBlack'
              }
            >
              <div className='rounded-md border border-solid border-methodologyGreen md:mx-2 m-2 duration-300 ease-in-out hover:shadow-raised shadow-raised-tighter group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-col align-center text-exploreButton p-4 group no-underline hover:scale-105 hover:transition-transform hover:duration-30'>
                <div className='bg-white p-2 w-fit rounded-sm text-altGreen group-hover:scale-110'>
                  {link.path === '#economic-inequality' && (
                    <AttachMoneyRounded />
                  )}
                  {link.path === '#educational-opportunities' && (
                    <SchoolRounded />
                  )}
                  {link.path === '#racial-and-social-justice' && (
                    <GavelRounded />
                  )}
                  {link.path === '#mental-health-services' && (
                    <PsychologyRounded />
                  )}
                  {link.path === '#community-engagement' && (
                    <Diversity3Rounded />
                  )}
                </div>
                <p className='text-text font-semibold leading-lhNormal text-black'>
                  {link.label}
                </p>
                <p className='text-smallest font-semibold tracking-normal'>
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
          <br />
          <br />
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
              <FactCard key={index} content={youthFatalitiesFact.content} />
            ))}
          </ul>
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
              <FactCard key={index} content={homicideFact.content} />
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
              <FactCard key={index} content={suicideFact.content} />
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
=======
			<>
				<Helmet>
					<title>Addressing Inequities - Health Equity Tracker</title>
				</Helmet>
				<h2 className='sr-only'>Addressing Inequities</h2>
				<section id='health-inequities-definition'>
					<p>
						<HetTerm>Health inequities</HetTerm> <em>(noun)</em>: Unfair and
						avoidable differences in health status across various groups,
						influenced by social, economic, and environmental factors.
						<br />
						<br />
						Addressing the root causes of gun violence involves a comprehensive
						approach that includes:
					</p>

					<div className='mb-8 grid lg:grid-cols-5 gap-4 sm:grid-cols-3 xs:grid-cols-2'>
						{links.map((link) => (
							<CombinedLink
								key={link.path}
								to={link.path}
								isScrollLink
								smooth
								duration={200}
								onClick={() => handleClick(link.path)}
								tabIndex={0}
								className={
									activeLink === link.path
										? 'font-semibold text-altGreen'
										: 'hover:cursor-pointer text-altBlack'
								}
							>
								<div className='rounded-md border border-solid border-methodologyGreen md:mx-2 m-2 duration-300 ease-in-out hover:shadow-raised shadow-raised-tighter group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-col align-center text-exploreButton p-4 group no-underline hover:scale-105 hover:transition-transform hover:duration-30'>
									<div className='bg-white p-2 w-fit rounded-sm text-altGreen group-hover:scale-110'>
										{link.path === '#economic-inequality' && (
											<AttachMoneyRounded />
										)}
										{link.path === '#educational-opportunities' && (
											<SchoolRounded />
										)}
										{link.path === '#racial-and-social-justice' && (
											<GavelRounded />
										)}
										{link.path === '#mental-health-services' && (
											<PsychologyRounded />
										)}
										{link.path === '#community-engagement' && (
											<Diversity3Rounded />
										)}
									</div>
									<p className='text-text font-semibold leading-lhNormal text-black'>
										{link.label}
									</p>
									<p className='text-smallest font-semibold tracking-normal'>
										Jump to section{' '}
										<ArrowDownwardRounded className='text-text' />
									</p>
								</div>
							</CombinedLink>
						))}
					</div>
					<p>
						By recognizing these interconnections, the Health Equity Tracker not
						only provides data but also underscores the multi-faceted nature of
						gun violence.
						<br />
						<br />
						This approach advocates for holistic solutions that address the root
						causes of gun violence, which are often found in the systemic
						inequities plaguing these communities.The patterns observed in
						Atlanta reflect a broader narrative of health inequity, where the
						determinants of health unfairly disadvantage certain groups, leading
						to disparities in violence exposure.
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
								<FactCard key={index} content={youthFatalitiesFact.content} />
							))}
						</ul>
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
								<FactCard key={index} content={homicideFact.content} />
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
						Organizations focusing on reducing economic inequality are crucial
						in the fight against gun violence, as poverty and lack of
						opportunities can contribute to crime.
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
						Tackling systemic racial and social injustice is a fundamental
						aspect of addressing the root causes of gun violence.
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
								<FactCard key={index} content={suicideFact.content} />
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
>>>>>>> 34fdfbcf (Policy hub content enhancements and route config updates (#3625))
}
