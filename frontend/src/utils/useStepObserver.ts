import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export type StepData = {
  label: string;
  hashId: ScrollableHashId;
  pluralOnCompare: boolean;
};

export type ScrollableHashId =
  | "population"
  | "map"
  | "bar"
  | "unknowns"
  | "disparity"
  | "table"
  | "age-adjusted"
  | "def"
  | "what";

export function useStepObserver(steps: StepData[], isScrolledToTop: boolean) {
  const location: any = useLocation();

  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");
  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  useEffect(() => {
    // if user scrolls or clicks, go back to tracking scroll position in the table of contents
    function watchScroll() {
      window.addEventListener("wheel", () => setRecentlyClicked(null));
      window.addEventListener("mouseup", () => setRecentlyClicked(null));
      window.addEventListener("keydown", () => setRecentlyClicked(null));
    }
    watchScroll();
    return () => {
      window.removeEventListener("wheel", () => setRecentlyClicked(null));
      window.removeEventListener("mouseup", () => setRecentlyClicked(null));
      window.removeEventListener("keydown", () => setRecentlyClicked(null));
    };
  });

  useEffect(() => {
    const handleObserver = (entries: any) => {
      entries.forEach((entry: any) => {
        // when page is scrolled to the top, don't track scroll position
        if (isScrolledToTop) setActiveId("");
        else if (entry?.isIntersecting) {
          // prefer a recently clicked id, otherwise set to the observed "in view" id
          const preferredId = recentlyClicked || entry.target.id;
          setActiveId(preferredId);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-20% 0% -35% 0px",
    });

    const elements = steps
      .map((step) => {
        const stepElem = document.getElementById(step.hashId);
        return stepElem;
      })
      .filter((el) => el !== undefined);

    elements.forEach((elem) => elem && observer.current?.observe(elem));
    return () => observer.current?.disconnect();
  }, [steps, recentlyClicked, isScrolledToTop]);

  const recentlyClickedRef = useRef(recentlyClicked);
  recentlyClickedRef.current = recentlyClicked;

  useEffect(() => {
    const hashLink = location?.hash;
    const hashId = hashLink.substring(1) || "";

    const urlNoHash = window.location.href.split("#")[0];
    console.log(urlNoHash);
    // window.location.hash = preferredId;
    window.history.replaceState(undefined, "", `${urlNoHash}${hashLink}`);
    setRecentlyClicked(null);

    if (
      hashLink &&
      steps.map((step: StepData) => step.hashId.includes(hashId))
    ) {
      setActiveId(hashId);
      setRecentlyClicked(hashId);
    }
  }, [location?.hash, steps]);

  useEffect(() => {
    const hashLink = location?.hash;
    const hashId = hashLink.substring(1) || "";

    if (
      hashLink &&
      steps.map((step: StepData) => step.hashId.includes(hashId))
    ) {
      const pulse_id = setInterval(() => {
        if (recentlyClickedRef.current === hashId) {
          console.log("scrolling", hashId, "into view until user interaction");
          document.querySelector(`#${hashId}`)?.scrollIntoView({
            behavior: "smooth",
          });
        } else clearInterval(pulse_id);
      }, 500);

      return () => {
        clearInterval(pulse_id);
      };

      // for (let poll = 0; poll < 20_000; poll += 500) {
      //   setTimeout(() => {
      //     if (recentlyClickedRef.current === hashId) {

      //       document.querySelector(`#${hashId}`)?.scrollIntoView({
      //         behavior: "smooth",
      //       });
      //     }
      //   }, poll)
      // }
    }
  }, [steps, location.hash]);

  return [activeId, setRecentlyClicked] as const;
}

export function pluralizeStepLabels(steps: StepData[]) {
  return steps.map((step) => {
    return {
      ...step,
      label: step.pluralOnCompare ? `${step.label}s` : step.label,
    };
  });
}
