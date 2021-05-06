import { createMuiTheme } from "@material-ui/core/styles";
import "typeface-dm-sans";

const MaterialTheme = createMuiTheme({
  palette: {
    primary: {
      light: "#91C684",
      main: "#0B5240",
      dark: "#083f31",
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
          fontFamily: '"Inter", serif',
        },
        ".MuiAlert-standardInfo	.MuiAlert-icon": {
          color: "#0B5240 !important",
        },
        ".MuiAlert-standardWarning	.MuiAlert-icon": {
          color: "#D85C47 !important",
        },
      },
    },
    MuiTab: {
      root: {
        textTransform: "none",
        fontFamily: '"DM Sans", sans-serif !important',
      },
    },
    MuiTabs: {
      root: {
        marginTop: "40px",
        borderBottom: "1px solid #3e3e3e",
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        fontFamily: '"Inter", serif',
      },
      containedPrimary: {
        color: "#ffffff !important",
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
      root: {
        fontFamily: '"Inter", serif',
      },
      standardInfo: {
        backgroundColor: "#F8F9FA !important",
        color: "#00000 !important",
        textAlign: "left",
      },
      standardWarning: {
        backgroundColor: "#FFF8EB !important",
        color: "#00000 !important",
        textAlign: "left",
      },
      standardError: {
        textAlign: "left",
      },
    },
  },
});

export default MaterialTheme;
