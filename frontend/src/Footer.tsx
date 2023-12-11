import Grid from '@mui/material/Grid'
import styles from './Footer.module.scss'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import {
  EXPLORE_DATA_PAGE_LINK,
  TERMS_OF_USE_PAGE_LINK,
  FAQ_TAB_LINK,
  CONTACT_TAB_LINK,
  NEWS_PAGE_LINK,
  OLD_METHODOLOGY_PAGE_LINK,
} from './utils/internalRoutes'
import AppbarLogo from './assets/AppbarLogo.png'
import PartnerSatcher from './assets/PartnerSatcher.png'
import { urlMap } from './utils/externalUrls'
import { currentYear } from './cards/ui/SourcesHelpers'
import HetReturnToTop from './styles/HetComponents/HetReturnToTop'
import HetLinkButton from './styles/HetComponents/HetLinkButton'

function Footer() {
  return (
    <div className={styles.Footer}>
      <Grid container justifyContent='space-around' alignItems='center'>
        <Grid item xs={12} sm={12} lg={6} xl={4} className={styles.FooterGrid}>
          <Logos />
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
          md={10}
          lg={6}
          xl={4}
          className={styles.LinksContainer}
        >
          <Grid
            className={styles.Links}
            justifyContent='space-between'
            alignItems='center'
            spacing={0}
            container
          >
            {[
              ['Explore Data', EXPLORE_DATA_PAGE_LINK],
              ['Methods', OLD_METHODOLOGY_PAGE_LINK],
              ['News', NEWS_PAGE_LINK],
              ['FAQs', `${FAQ_TAB_LINK}`, 'Frequently Asked Questions'],
              ['Contact Us', `${CONTACT_TAB_LINK}`],
              ['Terms of Use', `${TERMS_OF_USE_PAGE_LINK}`],
            ].map(([label, link, ariaLabel]) => (
              <LinkGridItem
                key={link}
                text={label}
                link={link}
                ariaLabel={ariaLabel}
              />
            ))}
          </Grid>

          <Grid item container className={styles.CopyrightSpanBox}>
            <span className={styles.CopyrightSpan}>&copy;{currentYear()}</span>
          </Grid>
        </Grid>

        <Grid
          container
          item
          direction='column'
          xs={12}
          md={1}
          lg={12}
          xl={1}
          alignItems='center'
          justifyContent='center'
        >
          <Grid item container justifyContent='center'>
            <HetReturnToTop />
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

function Logos() {
  return (
    <Grid item container spacing={2} justifyContent='center'>
      <Grid
        container
        item
        xs={10}
        sm={5}
        alignItems='center'
        justifyContent='center'
        wrap='nowrap'
      >
        <Grid item>
          <HetLinkButton href='/'>
            <img
              src={AppbarLogo}
              className='m-2 mb-0 h-[30px] w-[30px]'
              alt='Health Equity Tracker logo'
            />
          </HetLinkButton>
        </Grid>
        <Grid item>
          <Grid container justifyContent='flex-start' alignItems='flex-start'>
            <Grid item xs={12}>
              <span className={styles.FooterTitleSpan} aria-hidden='true'>
                Health Equity Tracker
              </span>
              <Grid container justifyContent='center'>
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliLinkedIn}
                    aria-label='Satcher Health on LinkedIn'
                  >
                    <LinkedInIcon />
                  </a>
                </Grid>
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliTwitter}
                    aria-label='Satcher Health on Twitter'
                  >
                    <TwitterIcon />
                  </a>
                </Grid>
                <Grid item className={styles.SocialsIcon}>
                  <a
                    href={urlMap.shliYoutube}
                    aria-label='Satcher Health on YouTube'
                  >
                    <YouTubeIcon />
                  </a>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={10}
        sm={5}
        container
        justifyContent='center'
        alignItems='center'
      >
        <HetLinkButton href={urlMap.shli}>
          <img
            src={PartnerSatcher}
            alt='Satcher Health Leadership Institute Logo'
            height={60}
            width={216}
          />
        </HetLinkButton>
      </Grid>
    </Grid>
  )
}

function LinkGridItem(props: {
  text: string
  link: string
  ariaLabel: string
}) {
  return (
    <HetLinkButton
      ariaLabel={props.ariaLabel}
      href={props.link}
      className='w-full text-navlink-color no-underline sm:w-auto'
    >
      {props.text}
    </HetLinkButton>
  )
}

export default Footer
