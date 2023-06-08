import { Button, Divider, Grid, Typography } from '@mui/material'
import styles from './NewsPage.module.scss'

export default function ShareYourStory() {
  return (
    <Grid
      sx={{ textAlign: 'start' }}
      width={'100%'}
      container
      alignItems={'center'}
      justifyContent={'center'}
      direction={'column'}
    >
      <Grid maxWidth={'md'}>
        <Grid padding={'6rem 4rem 1rem 4rem'}>
          <Typography
            id="main"
            variant="h2"
            className={styles.ShareYourStoryHeaderText}
          >
            Call for Community Writers
          </Typography>
          <Typography
            className={styles.ShareYourStoryHeaderSubtext}
            variant="subtitle1"
          >
            Share Your Story and Amplify Your Voice
          </Typography>
        </Grid>

        <p>
          We believe that everyone's voice matters when it comes to health
          equity and ending the HIV epidemic. We invite community members,
          advocates, and individuals directly affected by HIV to share their
          personal stories, insights, and experiences on our ‘New and Stories’
          page. By contributing, you can help raise awareness, foster
          understanding, and inspire positive change in underserved communities.
          To ensure the quality and credibility of the content, we kindly ask
          you to follow the guidelines outlined below.
        </p>

        <Divider sx={{ mt: 5 }}>
          <Typography
            className={styles.GuidelinesHeaderText}
            variant="subtitle1"
          >
            Submission guidelines
          </Typography>
        </Divider>

        <ul className={styles.GuidelinesList}>
          <li>
            <b>Purpose of News and Stories:</b> Our articles focus on health
            equity and large-scale public health efforts such as ending the HIV
            epidemic. Please align your story with these topics, addressing
            issues related to health disparities, social determinants of health,
            barriers to access and care, and the impact on underserved
            communities.
          </li>

          <li>
            <b>Personal Stories:</b> We value personal narratives that
            authentically express a unique perspective and resonate with
            readers. Share your own experiences related to HIV, health equity,
            or any related aspect you feel is relevant.
          </li>

          <li>
            <b>Accuracy and Validity:</b> We encourage you to include
            evidenced-based information in your story whenever possible. If you
            mention statistics, studies, or any specific data, please provide
            credible references. Use reputable sources such as scientific
            journals, government reports, or recognized health organizations to
            support your claims.
          </li>

          <li>
            <b>Respectful and Inclusive Language:</b> Maintain a respectful and
            inclusive tone throughout your writing. Avoid offensive language,
            stereotypes, or stigmatizing attitudes. Our goal is to foster a safe
            and supportive environment for readers from diverse backgrounds.
          </li>

          <li>
            <b>Formatting and Length:</b> Structure your story with an
            introduction, body, and conclusion. Aim for a length of under 2000
            words to maintain readability and engagement. Feel free to include
            headings, subheadings, or bullet points to enhance clarity and
            organization.
          </li>

          <li>
            <b>Plagiarism and Copyright:</b> Ensure that your story is original
            and not published elsewhere. Plagiarism or copyright infringement
            will not be tolerated. If you include any external sources, provide
            proper citations and give credit to the original authors.
          </li>

          <li>
            <b>Submitting Your Story:</b> To contribute, please send your story
            as a Word document or Google Doc to{' '}
            <a href="mailto:info@healthequitytracker.org">
              info@healthequitytracker.org
            </a>
            . Include a brief bio (2-3 sentences) introducing yourself and any
            relevant affiliations or experiences you would like to share.
          </li>

          <li>
            <b>Editorial Process:</b> All submissions will go through an
            editorial process to ensure clarity, grammar, and adherence to the
            guidelines. You may be requested to revise your story based on
            feedback from our editorial team. We will notify you if your story
            is selected for publication.
          </li>

          {/* <li>
            <b>Anonymity and Privacy:</b> If you prefer to remain anonymous or
            use a pseudonym, please let us know in your submission email. We
            respect your privacy and will handle your personal information with
            utmost confidentiality.
          </li> */}

          <li>
            <b>Publication and Promotion:</b> While we cannot guarantee that all
            submissions will be published, we appreciate your contribution and
            will notify you if your story is selected. Published stories will be
            promoted on our website and various social media platforms,
            amplifying their reach and impact.
          </li>
        </ul>

        <Divider sx={{ m: 5 }} />

        <p>
          Thank you for considering sharing your story with us. Your voice can
          make a difference in advancing health equity for all people. We look
          forward to hearing from you and appreciate your support in creating a
          more inclusive and informed community.
        </p>
        <Grid container justifyContent={'center'} mt={5}>
          <Button
            variant="contained"
            color="primary"
            className={styles.ShareYourStoryButton}
            href="mailto:info@healthequitytracker.org"
          >
            Share your story
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
