import axios from "axios";
import { useEffect, useState } from "react";
import {
  ALL_CATEGORIES,
  ALL_POSTS,
  BLOG_URL,
  MAX_FETCH,
  WP_API,
  WP_EMBED_PARAM,
  WP_PER_PAGE_PARAM,
} from "./urlutils";

export interface Article {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  author: number;
  featured_media: number;
  sticky: boolean;
  categoriesXYZ: number[];
  acf: { contributing_author: string };
  _embedded: {
    author: {
      id: number;
    };
    "wp:featuredmedia": { id: number; source_url: string }[];
  };
}

export default function useFetchBlog() {
  // BLOG articles and article categories from external Wordpress Headless CMS
  // use session storage to persist
  const [categories, setCategories] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const savedArticles: Article[] = JSON.parse(
      sessionStorage.getItem("articles") as string
    );

    const savedArticleCategories: any[] = JSON.parse(
      sessionStorage.getItem("articleCategories") as string
    );

    if (savedArticleCategories === null || savedArticles === null) {
      // fetch up to 100 posts
      axios
        .get(
          `${
            BLOG_URL + WP_API + ALL_POSTS
          }?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`
        )
        .then(async (posts) => {
          // set in state
          setArticles(posts.data);
          // also cache in session storage
          sessionStorage.setItem("articles", JSON.stringify(posts.data));
        })
        .catch((err) => {
          console.log(err);
        });

      // also fetch all categories (probably only getting first 10 by default ? )
      axios
        .get(`${BLOG_URL + WP_API + ALL_CATEGORIES}`)
        .then((categories) => {
          setCategories(categories.data);
          // also cache in session storage
          sessionStorage.setItem(
            "articleCategories",
            JSON.stringify(categories.data)
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setArticles(savedArticles);
      setCategories(savedArticleCategories);
    }
  }, []);

  return { categories, articles };
}
