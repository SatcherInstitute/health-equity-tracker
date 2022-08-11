import React, { useEffect, useState } from "react";
import { reportProviderSteps } from "../../reports/ReportProviderSteps";
import { useHeadsObserver } from "../../utils/useHeadsObserver";
import styles from "./TableOfContents.module.scss";

const getClassName = (level: number) => {
  switch (level) {
    case 2:
      return "head2";
    case 3:
      return "head3";
    case 4:
      return "head4";
    default:
      return null;
  }
};

export function TableOfContents() {
  const { activeId } = useHeadsObserver();

  const [headings, setHeadings] = useState<any[]>([]);

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
          <li
            key={heading.id}
            className={getClassName(heading.level) as string}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(`#${heading.id}`)!.scrollIntoView({
                  behavior: "smooth",
                });
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
