import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.scss";
import App from "./App";
import "typeface-hind";
import "typeface-montserrat";
import { QueryClient, QueryClientProvider } from "react-query";
// import { ReactQueryDevtools } from 'react-query/devtools'
import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { createWebStoragePersistor } from "react-query/createWebStoragePersistor-experimental";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity, //1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

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
      <App />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
