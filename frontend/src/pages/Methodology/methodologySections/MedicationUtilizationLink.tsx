import { HashLink } from 'react-router-hash-link'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { METRIC_CONFIG } from '../../../data/config/MetricConfig'
import { MEDICARE_CATEGORY_DROPDOWNIDS } from '../../../data/config/MetricConfigPhrma'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import KeyTermsTopicsAccordion from '../methodologyComponents/KeyTermsTopicsAccordion'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { MEDICARE_MEDICATION_RESOURCES } from '../methodologyContent/ResourcesData'
import { buildTopicsString } from './linkUtils'

const medicareMedicationDataSources = [dataSourceMetadataMap.phrma]

const datatypeConfigs = MEDICARE_CATEGORY_DROPDOWNIDS.flatMap((dropdownId) => {
  return METRIC_CONFIG[dropdownId]
})

const medicareTopicsString = buildTopicsString(MEDICARE_CATEGORY_DROPDOWNIDS)

export default function MedicareMedicationLink() {
  return (
    <section id='medication-utilization'>
      <article>
        <title>Medication Utilization - Health Equity Tracker</title>

        <StripedTable
          id='categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
          ]}
          rows={[
            {
              category: 'Medication Utilization in the Medicare Population',
              topic: medicareTopicsString,
            },
          ]}
        />

        <h2
          className='mt-12 font-medium text-title'
          id='medication-utilization-data-sourcing'
        >
          Data Sourcing
        </h2>
        <p>
          Data presented is from 2020 and is sourced directly from the Medicare
          Administrative Data and encoded based on the fields below. For these
          reports, the study population consists of Medicare fee-for-service
          beneficiaries ages 18+, continuously enrolled, and treated with a
          medication of interest during the measurement period. For more
          information refer directly to the{' '}
          <a href='https://www2.ccwdata.org/documents/10280/19022436/codebook-mbsf-abcd.pdf'>
            data dictionary
          </a>
          .
        </p>

        <table className='m-4 border-collapse border-bg-color border-solid p-1'>
          <thead className='bg-join-effort-bg1 font-bold'>
            <tr>
              <th>Field from data dictionary</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className='even:bg-explore-bg-color'>
            <tr>
              <td className='border-collapse border-bg-color border-solid p-1'>
                <>RTI_RACE_CD</>
              </td>
              <td className='border-collapse border-bg-color border-solid p-1'>
                Beneficiary race code (modified using RTI algorithm). The race
                of the beneficiary and enhanced based on first and last name
                algorithms.
              </td>
            </tr>
            <tr>
              <td className='border-collapse border-bg-color border-solid p-1'>
                <>SEX_IDENT_CD</>
              </td>
              <td className='border-collapse border-bg-color border-solid p-1'>
                This variable indicates the sex of the beneficiary.
              </td>
            </tr>
            <tr>
              <td className='border-collapse border-bg-color border-solid p-1'>
                <>AGE_AT_END_REF_YR</>
              </td>
              <td className='border-collapse border-bg-color border-solid p-1'>
                This is the beneficiary’s age, expressed in years and calculated
                as of the end of the calendar year, or, for beneficiaries that
                died during the year, age as of the date of death.
              </td>
            </tr>
            <tr>
              <td className='border-collapse border-bg-color border-solid p-1'>
                <>CST_SHR_GRP_CD</>
              </td>
              <td className='border-collapse border-bg-color border-solid p-1'>
                Monthly cost sharing group under Part D low-income subsidy.
                Beneficiaries receiving the subsidy at any time during the year
                were classified as LIS.
              </td>
            </tr>
            <tr>
              <td className='border-collapse border-bg-color border-solid p-1'>
                <>ENTLMT_RSN_CURR</>
              </td>
              <td className='border-collapse border-bg-color border-solid p-1'>
                Current reason for Medicare entitlement. This variable indicates
                how the beneficiary currently qualifies for Medicare.
              </td>
            </tr>
          </tbody>
        </table>

        <section>
          <div className='py-5'>
            <h3 className='font-normal text-text'>Medicare PQA Adherence</h3>
            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Renin Angiotensin System Antagonists</HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-RASA)
                </a>
              </li>
              <li>
                <HetTerm>Statins</HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-STA)
                </a>
              </li>

              <li>
                <HetTerm>Beta-blockers</HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-BB)
                </a>
              </li>
              <li>
                <HetTerm>Calcium Channel Blockers</HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-CCB)
                </a>
              </li>
              <li>
                <HetTerm>
                  Adherence to Direct-Acting Oral Anticoagulants
                </HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-DOAC)
                </a>
              </li>
              <li>
                <HetTerm>Antiretroviral Medications</HetTerm>{' '}
                <a href='https://www.pqaalliance.org/assets/Measures/PQA_Measures_Overview.pdf'>
                  (PQA PDC-ARV)
                </a>
              </li>
            </ul>

            <h4 className='my-2'>Metrics</h4>
            <ul>
              <li>
                <HetTerm>Adherence Rate</HetTerm>: this rate measures the
                percentage of Medicare fee-for-service beneficiaries 18 years
                and older who met the Proportion of Days Covered (PDC) threshold
                of 80% for the indicated medication during the measurement year.
              </li>
            </ul>
          </div>
          <div className='py-5'>
            <h3 className='list-inside font-normal text-text'>
              Medicare NQF Adherence
            </h3>

            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>
                  Persistence of Beta-Blocker Treatment After a Heart Attack
                </HetTerm>{' '}
                <a href='https://www.qualityforum.org/QPS/0071'>(NQF 0071)</a>
              </li>
              <li>
                <HetTerm>
                  Adherence to Antipsychotic Medications For Individuals with
                  Schizophrenia
                </HetTerm>{' '}
                <a href='https://www.qualityforum.org/QPS/1879'>(NQF 1879)</a>
              </li>
            </ul>

            <h4 className='my-2'>Metrics</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>
                  Persistence of Beta-Blocker Treatment After a Heart Attack
                </HetTerm>{' '}
                measures the percentage of Medicare fee-for-service
                beneficiaries 18 years and older during the measurement year who
                were hospitalized and discharged with a diagnosis of acute
                myocardial infarction (AMI) and who received persistent
                beta-blocker treatment for six months after discharge.
              </li>
              <li>
                <HetTerm>
                  Adherence to Antipsychotic Medications For Individuals with
                  Schizophrenia
                </HetTerm>{' '}
                measures the percentage of Medicare fee-for-service
                beneficiaries 18 years and older during the measurement year
                with schizophrenia or schizoaffective disorder who had at least
                two prescriptions filled for any antipsychotic medication and
                who had a Proportion of Days Covered (PDC) of at least 0.8 for
                antipsychotic medications during the measurement period (12
                consecutive months)
              </li>
            </ul>
          </div>
          <div className='py-5'>
            <h3 className='font-normal text-text'>Medicare Disease Measures</h3>

            <h4 className='my-2'>Conditions</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>HIV cases</HetTerm>
              </li>
              <li>
                <HetTerm>Acute Myocardial Infarction (AMI) cases</HetTerm>
              </li>
              <li>
                <HetTerm>Schizophrenia cases</HetTerm>
              </li>
            </ul>

            <h4 className='my-2'>Metrics</h4>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <HetTerm>Cases per 100k</HetTerm>: Rate of beneficiaries with
                the specified disease per 100,000 beneficiaries.
                <ul>
                  <li>
                    AMI defined as beneficiaries having 1+ medical claims with
                    ICD-10-CM of I21
                  </li>
                  <li>
                    HIV defined as beneficiaries having 1+ medical claims with
                    ICD-10-CM of B20.
                  </li>
                  <li>
                    Schizophrenia defined as beneficiaries having 1+ medical
                    claims with ICD-10-CM of F20.
                  </li>
                </ul>
              </li>
              <li>
                <HetTerm>Percent share</HetTerm>: this figure measures a
                particular group's share of the total cases of the condition.
              </li>
              <li>
                <HetTerm>Population percent</HetTerm>: this figure measures a
                particular group's share of the total measured population:
                Medicare fee-for-service beneficiaries 18 years and older.
              </li>
            </ul>
          </div>
          <div className='py-5'>
            <h3 className='font-normal text-text'>
              Medicare Demographic Identifiers
            </h3>
            <p>
              <strong>Race/ethnicity:</strong> Medicare enhances the race and
              ethnicity of each beneficiary that has been used by the Social
              Security Administration and applies{' '}
              <a href='https://resdac.org/cms-data/variables/research-triangle-institute-rti-race-code'>
                an algorithm
              </a>{' '}
              that identifies more beneficiaries of Hispanic and Asian descent.
              Due to sample size constraints and data availability, we
              categorized racial/ethnic groups using the following groups, and
              have adjusted the wording in some cases to use more inclusive
              terminology and to correspond more closely with our other data
              sources.
            </p>
            <ul className='list-inside list-disc pl-4'>
              <li>
                <i>Asian/Pacific Islander</i> we represent as{' '}
                <HetTerm>
                  Asian, Native Hawaiian, and Pacific Islander (Non-Hispanic)
                </HetTerm>
              </li>
              <li>
                <i>American Indian / Alaska Native</i> we represent as{' '}
                <HetTerm>Indigenous (Non-Hispanic)</HetTerm>
              </li>
              <li>
                <i>Non-Hispanic White</i> we represent as{' '}
                <HetTerm>White (Non-Hispanic)</HetTerm>
              </li>
              <li>
                <i>Black or African-American</i> we represented as{' '}
                <HetTerm>Black or African American (Non-Hispanic)</HetTerm>
              </li>
              <li>
                <i>Hispanic</i> we represent as{' '}
                <HetTerm>Hispanic or Latino</HetTerm>
              </li>
              <li>
                <i>Other</i> we represent as{' '}
                <HetTerm>Unrepresented race (Non-Hispanic)</HetTerm>
              </li>
              <li>
                <i>Unknown</i> we represent on our{' '}
                <HashLink
                  to={
                    '/exploredata?mls=1.medicare_cardiovascular-3.00&group1=All&demo=race_and_ethnicity#unknown-demographic-map'
                  }
                >
                  Unknown Demographic Map
                </HashLink>
              </li>
            </ul>

            <p>
              <>Sex:</> Medicare{' '}
              <a href='https://resdac.org/cms-data/variables/sex'>
                collects the sex of each beneficiary
              </a>{' '}
              as Unknown, Male, or Female.
            </p>

            <p>
              <>Age:</> Medicare provides the age of each beneficiary at the end
              of the reference year (i.e., 2020), or, for beneficiaries that
              died during the year,{' '}
              <a href='https://resdac.org/cms-data/variables/age-beneficiary-end-year'>
                age as of the date of death
              </a>
              . We categorized age into the following groups:
            </p>
            <ul className='list-inside list-disc pl-4'>
              <li>18-39 years old</li>
              <li>40-64 years old</li>
              <li>65-69 years old</li>
              <li>70-74 years old</li>
              <li>75-79 years old</li>
              <li>80-84 years old</li>
              <li>85+ years old</li>
            </ul>

            <p>
              <b>Low-Income Subsidy Eligibility:</b> The Low-Income Subsidy
              (LIS) program for Medicare Part D beneficiaries provides subsidies
              to reduce or eliminate premiums and deductibles, and offers zero
              to reduced co-payments{' '}
              <a href='https://resdac.org/cms-data/variables/current-reason-entitlement-code'>
                for low-income Medicare Part D beneficiaries
              </a>
              . We categorized Medicare beneficiaries, who were eligible for the
              Part D LIS program, for 1 or more months during 2020 as “receiving
              Low Income Subsidy.” Medicare beneficiaries, who were{' '}
              <a href='https://resdac.org/cms-data/variables/monthly-cost-sharing-group-under-part-d-low-income-subsidy-january'>
                not eligible for the Part D LIS program
              </a>{' '}
              at any time during 2020 were classified as “not receiving Low
              Income Subsidy.”
            </p>

            <p>
              <b>Entitlement Qualification:</b> Medicare collects the reason for
              enrollment in Medicare. We categorized each beneficiary’s reason
              for Medicare enrollment as:
            </p>
            <ul className='list-inside list-disc pl-4'>
              <li>Eligible due to age</li>
              <li>Eligible due to disability</li>
              <li>Eligible due to end-stage renal disease (ESRD)</li>
              <li>
                Eligible due to disability and end-stage renal disease (ESRD)
              </li>
            </ul>
          </div>
        </section>
        <h3
          className='mt-12 font-medium text-title'
          id='demographic-stratification'
        >
          Demographic Stratification
        </h3>
        <HetTopicDemographics
          topicIds={[...MEDICARE_CATEGORY_DROPDOWNIDS]}
          datasourceMetadata={dataSourceMetadataMap.phrma}
        />

        <h3
          className='mt-12 font-medium text-title'
          id='medication-utilization-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={medicareMedicationDataSources.map((source) => ({
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
          hashId='medication-utilization-key-terms'
          datatypeConfigs={datatypeConfigs}
        />
        <Resources
          id='medication-utilization-resources'
          resourceGroups={[MEDICARE_MEDICATION_RESOURCES]}
        />
      </article>
    </section>
  )
}
