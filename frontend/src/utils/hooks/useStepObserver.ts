import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export type StepData = {
  label: string;
  hashId: ScrollableHashId;
  pluralOnCompare: boolean;
};

export type ScrollableHashId =
  | "location-info"
  | "rate-map"
  | "rate-trends"
  | "rate-chart"
  | "unknowns-map"
  | "share-trends"
  | "population-vs-share"
  | "data-table"
  | "age-adjusted-risk"
  | "definitions-missing-data";

export function useStepObserver(
  stepIds: ScrollableHashId[],
  isScrolledToTop: boolean
) {
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

    const elements = stepIds
      .map((stepId) => {
        const stepElem = document.getElementById(stepId);
        return stepElem;
      })
      .filter((el) => el !== undefined);

    elements.forEach((elem) => elem && observer.current?.observe(elem));
    return () => observer.current?.disconnect();
  }, [stepIds, recentlyClicked, isScrolledToTop]);

  const urlHashOverrideRef = useRef(recentlyClicked);

  useEffect(() => {
    // any updates to the focused id results in a new URL hash
    const urlNoHash = window.location.href.split("#")[0];
    const newHash = activeId ? `#${activeId}` : "";
    window.history.replaceState(undefined, "", urlNoHash + newHash);
    urlHashOverrideRef.current = recentlyClicked;
  }, [activeId, recentlyClicked]);

  const hashLink = location?.hash;
  const hashId = hashLink.substring(1) || "";

  useEffect(() => {
    // updates to the URL or available stepIds results in recalculated focus for the Table of Contents

    if (hashLink && stepIds.includes(hashId)) {
      setActiveId(hashId);
      setRecentlyClicked(hashId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.hash, stepIds]);

  useEffect(() => {
    //  on render, set up a timer to auto scroll user to the focused card (counteracting layout shift from loading/resizing cards)
    // timer is stopped when the urlHashOverrideRef is reset, which is caused by a user interaction like scrolling, swiping, or key presses
    if (hashLink && stepIds.includes(hashId)) {
      let pulseIdCounter = 0;

      const pulse_id = setInterval(() => {
        // clear the auto-scroll regardless of user interaction after set time
        pulseIdCounter += 500;
        if (pulseIdCounter > 500 * 2 * 30) clearInterval(pulse_id);
        if (urlHashOverrideRef.current === hashId) {
          document.querySelector(`#${hashId}`)?.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 500);

      return () => {
        clearInterval(pulse_id);
      };
    }
  }, [hashId, hashLink, stepIds]);

  return [activeId, setRecentlyClicked] as const;
}
