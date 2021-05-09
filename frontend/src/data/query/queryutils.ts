import { DataFrame } from "data-forge";
import {
  joinOnCols,
  JoinType,
  maybeApplyRowReorder,
} from "../utils/datasetutils";
import { Breakdowns } from "./Breakdowns";
import { MetricQueryResponse } from "./MetricQuery";

export function joinResponses(
  left: MetricQueryResponse,
  right: MetricQueryResponse,
  breakdowns: Breakdowns,
  joinType: JoinType
): MetricQueryResponse {
  if (left.dataIsMissing()) {
    return left;
  }

  if (right.dataIsMissing()) {
    return right;
  }

  const leftData = new DataFrame(left.data);
  const rightData = new DataFrame(right.data);

  const joined = joinOnCols(
    leftData,
    rightData,
    breakdowns.getOrderedBreakdowns(),
    joinType
  );

  const consumedDatasetIds = left.consumedDatasetIds.concat(
    right.consumedDatasetIds
  );
  const uniqueConsumedDatasetIds = Array.from(new Set(consumedDatasetIds));
  return new MetricQueryResponse(
    maybeApplyRowReorder(joined.toArray(), breakdowns),
    uniqueConsumedDatasetIds
  );
}
