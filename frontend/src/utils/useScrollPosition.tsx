import { useRef, useLayoutEffect } from "react";
import styles from "../pages/ExploreData/ExploreDataPage.module.scss";

const EXPLORE_DATA_ID = "main";

export function useScrollPosition(
  effect: (arg0: {
    pageYOffset: number;
    stickyBarOffsetFromTop: number;
  }) => void,
  sticking: boolean[],
  wait: number | undefined
) {
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const position = useRef<number>();

  useLayoutEffect(() => {
    const scrollCallBack = (stickyBarOffsetFromTop: number) => {
      effect({ pageYOffset: window.pageYOffset, stickyBarOffsetFromTop });
      position.current = stickyBarOffsetFromTop;
      throttleTimeout.current = null;
    };

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
}
