import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { NEWS_TAB_LINK } from "../../../utils/urlutils";
import styles from "./News.module.scss";

export interface NewsAuthorsProps {
  authors: string[];
}

export default function NewsAuthors(props: NewsAuthorsProps) {
  const { authors } = props;

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h3">
        Authors
      </Typography>
      <ul className={styles.FilterList}>
        {authors.length > 0
          ? authors.map((filter: string) => {
              return (
                <li key={filter}>
                  <Link
                    to={`${NEWS_TAB_LINK}?author=${filter}`}
                    className={styles.FilterListLink}
                  >
                    {filter}
                  </Link>
                </li>
              );
            })
          : ""}
        <li>
          <Link to={NEWS_TAB_LINK} className={styles.FilterListLink}>
            All Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
