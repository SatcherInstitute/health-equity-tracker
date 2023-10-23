import { Grid, Typography } from '@mui/material'
import styles from '../../AboutUs/AboutUsPage.module.scss'

const MethodologyHomeLink = () => {
  return (
    <section>
      <article>
        <h2 className={styles.ScreenreaderTitleHeader}>Methodology</h2>
        <Grid container className={styles.Grid} maxWidth={'md'}>
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
                  <b style={{ fontWeight: 400 }}>Explore</b> our
                  <br aria-hidden="true" />
                  methodologies
                </span>
              </Typography>
            </Grid>
            <Grid item md={7} className={styles.HeaderImgItem}>
              <img
                width="870"
                height="644"
                src="/img/stock/girls-studying.jpg"
                className={styles.ImgContactUsHeader}
                alt=""
              />
            </Grid>
          </Grid>
        </Grid>
      </article>
    </section>
  )
}

export default MethodologyHomeLink
