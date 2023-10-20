import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { Select, FormControl, MenuItem, InputLabel, Card } from '@mui/material'
import { links } from './MethodologyCardMenu'
import { useHistory } from 'react-router-dom'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const MethodologyCardMenuMobile: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false) // State to track visibility of the FAB
  const history = useHistory()

  const handleSelected = (event: React.ChangeEvent<{ value: unknown }>) => {
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
      <Card raised={true} className={styles.CardMenuMobile}>
        <Toolbar>
          <FormControl sx={{ minWidth: '90vw' }} size="large">
            <InputLabel id="methodology-select-label">Jump to</InputLabel>
            <Select
              labelId="methodology-select-label"
              value={selectedIndex}
              onChange={handleSelected}
              label="Sections"
            >
              {links.map((link, idx) => (
                <MenuItem
                  key={idx}
                  value={link.index}
                  className={styles.MenuItemText}
                >
                  {link.primary ? link.primary : link.secondary}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </Card>
      {showScrollTop && (
        <Fab
          color="secondary"
          size="small"
          aria-label="scroll back to top"
          className={styles.Fab}
          onClick={scrollTop}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </>
  )
}

export default MethodologyCardMenuMobile
