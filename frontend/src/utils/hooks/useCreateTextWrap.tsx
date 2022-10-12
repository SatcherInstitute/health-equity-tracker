import { useEffect } from "react";
import { useMediaQuery } from "@material-ui/core";

const useCreateTextWrap = (mobileChartTitle?: string[]) => {
  const testing = "";
  useEffect(() => {
    const isComparing = window.location.href.includes("compare");
    console.log(mobileChartTitle);
  });
  return testing;
};

export default useCreateTextWrap;
