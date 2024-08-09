import { Helmet } from 'react-helmet-async'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import StripedTable from '../../Methodology/methodologyComponents/StripedTable'
import { BlockRounded, CheckRounded } from '@mui/icons-material'
import { Tooltip, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export default function DataCollectionTab() {
	return (
		<>
			<Helmet>
				<title>Data Collection - Health Equity Tracker</title>
			</Helmet>
			<h2 className='sr-only'>Data Collection</h2>
			<section id='#source-profile'>
				<article className='mb-8 rounded-md shadow-raised-tighter p-8'>
					<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
						SOURCE PROFILE
					</p>
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
						<p className='my-0 text-altGreen font-semibold'>Geographic Level</p>
						<p className='my-0'>National, State</p>
					</li>
					<li className='flex flex-col'>
						<p className='my-0 text-altGreen font-semibold'>
							Demographic Granularity
						</p>
						<p className='my-0'>Race/ethnicity, sex, age</p>
					</li>
					<li className='flex flex-col'>
						<p className='my-0 text-altGreen font-semibold'>Update Frequency</p>
						<p className='my-0'>Yearly</p>
					</li>
				</ul>
				</article>
			</section>
			<section id='#key-metrics'>
				<div className='mb-0'>
					<p className='my-0 text-left font-sansTitle text-smallest font-extrabold uppercase text-black tracking-widest'>
						OUR METHODS
					</p>
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

			<section id='#available-data'>
				<h3 className='my-0 text-title font-medium text-altGreen'>
					Available Data
				</h3>
				<div className='grid grid-cols-1 md:grid-cols-2'>
					<div>
						<p className='text-smallest'>
							What’s included in our <HetTerm>youth (0-17)</HetTerm> dataset:
						</p>
						<ul className='list-none p-0 text-smallest'>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />
								<p className='my-0 ml-2'>National- and state-level data</p>
							</li>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />

								<p className='my-0 ml-2'>Breakdowns by race/ethnicity</p>
							</li>
							<li className='flex flex-row align-center'>
								<BlockRounded className='text-text text-redOrange' />

								<p className='my-0 ml-2'>Breakdowns by age</p>
							</li>
							<li className='flex flex-row align-center'>
								<BlockRounded className='text-text text-redOrange' />

								<p className='my-0 ml-2'>Breakdowns by sex</p>
							</li>
							<li className='flex flex-row align-center'>
								<BlockRounded className='text-text text-redOrange' />

								<p className='my-0 ml-2'>Breakdowns by cause of death</p>
							</li>
						</ul>
					</div>

					<div>
						<p className='text-smallest'>
							What’s included in our <HetTerm>general population</HetTerm>{' '}
							dataset:
						</p>
						<ul className='list-none p-0 text-smallest'>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />
								<p className='my-0 ml-2'>National- and state-level data</p>
							</li>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />

								<p className='my-0 ml-2'>Breakdowns by race/ethnicity</p>
							</li>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />

								<p className='my-0 ml-2'>Breakdowns by age</p>
							</li>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />

								<p className='my-0 ml-2'>Breakdowns by sex</p>
							</li>
							<li className='flex flex-row align-center'>
								<CheckRounded className='text-text text-altGreen' />

								<p className='my-0 ml-2'>Breakdowns by cause of death</p>
							</li>
						</ul>
					</div>
				</div>
			</section>
			<section id='#fatality-definitions'>
				<h3 className='my-4 text-title font-medium text-altGreen'>
					Fatality Definitions
				</h3>
				<StripedTable
					id=''
					applyThickBorder={false}
					columns={[
						{ header: 'Topic', accessor: 'topic' },
						{
							header: 'Measurement Definition',
							accessor: 'measurementDefinition',
						},
					]}
					rows={[
						{
							topic: 'Gun deaths (youth)',
							measurementDefinition:
								'Deaths of individuals under the age of 18 caused by firearms.',
						},
						{
							topic: 'Gun homicides',
							measurementDefinition:
								'Deaths caused by firearms used with the intent to harm others.',
						},
						{
							topic: 'Gun suicides',
							measurementDefinition:
								'Deaths resulting from individuals using firearms to inflict self-harm.',
						},
					]}
				/>
			</section>
		</>
	)
}