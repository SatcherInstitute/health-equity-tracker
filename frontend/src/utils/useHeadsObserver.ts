import { useEffect, useState, useRef } from "react";
import {
  reportProviderSteps,
  ScrollableHashId,
} from "../reports/ReportProviderSteps";

export function useHeadsObserver(recentlyClicked?: ScrollableHashId) {
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState("");

  // src/hooks.js
  useEffect(() => {
    const handleObsever = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry?.isIntersecting) {
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
