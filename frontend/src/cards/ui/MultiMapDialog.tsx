import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Fips, TERRITORY_CODES } from "../../data/utils/Fips";
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
  useSmallSampleMessage: boolean;
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
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>;
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
          {props.metricConfig.fullCardTitleName} Across All{" "}
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
              <Grid
                item
                key={breakdownValue}
                className={styles.SmallMultipleMap}
              >
                <b>{breakdownValue}</b>
                {props.metricConfig && (
                  <ChoroplethMap
                    key={breakdownValue}
                    signalListeners={{ click: (...args: any) => {} }}
                    metric={props.metricConfig}
                    useSmallSampleMessage={props.useSmallSampleMessage}
                    legendTitle={props.metricConfig.fullCardTitleName}
                    legendData={props.data}
                    data={dataForValue}
                    hideLegend={true}
                    showCounties={props.fips.isUsa() ? false : true}
                    fips={props.fips}
                    fieldRange={props.fieldRange}
                    hideActions={false}
                    scaleType="quantile"
                    geoData={props.geoData}
                  />
                )}
                {props.metricConfig &&
                  props.fips.isUsa() &&
                  TERRITORY_CODES.map((code) => {
                    const fips = new Fips(code);
                    return (
                      <div className={styles.TerritoryMap}>
                        <ChoroplethMap
                          key={breakdownValue}
                          signalListeners={{ click: (...args: any) => {} }}
                          metric={props.metricConfig}
                          useSmallSampleMessage={props.useSmallSampleMessage}
                          legendTitle={props.metricConfig.fullCardTitleName}
                          legendData={props.data}
                          data={dataForValue}
                          hideLegend={true}
                          hideActions={true}
                          showCounties={props.fips.isUsa() ? false : true}
                          fips={fips}
                          fieldRange={props.fieldRange}
                          scaleType="quantile"
                          geoData={props.geoData}
                          overrideShapeWithCircle={true}
                        />
                      </div>
                    );
                  })}
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
