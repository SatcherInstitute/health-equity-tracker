import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { scrollIntoView } from "seamless-scroll-polyfill";

export type StepData = {
  label: string;
  hashId: ScrollableHashId;
  pluralOnCompare: boolean;
};

export type ScrollableHashId =
  | "location-info"
  | "rate-map"
  | "rate-chart"
  | "unknowns-map"
  | "population-vs-share"
  | "data-table"
  | "age-adjusted-risk"
  | "definitions-missing-data";

export function useStepObserver(steps: StepData[], isScrolledToTop: boolean) {
  const location: any = useLocation();

  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");
  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  function handleInteraction() {
    // any time the user interacts, cancel pending automated scrolling and erase any incoming #hash from the URL
    setRecentlyClicked(null);
    location.hash = "";
  }

  useEffect(() => {
    // if user scrolls or clicks, go back to tracking scroll position in the table of contents
    function watchScroll() {
      window.addEventListener("wheel", handleInteraction);
      window.addEventListener("pointerdown", handleInteraction);
      window.addEventListener("keydown", handleInteraction);
    }
    watchScroll();
    return () => {
      window.removeEventListener("wheel", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  });

  useEffect(() => {
    const handleObserver = (entries: any) => {
      entries.forEach((entry: any) => {
        // when page is scrolled to the top, don't track scroll position and remove any hash
        if (isScrolledToTop) {
          setActiveId("");
          window.history.replaceState(
            "",
            document.title,
            window.location.pathname + window.location.search
          );
        } else if (entry?.isIntersecting) {
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

  const urlHashOverrideRef = useRef(recentlyClicked);

  useEffect(() => {
    // any updates to the focused id updates the ref
    urlHashOverrideRef.current = recentlyClicked;
  }, [activeId, recentlyClicked]);

  const hashLink = location?.hash;
  const hashId = hashLink.substring(1) || "";

  useEffect(() => {
    // updates to the URL or available steps results in recalculated focus for the Table of Contents
    if (
      hashLink &&
      steps.map((step: StepData) => step.hashId).includes(hashId)
    ) {
      setActiveId(hashId);
      setRecentlyClicked(hashId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.hash, steps]);

  useEffect(() => {
    //  on render, set up a timer to auto scroll user to the focused card (counteracting layout shift from loading/resizing cards)
    // timer is stopped when the urlHashOverrideRef is reset, which is caused by a user interaction like scrolling, swiping, or key presses
    if (
      hashLink &&
      steps.map((step: StepData) => step.hashId).includes(hashId)
    ) {
      let pulseIdCounter = 0;

      const pulse_id = setInterval(() => {
        // clear the auto-scroll regardless of user interaction after set time
        pulseIdCounter += 500;
        if (pulseIdCounter > 500 * 2 * 30) clearInterval(pulse_id);
        if (urlHashOverrideRef.current === hashId) {
          const targetElem = document.querySelector(`#${hashId}`);
          if (targetElem) {
            scrollIntoView(targetElem, {
              behavior: "smooth",
            });
          }
        }
      }, 500);

      return () => {
        clearInterval(pulse_id);
      };
    }
  }, [hashId, hashLink, steps]);

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
