import { Grid } from '@mui/material'
import {
  CONTACT_TAB_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { LinkWithStickyParams } from '../../utils/urlutils'

import styles from './SignupSection.module.scss'
import HetEmailSignup from '../../styles/HetComponents/HetEmailSignup'

export default function SignupSection() {
  return (
    <Grid
      container
      direction='column'
      justifyContent='center'
      className={styles.NewsEmailSignup}
    >
      <Grid item>
        <p>
          Please{' '}
          <LinkWithStickyParams to={CONTACT_TAB_LINK}>
            contact us
          </LinkWithStickyParams>{' '}
          with any questions or concerns, and{' '}
          <LinkWithStickyParams to={SHARE_YOUR_STORY_TAB_LINK}>
            consider sharing your own story
          </LinkWithStickyParams>
          .
        </p>
        <p>
          For more information about health equity, please sign up for our
          Satcher Health Leadership Institute newsletter.
        </p>
      </Grid>
      <Grid item container justifyContent='center' alignItems='center'>
        <HetEmailSignup id='signup-section-email-signup' />
      </Grid>
    </Grid>
  )
}
