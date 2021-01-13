import React from "react";
import {
  DatasetProvider,
  useDatasetStoreProvider,
} from "../data/useDatasetStore";
import { autoInitGlobals } from "../utils/globals";

autoInitGlobals();

/** A fake app context that sets up global context for use in tests. */
function AppContext(props: { children: React.ReactNode }) {
  const datasetStore = useDatasetStoreProvider();
  return (
    <DatasetProvider value={datasetStore}>{props.children}</DatasetProvider>
  );
}

export default AppContext;
