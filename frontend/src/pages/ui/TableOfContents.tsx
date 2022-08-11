import React, { useEffect, useState } from "react";
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
    const rawElements = [
      document.getElementById("population"),
      document.getElementById("map"),
      document.getElementById("bar"),
      document.getElementById("table"),
    ];
    const elements = rawElements.map((elem) => ({
      id: elem?.id,
      text: elem?.innerText || elem?.textContent || "*",
      level: Number(elem?.nodeName.charAt(1)),
    }));
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
