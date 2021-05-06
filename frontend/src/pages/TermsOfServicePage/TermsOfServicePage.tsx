import React, { Dispatch, SetStateAction } from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./TermsOfServicePage.module.scss";
import { Typography } from "@material-ui/core";

function TermsOfServicePage(props: {
  setTabIndexFx: Dispatch<SetStateAction<number>>;
}) {
  return (
    <>
      <title>Terms of Service - Health Equity Tracker</title>
      <h1 className={styles.ScreenreaderTitleHeader}>Terms of Service</h1>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.TosSection}>
          <Grid item xs={3}>
            <Typography
              id="main"
              tabIndex={-1}
              className={styles.TosHeaderText}
              variant="h2"
            >
              Privacy Policy
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <div className={styles.TosAnswer}>
                  <p>
                    Morehouse School of Medicine’s (MSM) Health Equity Tracker
                    (HET) is committed to protecting your online privacy. The
                    only information MSM’s HET obtains about individual visitors
                    to this web site is information supplied voluntarily by the
                    visitor. This policy outlines the practices of MSM regarding
                    the collection and use of your personal information from
                    your visit to our web site.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Personally Provided Information
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    In general, you can visit official MSM web sites, such as
                    the Health Equity Tracker (www.healthequitytracker.org)
                    without revealing any personal information. If you choose to
                    provide us with any personal information by sending an email
                    or by filling out a form with your personal information and
                    submitting it through a MSM web site, we use that
                    information to respond to your message and to help us
                    provide you with information or material that you request.
                    We do not give, share, sell or transfer any personal
                    information to a third party unless required by law.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Email and Phone Communications
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    Email communication that you send to us via contact forms on
                    our sites or through phone calls may be shared with a
                    customer service representative, employee, HET partners or
                    medical expert that is most able to address your inquiry. We
                    make every effort to respond in a timely fashion once
                    communications are received.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Collection of Technical Information
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    MSM and the HET use IP addresses (the Internet address of
                    your computer) to help diagnose problems with our servers
                    and to administer our site. For instance, we run statistical
                    software to identify those parts of our site that are more
                    heavily used and which portion of our audience comes from
                    within the MSM network. But, we do not link IP addresses to
                    anything personally identifiable.
                  </p>
                  <p>
                    Like many other web sites, portions of MSM’s HET web site
                    might use cookies. This is typically done to recognize you
                    and your access privileges on the MSM web site. For
                    instance, using cookies prevents the user from needing to
                    constantly reenter a password on every site of MSM. These
                    cookies get stored on your computer and never contain
                    personal data and cannot be accessed remotely by anybody
                    other than MSM.
                  </p>
                  <p>
                    While aggregate statistical reports may be generated based
                    on site usage, no personally identifiable information will
                    ever be disseminated to any unaffiliated third party.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Security</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    While no computing environment can be 100% secure, it is
                    MSM’s goal to maintain as secure a technical environment as
                    feasible given the current state of capabilities and
                    technologies. MSM will comply with all state and federal
                    statutes requiring additional safeguards for certain types
                    of information, such as students’ personally identifiable
                    information and patients’ protected health information.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Links to Other Sites</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    Please note that some pages within MSM web site, for the
                    convenience of users, are linked to web sites not managed by
                    the institution or HET. MSM does not review, control or take
                    responsibility for the content of these web sites. Once you
                    link to another site, you are subject to the privacy policy
                    of the new web site.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Changes to our Privacy Policy
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    We may change the terms and conditions of our Privacy Policy
                    at any time by posting revisions on the MSM and HET web
                    site. By accessing or using the MSM and HET web site, you
                    agree to be bound by all the terms and conditions of our
                    Privacy Policy as posted on the MSM and HET web site at the
                    time of your access or use. If you do not agree to the terms
                    of this Privacy Policy or any revised statement, please exit
                    the site immediately.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Complaint Process</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    If you have a complaint or problem with the HET website, or
                    if you believe your privacy rights have been violated from
                    the HET website, you may email us at HET@msm.edu. Please
                    indicate the reason for contacting us. The HET
                    Communications and Dissemination Core will review your
                    complaint for response or resolution.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Disclaimer</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    No data protection method or combination of methods can be
                    guaranteed as completely secure. MSM nor HET are responsible
                    for and will not be held liable for disclosures of your
                    personal information due to errors in transmissions or
                    unauthorized acts of third parties. MSM nor HET guarantee
                    the privacy of your confidential information transmitted to
                    its web site should you choose not to use the appropriate
                    secure on-line forms provided in the relevant pages of the
                    web site. By using this web site you agree to the terms and
                    conditions outlined in this Privacy Policy statement.
                  </p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.TosSection}>
          <Grid item xs={3}>
            <Typography className={styles.TosHeaderText} variant="h2">
              Terms and Conditions
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <div className={styles.TosAnswer}>
                  <p>
                    Morehouse School of Medicine’s (MSM) Health Equity Tracker
                    (HET) is committed to protecting your online privacy. The
                    only information MSM’s HET obtains about individual visitors
                    to this web site is information supplied voluntarily by the
                    visitor. This policy outlines the practices of MSM regarding
                    the collection and use of your personal information from
                    your visit to our web site.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Personally Provided Information
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    In general, you can visit official MSM web sites, such as
                    the Health Equity Tracker (www.healthequitytracker.org)
                    without revealing any personal information. If you choose to
                    provide us with any personal information by sending an email
                    or by filling out a form with your personal information and
                    submitting it through a MSM web site, we use that
                    information to respond to your message and to help us
                    provide you with information or material that you request.
                    We do not give, share, sell or transfer any personal
                    information to a third party unless required by law.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Email and Phone Communications
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    Email communication that you send to us via contact forms on
                    our sites or through phone calls may be shared with a
                    customer service representative, employee, HET partners or
                    medical expert that is most able to address your inquiry. We
                    make every effort to respond in a timely fashion once
                    communications are received.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Collection of Technical Information
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    MSM and the HET use IP addresses (the Internet address of
                    your computer) to help diagnose problems with our servers
                    and to administer our site. For instance, we run statistical
                    software to identify those parts of our site that are more
                    heavily used and which portion of our audience comes from
                    within the MSM network. But, we do not link IP addresses to
                    anything personally identifiable.
                  </p>
                  <p>
                    Like many other web sites, portions of MSM’s HET web site
                    might use cookies. This is typically done to recognize you
                    and your access privileges on the MSM web site. For
                    instance, using cookies prevents the user from needing to
                    constantly reenter a password on every site of MSM. These
                    cookies get stored on your computer and never contain
                    personal data and cannot be accessed remotely by anybody
                    other than MSM.
                  </p>
                  <p>
                    While aggregate statistical reports may be generated based
                    on site usage, no personally identifiable information will
                    ever be disseminated to any unaffiliated third party.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Security</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    While no computing environment can be 100% secure, it is
                    MSM’s goal to maintain as secure a technical environment as
                    feasible given the current state of capabilities and
                    technologies. MSM will comply with all state and federal
                    statutes requiring additional safeguards for certain types
                    of information, such as students’ personally identifiable
                    information and patients’ protected health information.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Links to Other Sites</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    Please note that some pages within MSM website, for the
                    convenience of users, are linked to web sites not managed by
                    the institution or HET. MSM does not review, control or take
                    responsibility for the content of these web sites. Once you
                    link to another site, you are subject to the privacy policy
                    of the new website.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>
                  Changes to our Privacy Policy
                </h3>
                <div className={styles.TosAnswer}>
                  <p>
                    We may change the terms and conditions of our Privacy Policy
                    at any time by posting revisions on the MSM and HET website.
                    By accessing or using the MSM and HET web site, you agree to
                    be bound by all the terms and conditions of our Privacy
                    Policy as posted on the MSM and HET website at the time of
                    your access or use. If you do not agree to the terms of this
                    Privacy Policy or any revised statement, please exit the
                    site immediately.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Complaint Process</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    If you have a complaint or problem with the HET website, or
                    if you believe your privacy rights have been violated from
                    the HET website, you may email us at shli@msm.edu. Please
                    indicate the reason for contacting us. The HET Team will
                    review your complaint for response or resolution.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.TosQuestionAndAnswer}>
                <h3 className={styles.TosQuestion}>Disclaimer</h3>
                <div className={styles.TosAnswer}>
                  <p>
                    No data protection method or combination of methods can be
                    guaranteed as completely secure. MSM nor HET are responsible
                    for and will not be held liable for disclosures of your
                    personal information due to errors in transmissions or
                    unauthorized acts of third parties. MSM nor HET guarantee
                    the privacy of your confidential information transmitted to
                    its web site should you choose not to use the appropriate
                    secure on-line forms provided in the relevant pages of the
                    web site. By using this web site you agree to the terms and
                    conditions outlined in this Privacy Policy statement.
                  </p>
                </div>
              </Grid>
            </Grid>
            <span>
              Copyright ©Morehouse School of Medicine 2021. All rights reserved.
            </span>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default TermsOfServicePage;
