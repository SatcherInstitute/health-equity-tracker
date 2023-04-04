import { Grid, Button, Alert } from '@mui/material'

function NoDataAlert(props: { dropdownVarId: string }) {
  return (
    <Grid item xs={5}>
      <Alert style={{ margin: '20px' }} severity="error">
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
      </Alert>
      <Alert variant="outlined" severity="info">
        Do you have information on {props.dropdownVarId} at the state or local
        level?
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
          We would love to hear from you.
        </Button>
      </Alert>
    </Grid>
  )
}

export default NoDataAlert
