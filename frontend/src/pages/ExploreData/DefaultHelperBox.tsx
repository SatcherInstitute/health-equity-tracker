import { Box, Grid } from '@mui/material'
import {
  COVID_DEATHS_AGE_FULTON_COUNTY_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  HIV_PREVALANCE_RACE_USA_SETTING,
  PRISON_VS_POVERTY_RACE_GA_SETTING,
  UNINSURANCE_SEX_FL_VS_CA_SETTING,
  WARM_WELCOME_DEMO_SETTING,
} from '../../utils/internalRoutes'
import styles from './DefaultHelperBox.module.scss'
import DisclaimerAlert from '../../reports/ui/DisclaimerAlert'

export default function DefaultHelperBox() {
  return (
    <Grid
      container
      alignContent='flex-start'
      justifyContent='center'
      className={styles.NoTopicContent}
    >
      <section className='m-0 mb-5 max-w-helperBox content-center items-center justify-center justify-items-center bg-standard-info'>
        <Grid
          item
          xs={12}
          container
          justifyContent={'space-evenly'}
          className='px-12 pb-0 pt-4'
        >
          <Grid item xs={12} md={6} container justifyContent={'center'}>
            <div className='text-left'>
              <h3 className={styles.BigHeadline}>Select a topic above</h3>

              <h3 className={styles.LittleHeadline}>
                ...or explore one of the following reports:
              </h3>

              <ul className={styles.SuggestedReportsList}>
                <li className={styles.SuggestedReportsListItem}>
                  <a
                    href={
                      EXPLORE_DATA_PAGE_LINK + HIV_PREVALANCE_RACE_USA_SETTING
                    }
                  >
                    HIV by race
                  </a>
                </li>
                <li className={styles.SuggestedReportsListItem}>
                  <a
                    href={
                      EXPLORE_DATA_PAGE_LINK +
                      COVID_DEATHS_AGE_FULTON_COUNTY_SETTING
                    }
                  >
                    COVID-19 in Fulton County, Georgia, by age
                  </a>
                </li>
                <li className={styles.SuggestedReportsListItem}>
                  <a
                    href={
                      EXPLORE_DATA_PAGE_LINK + PRISON_VS_POVERTY_RACE_GA_SETTING
                    }
                  >
                    Prison & poverty in Georgia, by race
                  </a>
                </li>
                <li className={styles.SuggestedReportsListItem}>
                  <a
                    href={
                      EXPLORE_DATA_PAGE_LINK + UNINSURANCE_SEX_FL_VS_CA_SETTING
                    }
                  >
                    Uninsurance in Florida & California, by sex
                  </a>
                </li>
              </ul>
            </div>
          </Grid>

          <Grid
            container
            item
            xs={12}
            md={6}
            className={styles.NoTopicHelperVideoBoxWithCaption}
            direction='column'
            alignItems='center'
            justifyContent='center'
          >
            <Box mt={1} mb={5} sx={{ display: { xs: 'block', md: 'none' } }}>
              <DisclaimerAlert />
            </Box>
            <div className={styles.NoTopicHelperVideoBox}>
              <iframe
                loading='lazy'
                className={styles.ResourceVideoEmbed}
                src='https://www.youtube.com/embed/XBoqT9Jjc8w'
                title='YouTube video player'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              ></iframe>
            </div>
            <p className='px-4 pb-4 text-small md:px-4'>
              <i>
                New to the tracker? Watch the video demo, or take a{' '}
                <a href={EXPLORE_DATA_PAGE_LINK + WARM_WELCOME_DEMO_SETTING}>
                  guided tour of a COVID-19 report.
                </a>
              </i>
            </p>
          </Grid>
        </Grid>
        <Box mx={7} my={7} sx={{ display: { xs: 'none', md: 'block' } }}>
          <DisclaimerAlert />
        </Box>
      </section>
    </Grid>
  )
}
