import Toolbar from '@mui/material/Toolbar'
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material'
import { links } from './MethodologyCardMenu'
import { useHistory } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

export default function MethodologyCardMenuMobile() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false) // State to track visibility of the FAB
  const history = useHistory()

  const handleSelected = (event: any) => {
    setSelectedIndex(event.target.value as number)
    const selectedLink = links.find((link) => link.index === event.target.value)
    if (selectedLink) {
      history.push(selectedLink.to)
    }
  }

  const checkScrollTop = () => {
    if (!showScrollTop && window.pageYOffset > window.innerHeight) {
      setShowScrollTop(true)
    } else if (showScrollTop && window.pageYOffset <= window.innerHeight) {
      setShowScrollTop(false)
    }
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop)
    return () => {
      window.removeEventListener('scroll', checkScrollTop)
    }
  }, [])

  return (
    <>
      <div className='sticky top-0 z-z-almost-top flex items-center justify-center rounded-sm bg-white p-1 shadow-raised-tighter'>
        <Toolbar>
          <FormControl sx={{ minWidth: '90vw' }} size='medium'>
            <InputLabel id='methodology-select-label'>Jump to</InputLabel>
            <Select
              labelId='methodology-select-label'
              value={selectedIndex}
              onChange={handleSelected}
              label='Sections'
            >
              {links.map((link, idx) => (
                <MenuItem key={idx} value={link.index} className=''>
                  {link.primary ? link.primary : link.secondary}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </div>
      {showScrollTop && (
        <Fab
          color='secondary'
          size='small'
          aria-label='scroll back to top'
          // className={styles.Fab}
          className='fixed bottom-2 right-2 z-z-top bg-alt-green'
          onClick={scrollTop}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </>
  )
}
