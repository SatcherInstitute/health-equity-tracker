import styles from './AboutUsPage.module.scss'
import { Helmet } from 'react-helmet-async'
import { urlMap } from '../../utils/externalUrls'
import { Button, TextField, Typography, Grid } from '@mui/material'

function ContactUsTab() {
  return (
    <>
      <Helmet>
        <title>Contact Us - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Contact Us</h2>
      <Grid container className={styles.Grid}>
        <Grid
          container
          className={styles.GridOutlinedImgRow}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item md={5} className={styles.GridVerticallyAlignedItem}>
            <Typography
              id="main"
              className={styles.ContactUsHeaderText}
              variant="h2"
            >
              <span className={styles.MoveEquityForward}>
                Let's move
                <br aria-hidden="true" />
                equity <b style={{ fontWeight: 400 }}>forward</b>
              </span>
            </Typography>
          </Grid>
          <Grid item md={7} className={styles.HeaderImgItem}>
            <img
              width="870"
              height="644"
              src="/img/stock/women-laughing-in-line.png"
              className={styles.ImgContactUsHeader}
              alt=""
            />
          </Grid>
        </Grid>

        <Grid
          container
          className={styles.GridOutlinedRow}
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12} sm={12} md={8} lg={6}>
            <Typography
              className={styles.ContactUsSubheaderText}
              variant="h4"
              paragraph={true}
            >
              Thank you for your interest in the Health Equity Tracker
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={7}>
            <p className={styles.ContactUsP}>
              <b>Join our mailing list:</b>
            </p>

            <form
              action={urlMap.newsletterSignup}
              method="post"
              target="_blank"
            >
              <Grid container justifyContent="center" alignContent="center">
                <Grid item>
                  <TextField
                    id="Enter email address to sign up" // Accessibility label
                    name="MERGE0"
                    variant="outlined"
                    className={styles.EmailTextField}
                    type="email"
                    aria-label="Enter Email Address for Newsletter signup"
                    placeholder="Enter email address"
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className={styles.EmailAddressFormSubmit}
                    aria-label="Sign Up for Newsletter in a new window"
                  >
                    Sign up
                  </Button>
                </Grid>
              </Grid>
            </form>

            <p className={styles.ContactUsP}>
              <b>For general requests and media inquiries:</b>
              <br />
              Please contact the{' '}
              <a href={urlMap.shli}>
                Satcher Health Leadership Institute
              </a> at <a href="mailto:shli@msm.edu">shli@msm.edu</a>
            </p>

            <p className={styles.ContactUsP}>
              <b>Phone:</b>
              <br />
              <a href="tel:4047528654">(404) 752-8654</a>
            </p>

            <p className={styles.ContactUsP}>
              <b>Mailing address:</b>
              <br />
              Morehouse School of Medicine
              <br />
              Satcher Health Leadership Institute
              <br />
              720 Westview Drive SW
              <br />
              Atlanta, Georgia 30310
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ContactUsTab
