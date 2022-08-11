import { useEffect, useState, useRef } from "react";
import {
  reportProviderSteps,
  ScrollableHashId,
} from "../reports/ReportProviderSteps";

export function useHeadsObserver(
  recentlyClicked: ScrollableHashId | null,
  setRecentlyClicked: Function
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");

  // useEffect(() => {
  //   console.log(recentlyClicked);
  // }, [recentlyClicked])

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

  // src/hooks.js
  useEffect(() => {
    const handleObsever = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry?.isIntersecting) {
          // prefer a recently clicked id, otherwise set to the observed "in view" id
          setActiveId(recentlyClicked || entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObsever, {
      rootMargin: "-20% 0% -35% 0px",
    });

    const elements = reportProviderSteps
      .map((step) => {
        const stepElem = document.getElementById(step.hashId);
        return stepElem;
      })
      .filter((el) => !!el);

    elements.forEach((elem) => observer.current?.observe(elem!));
    return () => observer.current?.disconnect();
  }, [recentlyClicked]);

  return { activeId };
}
