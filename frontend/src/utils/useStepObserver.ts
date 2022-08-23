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
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");
  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  useEffect(() => {
    // if user scrolls or clicks, go back to tracking scroll position in the table of contents
    function watchScroll() {
      window.addEventListener("wheel", () => setRecentlyClicked(null));
      window.addEventListener("mouseup", () => setRecentlyClicked(null));
    }
    watchScroll();
    return () => {
      window.removeEventListener("wheel", () => setRecentlyClicked(null));
      window.removeEventListener("mouseup", () => setRecentlyClicked(null));
    };
  });

  useEffect(() => {
    const handleObserver = (entries: any) => {
      entries.forEach((entry: any) => {
        // when page is scrolled to the top, don't track scroll position
        if (isScrolledToTop) setActiveId("");
        else if (entry?.isIntersecting) {
          // prefer a recently clicked id, otherwise set to the observed "in view" id
          setActiveId(recentlyClicked || entry.target.id);
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

  const location: any = useLocation();

  useEffect(() => {
    const hashLink = location?.hash;
    const hashId = hashLink.substring(1) || "";

    if (
      hashLink &&
      steps.map((step: StepData) => step.hashId.includes(hashId))
    ) {
      setActiveId(hashId);
      setRecentlyClicked(hashId);

      document.querySelector(`#${hashId}`)?.scrollIntoView({
        // behavior: "smooth",
      });

      setTimeout(() => {
        document.querySelector(`#${hashId}`)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 2000);
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
