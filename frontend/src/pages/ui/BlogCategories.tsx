import { Typography } from "@material-ui/core";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ALL_CATEGORIES, BLOG_URL, WP_API } from "../../utils/urlutils";
import styles from "./BlogFilterList.module.scss";

export default function BlogCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${BLOG_URL + WP_API + ALL_CATEGORIES}`)
      .then((categories) => {
        console.log(categories);
        setCategories(categories.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className={styles.FilterListBox}>
      <Typography className={styles.FilterListHeader} variant="h4">
        Categories
      </Typography>
      <ul className={styles.FilterList}>
        {categories.length > 0
          ? categories.map((categoryObject: { name: string }) => {
              return <li key={categoryObject.name}>{categoryObject.name}</li>;
            })
          : ""}
      </ul>
    </div>
  );
}
