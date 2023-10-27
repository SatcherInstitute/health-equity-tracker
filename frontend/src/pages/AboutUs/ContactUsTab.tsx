import { Helmet } from 'react-helmet-async'
import { urlMap } from '../../utils/externalUrls'
import { Button, TextField } from '@mui/material'
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
      <div className=" flex w-full flex-col content-center items-center">
        <div className="hidden w-full md:flex">
          <div className="grid w-full place-content-center border-1 border-solid border-border-color  border-opacity-50 md:w-5/12">
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
          <div className="w-full border-1 border-solid border-border-color border-opacity-50  md:w-7/12">
            <img
              width="870"
              height="644"
              src="/img/stock/women-laughing-in-line.png"
              className="m-10 h-auto w-9/12 max-w-xl rounded-3xl"
              alt=""
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center px-12 md:w-8/12 lg:w-6/12">
          <div className="grid  w-full place-content-center">
            <h3
              className="px-18
              mb-0
                py-6
                font-serif
                text-header
                font-light
                leading-lhSomeMoreSpace
                text-alt-green
                md:py-12"
            >
              Thank you for your interest in the Health Equity Tracker
            </h3>
          </div>
          <div className="w-full md:w-7/12">
            <h4 className="mb-2 mt-8 text-text font-bold">
              Join our mailing list:
            </h4>
            <div>
              <form
                action={urlMap.newsletterSignup}
                method="post"
                target="_blank"
                className="flex justify-center"
              >
                <TextField
                  id="Enter email address to sign up" // Accessibility label
                  name="MERGE0"
                  variant="outlined"
                  type="email"
                  aria-label="Enter Email Address for Newsletter signup"
                  placeholder="Enter email address"
                />
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  aria-label="Sign Up for Newsletter in a new window"
                >
                  Sign up
                </Button>
              </form>
            </div>

            <h4 className="mb-0 mt-8 text-text font-bold">
              For general requests and media inquiries:
            </h4>
            <div>
              Please contact the{' '}
              <a href={urlMap.shli}>Satcher Health Leadership Institute</a> at{' '}
              <a href="mailto:info@healthequitytracker.org">
                info@healthequitytracker.org
              </a>
            </div>

            <h4 className="mb-0 mt-8 text-text font-bold">Phone:</h4>
            <div>
              <a href="tel:4047528654">(404) 752-8654</a>
            </div>

            <h4 className="mb-0 mt-8 text-text font-bold">Mailing address:</h4>
            <div>
              Morehouse School of Medicine
              <br />
              Satcher Health Leadership Institute
              <br />
              720 Westview Drive SW
              <br />
              Atlanta, Georgia 30310
            </div>

            <h4 className="mb-0 mt-8 text-text font-bold">Share your story:</h4>
            <div>
              Read our{' '}
              <Link to={SHARE_YOUR_STORY_TAB_LINK}>
                article submission guidelines
              </Link>{' '}
              for potential inclusion on our{' '}
              <Link to={NEWS_PAGE_LINK}>News and Stories page</Link>, and email
              the address above with any specific questions.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactUsTab
