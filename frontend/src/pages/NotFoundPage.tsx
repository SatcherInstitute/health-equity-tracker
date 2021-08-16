import React, { useEffect } from "react";
import { APP_TITLE } from "../App";

export const PAGE_NOT_FOUND_TITLE = "404 - Page Not Found";
function NotFoundPage() {
  useEffect(() => {
    document.title = `${PAGE_NOT_FOUND_TITLE} - ${APP_TITLE}`;
  }, []);

  return (
    <h1 id="main" tabIndex={-1}>
      {PAGE_NOT_FOUND_TITLE}
    </h1>
  );
}

export default NotFoundPage;
