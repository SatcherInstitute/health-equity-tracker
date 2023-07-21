import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
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
import sass from '../../styles/variables.module.scss'
import { type PopoverElements } from '../../utils/hooks/usePopover'
import styles from './CardShareIcons.module.scss'

const shareIconAttributes = {
  iconFillColor: sass.altDark,
  bgStyle: { fill: 'none' },
  size: 39,
}

interface CardShareIconsProps {
  popover: PopoverElements
  reportTitle: string
  urlWithHash: string
}

export default function CardShareIcons(props: CardShareIconsProps) {
  const title = `Health Equity Tracker - ${props.reportTitle}`
  const emailShareBody = `${title}${'\n'}${'\n'}` // Add line breaks here if needed
  const sharedUrl = props.urlWithHash

  function handleClose() {
    props.popover.close()
  }

  return (
    <>
      <MenuItem aria-label={'Share to Twitter'} onClick={handleClose}>
        <ListItemIcon className={styles.ListItemShareIcon}>
          <TwitterShareButton
            hashtags={['healthequity']}
            related={['@SatcherHealth', '@MSMEDU']}
            url={sharedUrl}
            className={styles.TwitterShareButton}
          >
            <TwitterIcon
              {...shareIconAttributes}
              className={styles.TwitterIcon}
            />
            <div className={styles.ShareIconLinkText}>Share on Twitter</div>
          </TwitterShareButton>
        </ListItemIcon>
      </MenuItem>

      <MenuItem
        aria-label={'Share on Facebook'}
        className={styles.FacebookMenuItem}
        onClick={handleClose}
      >
        <ListItemIcon className={styles.ListItemShareIcon}>
          <FacebookShareButton
            aria-label={'Post this report to Facebook'}
            hashtag={'#healthequity'}
            quote={''}
            url={sharedUrl}
            className={styles.FacebookShareButton}
          >
            <FacebookIcon
              {...shareIconAttributes}
              className={styles.FacebookIcon}
            />
            <div className={styles.ShareIconLinkText}>Share on Facebook</div>
          </FacebookShareButton>
        </ListItemIcon>
      </MenuItem>

      <MenuItem
        aria-label={'Share on LinkedIn'}
        className={styles.FacebookMenuItem}
        onClick={handleClose}
      >
        <ListItemIcon className={styles.ListItemShareIcon}>
          <LinkedinShareButton
            aria-label={'Share to LinkedIn'}
            className={styles.FacebookShareButton}
            source={'Health Equity Tracker'}
            url={sharedUrl}
          >
            <LinkedinIcon
              {...shareIconAttributes}
              className={styles.LinkedInIcon}
            />
            <div className={styles.ShareIconLinkText}>Share on LinkedIn</div>
          </LinkedinShareButton>
        </ListItemIcon>
      </MenuItem>

      <MenuItem
        aria-label={'Email card link'}
        className={styles.EmailMenuItem}
        onClick={handleClose}
      >
        <ListItemIcon className={styles.ListItemShareIcon}>
          <EmailShareButton
            aria-label={'Share by email'}
            body={emailShareBody}
            className={styles.TwitterShareButton}
            subject={`Sharing from healthequitytracker.org`}
            url={sharedUrl}
          >
            <EmailIcon
              {...shareIconAttributes}
              className={styles.TwitterIcon}
            />
            <div className={styles.ShareIconLinkText}>Email card link</div>
          </EmailShareButton>
        </ListItemIcon>
      </MenuItem>
    </>
  )
}
