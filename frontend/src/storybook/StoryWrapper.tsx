import React from "react";
import { BrowserRouter } from "react-router-dom";
import {
  useDatasetStoreProvider,
  DatasetProvider,
  startMetadataLoad,
} from "../data/useDatasetStore";
import Logger from "../utils/Logger";
import { initGlobals } from "../utils/globals";
import DataFetcher from "../data/DataFetcher";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";
import MaterialTheme from "../styles/MaterialTheme";

initGlobals(new Logger(false), new DataFetcher());
startMetadataLoad();

// TODO Refactor so these aren't making real API calls
export const StoryWrapper = (storyFn: any) => {
  return (
    <ThemeProvider theme={MaterialTheme}>
      <CssBaseline />
      <BrowserRouter>
        <DatasetProvider value={useDatasetStoreProvider()}>
          {storyFn()}
        </DatasetProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};
