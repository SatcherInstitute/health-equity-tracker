import { GridView } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { MULTIPLE_MAPS_PARAM_KEY } from '../../utils/urlutils'

export default function MultipleMapsButton() {
  const [, setMultimapOpen] = useParamState<boolean>(
    /* paramKey */ MULTIPLE_MAPS_PARAM_KEY,
    /* defaultParamValue */ false
  )

  return (
    <Button
      onClick={() => {
        setMultimapOpen(true)
      }}
    >
      <GridView />
      <span
        style={{
          marginTop: '4px',
          paddingInline: '5px',
          verticalAlign: 'bottom',
        }}
      >
        View multiple maps
      </span>
    </Button>
  )
}
