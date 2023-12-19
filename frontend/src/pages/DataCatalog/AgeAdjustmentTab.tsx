import Grid from '@mui/material/Grid'
import { Helmet } from 'react-helmet-async'
import {
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'
import HetBigCTA from '../../styles/HetComponents/HetBigCTA'
import {
  AgeAdjustmentIntro,
  AgeSpecificTableConfig,
  AlgorithmSection,
  DataSourcingSection,
  DeathRatioTable,
  ExampleTable,
  ExpectedProductTable,
  ExpectedSumTable,
  StandardPopulationTable,
} from '../Methodology/methodologyComponents/AgeAdjustmentComponents'

export default function AgeAdjustmentTab() {
  return (
    <>
      <Helmet>
        <title>Age-Adjustment - Health Equity Tracker</title>
      </Helmet>
      <h2 className='sr-only'>Age-Adjustment</h2>
      <Grid
        container
        direction='column'
        justifyContent='space-around'
        alignItems='center'
      >
        <Grid container className='m-auto max-w-md px-5 pb-12 pt-1'>
          <article className='pb-6'>
            <h3
              className='text-center font-serif text-smallHeader font-light text-alt-black'
              id='main'
            >
              Calculating Age-Adjusted Ratios
            </h3>

            <div className='text-left font-sansText text-small text-alt-black'>
              {/* AGE-ADJUSTED INFO */}

              <AgeAdjustmentIntro />
              <DataSourcingSection />
              <AlgorithmSection />

              {/* TABLES */}

              <ExampleTable />
              <AgeSpecificTableConfig />
              <StandardPopulationTable />
              <ExpectedProductTable />
              <ExpectedSumTable />
              <DeathRatioTable />
            </div>
          </article>
        </Grid>

        <Grid item xs={12} sm={12} md={8} lg={5}>
          <HetBigCTA
            href={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
          >
            Explore age-adjusted ratios
          </HetBigCTA>
        </Grid>
      </Grid>
    </>
  )
}
