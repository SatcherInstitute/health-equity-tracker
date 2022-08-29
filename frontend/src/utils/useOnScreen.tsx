import { useRef, useLayoutEffect, DependencyList } from "react";
import styles from "../pages/ExploreData/ExploreDataPage.module.scss";

const EXPLORE_DATA_ID = "main";

export function useScrollPosition(
  effect: (arg0: {
    pageYOffset: number;
    stickyBarOffsetFromTop: number;
  }) => void,
  deps: boolean[],
  wait: number | undefined
) {
  let throttleTimeout: NodeJS.Timeout | null = null;

  const position = useRef<number>();

  const callBack = () => {
    const header = document.getElementById(EXPLORE_DATA_ID);
    const stickyBarOffsetFromTop = header?.offsetTop || 1;
    effect({ pageYOffset: window.pageYOffset, stickyBarOffsetFromTop });
    position.current = stickyBarOffsetFromTop;
    throttleTimeout = null;
  };

  useLayoutEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById(EXPLORE_DATA_ID);
      const carousel = document.getElementsByClassName("Carousel")[0];
      const stickyBarOffsetFromTop = header?.offsetTop || 1;
      const topOfCarousel = window.pageYOffset > stickyBarOffsetFromTop;

      if (topOfCarousel) {
        header?.classList.add(styles.Sticky);
        carousel?.classList.add(styles.StickyCarousel);
      } else {
        header?.classList.remove(styles.Sticky);
        carousel?.classList.remove(styles.StickyCarousel);
      }

      if (wait) {
        if (throttleTimeout === null) {
          throttleTimeout = setTimeout(callBack, wait);
        }
      } else {
        callBack();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, deps);
}
