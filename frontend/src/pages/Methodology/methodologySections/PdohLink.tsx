import { datasourceMetadataAhr } from '../../../data/config/DatasetMetadataAhr'
import { datasourceMetadataBjs } from '../../../data/config/DatasetMetadataBjs'
import { datasourceMetadataChr } from '../../../data/config/DatasetMetadataChr'
import { datasourceMetadataVera } from '../../../data/config/DatasetMetadataVera'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { PDOH_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigPDOH'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { MissingCAWPData } from '../methodologyContent/missingDataBlurbs'
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
        <h2 className='text-title mt-12 font-medium' id='pdoh-data-sourcing'>
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
        <h3 className='text-title mt-12 font-medium' id='jails-vs-prisons'>
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
          className='text-title mt-12 font-medium'
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
        <h3 className='text-title mt-12 font-medium' id='combined-systems'>
          Combined Systems
        </h3>
        <p>
          Some states, like Alaska, Connecticut, Delaware, Hawaii, Rhode Island,
          and Vermont, integrate both prison and jail systems. For our reports,
          these are categorized as prison facilities only.
        </p>

        <h3 className='text-title mt-12 font-medium' id='political-forces'>
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
          className='text-title mt-12 font-medium'
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

        <h3 className='text-title mt-12 font-medium' id='women-in-gov'>
          Women in Elected Office and Health Impacts
        </h3>

        <p>
          Having women in government has been linked to improvements in
          population health. Women in elected office advocate for vital social
          and political determinants of health, such as education, social
          welfare, reproductive and maternal health, and family life. These
          policies significantly advance health equity.
        </p>

        <h3 className='text-title mt-12 font-medium' id='pdoh-data-metrics'>
          Data Metrics and Methodology
        </h3>
        <p>
          We use data from the Center for American Women in Politics (CAWP) to
          present metrics on the representation of women in legislative and
          executive roles:
        </p>

        <ul className='list-disc pl-4'>
          <li className='font-sans-title font-medium'>
            Women in State Legislature
          </li>
          <li className='font-sans-title font-medium'>
            {' '}
            Women in U.S. Congress
          </li>
          <li className='font-sans-title font-medium'>Women Governors</li>
          <li className='font-sans-title font-medium'>
            Women Lieutenant Governors
          </li>
        </ul>

        <p>
          These data types cover state and national levels, and all but
          lieutenant governors also cover territories. Our national level
          calculations include officeholders from U.S. territories, leading to
          variations from the CAWP website's data. All gender and race/ethnicity
          categorizations are self-reported. An officeholder might appear in
          multiple race groups based on their identification.
        </p>

        <h3 className='text-title mt-12 font-medium' id='governors-data'>
          Governors and Lieutenant Governors Data
        </h3>
        <p>
          Governor data covers the 50 states and the five inhabited U.S.
          territories at the state, territory, and national levels. Each has one
          governor, so the denominator is 1 per state or territory per year.
          Alaska and Hawaii are counted from statehood in 1959, and each
          territory from its first popularly elected governor: Puerto Rico in
          1949, Guam and the U.S. Virgin Islands in 1971, and American Samoa and
          the Northern Mariana Islands in 1978. A state or territory's rate is
          therefore either 0% or 100% in a given year, and with 55 governors
          today, national rates change in steps of about 2%. Because the numbers
          are this small, a single election can move a group's national share
          sharply. D.C. has a mayor rather than a governor and is not included.
        </p>
        <p>
          Lieutenant governor data covers the states where the office is elected
          statewide: 43 states as of 2026, rising to 44 when Arizona's first
          lieutenant governor takes office in 2027. Maine, New Hampshire,
          Oregon, and Wyoming have no lieutenant governor, and in Tennessee and
          West Virginia the title belongs to the state senate president, who is
          not elected statewide, so those states are not included. The office
          was created or took its current title after 1915 in several states
          (Arkansas 1927, Georgia 1947, Hawaii 1959, Florida 1969, Alaska 1970,
          Maryland 1971, Utah 1975, New Jersey 2010), and each counts from that
          year. We maintain this list, with a source for each state, in a
          reference file we review every year. CAWP does not track territorial
          lieutenant governors, so territories are not included.
        </p>
        <p>
          The President and Vice President are not included. With only two
          offices nationwide, a rate would not be meaningful. Kamala Harris, who
          served as Vice President from 2021 to 2025, is the only woman to have
          held either office.
        </p>

        <h3
          className='text-title mt-12 font-medium'
          id='county-level-congress-data'
        >
          County-Level U.S. Congress Data
        </h3>
        <p>
          Women in U.S. Congress data is also available at the county level.
          County figures are derived by mapping congressional districts to
          counties using the{' '}
          <strong>
            U.S. Census Bureau TIGER 2022 county-to-congressional-district
            crosswalk
          </strong>{' '}
          (118th Congress boundaries). Every Congress member whose district
          overlaps a county is counted for that county.
        </p>
        <p>
          Because each county shares two U.S. senators with every other county
          in its state, the denominator is typically <strong>3 members</strong>{' '}
          (2 senators + 1 representative). This produces only four possible
          percentages: 0%, 33%, 67%, or 100%. Counties that span multiple House
          districts will have a higher denominator and proportionally more
          gradations. Members from multi-county districts are counted once in
          each overlapping county.
        </p>
        <p>
          Note: county-level data reflects 118th Congress district boundaries
          and will not automatically update when new boundaries are certified
          after a redistricting cycle.
        </p>

        <p>
          For each of those data types we calculate and present two metrics to
          study the proportion of women officeholders:
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

        <h3 className='text-title mt-12 font-medium' id='historical-tracking'>
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
          className='text-title mt-12 font-medium'
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
        <div id='pdoh-missing-data'>
          <MissingCAWPData headingLevel='h3' />
        </div>

        <h3
          className='text-title mt-12 font-medium'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...PDOH_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={{
            ...datasourceMetadataChr,
            ...datasourceMetadataVera,
            ...datasourceMetadataAhr,
            ...datasourceMetadataBjs,
          }}
        />

        <h3 className='text-title mt-12 font-medium' id='pdoh-data-resources'>
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
