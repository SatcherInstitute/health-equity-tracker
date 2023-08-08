import { GridView } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import {
  MULTIPLE_MAPS_PARAM_KEY,
  MODAL_PARAM_VALUE_TRUE,
} from '../../utils/urlutils'

export default function MultipleMapsButton() {
  const [, setMultimapOpen] = useParamState(
    /* paramKey */ MULTIPLE_MAPS_PARAM_KEY
  )

  return (
    <Button
      onClick={() => {
        setMultimapOpen(MODAL_PARAM_VALUE_TRUE)
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
