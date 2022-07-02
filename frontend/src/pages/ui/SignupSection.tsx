import { Button, Grid, TextField } from "@material-ui/core";
import React from "react";
import { urlMap } from "../../utils/externalUrls";
import { LinkWithStickyParams } from "../../utils/urlutils";
import { CONTACT_TAB_LINK } from "../../utils/internalRoutes";

import styles from "./SignupSection.module.scss";

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
          Please{" "}
          <LinkWithStickyParams to={CONTACT_TAB_LINK}>
            contact us
          </LinkWithStickyParams>{" "}
          with any questions or concerns.
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
  );
}
