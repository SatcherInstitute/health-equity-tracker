import { useMediaQuery, useTheme } from "@material-ui/core";
import { useEffect, useState } from "react";

/* 

Hook that targets an element (madlib header) and measures the height to adjust the scroll-margin offset needed by the cards. this allows all of our "scroll to id" functionality to accurately target the element compensating for the dynamic height of the madlib header (which can have 1, 2 or 3 lines of text). Also compensates for scanrios where the header has a height but is not sticking and obstructing the scroll

elemId: string id (without the "#") that will be measured
stcking: boolean set in ExploreData as to whether the header is in sticky mode or not
otherDependencies: any[] changes to and of the items in this array will trigger  re-measure and adjustment to the scroll-margin offset

*/

// when scrolled to the top, header is taller with 3-dot indicators and extra padding
const EXTRA_HEIGHT_NON_STICKY_HEADER = 60;

export function useHeaderScrollMargin(
  elemId: string,
  sticking: boolean,
  otherDependencies: any[]
) {
  const [headerScrollMargin, setHeaderScrollMargin] = useState(0);

  const theme = useTheme();
  const isWideEnoughForSticky = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const headerEl = document.querySelector(`#${elemId}`);
    if (headerEl) {
      let headerHeight = headerEl.clientHeight;
      console.log("measured header height", headerHeight);

      if (!sticking) {
        headerHeight -= EXTRA_HEIGHT_NON_STICKY_HEADER;
        console.log("> adjusted header height (", headerHeight);
      }

      setHeaderScrollMargin(isWideEnoughForSticky ? headerHeight : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elemId, sticking, ...otherDependencies]);

  return headerScrollMargin;
}
