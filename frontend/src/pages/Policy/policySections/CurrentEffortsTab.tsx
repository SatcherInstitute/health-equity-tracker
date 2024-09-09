import { Helmet } from 'react-helmet-async'
import ResourceItem from '../policyComponents/ResourceItem'
import {
  economicResources,
  educationalResources,
  justiceResources,
  mentalHealthResources,
  communityResources,
} from '../policyContent/CurrentEffortsContent'
import {
  AttachMoneyRounded,
  SchoolRounded,
  GavelRounded,
  PsychologyRounded,
  Diversity3Rounded,
} from '@mui/icons-material'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import ResourceSection from '../policyComponents/ResourceSection'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function CurrentEffortsTab() {
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
      <HetOverline text='Atlanta’s Support Initiatives'/>
      <ResourceSection
        id='#economic-inequality'
        icon={<AttachMoneyRounded className='text-title smMd:text-smallestHeader' />}
        title='Economic Inequality'
        description='Organizations focusing on reducing economic inequality are crucial in the fight against gun violence, as poverty and lack of opportunities can contribute to crime.'
        resources={economicResources}
      />
      <ResourceSection
        id='#educational-opportunities'
        icon={<SchoolRounded className='text-title smMd:text-smallestHeader' />}
        title='Educational Opportunities'
        description='Improving access to education is a vital step in preventing gun violence.'
        resources={educationalResources}
      />
      <ResourceSection
        id='#racial-and-social-justice'
        icon={<GavelRounded className='text-title smMd:text-smallestHeader' />}
        title='Racial and Social Justice'
        description='Tackling systemic racial and social injustice is a fundamental aspect of addressing the root causes of gun violence.'
        resources={justiceResources}
      />
      <ResourceSection
        id='#mental-health-services'
        icon={<PsychologyRounded className='text-title smMd:text-smallestHeader' />}
        title='Mental Health Services'
        description='Expanded access to mental health services is essential in addressing the trauma and stress that can lead to violence.'
        resources={mentalHealthResources}
      />
      <ResourceSection
        id='#community-engagement'
        icon={<Diversity3Rounded className='text-title smMd:text-smallestHeader' />}
        title='Community Engagement'
        description='Organizations that encourage community involvement in safety and prevention initiatives are key players.'
        resources={communityResources}
      />
    </>
  )
}