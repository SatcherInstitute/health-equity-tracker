import React, { useState } from "react";
import { DatasetMetadata } from "../../../data/DatasetTypes";
import styles from "./DatasetListing.module.scss";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import AnimateHeight from "react-animate-height";
import DownloadButton from "./DownloadButton";

export interface DatasetListingProps {
  dataset: DatasetMetadata;
}

export function DatasetListing(props: DatasetListingProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card elevation={3} className={styles.DatasetListing}>
      <Typography variant="h5" className={styles.DatasetTitle} align="left">
        {props.dataset.name}
      </Typography>
      <Typography className={styles.DataSubtitle} align="left">
        <Link
          href={props.dataset.data_source_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.dataset.data_source_name}
        </Link>
      </Typography>
      <table className={styles.MetadataTable}>
        <tbody>
          <tr>
            <td>
              <b>Geographic Level</b>
            </td>
            <td>{props.dataset.geographic_level}</td>
          </tr>
          <tr>
            <td>
              <b>Demographic Granularity</b>
            </td>
            <td>{props.dataset.demographic_granularity}</td>
          </tr>
          <tr>
            <td>
              <b>Update Frequency</b>
            </td>
            <td>{props.dataset.update_frequency}</td>
          </tr>
          <tr>
            <td>
              <b>Latest Update Time</b>
            </td>
            <td>{props.dataset.update_time}</td>
          </tr>
        </tbody>
      </table>
      <AnimateHeight duration={500} height={expanded ? "auto" : 20}>
        <div className={styles.Description}>{props.dataset.description}</div>
      </AnimateHeight>
      <div className={styles.Footer}>
        <div className={styles.CardFooterRight}>
          <DownloadButton datasetId={props.dataset.id}></DownloadButton>
        </div>
        <div className={styles.CardFooterLeft}>
          <Button
            aria-label="expand description"
            onClick={() => setExpanded(!expanded)}
            data-testid={"expand-" + props.dataset.id}
            color="primary"
          >
            {expanded ? "Less" : "More"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default DatasetListing;
