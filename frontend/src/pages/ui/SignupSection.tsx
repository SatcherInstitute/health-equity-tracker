import { Button, Grid, TextField } from "@material-ui/core";
import React from "react";
import { CONTACT_TAB_LINK, LinkWithStickyParams } from "../../utils/urlutils";
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
        <form
          action="https://satcherinstitute.us11.list-manage.com/subscribe?u=6a52e908d61b03e0bbbd4e790&id=3ec1ba23cd&"
          method="post"
          target="_blank"
        >
          <TextField
            id="Enter email address to sign up" // Accessibility label
            name="MERGE0"
            variant="outlined"
            className={styles.NewsEmailTextField}
            type="email"
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
