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
import styles from './OptionMenuIcons.module.scss'

const shareIconAttributes = {
    iconFillColor: sass.altDark,
    bgStyle: { fill: 'none' },
    size: 39,
}

export default function OptionMenuIcons() {
    const emailShareBody = `${'\n'}${'\n'}` // Add line breaks here if needed
    const sharedUrl = window.location.href

    return (
        <>
            <MenuItem
                aria-label={'Share to Twitter'}
            >
                <ListItemIcon className={styles.ListItemShareIcon}>
                    <TwitterShareButton
                        hashtags={['healthequity']}
                        related={['@SatcherHealth', '@MSMEDU']}
                        url={sharedUrl}
                        className={styles.TwitterShareButton}
                    >
                        <TwitterIcon {...shareIconAttributes} className={styles.TwitterIcon} />
                        <div className={styles.ShareIconLinkText}>Share on Twitter</div>
                    </TwitterShareButton>
                </ListItemIcon>
            </MenuItem>

            <MenuItem
                aria-label={'Share on Facebook'}
                className={styles.FacebookMenuItem}
            >
                <ListItemIcon className={styles.ListItemShareIcon}>
                    <FacebookShareButton
                        aria-label={'Post this report to Facebook'}
                        hashtag={'#healthequity'}
                        quote={''}
                        url={sharedUrl}
                        className={styles.FacebookShareButton}
                    >
                        <FacebookIcon {...shareIconAttributes} className={styles.FacebookIcon} />
                        <div className={styles.ShareIconLinkText}>Share on Facebook</div>
                    </FacebookShareButton>
                </ListItemIcon>
            </MenuItem>

            <MenuItem
                aria-label={'Share on LinkedIn'}
                className={styles.FacebookMenuItem}
            >
                <ListItemIcon className={styles.ListItemShareIcon}>
                    <LinkedinShareButton
                        aria-label={'Share to LinkedIn'}
                        source={'Health Equity Tracker'}
                        url={sharedUrl}
                        className={styles.FacebookShareButton}
                    >
                        <LinkedinIcon {...shareIconAttributes} className={styles.LinkedInIcon} />
                        <div className={styles.ShareIconLinkText}>Share on LinkedIn</div>
                    </LinkedinShareButton>
                </ListItemIcon>
            </MenuItem>

            <MenuItem
                aria-label={'Email card link'}
                className={styles.EmailMenuItem}
            >
                <ListItemIcon className={styles.ListItemShareIcon}>
                    <EmailShareButton
                        aria-label={'Share by email'}
                        body={emailShareBody}
                        subject={`Sharing from healthequitytracker.org`}
                        url={'Email card link'}
                        className={styles.TwitterShareButton}
                    >
                        <EmailIcon {...shareIconAttributes} className={styles.TwitterIcon} />
                        <div className={styles.ShareIconLinkText}>Email card link</div>
                    </EmailShareButton>
                </ListItemIcon>
            </MenuItem>
        </>

    )
}