import { Typography } from "@material-ui/core";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ALL_CATEGORIES,
  BLOG_TAB_LINK,
  BLOG_URL,
  WP_API,
} from "../../utils/urlutils";
import styles from "./BlogFilterList.module.scss";

export default function BlogCategories({ categories }: { categories: any[] }) {
  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h4">
        Categories
      </Typography>
      <ul className={styles.FilterList}>
        {categories.length > 0
          ? categories.map((categoryObject: { name: string }) => {
              return (
                <li key={categoryObject.name}>
                  <Link
                    to={`${BLOG_TAB_LINK}?category=${categoryObject.name}`}
                    className={styles.AllArticlesTitleLink}
                  >
                    {categoryObject.name}
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
