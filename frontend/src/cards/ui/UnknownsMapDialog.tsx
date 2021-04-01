import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { ChoroplethMap } from "../../charts/ChoroplethMap";
import { Fips } from "../../data/utils/Fips";
import { MetricConfig } from "../../data/config/MetricConfig";
import { Row } from "../../data/utils/DatasetTypes";
import { Sources } from "./Sources";
import { MetricQuery } from "../../data/query/MetricQuery";
import styles from "./UnknownsMapDialog.module.scss";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../../data/query/Breakdowns";
import { WithMetadataAndMetrics } from "../../data/react/WithLoadingOrErrorUI";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import { UNKNOWN, UNKNOWN_RACE } from "../../data/utils/Constants";

export interface UnknownsMapDialogProps {
  // Metric the map will evaluate for unknowns
  metricConfig: MetricConfig;
  // Breakdown value to evaluate for unknowns
  breakdownVar: BreakdownVar;
  // Geographic region of maps
  fips: Fips;
  // Whether or not dialog is currently open
  open: boolean;
  // Closes the dialog in the parent component
  handleClose: () => void;
}

/*
   UnknownsMapDialog is a dialog opened via the Disparity Bar Chart that shows portion of unknown results in a geography
*/
export function UnknownsMapDialog(props: UnknownsMapDialogProps) {
  // TODO Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const breakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    props.breakdownVar
  );

  // Population Comparison Metric is required
  const query = new MetricQuery(
    [
      props.metricConfig.metricId,
      props.metricConfig.populationComparisonMetric!.metricId,
    ],
    breakdowns
  );

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll="paper"
      aria-labelledby={`Dialog showing map of share of unknowns for ${props.metricConfig.fullCardTitleName}.`}
    >
      <WithMetadataAndMetrics
        queries={[query]}
        loadingComponent={
          <div className={styles.LoadingContainer}>
            <CircularProgress />
          </div>
        }
      >
        {(metadata, [queryResponse]) => {
          const dataForValue = queryResponse
            .getValidRowsForField(props.breakdownVar)
            .filter(
              (row: Row) =>
                row[props.breakdownVar] === UNKNOWN_RACE ||
                row[props.breakdownVar] === UNKNOWN
            );

          return (
            <>
              <DialogContent>
                <Typography className={styles.Title}>
                  {`Unknown values for ${
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  } ${
                    props.metricConfig.fullCardTitleName
                  } in ${props.fips.getFullDisplayName()}`}
                </Typography>
              </DialogContent>
              <DialogContent dividers={true}>
                <ChoroplethMap
                  signalListeners={{}}
                  metric={props.metricConfig}
                  legendTitle={props.metricConfig.fullCardTitleName}
                  data={dataForValue}
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                />
              </DialogContent>
              <div className={styles.Footer}>
                <div className={styles.FooterButtonContainer}>
                  <Button onClick={props.handleClose} color="primary">
                    Close
                  </Button>
                </div>
                <div className={styles.FooterSourcesContainer}>
                  <Sources
                    queryResponses={[queryResponse]}
                    metadata={metadata}
                  />
                </div>
              </div>
            </>
          );
        }}
      </WithMetadataAndMetrics>
    </Dialog>
  );
}
