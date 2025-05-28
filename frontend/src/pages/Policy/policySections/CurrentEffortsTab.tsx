import {
  AttachMoneyRounded,
  Diversity3Rounded,
  GavelRounded,
  PsychologyRounded,
  SchoolRounded,
} from '@mui/icons-material'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTermUnderline from '../../../styles/HetComponents/HetTermUnderline'
import ResourceSection from '../policyComponents/ResourceSection'
import {
  communityResources,
  economicResources,
  educationalResources,
  justiceResources,
  mentalHealthResources,
} from '../policyContent/CurrentEffortsContent'

export default function CurrentEffortsTab() {
  return (
    <>
      <title>Current Efforts - Health Equity Tracker</title>

      <p className='my-2'>
        We identify and analyze current intervention policies in Atlanta,
        examining their effectiveness and areas for improvement. This includes
        legislation, community programs, and law enforcement strategies aimed at
        reducing gun violence.
      </p>

      <section id='health-inequities-definition'>
        <p>
          This approach advocates for holistic solutions that address the root
          causes of gun violence, which are often found in the systemic
          inequities plaguing these communities.The patterns observed in Atlanta
          reflect a broader narrative of health inequity, where the determinants
          of health unfairly disadvantage certain groups, leading to disparities
          in violence exposure.
        </p>
        <article className='group fade-in-up-blur my-0 rounded-md border border-methodology-green border-solid bg-white p-4 shadow-raised-tighter'>
          <p>
            <HetTerm>Health inequities</HetTerm> <em>(noun)</em>:' '
            <HetTermUnderline>Unfair and avoidable</HetTermUnderline>' '
            differences in health status across various groups, influenced by
            social, economic, and environmental factors.
          </p>
        </article>
      </section>
      <HetOverline text='Atlanta’s Support Initiatives' />
      <ResourceSection
        id='economic-inequality'
        icon=<AttachMoneyRounded className='text-title smMd:text-smallest-header' />
        title='Economic Inequality'
        description='Organizations focusing on reducing economic inequality are crucial in the fight against gun violence, as poverty and lack of opportunities can contribute to crime.'
        resources={economicResources}
      />
      <ResourceSection
        id='educational-opportunities'
        icon={
          <SchoolRounded className='text-title smMd:text-smallest-header' />
        }
        title='Educational Opportunities'
        description='Improving access to education is a vital step in preventing gun violence.'
        resources={educationalResources}
      />
      <ResourceSection
        id='racial-and-social-justice'
        icon={<GavelRounded className='text-title smMd:text-smallest-header' />}
        title='Racial and Social Justice'
        description='Tackling systemic racial and social injustice is a fundamental aspect of addressing the root causes of gun violence.'
        resources={justiceResources}
      />
      <ResourceSection
        id='mental-health-services'
        icon={
          <PsychologyRounded className='text-title smMd:text-smallest-header' />
        }
        title='Mental Health Services'
        description='Expanded access to mental health services is essential in addressing the trauma and stress that can lead to violence.'
        resources={mentalHealthResources}
      />
      <ResourceSection
        id='community-engagement'
        icon={
          <Diversity3Rounded className='text-title smMd:text-smallest-header' />
        }
        title='Community Engagement'
        description='Organizations that encourage community involvement in safety and prevention initiatives are key players.'
        resources={communityResources}
      />
    </>
  )
}
