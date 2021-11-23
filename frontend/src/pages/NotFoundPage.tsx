import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

function NotFoundPage() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Page Not Found - 404</title>
      </Helmet>
      <h1 id="main" tabIndex={-1}>
        Page Not Found - 404
      </h1>
    </HelmetProvider>
  );
}

export default NotFoundPage;
