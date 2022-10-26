import { useEffect, useState } from "react";
import { createTheme, useMediaQuery } from "@material-ui/core";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 800,
      lg: 1500,
      xl: 1850,
    },
  },
});

export function useFontSize() {
  const isComparing = window.location.href.includes("compare");
  const isSmall = useMediaQuery(theme.breakpoints.only("sm"));
  const [fontSize, setFontsize] = useState(14);

  useEffect(() => {
    if (isComparing && isSmall) {
      setFontsize(10);
    } else {
      setFontsize(14);
    }
  }, [isComparing, fontSize, isSmall]);

  return fontSize;
}
