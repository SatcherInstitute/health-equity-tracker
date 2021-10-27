import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import App from "./App";
import "typeface-hind";
import "typeface-montserrat";
import { SnackbarProvider } from "notistack";

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider variant="success" preventDuplicate={true}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
