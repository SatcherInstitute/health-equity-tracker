import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ALL_CATEGORIES, BLOG_URL, WP_API } from "../../utils/urlutils";
import styles from "./BlogCategories.module.scss";

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
    <div className={styles.CategoryListBox}>
      <p className={styles.CategoryListHeader}>View By Category</p>
      <ul className={styles.CategoryList}>
        {categories.length > 0
          ? categories.map((categoryObject: { name: string }) => {
              return <li key={categoryObject.name}>{categoryObject.name}</li>;
            })
          : ""}
      </ul>
    </div>
  );
}
