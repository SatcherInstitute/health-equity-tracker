import { Grid, useTheme, useMediaQuery } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Popover from '@mui/material/Popover'
import { type PopoverOrigin } from '@mui/material/Popover'
import { DownloadCardImageButton } from './DownloadCardImageButton'
import CopyLinkButton from './CopyLinkButton'
import sass from '../../styles/variables.module.scss'
import styles from '../../pages/ExploreData/OptionsSelector.module.scss'
import { usePopover, type PopoverElements } from '../../utils/hooks/usePopover'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
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

const shareIconAttributes = {
    iconFillColor: sass.altDark,
    bgStyle: { fill: 'none' },
    size: 32,
}

interface MenuItemType {
    title: string
    action: JSX.Element
}

interface MenuPopoverProps {
    popover: PopoverElements
    items: MenuItemType[]
    onClose?: () => void
    downloadTargetScreenshot: () => Promise<boolean>
    scrollToHash?: ScrollableHashId
}

interface CardOptionsMenuProps {
    downloadTargetScreenshot: () => Promise<boolean>
    scrollToHash: ScrollableHashId
}

export function MenuPopover(props: MenuPopoverProps): JSX.Element {
    const theme = useTheme()
    const pageIsWide = useMediaQuery(theme.breakpoints.up('sm'))

    const anchorOrigin: PopoverOrigin = {
        vertical: 'top',
        horizontal: 'right',
    }
    const transformOrigin: PopoverOrigin = {
        vertical: 'top',
        horizontal: pageIsWide ? 'left' : 'center',
    }

    function handleClose() {
        props.popover.close()
        if (props.onClose) props.onClose()
    }

    return (
        <Popover
            anchorEl={props.popover.anchor}
            anchorOrigin={anchorOrigin}
            className={styles.GroupListMenuBox}
            open={props.popover.isOpen}
            onClose={handleClose}
            transformOrigin={transformOrigin}
        >
            <MenuList>
                {props.items.map((item, index) => (
                    <MenuItem key={index}>
                        <ListItemIcon>{item.action}</ListItemIcon>
                        <ListItemText primary={item.title} />
                    </MenuItem>
                ))}
            </MenuList>
        </Popover>
    )
}

const shareButtonStyle = { width: '3rem', height: '3rem' };

function CardOptionsMenu(props: CardOptionsMenuProps) {
    const emailShareBody = `${'\n'}${'\n'}`; // Add line breaks here if needed
    const menu = usePopover()
    const sharedUrl = window.location.href

    const sharingOptions = [
        {
            title: 'Copy card link',
            action: <CopyLinkButton scrollToHash={props.scrollToHash} />,
        },
        {
            title: 'Save image',
            action: (
                <DownloadCardImageButton
                    downloadTargetScreenshot={props.downloadTargetScreenshot}
                />
            ),
        },
        {
            title: 'Share on Twitter',
            action: (
                <TwitterShareButton
                    aria-label={'Share to Twitter'}
                    hashtags={['healthequity']}
                    related={['@SatcherHealth', '@MSMEDU']}
                    style={shareButtonStyle}
                    url={sharedUrl}
                >
                    <TwitterIcon {...shareIconAttributes} />
                </TwitterShareButton>
            ),
        },
        {
            title: 'Share on Facebook',
            action: (
                <FacebookShareButton
                    aria-label={'Post this report to Facebook'}
                    hashtag={'#healthequity'}
                    quote={''}
                    style={shareButtonStyle}
                    url={sharedUrl}
                >
                    <FacebookIcon {...shareIconAttributes} />
                </FacebookShareButton>
            ),
        },
        {
            title: 'Share on LinkedIn',
            action: (
                <LinkedinShareButton
                    aria-label={'Share to LinkedIn'}
                    source={'Health Equity Tracker'}
                    style={shareButtonStyle}
                    url={sharedUrl}
                >
                    <LinkedinIcon {...shareIconAttributes} />
                </LinkedinShareButton>
            ),
        },
        {
            title: 'Email card link',
            action: (
                <EmailShareButton
                    aria-label={'Share by email'}
                    body={emailShareBody}
                    subject={`Sharing from healthequitytracker.org`}
                    style={shareButtonStyle}
                    url={'Email card link'}
                >
                    <EmailIcon {...shareIconAttributes} />
                </EmailShareButton>
            ),
        },
    ]

    return (
        <Grid style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <IconButton onClick={menu.open}>
                <MoreHorizIcon />
            </IconButton>
            <MenuPopover
                aria-expanded="true"
                aria-labelledby={'card-options-label'}
                downloadTargetScreenshot={props.downloadTargetScreenshot}
                items={sharingOptions}
                popover={menu}
                scrollToHash={props.scrollToHash}
            />
        </Grid>
    )
}

export default CardOptionsMenu
