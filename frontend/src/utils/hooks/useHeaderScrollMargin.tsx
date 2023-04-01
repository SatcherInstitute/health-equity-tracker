import { useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";

/*

Hook that targets an element (madlib header) and measures the height to adjust the scroll-margin offset needed by the cards. this allows all of our "scroll to id" functionality to accurately target the element compensating for the dynamic height of the madlib header (which can have 1, 2 or 3 lines of text). Also compensates for scenarios where the header has a height but is not sticking and is not obstructing the scroll

elemId: string id (without the "#") that will be measured
sticking: boolean set in ExploreData as to whether the header is in sticky mode or not
otherDependencies: any[] changes to and of the items in this array will trigger  re-measure and adjustment to the scroll-margin offset

*/

// when scrolled to the top, header is taller with 3-dot indicators and extra padding
const EXTRA_HEIGHT_NON_STICKY_HEADER = 60;

export function useHeaderScrollMargin(
  elemId: string,
  sticking: boolean,
  otherDependencies: any[]
) {
  // ensure header height is remeasured on changes to page width
  useEffect(() => {
    window.addEventListener("resize", handlePageResize);
    return () => {
      window.removeEventListener("resize", handlePageResize);
    };
  }, []);
  const [pageWidth, setPageWidth] = useState(window.innerWidth);
  function handlePageResize() {
    setPageWidth(window.innerWidth);
  }

  function measureHeight() {
    const headerEl = document.querySelector(`#${elemId}`);

    let headerHeight = 0;

    if (headerEl) {
      headerHeight = headerEl.clientHeight;

      if (!sticking) {
        headerHeight -= EXTRA_HEIGHT_NON_STICKY_HEADER;
      }
    }

    return headerHeight;
  }

  // track and return the adjusted height of the element
  const [headerScrollMargin, setHeaderScrollMargin] = useState(measureHeight());
  const theme = useTheme();
  const isWideEnoughForSticky = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    setHeaderScrollMargin(isWideEnoughForSticky ? measureHeight() : 0);
  }, [elemId, pageWidth, sticking, ...otherDependencies]);

  return headerScrollMargin;
}
