import React from "react";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { LegendOther } from "../../charts/LegendOther";
import { Fips } from "../../data/utils/Fips";
import { MetricConfig } from "../../data/config/MetricConfig";
import { Grid } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Row } from "../../data/utils/DatasetTypes";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";

export interface MultiMapDialogProps {
  fips: Fips;
  metricConfig: MetricConfig;
  validData: Row[];
  currentlyDisplayedBreakdown: string;
  handleClose: () => void;
  open: boolean;
  breakdownValues: string[];
  queryResponse: any;
}

export function MultiMapDialog(props: MultiMapDialogProps) {
  return (
    <Dialog
      style={{ width: "90%", padding: "0" }}
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogContent dividers={true}>
        <Grid container justify="space-around">
          <Grid item xs={6}>
            <Alert severity="info">
              This legend is quantile math math math explanation.
            </Alert>
          </Grid>
          <Grid item xs={6}>
            {/* TODO- not working at the county level */}
            <LegendOther
              metric={props.metricConfig}
              legendTitle={props.metricConfig.fullCardTitleName}
              legendData={props.validData} // TODO is this right?
              scaleType="quantile"
              sameDotSize={true}
            />
          </Grid>
        </Grid>
        <Grid container justify="space-around">
          {props.breakdownValues.map((breakdownValue) => {
            const dataForValue = props.validData.filter(
              (row: Row) =>
                row[props.currentlyDisplayedBreakdown] === breakdownValue
            );
            return (
              <Grid item style={{ width: "300px", padding: "15px" }}>
                <b>{breakdownValue}</b>
                {props.metricConfig && (
                  <ChoroplethMap
                    key={breakdownValue}
                    signalListeners={{ click: (...args: any) => {} }}
                    metric={props.metricConfig}
                    legendTitle={props.metricConfig.fullCardTitleName}
                    legendData={props.validData}
                    data={dataForValue}
                    hideLegend={true}
                    showCounties={props.fips.isUsa() ? false : true}
                    fips={props.fips}
                    fieldRange={props.queryResponse.getFieldRange(
                      props.metricConfig.metricId
                    )}
                    hideActions={false} /* TODO false */
                    scaleType="quantile"
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
