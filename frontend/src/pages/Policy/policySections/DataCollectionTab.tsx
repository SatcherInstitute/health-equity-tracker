import { Helmet } from 'react-helmet-async'
import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'
import StripedTable from '../../Methodology/methodologyComponents/StripedTable'
import DatasetList from '../policyComponents/DatasetList'
import {
  gunViolenceDatasets,
  gvDefinitions,
} from '../policyContent/DataCollectionContent'

export default function DataCollectionTab() {
  return (
    <>
      <title>Data Collection - Health Equity Tracker</title>
      <section id='source-profile'>
        <article className='group mt-8 mb-8 rounded-md border border-methodologyGreen border-solid bg-white p-4 shadow-raised-tighter'>
          <HetOverline className='my-0' text='Source Profile' />
          <h2 className='my-0 font-medium text-title'>
            CDC's WISQARS™(Web-based Injury Statistics Query and Reporting
            System)
          </h2>

          <p>
            The{' '}
            <a href={dataSourceMetadataMap.cdc_wisqars.data_source_link}>
              CDC's WISQARS™ (Web-based Injury Statistics Query and Reporting
              System)
            </a>{' '}
            dataset includes a wide range of information related to gun-related
            injuries, providing a holistic perspective on the impact of
            gun-related incidents.
          </p>
          <ul className='grid list-none grid-cols-2 gap-4 p-0 text-smallest'>
            <li className='flex flex-col'>
              <p className='my-0 font-semibold text-altGreen'>
                Time-Series Range
              </p>
              <p className='my-0'>2001 - current</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 font-semibold text-altGreen'>
                Geographic Level
              </p>
              <p className='my-0'>National, State</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 font-semibold text-altGreen'>
                Demographic Granularity
              </p>
              <p className='my-0'>Race/ethnicity, sex, age</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 font-semibold text-altGreen'>
                Update Frequency
              </p>
              <p className='my-0'>Yearly</p>
            </li>
          </ul>
        </article>
      </section>
      <section id='key-metrics'>
        <div className='mb-0'>
          <HetOverline text='Our Methods' />
          <h2 className='my-0 font-medium text-altGreen text-title'>
            Key Metrics
          </h2>
        </div>
        <p>
          Our key metrics encompass data on fatal gun-related incidents, with a
          detailed breakdown by age, sex, and, for fatalities, by race and
          ethnicity (as the data allows). These metrics provide a granular view
          of the gun violence landscape, highlighting trends and disparities
          crucial for understanding the impact within the Atlanta community.
        </p>
      </section>
      <section id='data-limitations'>
        <h2 className='my-0 font-medium text-altGreen text-title'>
          Data Limitations
        </h2>
        <p>
          While our dataset is comprehensive, it's important to note certain
          limitations: potential underreporting in certain demographics, and the
          challenges in interpreting data with suppressed or unstable values.
          These limitations necessitate cautious interpretation and underscore
          the need for ongoing data enhancement.
        </p>
      </section>

      <section id='fatality-definitions'>
        <h2 className='my-4 font-medium text-altGreen text-title'>
          Fatality Definitions
        </h2>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Topic', accessor: 'topic' },
            {
              header: 'Measurement Definition',
              accessor: 'measurementDefinition',
            },
          ]}
          rows={gvDefinitions}
        />
      </section>
      <section id='available-data'>
        <h2 className='mt-6 mb-2 font-medium text-altGreen text-title'>
          Available Data
        </h2>
        <p className='mb-0'>
          Currently, all of our gun violence datasets include national- and
          state-level data. Here is a brief overview of what is included in our
          data collection.
        </p>
        <DatasetList datasets={gunViolenceDatasets} />
      </section>
    </>
  )
}
