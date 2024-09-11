import Toolbar from '@mui/material/Toolbar'
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface HetCardMenuMobileProps {
  className?: string
  routeConfigs: { path: string; label: string }[]
  label: string
}

export default function HetCardMenuMobile(props: HetCardMenuMobileProps) {
  const navigate = useNavigate()

  const handleSelected = (event: any) => {
    navigate(event.target.value)
  }

  return (
    <>
      <div
        className={`top-0 z-almostTop flex rounded-sm bg-white pt-8 pb-4 w-fit max-w-screen ${
          props.className ?? ''
        }`}
      >
        <Toolbar className='w-screen px-0 flex justify-center'>
          <FormControl sx={{ minWidth: '90vw' }} size='medium'>
            <InputLabel id='context-select-label'>{props.label}</InputLabel>
            <Select
              labelId='context-select-label'
              value={window.location.pathname}
              onChange={handleSelected}
              label={props.label}
            >
              {props.routeConfigs.map((config) => (
                <MenuItem key={config.path} value={config.path}>
                  {config.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </div>
    </>
  )
}
