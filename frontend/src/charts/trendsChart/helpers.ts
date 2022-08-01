import { useEffect, useState } from "react";
import { TrendsData } from "./types";

// Filter out data for groups that are not selected
function filterDataByGroup(data: TrendsData, groups: string[]) {
  const filteredData = data && data.filter(([group]) => groups.includes(group));
  return filteredData;
}

const STARTING_WIDTH = 980; // standard card parent size
const STARTING_HEIGHT = 550; // standard card parent size
const MOBILE_BREAKPOINT = 394; // standard card parent size on mobile (iphone)

function useResponsiveSize(
  widthAccessor: number,
  startingWidth: number,
  heightAccessor?: number,
  startingHeight?: number
) {
  // sets window dimensions on resize
  const [[width, height, isMobile], setWindowDimensions] = useState([
    startingWidth,
    startingHeight
      ? startingHeight
      : heightAccessor
      ? heightAccessor
      : window.document.documentElement.clientHeight,
    startingWidth < MOBILE_BREAKPOINT,
  ]);
  useEffect(() => {
    console.log("width accessor", widthAccessor);
    if (widthAccessor) {
      const setDimensions = () => {
        const isMobile = widthAccessor < MOBILE_BREAKPOINT;
        setWindowDimensions([
          widthAccessor,
          heightAccessor
            ? heightAccessor
            : window.document.documentElement.clientHeight,
          isMobile,
        ]);
      };
      setDimensions();
      window.addEventListener("resize", setDimensions);
      return () => window.removeEventListener("resize", setDimensions);
    }
  }, [widthAccessor, heightAccessor]);

  return [[width, height, isMobile]];
}

export { filterDataByGroup, useResponsiveSize };
