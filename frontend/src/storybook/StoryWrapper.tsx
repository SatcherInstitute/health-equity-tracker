import React from "react";
import { BrowserRouter } from "react-router-dom";
import { autoInitGlobals } from "../utils/globals";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/styles";
import MaterialTheme from "../styles/MaterialTheme";

autoInitGlobals();

// TODO Refactor so these aren't making real API calls
export const StoryWrapper = (storyFn: any) => {
  return (
    <ThemeProvider theme={MaterialTheme}>
      <CssBaseline />
      <BrowserRouter>{storyFn()}</BrowserRouter>
    </ThemeProvider>
  );
};
