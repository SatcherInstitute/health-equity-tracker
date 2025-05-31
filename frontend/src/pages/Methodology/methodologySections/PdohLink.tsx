import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { PDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigPDOH'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { PDOH_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const pdohDataSources = [
  dataSourceMetadataMap.bjs,
  dataSourceMetadataMap.acs,
  dataSourceMetadataMap.decia_2020_territory_population,
  dataSourceMetadataMap.ahr,
  dataSourceMetadataMap.chr,
  dataSourceMetadataMap.vera,
  dataSourceMetadataMap.cawp,
  dataSourceMetadataMap.the_unitedstates_project,
]

const datatypeConfigs = PDOH_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

export const pdohTopicsString = buildTopicsString(PDOH_CATEGORY_DROPDOWNIDS)

const PdohLink = () => {
  return (
    <section id='pdoh'>
      <article>
        <title>Political Determinants of Health - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Political Determinants of Health',
              topic: pdohTopicsString,
            },
          ]}
        />
        <h2 className='mt-12 font-medium text-title' id='pdoh-data-sourcing'>
          Data Sourcing
        </h2>
        <p>
          We gather our information on incarcerated individuals (including
          children) in the U.S. from trusted sources:
        </p>
        <p className='font-medium italic'>Bureau of Justice Statistic (BJS)</p>
        <p>
          Provides comprehensive reports on people under correctional control.
          Our insights are based on combining data from their “Prisoners in
          2020” and “Census of Jails 2005-2019” reports.
        </p>
        <p className='font-medium italic'>Vera Institute for Justice</p>
        <p>
          Offers detailed research on incarceration trends at the county level.
        </p>
        <h3>Breakdown of Our Reports</h3>
        <h4>By Age</h4>
        <ul className='list-disc pl-4'>
          <li className='font-medium'>
            Nationwide data: From BJS's "Prisoners Table 10"
          </li>
          <li className='font-medium'>
            State-specific data: From BJS's "Prisoners Table 2".
          </li>
        </ul>
        <h4>By Race</h4>
        <ul className='list-disc pl-4'>
          <li className='font-medium'>
            Nationwide & State-specific data: From BJS's "Prisoners Appendix
            Table 2".
          </li>
        </ul>
        <h4>By Sex</h4>
        <ul className='list-disc pl-4'>
          <li className='font-medium'>
            Nationwide & State-specific data: From BJS's "Prisoners Table 2".
          </li>
        </ul>
        <h4>Special Reports</h4>
        <ul className='list-disc pl-4'>
          <li className='font-medium'>
            Information on children in prison: From BJS's "Prisoners Table 13".
          </li>
          <li className='font-medium'>
            Data for all territories: From BJS's "Prisoners Table 23".
          </li>
          <li className='font-medium'>
            County-level data: Sourced from Vera Institute's Incarceration
            Trends.
          </li>
        </ul>
        <h3 className='mt-12 font-medium text-title' id='jails-vs-prisons'>
          Understanding Jails vs. Prisons
        </h3>
        <h3>Jails</h3>
        <p>
          Jails are local facilities that primarily house individuals awaiting
          trial or sentencing, or those sentenced to less than a year. Our data
          on jails doesn't include those under supervised release outside of the
          facility or weekend-only inmates. For county-level data, we focus on
          individuals aged 15-64 using data from the Vera Institute.
        </p>
        <h3>Prisons</h3>

        <p>Prisons generally house individuals sentenced to over a year.</p>
        <p>
          "Jurisdiction" refers to the legal authority over an incarcerated
          person, not necessarily where they're held.
        </p>
        <p>Our data varies slightly based on the location and type:</p>
        <h4>National report</h4>
        <p>
          Includes all under the jurisdiction of a state or federal adult
          prison. Excludes territorial, military, or Indian Country facilities.
        </p>
        <h4>State reports</h4>
        <p>
          Focuses on individuals within a state's prison system. Age-specific
          data is not available.
        </p>
        <h4>Territory reports</h4>
        <p>
          Covers individuals in a territory's adult prison facilities. No
          specific demographic breakdown.
        </p>
        <h4>County reports</h4>
        <p>
          Considers those under state prison systems but charged in a specific
          county.
        </p>

        <h3
          className='mt-12 font-medium text-title'
          id='children-in-adult-facilities'
        >
          Children in Adult Facilities
        </h3>
        <p>
          We highlight the total count of children in adult facilities rather
          than a "per 100k" rate for a few reasons:
        </p>
        <ul className='list-disc pl-4'>
          <li>
            Varying state and federal laws make it challenging to get an
            accurate base population of minors in adult facilities.
          </li>
          <li>
            Using the entire child population for rate calculations dilutes the
            actual rate of incarcerated minors.
          </li>
          <li>
            Our prison data for juveniles includes those confined to a specific
            facility, unlike other reports which consider jurisdictional
            populations.
          </li>
        </ul>
        <h3 className='mt-12 font-medium text-title' id='combined-systems'>
          Combined Systems
        </h3>
        <p>
          Some states, like Alaska, Connecticut, Delaware, Hawaii, Rhode Island,
          and Vermont, integrate both prison and jail systems. For our reports,
          these are categorized as prison facilities only.
        </p>

        <h3 className='mt-12 font-medium text-title' id='political-forces'>
          Political Forces and Incarceration
        </h3>
        <p>
          Incarceration is influenced by a blend of political forces, laws, and
          public opinion. Sentencing policies and the disenfranchisement of
          convicted felons are among the key political forces that determine
          voter participation in the justice-involved population.
        </p>
        <h3 className='font-medium italic'>Voter Disenfranchisement</h3>

        <p>
          The ability to vote is described as the singular most powerful,
          non-violent tool in American democracy. However, as of 2020, an
          estimated 5.17 million people lost this right due to a prior felony
          conviction. Minority populations of voting age are disproportionately
          affected by this disenfranchisement (Sentencing Project).
        </p>
        <h3
          className='mt-12 font-medium text-title'
          id='health-impact-of-incarceration'
        >
          Health Impact of Incarceration
        </h3>
        <h3 className='font-medium italic'>Immediate Health Consequences</h3>
        <p>
          Studies indicate that incarceration heightens the risk of chronic
          health conditions, infectious diseases like HIV/AIDS, mental
          illnesses, and substance use disorders.
        </p>
        <h3 className='font-medium italic'>Life Expectancy</h3>
        <p>
          Each year spent in prison is associated with a reduction of 2 years in
          life expectancy.
        </p>
        <h3 className='font-medium italic'>Post-Incarceration Challenges</h3>
        <p>
          The health impact of incarceration extends beyond the confinement
          period. Upon reentry into society, justice-involved individuals often
          face limited access to healthcare and essential resources such as
          health insurance, housing, and employment. These challenges, coupled
          with limited opportunities for advancement, intensify the health
          inequities experienced by this group.
        </p>

        <h3 className='mt-12 font-medium text-title' id='women-in-gov'>
          Women in Legislative Office and Health Impacts
        </h3>

        <p>
          Having women in government has been linked to improvements in
          population health. Women in legislative roles advocate for vital
          social and political determinants of health, such as education, social
          welfare, reproductive and maternal health, and family life. These
          policies significantly advance health equity.
        </p>

        <h3 className='mt-12 font-medium text-title' id='pdoh-data-metrics'>
          Data Metrics and Methodology
        </h3>
        <p>
          We use data from the Center for American Women in Politics (CAWP) to
          present metrics on the representation of women in legislative roles:
        </p>

        <ul className='list-disc pl-4'>
          <li className='font-medium font-sans-title'>
            Women in State Legislature
          </li>
          <li className='font-medium font-sans-title'>
            {' '}
            Women in U.S. Congress
          </li>
        </ul>

        <p>
          Both data types cover state, territory, and national levels. Our
          national level calculations include legislators from U.S. territories,
          leading to variations from the CAWP website's data. All gender and
          race/ethnicity categorizations are self-reported. A legislator might
          appear in multiple race groups based on their identification.
        </p>

        <p>
          For each of those data types we calculate and present two metrics to
          study the proportion of women legislators:
        </p>

        <ol>
          <li>
            <span>
              <strong>Intersectional Representation:</strong>
            </span>{' '}
            For example, the percentage of the entire Georgia State Legislature
            who identify as Black women.
          </li>
          <li>
            <span>
              <strong>
                Race/Ethnicity Distribution Among Women Legislators:
              </strong>
            </span>{' '}
            For instance, the percentage of self-identified women in the Georgia
            State Legislature who also identify as Black.
          </li>
        </ol>

        <h3 className='mt-12 font-medium text-title' id='historical-tracking'>
          Historical Tracking
        </h3>
        <ul>
          <li>
            <span>
              <strong>Historical Intersectional Representation:</strong>
            </span>{' '}
            The percentage of U.S. Congress members identifying as black women
            each year since 1915.
          </li>
          <li>
            <span>
              <strong>Historical Relative Inequity:</strong>
            </span>{' '}
            The over- or under-representation of black women compared to their
            overall representation among female Congress members. This measure
            traces back to 2019, using the 2019 ACS 5-year estimates for
            population comparison.
          </li>
        </ul>
        <p>
          For U.S. Congress, we track data back to before the first woman's
          election in 1917. However, for state legislators, our data reliably
          goes back only to 1983.
        </p>
        <h3
          className='mt-12 font-medium text-title'
          id='race-ethnicity-groupings-and-challenges'
        >
          Race/Ethnicity Groupings and Challenges
        </h3>
        <p>
          The U.S. Census and CAWP use varying race/ethnicity classifications,
          complicating direct comparisons. We've adjusted our methods to address
          these discrepancies:
        </p>
        <ul className='list-disc pl-4'>
          <li>
            Women identifying with multiple races appear in each corresponding
            race visualization.
          </li>
          <li>
            The combined group "American Indian, Alaska Native, Asian & Pacific
            Islander" represents our effort to visualize these under-represented
            groups.
          </li>
          <li>
            The U.S. Census doesn't collect data for Middle Eastern & North
            African (MENA). Currently, MENA individuals are counted as White by
            the ACS.
          </li>
        </ul>
        <h3 className='mt-12 font-medium text-title' id='pdoh-missing-data'>
          Missing Data
        </h3>
        <p>
          The CAWP dataset's unique race/ethnicity groupings don't align with
          U.S. Census categories. Consequently, certain groups (Middle Eastern &
          North African Women, Asian American & Pacific Islander Women, Native
          American, Alaska Native, & Native Hawaiian Women) lack corresponding
          population comparison metrics.
        </p>
        <p>
          We're currently unable to source reliable data on state legislature
          totals by state and year before 1983, preventing historical
          representation calculations before that year.
        </p>

        <h3 className='mt-12 font-medium text-title' id='pdoh-data-resources'>
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={pdohDataSources.map((source) => ({
            source: (
              <a
                key={source.data_source_name}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            updates: source.update_frequency,
          }))}
        />
        <KeyTermsTopicsAccordion
          hashId='pdoh-key-terms'
          datatypeConfigs={datatypeConfigs}
        />

        <Resources id='pdoh-resources' resourceGroups={[PDOH_RESOURCES]} />
      </article>
    </section>
  )
}

export default PdohLink
