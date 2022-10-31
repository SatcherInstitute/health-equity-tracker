import { getTitleProps } from "./types";

function getTitle(props: getTitleProps) {
  return {
    text: props.chartTitle || "",
    subtitle: " ",
    encode: {
      title: {
        enter: {
          fontSize: { value: props.fontSize },
          font: { value: "Inter, sans-serif" },
        },
      },
    },
  };
}

export { getTitle };
