import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { BLOG_TAB_LINK } from "../../utils/urlutils";
import styles from "./BlogFilterList.module.scss";

export interface BlogCategoriesProps {
  categories: any[];
}

export default function BlogCategories(props: BlogCategoriesProps) {
  const { categories } = props;

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h5">
        Categories
      </Typography>
      <ul className={styles.FilterList}>
        {categories
          ? categories.map((category: string) => {
              return (
                <li key={category}>
                  <Link
                    to={`${BLOG_TAB_LINK}?category=${category}`}
                    className={styles.FilterListLink}
                  >
                    {category}
                  </Link>
                </li>
              );
            })
          : ""}
        <li>
          <Link to={BLOG_TAB_LINK} className={styles.FilterListLink}>
            All Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
