import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./TermsOfUsePage.module.scss";
import { Typography } from "@material-ui/core";
import { HET_URL } from "../../utils/urlutils";
import { Helmet } from "react-helmet-async";

function TermsOfUsePage() {
  return (
    <>
      <Helmet>
        <title>Terms of Use - Health Equity Tracker</title>
      </Helmet>
      <Grid container className={styles.TosSection} justifyContent="center">
        <Grid item xs={12} md={3} xl={12} component={"header"}>
          <Typography id="main" className={styles.TosHeaderText} variant="h2">
            Terms of Use
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          md={9}
          xl={12}
          className={styles.TosContent}
          component="ul"
        >
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>Privacy Policy</h3>
            <p>
              Morehouse School of Medicine’s (MSM) Health Equity Tracker (HET)
              is committed to protecting your online privacy. The only
              information MSM’s HET obtains about individual visitors to this
              web site is information supplied voluntarily by the visitor. This
              policy outlines the practices of MSM regarding the collection and
              use of your personal information from your visit to our web site.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>
              Personally Provided Information
            </h3>
            <p>
              In general, you can visit official MSM web sites, such as the
              Health Equity Tracker ({HET_URL}) without revealing any personal
              information. If you choose to provide us with any personal
              information by sending an email or by filling out a form with your
              personal information and submitting it through a MSM web site, we
              use that information to respond to your message and to help us
              provide you with information or material that you request. We do
              not give, share, sell or transfer any personal information to a
              third party unless required by law.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>
              Email and Phone Communications
            </h3>
            <p>
              Email communication that you send to us via contact forms on our
              sites or through phone calls may be shared with a customer service
              representative, employee, HET partners or medical expert that is
              most able to address your inquiry. We make every effort to respond
              in a timely fashion once communications are received.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>
              Collection of Technical Information
            </h3>
            <p>
              MSM and the HET use IP addresses (the Internet address of your
              computer) to help diagnose problems with our servers and to
              administer our site. For instance, we run statistical software to
              identify those parts of our site that are more heavily used and
              which portion of our audience comes from within the MSM network.
              But, we do not link IP addresses to anything personally
              identifiable.
            </p>
            <p>
              Like many other web sites, portions of MSM’s HET web site might
              use cookies. This is typically done to recognize you and your
              access privileges on the MSM web site. For instance, using cookies
              prevents the user from needing to constantly reenter a password on
              every site of MSM. These cookies get stored on your computer and
              never contain personal data and cannot be accessed remotely by
              anybody other than MSM.
            </p>
            <p>
              While aggregate statistical reports may be generated based on site
              usage, no personally identifiable information will ever be
              disseminated to any unaffiliated third party.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>Security</h3>
            <p>
              While no computing environment can be 100% secure, it is MSM’s
              goal to maintain as secure a technical environment as feasible
              given the current state of capabilities and technologies. MSM will
              comply with all state and federal statutes requiring additional
              safeguards for certain types of information, such as students’
              personally identifiable information and patients’ protected health
              information.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>Links to Other Sites</h3>
            <p>
              Please note that some pages within MSM web site, for the
              convenience of users, are linked to web sites not managed by the
              institution or HET. MSM does not review, control or take
              responsibility for the content of these web sites. Once you link
              to another site, you are subject to the privacy policy of the new
              web site.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>
              Changes to our Privacy Policy
            </h3>
            <p>
              We may change the terms and conditions of our Privacy Policy at
              any time by posting revisions on the MSM and HET web site. By
              accessing or using the MSM and HET web site, you agree to be bound
              by all the terms and conditions of our Privacy Policy as posted on
              the MSM and HET web site at the time of your access or use. If you
              do not agree to the terms of this Privacy Policy or any revised
              statement, please exit the site immediately.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>Complaint Process</h3>
            <p>
              If you have a complaint or problem with the HET website, or if you
              believe your privacy rights have been violated from the HET
              website, you may email us at HET@msm.edu. Please indicate the
              reason for contacting us. The HET Communications and Dissemination
              Core will review your complaint for response or resolution.
            </p>
          </Grid>
          <Grid item className={styles.TosChunk} component="li">
            <h3 className={styles.TosChunkHeader}>Disclaimer</h3>
            <p>
              No data protection method or combination of methods can be
              guaranteed as completely secure. MSM nor HET are responsible for
              and will not be held liable for disclosures of your personal
              information due to errors in transmissions or unauthorized acts of
              third parties. MSM nor HET guarantee the privacy of your
              confidential information transmitted to its web site should you
              choose not to use the appropriate secure on-line forms provided in
              the relevant pages of the web site. By using this web site you
              agree to the terms and conditions outlined in this Privacy Policy
              statement.
            </p>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default TermsOfUsePage;
