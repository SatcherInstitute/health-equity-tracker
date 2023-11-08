import Grid from '@mui/material/Grid'
import styles from './WhatIsHealthEquityPage.module.scss'
import { Typography } from '@mui/material'
import { CONTACT_TAB_LINK } from '../../utils/internalRoutes'
import { Helmet } from 'react-helmet-async'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { CITATION_APA } from '../../cards/ui/SourcesHelpers'
import { selectFAQs } from './FaqData'

function FaqTab() {
  return (
    <>
      <Helmet>
        <title>FAQ - What Is Health Equity - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>
        Frequently Asked Questions
      </h2>
      <Grid container className={styles.Grid}>
        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography
              id='main'
              tabIndex={-1}
              className={styles.FaqHeaderText}
              variant='h2'
            >
              Data
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  {selectFAQs[4].questionText}
                </h3>
                <div className={styles.FaqAnswer}>{selectFAQs[4].answer}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  {selectFAQs[2].questionText}
                </h3>
                <div className={styles.FaqAnswer}>{selectFAQs[2].answer}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  {selectFAQs[3].questionText}
                </h3>
                <div className={styles.FaqAnswer}>{selectFAQs[3].answer}</div>
                <a href='/datacatalog' className={styles.MajorLink}>
                  See Data Sources
                </a>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are the inequities in the data?
                </h3>
                <div className={styles.FaqAnswer}>
                  <ul>
                    <li>
                      We’ve seen that many agencies do not reliably collect race
                      and ethnicity data
                    </li>
                    <li>Others that do collect it, fail to report it</li>
                    <li>
                      Racial and ethnic categories are often left up to a
                      person’s interpretation and may not be accurate
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What principles guide you?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    It is essential that this work and its resulting products
                    are done consistently in an ethical manner. One of the core
                    values of the Health Equity Task Force charged with
                    developing the Health Equity Tracker is the importance of
                    working in a way that garners public trust.{' '}
                  </p>
                  <h4 className={styles.FaqSubheaderText}>
                    These guiding questions help ensure the right standards are
                    in place:
                  </h4>
                  <ul>
                    <li>Do we have open access and input in place?</li>
                    <li>Is there transparency among stakeholders?</li>
                    <li>
                      Are we using valid and current data that is reflective of
                      the realities?
                    </li>
                    <li>
                      Is the community a part of the ownership and authorship of
                      this work?
                    </li>
                    <li>
                      Have we created a tool that has real value for all
                      stakeholders including the communities?
                    </li>
                    <li>Are we holding our partners accountable?</li>
                  </ul>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant='h2'>
              Definitions
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>What is equity?</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Equity refers to everyone having a fair opportunity to reach
                    their full potential and no one being disadvantaged from
                    achieving this potential (Dawes D.E., 2020).
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What is the difference between equality and equity?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    By definition, equality means “the state of being equal,
                    especially in status, rights, and opportunities.” Equity, in
                    comparison, “the quality of being fair and just.” Equity
                    occurs when everyone has access to the necessary tools to
                    achieve their full potential. Equality occurs when everyone
                    has the same level and quality of access, which may not
                    yield fair results.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  {selectFAQs[0].questionText}
                </h3>
                <div className={styles.FaqAnswer}>{selectFAQs[0].answer}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  {selectFAQs[1].questionText}
                </h3>
                <div className={styles.FaqAnswer}>{selectFAQs[1].answer}</div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are political determinants of health?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    The political determinants of health create the structural
                    conditions and the social drivers – including poor
                    environmental conditions, inadequate transportation, unsafe
                    neighborhoods, and lack of healthy food options – that
                    affect all other dynamics of health. (Dawes, D.E. 2020) What
                    is important to note, is that the political determinants of
                    health are more than merely separate and distinct from the
                    social determinants of health, they actually serve as the
                    instigators of the social determinants that many people are
                    already well acquainted with.
                  </p>
                  <p>
                    By understanding these political determinants, their
                    origins, and their impact on the equitable distribution of
                    opportunities and resources, we can be better equipped to
                    develop and implement actionable solutions to close the
                    health gap.
                  </p>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  What are social determinants of health?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    Social determinants of health are conditions in the
                    environments in which people are born, live, learn, work,
                    play, worship, and age that affect a wide range of health,
                    functioning, and quality-of-life outcomes and risks.
                    (Healthy People 2020, CDC)
                  </p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={styles.FaqSection}>
          <Grid item xs={12} sm={12} md={3}>
            <Typography className={styles.FaqHeaderText} variant='h2'>
              Take Action
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Grid container>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>How can I get involved?</h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    To advance health equity, we need smart, talented,
                    passionate folks like you on board.
                  </p>
                  <ul>
                    <li>
                      Sign up for our newsletter to stay up to date with the
                      latest news
                    </li>
                    <li>
                      Share our site and graphs with your community on social
                      media
                    </li>
                    <li>
                      Share your health equity story.{' '}
                      <a href={`${CONTACT_TAB_LINK}`}>
                        Click here to contact us
                      </a>
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion}>
                  How do I share or save the visualizations (graphs, charts,
                  maps)?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>
                    In the top-right of each card, there is an icon button with
                    three horizontal dots like this: <MoreHorizIcon />. Clicking
                    on this button within each card gives you some options for
                    exporting the content of the card. You can:
                  </p>
                  <ul>
                    <li>
                      Copy a link that will navigate back to this exact card on
                      this exact report
                    </li>
                    <li>
                      Save an image of the entire card as a PNG file to your
                      device
                    </li>
                    <li>
                      Share the direct card link to multiple social media
                      platforms as a post
                    </li>
                    <li>
                      Compose a new email on your device with a direct link back
                      to this card on this report
                    </li>
                  </ul>
                </div>
              </Grid>
              <Grid item xs={12} className={styles.FaqQuestionAndAnswer}>
                <h3 className={styles.FaqQuestion} id='citation'>
                  What is the recommended citation (APA) for the Health Equity
                  Tracker?
                </h3>
                <div className={styles.FaqAnswer}>
                  <p>{CITATION_APA}</p>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default FaqTab
