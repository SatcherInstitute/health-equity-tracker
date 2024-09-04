import { Helmet } from 'react-helmet-async'
import StripedTable from '../../Methodology/methodologyComponents/StripedTable'
import { Tooltip, Typography } from '@mui/material'
import DatasetList from '../policyComponents/DatasetList'
import {
  datasets,
  gvDefinitions,
} from '../policyContent/DataCollectionContent'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

export default function DataCollectionTab() {
  return (
    <>
      <Helmet>
        <title>Data Collection - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Data Collection</h2>
      <section id='#source-profile'>
        <article className='rounded-md border border-solid border-methodologyGreen shadow-raised-tighter bg-white p-4 group mb-8 mt-4'>
          <HetOverline className='my-0' text='Source Profile'/>
          <h3 className='my-0 text-title font-medium'>
            CDC's WISQARS™(Web-based Injury Statistics Query and Reporting
            System)
          </h3>

          <p>
            The{' '}
            <a href='https://www.cdc.gov/injury/wisqars/index.html'>
              CDC's WISQARS™ (Web-based Injury Statistics Query and Reporting
              System)
            </a>{' '}
            dataset includes a wide range of information related to gun-related
            injuries, providing a holistic perspective on the impact of
            gun-related incidents.
          </p>
          <ul className='list-none grid gap-4 grid-cols-2 p-0 text-smallest'>
            <li className='flex flex-col'>
              <p className='my-0 text-altGreen font-semibold'>
                Time-Series Range
              </p>
              <p className='my-0'>2001 - current</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 text-altGreen font-semibold'>
                Geographic Level
              </p>
              <p className='my-0'>National, State</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 text-altGreen font-semibold'>
                Demographic Granularity
              </p>
              <p className='my-0'>Race/ethnicity, sex, age</p>
            </li>
            <li className='flex flex-col'>
              <p className='my-0 text-altGreen font-semibold'>
                Update Frequency
              </p>
              <p className='my-0'>Yearly</p>
            </li>
          </ul>
        </article>
      </section>
      <section id='#key-metrics'>
        <div className='mb-0'>
          <HetOverline text='Our Methods'/>
          <Tooltip
            placement='bottom-start'
            title={
              <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                Metrics are quantifiable indicators used to measure and analyze
                various aspects of public health data.
              </Typography>
            }
          >
            <h4 className='my-0 text-title font-medium text-altGreen underline decoration-dotted inline'>
              Key Metrics
            </h4>
          </Tooltip>
        </div>
        <p>
          Our key metrics encompass data on fatal gun-related incidents, with a
          detailed breakdown by age, sex, and, for fatalities, by race and
          ethnicity (as the data allows). These metrics provide a granular view
          of the gun violence landscape, highlighting trends and disparities
          crucial for understanding the impact within the Atlanta community.
        </p>
      </section>
      <section id='#data-limitations'>
        <h3 className='my-0 text-title font-medium text-altGreen'>
          Data Limitations
        </h3>
        <p>
          While our dataset is comprehensive, it's important to note certain
          limitations: potential underreporting in certain demographics, and the
          challenges in interpreting data with suppressed or unstable values.
          These limitations necessitate cautious interpretation and underscore
          the need for ongoing data enhancement.
        </p>
      </section>

      <section id='#fatality-definitions'>
        <h3 className='my-4 text-title font-medium text-altGreen'>
          Fatality Definitions
        </h3>
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
      <section id='#available-data'>
        <h3 className='mt-6 mb-2 text-title font-medium text-altGreen'>
          Available Data
        </h3>
        <p className='mb-0'>
          Currently, all of our gun violence datasets include national- and
          state-level data. Here is a brief overview of what is included in our
          data collection.
        </p>
        <DatasetList datasets={datasets} />
      </section>
    </>
  )
}
