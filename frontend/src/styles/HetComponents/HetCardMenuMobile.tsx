import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { useLocation, useNavigate } from 'react-router'

interface HetCardMenuMobileProps {
  className?: string
  routeConfigs: { path: string; label: string }[]
  label: string
}

export default function HetCardMenuMobile(props: HetCardMenuMobileProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSelected = (event: any) => {
    navigate(event.target.value)
  }

  return (
    <>
      <div
        className={`z-almost-top bg-alt-white top-0 flex w-fit max-w-screen rounded-sm pt-8 pb-4 ${
          props.className ?? ''
        }`}
      >
        <Toolbar className='flex w-screen justify-center px-0'>
          <FormControl sx={{ minWidth: '90vw' }} size='medium'>
            <InputLabel id='context-select-label'>{props.label}</InputLabel>
            <Select
              labelId='context-select-label'
              value={location.pathname}
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
