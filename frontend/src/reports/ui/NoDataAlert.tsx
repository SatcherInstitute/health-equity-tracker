import { Grid, Button } from '@mui/material'
import HetAlert from '../../styles/HetComponents/HetAlert'

function NoDataAlert(props: { dropdownVarId: string }) {
  return (
    <Grid item xs={5}>
      <HetAlert severity='error'>
        This data is not currently available in the Health Equity Tracker, but
        will be coming soon.
        <br />
        {/* TODO - buttons should be actual working a href links and better follow UX */}
        <Button
          style={{
            padding: '0',
            paddingLeft: '5px',
            paddingRight: '5px',
            background: 'none',
            textDecoration: 'underline',
          }}
          /* TODO - https://github.com/SatcherInstitute/health-equity-tracker/issues/431 */
          onClick={() => {
            alert('unimplemented')
          }}
        >
          See our roadmap to learn more.
        </Button>
      </HetAlert>
      <HetAlert>
        Do you have information on {props.dropdownVarId} at the state or local
        level?
        <a
          style={{
            padding: '0',
            paddingLeft: '5px',
            paddingRight: '5px',
            background: 'none',
            textDecoration: 'underline',
          }}
          href='mailto:info@healthequitytracker.org'
        >
          We would love to hear from you.
        </a>
      </HetAlert>
    </Grid>
  )
}

export default NoDataAlert
