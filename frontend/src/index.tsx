import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import App from "./App";
import "typeface-hind";
import "typeface-montserrat";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "react-query";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { createWebStoragePersistor } from "react-query/createWebStoragePersistor-experimental";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
    },
  },
});

/* 
VERY IMPORTANT: This utility is currently in an experimental stage. This means that breaking changes will happen in minor AND patch releases. Use at your own risk. If you choose to rely on this in production in an experimental stage, please lock your version to a patch-level version to avoid unexpected breakages.
 */
const sessionStoragePersistor = createWebStoragePersistor({
  storage: window.sessionStorage,
});
persistQueryClient({
  queryClient,
  persistor: sessionStoragePersistor,
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider
        variant="success"
        preventDuplicate={true}
        autoHideDuration={10000}
      >
        <App />
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
