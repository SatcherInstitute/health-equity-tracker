import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import {  economicResources, educationalResources, justiceResources, mentalHealthResources, communityResources } from '../policyContent/CurrentEffortsContent'
import { useScrollToAnchor } from '../../../utils/hooks/useScrollToAnchor'
import { ReactNode, useEffect, useState } from 'react'
import { Events } from 'react-scroll'
import { AttachMoneyRounded, SchoolRounded, GavelRounded, PsychologyRounded, Diversity3Rounded, ArrowDownwardRounded } from '@mui/icons-material'
import HetTerm from '../../../styles/HetComponents/HetTerm'



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

export default function CurrentEffortsTab() {
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
				<title>Current Efforts - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>Current Efforts</h2>
			<p className='my-2'>
				We identify and analyze current intervention policies in Atlanta,
				examining their effectiveness and areas for improvement. This includes
				legislation, community programs, and law enforcement strategies aimed at
				reducing gun violence.
			</p>
			
			<section id='#health-inequities-definition'>
			{/* <p className='my-2'>
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
              <div className='rounded-md border border-solid border-methodologyGreen my-2 duration-300 ease-in-out hover:shadow-raised shadow-raised-tighter group bg-hoverAltGreen hover:bg-whiteSmoke80 flex flex-row items-center justify-between text-exploreButton p-4 w-fitgroup no-underline hover:scale-105 hover:transition-transform hover:duration-30 fade-in-up-blur'>
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
          </p> */}
          <p>
          
          This approach advocates for holistic solutions that address the root
          causes of gun violence, which are often found in the systemic
          inequities plaguing these communities.The patterns observed in Atlanta
          reflect a broader narrative of health inequity, where the determinants
          of health unfairly disadvantage certain groups, leading to disparities
          in violence exposure.
        </p>
		<article className='rounded-md border border-solid border-methodologyGreen shadow-raised-tighter bg-white p-4 group my-0 fade-in-up-blur'>
          <p>
            <HetTerm>Health inequities</HetTerm> <em>(noun)</em>: Unfair and
            avoidable differences in health status across various groups,
            influenced by social, economic, and environmental factors.
          </p>
        </article>
      </section>
	  <section id='#economic-inequality'>
        <p className='mb-0 mt-8 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
          INTERCONNECTIONS
        </p>
        <div className='flex flex-row w-full items-center'>

        <div className='rounded-md border border-solid border-methodologyGreen bg-hoverAltGreen text-exploreButton p-4 w-fit mr-4'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'>
                  
                    <AttachMoneyRounded className='text-title smMd:text-smallestHeader' />
                  </div></div>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Economic Inequality
        </h3>
        </div>
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
              
            />
          ))}
        </ul>
      </section>
      <section id='#educational-opportunities'>
         <div className='flex flex-row w-full items-center'>

         <div className='rounded-md border border-solid border-methodologyGreen bg-hoverAltGreen text-exploreButton p-4 w-fit mr-4'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'>
                                      <SchoolRounded className='text-title smMd:text-smallestHeader' />
                  
                  </div></div>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Educational Opportunities
        </h3>
         </div>
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
         <div className='flex flex-row w-full items-center'>

         <div className='rounded-md border border-solid border-methodologyGreen bg-hoverAltGreen text-exploreButton p-4 w-fit mr-4'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'>
                  <GavelRounded className='text-title smMd:text-smallestHeader' />
                  </div></div>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Racial and Social Justice
        </h3>
         </div>
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
      <section id='#mental-health-services'>
         <div className='flex flex-row w-full items-center'>

         <div className='rounded-md border border-solid border-methodologyGreen bg-hoverAltGreen text-exploreButton p-4 w-fit mr-4'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'>
                    <PsychologyRounded className='text-title smMd:text-smallestHeader' />
                  </div></div>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Mental Health Services
        </h3>
         </div>
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
         <div className='flex flex-row w-full items-center'>

         <div className='rounded-md border border-solid border-methodologyGreen bg-hoverAltGreen text-exploreButton p-4 w-fit mr-4'>
                <div className='px-0 py-0 w-fit rounded-sm text-altGreen flex flex-row items-center justify-start gap-1 smMd:gap-4 fade-in-up-blur'> <Diversity3Rounded className='text-title smMd:text-smallestHeader' />
                  </div>
                  </div>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Community Engagement
        </h3>
         </div>
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