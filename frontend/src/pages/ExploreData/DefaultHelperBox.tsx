import { Box, Grid, Alert } from '@mui/material'
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

import { Sidetab } from '@typeform/embed-react'
import { SHOW_PHRMA } from '../../data/providers/PhrmaProvider'

export default function DefaultHelperBox() {
  return (
    <Grid
      container
      alignContent="flex-start"
      justifyContent="center"
      className={styles.NoTopicContent}
    >
      <Alert severity="info" icon={<></>} className={styles.NoTopicAlert}>
        <Grid
          item
          xs={12}
          container
          justifyContent={'space-evenly'}
          className={styles.NoTopicBox}
        >
          <Grid item xs={12} md={6} container justifyContent={'center'}>
            <div>
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
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Box mt={1} mb={5} sx={{ display: { xs: 'block', md: 'none' } }}>
              <DisclaimerAlert />
            </Box>
            <div className={styles.NoTopicHelperVideoBox}>
              <iframe
                className={styles.ResourceVideoEmbed}
                src="https://www.youtube.com/embed/XBoqT9Jjc8w"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className={styles.NoTopicHelperVideoBoxTourText}>
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
      </Alert>

      {SHOW_PHRMA && (
        <Sidetab id="gTBAtJee" buttonText="give us your feedback!" />
      )}
    </Grid>
  )
}
