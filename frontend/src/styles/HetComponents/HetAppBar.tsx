import { AppBar } from '@mui/material'
import HetDesktopToolbar from './HetDesktopToolbar'
import HetMobileToolbar from './HetMobileToolbar'

export default function HetAppBar() {
  return (
    <AppBar position='static' elevation={0} className='sticky top-0 z-top'>
      <div className='md:hidden'>
        <HetMobileToolbar />
      </div>
      <div className='hidden md:block'>
        <HetDesktopToolbar />
      </div>
    </AppBar>
  )
}
