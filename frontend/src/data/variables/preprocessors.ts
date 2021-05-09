import { IDataFrame } from "data-forge";
import { MetricQuery } from "../query/MetricQuery";

/**
 * Preprocessors are called by the StandardVariableProvider immediately after
 * fetching the dataset from the server. They are extremely flexible, allowing
 * any modifications to the dataset. The main use cases are:
 * 1) Temporarily support backwards compatibility for backend dataset changes.
 * 2) Support experimentation and rapid iteration by not requiring backend
 *    changes for minor things like renaming columns or converting NaN to null.
 *
 * Preprocessors are run across the whole dataset and don't currently benefit
 * from caching. Also due to their flexibility it is easier to break the
 * provider. Therefore, they should be used sparingly - prefer to make such
 * changes on the backend.
 */
export interface Preprocessor {
  apply(df: IDataFrame, metricQuery: MetricQuery): IDataFrame;
}

/**
 * A basic implementation of Preprocessor that takes in a function and calls it.
 * This is really just so you don't have to define a new class whenever you want
 * to do a one-off preprocesing step.
 */
export class FunctionPreprocessor implements Preprocessor {
  readonly fn: (df: IDataFrame, metricQuery: MetricQuery) => IDataFrame;

  constructor(fn: (df: IDataFrame, metricQuery: MetricQuery) => IDataFrame) {
    this.fn = fn;
  }

  apply(df: IDataFrame, metricQuery: MetricQuery): IDataFrame {
    return this.fn(df, metricQuery);
  }
}
