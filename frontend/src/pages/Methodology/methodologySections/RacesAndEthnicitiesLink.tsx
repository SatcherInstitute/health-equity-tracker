import { Helmet } from 'react-helmet-async'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import { urlMap } from '../../../utils/externalUrls'
import {
  ethnicityDefinitions,
  raceDefinitions,
  moreNonStandardDefinitions,
} from '../methodologyContent/RacesAndEthnicitiesDefinitions'
import RaceEthnicityList from './RacesEthnicitiesList'

export default function RacesAndEthnicitiesLink() {
  return (
    <section id='races-and-ethnicities'>
      <article>
        <Helmet>
          <title>Races and Ethnicities - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Races and Ethnicities</h2>
        <h3 className='mt-12 text-title font-medium' id='data-gaps'>
          Addressing Data Gaps Stemming from Structural Inequities
        </h3>
        <p>
          Health inequities arise from deep-rooted issues of structural racism
          and oppression, often resulting in gaps in data collection. We strive
          to present the most comprehensive reports based on the best available
          data.
        </p>

        <p>
          However, we acknowledge these limitations, especially in areas like
          the Census Island Areas (US territories excluding Puerto Rico), where
          detailed subpopulation rates by age, sex, and race/ethnicity are
          scarce.
        </p>

        <p>
          Our ongoing efforts aim to bridge these data gaps, ensuring more
          informed and effective health policies across the United States.
        </p>

        <HetNotice
          className='mt-10'
          title='Dataset Definitions and Contextual Variances'
        >
          <p>
            All reports on the site reflect the <HetTerm>race</HetTerm> and{' '}
            <HetTerm>ethnicity</HetTerm> categorization used by their respective
            data sources. In some cases we have relabelled or combined groups to
            promote more inclusive language and allow comparisons. The majority
            of these sources adhere to the U.S. Census groupings, which record
            race as one of five options, and ethnicity as either having or not
            having Hispanic origin. Due to the inherent complexity of
            visualizing these related but distinct demographic dimensions, the
            sources ultimately combine the race and ethnicity groups in one of
            two ways:
          </p>
          <ol>
            <li>
              Each <HetTerm>race</HetTerm> group explicitly excludes people of
              Hispanic origin, and another group{' '}
              <HetTerm>Hispanic or Latino</HetTerm> is added that combines all
              people of Hispanic origin, regardless of their race.
            </li>
            <li>
              Each <HetTerm>race</HetTerm> group is based solely on the reported
              race, regardless of Hispanic origin. In these cases, the
              additional <HetTerm>Hispanic or Latino</HetTerm> group is still
              added combining all people of Hispanic origin, regardless of their
              race, however the groups are no longer mutually exclusive and some
              people (e.g. those identifying as both Black and Hispanic) will be
              represented in multiple groups. This also means percentages of the
              total population will no longer sum to 100%, so provide alerting
              to the user that care should be used in analysis.{' '}
            </li>
          </ol>

          <p>
            It's crucial to recognize that the precise definition of a race or
            ethnicity is{' '}
            <strong>
              intrinsically tied to the context of the specific dataset
            </strong>{' '}
            from which it originates. For instance, the inclusion of an{' '}
            <HetTerm>Other</HetTerm> category can influence how individuals are
            categorized, potentially affecting distinctions like{' '}
            <HetTerm>Asian</HetTerm> vs. <HetTerm>Other</HetTerm>.
          </p>
          <p>
            Per the <a href={urlMap.censusRaceEthnicity}>U.S. Census FAQ</a>:
            “The race and ethnicity categories generally reflect social
            definitions in the U.S. and are not an attempt to define race and
            ethnicity biologically, anthropologically, or genetically. We
            recognize that the race and ethnicity categories include racial,
            ethnic, and national origins and sociocultural groups.”
          </p>
        </HetNotice>

        <RaceEthnicityList dataItem={ethnicityDefinitions} />
        <RaceEthnicityList dataItem={raceDefinitions} />
        <RaceEthnicityList dataItem={moreNonStandardDefinitions} />
      </article>
    </section>
  )
}
