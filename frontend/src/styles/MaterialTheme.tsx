import { createMuiTheme } from "@material-ui/core/styles";
import "typeface-dm-sans";

const MaterialTheme = createMuiTheme({
  palette: {
    primary: {
      light: "#91C684",
      main: "#0B5240",
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
        ".MuiAlert-standardInfo	.MuiAlert-icon": {
          color: "#0B5240 !important",
        },
        ".MuiAlert-standardWarning	.MuiAlert-icon": {
          color: "#D85C47 !important",
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
          backgroundColor: "#E1E9E7",
          color: "#0B5240",
        },
      },
    },
    MuiAlert: {
      standardInfo: {
        backgroundColor: "#F8F9FA !important",
        color: "#00000 !important",
      },
      standardWarning: {
        backgroundColor: "#FFF8EB !important",
        color: "#00000 !important",
      },
    },
  },
});

export default MaterialTheme;
