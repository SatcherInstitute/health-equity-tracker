import { Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { NEWS_TAB_LINK } from "../../../utils/internalRoutes";
import styles from "./News.module.scss";

type FilterType = "author" | "category";

// pretty string for filter box heading
const filterHeaderMap: Record<FilterType, string> = {
  author: "Authors",
  category: "Categories",
};

export interface ArticleFiltersProps {
  filterType: FilterType;
  filterOptions: string[];
}

export default function ArticleFilters(props: ArticleFiltersProps) {
  return (
    <div className={styles.FilterListBox}>
      {/* FILTER BOX HEADING */}
      <Typography className={styles.FilterListHeader} variant="h2">
        {filterHeaderMap[props.filterType]}
      </Typography>

      {/* LIST OF LINKED FILTERS (IF ANY) */}
      <ul className={styles.FilterList}>
        {props.filterOptions.length > 0 &&
          props.filterOptions.map((filter) => {
            return (
              <li key={filter}>
                <Link
                  to={`${NEWS_TAB_LINK}?${props.filterType}=${filter}`}
                  className={styles.FilterListLink}
                >
                  {filter}
                </Link>
              </li>
            );
          })}
        {/* ALWAYS DISPLAY ALL POSTS LINK */}
        <li>
          <Link to={NEWS_TAB_LINK} className={styles.FilterListLink}>
            All Posts
          </Link>
        </li>
      </ul>
    </div>
  );
}
