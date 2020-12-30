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

export const StoryWrapper = (storyFn: any) => {
  initGlobals(new Logger(false), new DataFetcher());
  startMetadataLoad();

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
