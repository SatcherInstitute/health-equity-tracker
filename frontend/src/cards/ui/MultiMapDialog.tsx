import React from "react";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { Grid } from "@material-ui/core";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Fips } from "../../data/utils/Fips";
import { Legend } from "../../charts/Legend";
import { MetricConfig } from "../../data/config/MetricConfig";
import { Row, FieldRange } from "../../data/utils/DatasetTypes";
import styles from "./MultiMapDialog.module.scss";

const QUANTILE = "quantile";
const VEGA_LEGEND_REFERENCE_LINK =
  "https://vega.github.io/vega/docs/scales/#" + QUANTILE;

export interface MultiMapDialogProps {
  // Metric the small maps will evaluate
  metricConfig: MetricConfig;
  // Demographic breakdown upon which we're dividing the data, i.e. "age"
  breakdown: string;
  // Unique values for breakdown, each one will have it's own map
  breakdownValues: string[];
  // Geographic region of maps
  fips: Fips;
  // Data that populates maps
  data: Row[];
  // Range of metric's values, used for creating a common legend across maps
  fieldRange: FieldRange | undefined;
  // Whether or not dialog is currently open
  open: boolean;
  // Closes the dialog in the parent component
  handleClose: () => void;
}

/*
   MultiMapDialog is a dialog opened via the MapCard that shows one small map for each unique
    value in a given breakdown for a particualr metric.
*/
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
              <a href={VEGA_LEGEND_REFERENCE_LINK}>{QUANTILE}</a> scale,
              optimized for visualizing and comparing across demographics.
            </Alert>
          </Grid>
          <Grid item xs={6}>
            <Legend
              metric={props.metricConfig}
              legendTitle={props.metricConfig.fullCardTitleName}
              legendData={props.data}
              scaleType={QUANTILE}
              sameDotSize={true}
            />
          </Grid>
        </Grid>
        <Grid container justify="space-around">
          {props.breakdownValues.map((breakdownValue) => {
            const dataForValue = props.data.filter(
              (row: Row) => row[props.breakdown] === breakdownValue
            );
            return (
              <Grid item className={styles.SmallMultipleMap}>
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
                    fieldRange={props.fieldRange}
                    hideActions={false}
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
