import React from "react";
import Typography from "@material-ui/core/Typography";
import { LinkWithStickyParams } from "../../utils/urlutils";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";

const useImageButtonStyles = makeStyles((theme) => ({
  image: {
    position: "relative",
    height: "300px",
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
    "&:hover, &$focusVisible": {
      zIndex: 1,
      "& $imageBackdrop": {
        opacity: 0.15,
      },
      "& $imageMarked": {
        opacity: 0,
      },
      "& $imageTitle": {
        border: "4px solid currentColor",
      },
    },
  },
  focusVisible: {},
  imageButton: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
  },
  imageSrc: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: "cover",
    backgroundPosition: "center 40%",
  },
  imageBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  },
  imageTitle: {
    position: "relative",
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${
      theme.spacing(1) + 6
    }px`,
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  },
}));

function ImageButton(props: { imageUrl: string; text: string; link: string }) {
  const classes = useImageButtonStyles();

  return (
    <LinkWithStickyParams to={props.link}>
      <ButtonBase
        focusRipple
        key={props.text}
        className={classes.image}
        focusVisibleClassName={classes.focusVisible}
      >
        <span
          className={classes.imageSrc}
          style={{
            backgroundImage: `url(${props.imageUrl})`,
          }}
        />
        <span className={classes.imageBackdrop} />
        <span className={classes.imageButton}>
          <Typography className={classes.imageTitle}>
            {props.text}
            <span className={classes.imageMarked} />
          </Typography>
        </span>
      </ButtonBase>
    </LinkWithStickyParams>
  );
}

export default ImageButton;
