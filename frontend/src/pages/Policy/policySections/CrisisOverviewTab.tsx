import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import HetQuoteLink from '../../../styles/HetComponents/HetQuoteLink'
import { urlMap } from '../../../utils/externalUrls'
import { useIsBreakpointAndUp } from '../../../utils/hooks/useIsBreakpointAndUp'
import FactCard from '../policyComponents/FactCard'
import {
  gvaFacts,
  rocketFoundationFacts,
} from '../policyContent/CrisisOverviewContent'

export default function CrisisOverviewTab() {
  const isMdAndUp = useIsBreakpointAndUp('md')

  return (
    <>
      <title>Crisis Overview - Health Equity Tracker</title>

      <div className='flex flex-col gap-2'>
        <section id='introduction'>
          <p>
            The Health Equity Tracker (HET) in partnership with The Annie E.
            Casey Foundation expanded its topics to track and integrate gun
            violence data and community engagement in an initiative to promote
            community safety and advance health equity within the Fulton and
            DeKalb counties of Atlanta, Georgia. This research aims to highlight
            the experiences of these young individuals by providing
            youth-focused reports to contextualize the impact of the lived
            experiences and challenges the affected youth have unfortunately
            faced in their adolescence.
          </p>
        </section>

        <section>
          <div className='mb-0'>
            <HetOverline className='mb-0' text='By the Numbers' />
            <HetOverline
              className='mt-0 inline'
              text={`SOURCE: The Rocket Foundation `}
            />
            <HetQuoteLink
              href={urlMap.rocketFoundation}
              label='The Rocket Foundation'
            />
          </div>

          <div className='my-0 grid list-none grid-cols-1 gap-4 pt-2 pb-4 pl-0 md:grid-cols-2'>
            {rocketFoundationFacts.map((rocketFoundationFact, index) => {
              const isMobileShadow = !isMdAndUp && index % 2 === 0
              const isDesktopShadow = isMdAndUp && index % 2 !== 0
              const uniqueKey = `fact-${index}`

              return (
                <div
                  key={uniqueKey}
                  className={`fade-in-up-blur rounded-md p-8 ${isMobileShadow || isDesktopShadow ? 'shadow-raised-tighter' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FactCard
                    key={uniqueKey}
                    content={rocketFoundationFact.content}
                  />
                </div>
              )
            })}
          </div>

          <HetOverline
            className='mt-0 inline'
            text={`SOURCE: Gun Violence Archive `}
          />

          <HetQuoteLink
            href={urlMap.gunViolenceArchive}
            label='Gun Violence Archive'
          />

          <ul className='my-0 grid list-none grid-cols-1 gap-4 pt-2 pb-4 pl-0 md:grid-cols-2'>
            {gvaFacts.map((gvaFact, index) => {
              const uniqueKey = `fact-${index}`

              return (
                <li
                  key={uniqueKey}
                  className={`fade-in-up-blur ${index % 2 === 0 ? 'shadow-raised-tighter' : null}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FactCard key={index} content={gvaFact.content} />
                </li>
              )
            })}
          </ul>

          <p>
            By expanding the Health Equity Tracker to include gun violence data,
            the project aims to offer informed insights and actionable
            information, underpinned by the realities of the crisis in Atlanta.
            The data aims to foster dialogue, ensuring that stakeholders and the
            broader community are both informed and involved.
          </p>
          <p>
            We hope this report will equip fellow researchers, policymakers, and
            other gun violence-prevention organizations with the data necessary
            to advocate for policy reform that support the work to end the
            public health crisis of youth-involved gun violence. This
            collaboration with the Annie E. Casey Foundation not only broadens
            the scope of the HET but also serves as a stepping-stone for
            capacity-building, promoting lasting change, and community
            resilience.
          </p>
        </section>
      </div>
    </>
  )
}
