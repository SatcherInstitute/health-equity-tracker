import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { BLOG_TAB_LINK } from "../../utils/urlutils";
import styles from "./BlogFilterList.module.scss";

export interface BlogAuthorsProps {
  authors: string[];
}

export default function BlogAuthors(props: BlogAuthorsProps) {
  const { authors } = props;

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h4">
        Authors
      </Typography>
      <ul className={styles.FilterList}>
        {authors.length > 0
          ? authors.map((filter: string) => {
              return (
                <li key={filter}>
                  <Link
                    to={`${BLOG_TAB_LINK}?author=${filter}`}
                    className={styles.AllArticlesTitleLink}
                  >
                    {filter}
                  </Link>
                </li>
              );
            })
          : ""}
        <li>
          <Link to={BLOG_TAB_LINK} className={styles.AllArticlesTitleLink}>
            All Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
