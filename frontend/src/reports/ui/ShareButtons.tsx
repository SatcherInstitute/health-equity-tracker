import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from 'react-share'
import { Grid, Tooltip } from '@mui/material'
import styles from './ShareButtons.module.scss'
import sass from '../../styles/variables.module.scss'
import { type Article } from '../../pages/WhatIsHealthEquity/NewsTab'
import { getHtml } from '../../utils/urlutils'

export const SHARE_LABEL = 'Share this report:'

export const ARTICLE_DESCRIPTION =
  'Article from the Health Equity Tracker: a free-to-use data and visualization platform that is enabling new insights into the impact of COVID-19 and other determinants of health on marginalized groups in the United States.'

export interface ShareButtonProps {
  isMobile: boolean
  reportTitle?: string
  article?: Article
}

function ShareButtons(props: ShareButtonProps) {
  const sharedUrl: string = window.location.href
  let title: string = 'Health Equity Tracker'
  if (props.reportTitle) {
    title += ': ' + props.reportTitle
  }
  if (props.article) {
    const htmlTitle = getHtml(props.article.title.rendered, true)
    if (typeof htmlTitle === 'string') {
      title += ': “' + htmlTitle + '”'
    }
  }

  const shareIconAttributes = {
    iconFillColor: sass.altDark,
    bgStyle: { fill: 'none' },
    size: props.isMobile ? 64 : 32,
  }

  return (
    <Grid
      container
      flexDirection={'column'}
      justifyContent={props.reportTitle ? 'center' : 'flex-start'}
      alignItems={'center'}
    >
      <Grid item>
        <p className={styles.ShareLabel}>{SHARE_LABEL}</p>
      </Grid>
      <Grid item>
        {/* SOCIAL SHARE BUTTONS */}

        <Tooltip title="Tweet this report">
          <TwitterShareButton
            url={sharedUrl}
            hashtags={['healthequity']}
            related={['@SatcherHealth', '@MSMEDU']}
            aria-label={'Share to Twitter'}
          >
            <TwitterIcon {...shareIconAttributes} />
          </TwitterShareButton>
        </Tooltip>

        <Tooltip title="Post this report to Facebook">
          <FacebookShareButton
            url={sharedUrl}
            hashtag={'#healthequity'}
            quote={title}
            aria-label={'Post this report to Facebook'}
          >
            <FacebookIcon {...shareIconAttributes} />
          </FacebookShareButton>
        </Tooltip>

        <Tooltip title="Post this report to LinkedIn">
          <LinkedinShareButton
            source={'Health Equity Tracker'}
            url={sharedUrl}
            aria-label={'Share to LinkedIn'}
          >
            <LinkedinIcon {...shareIconAttributes} />
          </LinkedinShareButton>
        </Tooltip>

        <Tooltip title="Share this report by email">
          <EmailShareButton
            aria-label={'Share by email'}
            subject={`Sharing from healthequitytracker.org`}
            body={`${title}

`} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
            url={sharedUrl}
          >
            <EmailIcon {...shareIconAttributes} />
          </EmailShareButton>
        </Tooltip>
      </Grid>
    </Grid>
  )
}

export default ShareButtons
