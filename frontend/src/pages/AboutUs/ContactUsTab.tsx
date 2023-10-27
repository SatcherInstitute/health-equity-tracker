import styles from './AboutUsPage.module.scss'
import { Helmet } from 'react-helmet-async'
import { urlMap } from '../../utils/externalUrls'
import { Button, TextField, Grid } from '@mui/material'
import {
  NEWS_PAGE_LINK,
  SHARE_YOUR_STORY_TAB_LINK,
} from '../../utils/internalRoutes'
import { Link } from 'react-router-dom'

function ContactUsTab() {
  return (
    <>
      <Helmet>
        <title>Contact Us - About Us - Health Equity Tracker</title>
      </Helmet>
      <h2 className="sr-only">Contact Us</h2>
      <div className=" flex w-full flex-col ">
        <div className="hidden w-full border-2 border-l-0 border-r-0 border-t-0 border-solid border-border-color md:flex">
          <div className="grid w-full place-content-center md:w-5/12">
            <h2
              id="main"
              className="font-serif
              text-biggerHeader
              font-light
              text-alt-green"
            >
              Let's move
              <br aria-hidden="true" />
              equity <i className="font-normal">forward</i>
            </h2>
          </div>
          <div className="w-full border-2 border-b-0 border-r-0 border-t-0 border-solid border-border-color  md:w-7/12">
            <img
              width="870"
              height="644"
              src="/img/stock/women-laughing-in-line.png"
              className="m-10 h-auto w-full max-w-xl rounded-3xl"
              alt=""
            />
          </div>
        </div>

        <Grid
          container
          className={styles.GridOutlinedRow}
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12} sm={12} md={8} lg={6}>
            <h4
              className="font-serif
                            text-header
                            font-light
                            text-alt-green"
            >
              Thank you for your interest in the Health Equity Tracker
            </h4>
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
              </a> at{' '}
              <a href="mailto:info@healthequitytracker.org">
                info@healthequitytracker.org
              </a>
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

            <p className={styles.ContactUsP}>
              <b>Share your story:</b>
              <br />
              Read our{' '}
              <Link to={SHARE_YOUR_STORY_TAB_LINK}>
                article submission guidelines
              </Link>{' '}
              for potential inclusion on our{' '}
              <Link to={NEWS_PAGE_LINK}>News and Stories page</Link>, and email
              the address above with any specific questions.
            </p>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default ContactUsTab
