import { createMuiTheme } from "@material-ui/core/styles";
import "typeface-dm-sans";

const MaterialTheme = createMuiTheme({
  palette: {
    primary: {
      light: "#6a97bb",
      main: "#07538f",
      dark: "#054272",
    },
    secondary: {
      light: "#89D5CC",
      main: "#228B7E",
      dark: "#167B6F",
    },
  },
  Typography: {
    fontFamily: "DM Sans",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          fontFamily: "DM Sans",
        },
      },
    },
    MuiButton: {
      root: {
        textTransform: "unset",
      },
    },
    MuiPaper: {
      root: {
        "&.MuiPopover-paper": {
          maxWidth: "unset",
          minWidth: "unset",
        },
      },
    },
    //@ts-ignore - ts doesn't like MuiToggleButton type even though it works
    MuiToggleButton: {
      root: {
        fontWeight: "normal",
        fontSize: "14px",
        lineHeight: "16px",
        background: "white",
        border: "1px solid #BDC1C6 !important",
        color: "black",
        textTransform: "none",
        "&$selected": {
          backgroundColor: "#E8F0FE",
          color: "#1A73E8",
        },
      },
    },
  },
});

export default MaterialTheme;
