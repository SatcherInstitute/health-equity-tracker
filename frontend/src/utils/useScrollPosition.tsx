import { useRef, useLayoutEffect } from "react";
import styles from "../pages/ExploreData/ExploreDataPage.module.scss";

const EXPLORE_DATA_ID = "main";
const INDICATORS = "Carousel-indicators-4";

const useScrollPosition = (
  effect: (arg0: {
    pageYOffset: number;
    stickyBarOffsetFromTop: number;
  }) => void,
  sticking: boolean[],
  wait: number | undefined
) => {
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    const scrollCallBack = (stickyBarOffsetFromTop: number) => {
      effect({ pageYOffset: window.pageYOffset, stickyBarOffsetFromTop });
      throttleTimeout.current = null;
    };

    const handleScroll = () => {
      const header = document.getElementById(EXPLORE_DATA_ID);
      const indicators = document.getElementsByClassName(
        INDICATORS
      )[0] as HTMLElement;
      const stickyBarOffsetFromTop = header?.offsetTop || 1;
      const topOfCarousel = window.pageYOffset > stickyBarOffsetFromTop;

      if (topOfCarousel) {
        header?.classList.add(styles.Sticky);
        indicators.style.cssText = "visibility: hidden; display: none";
      } else {
        header?.classList.remove(styles.Sticky);
        indicators.style.cssText = "visibility: visible; display: block";
      }

      if (wait) {
        if (throttleTimeout.current === null) {
          throttleTimeout.current = setTimeout(function () {
            scrollCallBack(stickyBarOffsetFromTop);
          }, wait);
        }
      } else {
        scrollCallBack(stickyBarOffsetFromTop);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sticking, effect, wait]);
};

export default useScrollPosition;
