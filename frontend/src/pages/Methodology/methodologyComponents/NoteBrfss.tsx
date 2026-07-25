import HetNotice from '../../../styles/HetComponents/HetNotice'

export default function NoteBrfss() {
  return (
    <HetNotice
      className='my-12'
      title="A note about the CDC's Behavioral Risk Factor Surveillance System
		(BRFSS) survey"
    >
      <p>
        It's important to note that because BRFSS is survey-based, it sometimes
        lacks sufficient data for smaller or marginalized racial and ethnic
        groups, making some estimates less statistically robust.
      </p>
      <p>
        America's Health Rankings provides its BRFSS analysis at the national
        and state levels only. Where we show county-level data for these topics,
        it comes from County Health Rankings, which publishes its own county
        estimates derived from BRFSS. Because the two analyses are produced
        differently, county figures are not directly comparable to the state and
        national figures shown alongside them.
      </p>
      <p>
        Most of these measures describe adults only. For the population
        comparison bar charts and relative inequity calculations, we therefore
        compare each group's share of cases to its share of the adult (18+)
        population rather than its share of the total population.
      </p>
    </HetNotice>
  )
}
