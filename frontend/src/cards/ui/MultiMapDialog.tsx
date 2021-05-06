import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Fips } from "../../data/utils/Fips";
import { Legend } from "../../charts/Legend";
import { MapOfDatasetMetadata } from "../../data/utils/DatasetTypes";
import { MetricConfig } from "../../data/config/MetricConfig";
import { Row, FieldRange } from "../../data/utils/DatasetTypes";
import { Sources } from "./Sources";
import styles from "./MultiMapDialog.module.scss";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";

export interface MultiMapDialogProps {
  // Metric the small maps will evaluate
  metricConfig: MetricConfig;
  // Whether or not the data was collected via survey
  surveyCollectedData: boolean;
  // Demographic breakdown upon which we're dividing the data, i.e. "age"
  breakdown: BreakdownVar;
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
  // Dataset IDs required the source footer
  queryResponses: MetricQueryResponse[];
  // Metadata required for the source footer
  metadata: MapOfDatasetMetadata;
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
        <Typography className={styles.Title}>
          {props.metricConfig.fullCardTitleName} across all{" "}
          {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdown]} groups
        </Typography>
        <Grid container justify="space-around">
          <Grid item className={styles.SmallMultipleLegendMap}>
            <b>Legend</b>
            <div className={styles.LegendDiv}>
              <Legend
                metric={props.metricConfig}
                legendTitle={props.metricConfig.fullCardTitleName}
                legendData={props.data}
                scaleType="quantile"
                sameDotSize={true}
              />
            </div>
          </Grid>
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
                    surveyCollectedData={props.surveyCollectedData}
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
      <div>
        <div className={styles.FooterButtonContainer}>
          <Button onClick={props.handleClose} color="primary">
            Close
          </Button>
        </div>
        <div className={styles.FooterSourcesContainer}>
          <Sources
            queryResponses={props.queryResponses}
            metadata={props.metadata}
          />
        </div>
      </div>
    </Dialog>
  );
}
