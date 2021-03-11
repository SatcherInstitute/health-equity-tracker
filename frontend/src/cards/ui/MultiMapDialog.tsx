import React from "react";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Legend } from "../../charts/Legend";
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
  data: Row[];
  breakdown: string;
  handleClose: () => void;
  open: boolean;
  breakdownOptions: string[];
  queryResponse: any;
}

export function MultiMapDialog(props: MultiMapDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll="paper"
      aria-labelledby="Dialog showing choropleth maps of each breakdown category with the same scale."
    >
      <DialogContent dividers={true}>
        <Grid container justify="space-around">
          <Grid item xs={6}>
            <Alert severity="info">
              This scale is a{" "}
              <a href="https://vega.github.io/vega/docs/scales/#quantile">
                quantile
              </a>{" "}
              scale, optimized for visualizing and comparing across
              demographics.
            </Alert>
          </Grid>
          <Grid item xs={6}>
            {/* TODO- not working at the county level */}
            <Legend
              metric={props.metricConfig}
              legendTitle={props.metricConfig.fullCardTitleName}
              legendData={props.data} // TODO is this right?
              scaleType="quantile"
              sameDotSize={true}
            />
          </Grid>
        </Grid>
        <Grid container justify="space-around">
          {props.breakdownOptions.map((breakdownValue) => {
            const dataForValue = props.data.filter(
              (row: Row) => row[props.breakdown] === breakdownValue
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
                    legendData={props.data}
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
