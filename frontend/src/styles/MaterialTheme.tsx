import { createTheme } from "@material-ui/core/styles";
import "typeface-dm-sans";
import sass from "./variables.module.scss";

const MaterialTheme = createTheme({
  palette: {
    primary: {
      light: sass.barChartLight,
      main: sass.altGreen,
      dark: sass.darkGreen,
    },
    secondary: {
      light: sass.secondaryLight,
      main: sass.secondaryMain,
      dark: sass.secondaryDark,
    },
  },
  Typography: {
    fontFamily: "DM Sans",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          fontFamily: '"Inter", sans-serif',
        },
        ".MuiAlert-standardInfo	.MuiAlert-icon": {
          color: `${sass.altGreen} !important`,
        },
        ".MuiAlert-standardWarning	.MuiAlert-icon": {
          color: `${sass.alertColor} !important`,
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
        borderBottom: `1px solid ${sass.borderColor}`,
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
        fontFamily: '"Inter", sans-serif',
      },
      containedPrimary: {
        color: `${sass.white} !important`,
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
        background: sass.white,
        border: `1px solid ${sass.unknownGrey} !important`,
        color: sass.black,
        textTransform: "none",
        "&$selected": {
          backgroundColor: sass.toggleColor,
          color: sass.altGreen,
        },
      },
    },
    MuiAlert: {
      root: {
        fontFamily: '"Inter", sans-serif',
      },
      standardInfo: {
        backgroundColor: `${sass.standardInfo} !important`,
        color: `${sass.black} !important`,
        textAlign: "left",
      },
      standardWarning: {
        backgroundColor: `${sass.standardWarning} !important`,
        color: `${sass.black} !important`,
        textAlign: "left",
      },
      standardError: {
        textAlign: "left",
      },
    },
  },
});

export default MaterialTheme;
