import React, { useEffect, useState } from "react";
import {
  reportProviderSteps,
  ScrollableHashId,
} from "../../reports/ReportProviderSteps";
import { useHeadsObserver } from "../../utils/useHeadsObserver";
import styles from "./TableOfContents.module.scss";

export function TableOfContents() {
  const [headings, setHeadings] = useState<any[]>([]);

  const [recentlyClicked, setRecentlyClicked] =
    useState<ScrollableHashId | null>(null);

  const { activeId } = useHeadsObserver(recentlyClicked, setRecentlyClicked);

  // useEffect(() => {

  //   console.log(recentlyClicked);
  // }, [recentlyClicked])

  useEffect(() => {
    const elements = reportProviderSteps
      .map((step) => {
        const stepElement = document.getElementById(step.hashId);

        return {
          id: stepElement?.id,
          text: step.label,
        };
      })
      .filter((el) => !!el.id);

    elements && setHeadings(elements);
  }, []);

  return (
    <nav className={styles.TOC}>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(`#${heading.id}`)!.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                setRecentlyClicked(heading.id);
              }}
              style={{
                fontWeight: activeId === heading.id ? "bold" : "normal",
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
