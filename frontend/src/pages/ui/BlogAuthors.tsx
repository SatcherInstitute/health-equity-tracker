import { Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./BlogFilterList.module.scss";

export default function BlogAuthors({ articles }: { articles: any[] }) {
  const [filterItems, setFilterItems] = useState<string[]>([]);

  useEffect(() => {
    const allAuthorsSet = new Set();

    articles.forEach(
      (article) =>
        article.acf.contributing_author &&
        allAuthorsSet.add(article.acf.contributing_author)
    );

    setFilterItems(Array.from(allAuthorsSet) as string[]);
  }, [articles]);

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h4">
        Authors
      </Typography>
      <ul className={styles.FilterList}>
        {filterItems.length > 0
          ? filterItems.map((filter: string) => {
              return <li key={filter}>{filter}</li>;
            })
          : ""}
      </ul>
    </div>
  );
}
