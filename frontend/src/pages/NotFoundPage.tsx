import React from "react";
import { Helmet } from "react-helmet";

function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - 404</title>
      </Helmet>
      <h1 id="main" tabIndex={-1}>
        Page Not Found - 404
      </h1>
    </>
  );
}

export default NotFoundPage;
