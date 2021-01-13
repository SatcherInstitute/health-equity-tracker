import React from "react";
import { BrowserRouter } from "react-router-dom";
import {
  useDatasetStoreProvider,
  DatasetProvider,
  startMetadataLoad,
} from "../data/useDatasetStore";
import { autoInitGlobals } from "../utils/globals";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";
import MaterialTheme from "../styles/MaterialTheme";

autoInitGlobals();
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
