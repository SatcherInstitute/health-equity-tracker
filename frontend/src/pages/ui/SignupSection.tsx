import { Button, Grid, TextField } from '@mui/material'
import { urlMap } from '../../utils/externalUrls'
import {
  CONTACT_TAB_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { LinkWithStickyParams } from '../../utils/urlutils'

import styles from './SignupSection.module.scss'

export default function SignupSection() {
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
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
      <Grid item container justifyContent="center" alignItems="center">
        <form action={urlMap.newsletterSignup} method="post" target="_blank">
          <TextField
            id="Enter email address to sign up" // Accessibility label
            name="MERGE0"
            variant="outlined"
            className={styles.NewsEmailTextField}
            type="email"
            role="textbox"
            aria-label="Enter Email Address for Newsletter signup"
            placeholder="Enter email address"
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            className={styles.NewsEmailAddressFormSubmit}
            aria-label="Sign Up for Newsletter in a new window"
          >
            Sign up
          </Button>
        </form>
      </Grid>
    </Grid>
  )
}
