import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { NEWS_TAB_LINK } from "../../../utils/urlutils";
import styles from "./News.module.scss";

export interface NewsCategoriesProps {
  categories: string[];
}

export default function NewsCategories(
  props: NewsCategoriesProps
): JSX.Element {
  const { categories } = props;

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h3">
        Categories
      </Typography>
      <ul className={styles.FilterList}>
        {categories
          ? categories.map((category: string) => {
              return (
                <li key={category}>
                  <Link
                    to={`${NEWS_TAB_LINK}?category=${category}`}
                    className={styles.FilterListLink}
                  >
                    {category}
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
