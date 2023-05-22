import { Grid, useTheme, useMediaQuery } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MenuList from '@mui/material/MenuList'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Popover from '@mui/material/Popover'
import { type PopoverOrigin } from '@mui/material/Popover'
import { DownloadCardImageButton } from './DownloadCardImageButton'
import CopyLinkButton from './CopyLinkButton'
import OptionMenuIcons from './OptionMenuIcons'
import { usePopover } from '../../utils/hooks/usePopover'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import styles from './CardOptionsMenu.module.scss'

interface CardOptionsMenuProps {
    downloadTargetScreenshot: () => Promise<boolean>
    scrollToHash: ScrollableHashId
}

function CardOptionsMenu(props: CardOptionsMenuProps) {
    const shareMenu = usePopover()
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

    return (
        <Grid className={styles.ShareMenu}>
            <IconButton onClick={shareMenu.open}>
                <MoreHorizIcon />
            </IconButton>

            <Popover
                anchorEl={shareMenu.anchor}
                anchorOrigin={anchorOrigin}
                open={shareMenu.isOpen}
                transformOrigin={transformOrigin}
                onClose={() => { shareMenu.close(); }}
            >
                <MenuList className={styles.MenuList}>
                    <CopyLinkButton scrollToHash={props.scrollToHash} />
                    <DownloadCardImageButton
                        downloadTargetScreenshot={props.downloadTargetScreenshot}
                    />
                    <OptionMenuIcons />
                </MenuList>
            </Popover>
        </Grid>
    )
}

export default CardOptionsMenu
