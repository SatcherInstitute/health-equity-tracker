import {
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useState } from 'react'
import { PAGE_URL_TO_NAMES } from '../../utils/urlutils'

export default function HetMobileAppToolbar() {
  const [open, setOpen] = useState(false)

  return (
    <Toolbar>
      <IconButton
        onClick={() => {
          setOpen(true)
        }}
        aria-label='Expand site navigation'
        size='large'
      >
        <MenuIcon className='text-white' />
      </IconButton>
      <Drawer variant='persistent' anchor='left' open={open}>
        <Button
          aria-label='Collapse site navigation'
          onClick={() => {
            setOpen(false)
          }}
        >
          <ChevronLeftIcon />
        </Button>
        <nav>
          <List>
            {Object.keys(PAGE_URL_TO_NAMES).map((pageUrl, index) => (
              <ListItemLink href={pageUrl} key={index}>
                <ListItemText primary={PAGE_URL_TO_NAMES[pageUrl]} />
              </ListItemLink>
            ))}
          </List>
        </nav>
      </Drawer>
    </Toolbar>
  )
}

function ListItemLink(props: any) {
  return <ListItem component='a' {...props} />
}
