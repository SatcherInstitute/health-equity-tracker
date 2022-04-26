import Button from "@material-ui/core/Button";
import axios from "axios";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { VariableId } from "../data/config/MetricConfig";
import { getLogger } from "./globals";
import { EXPLORE_DATA_PAGE_LINK } from "./internalRoutes";
import { MadLibId, PhraseSelections } from "./MadLibs";

export const STICKY_VERSION_PARAM = "sv";

// Value is a comma-separated list of dataset ids. Dataset ids cannot have
// commas in them.
export const DATA_SOURCE_PRE_FILTERS = "dpf";

// Value is index of the phrase to jump to
export const MADLIB_PHRASE_PARAM = "mlp";

// Value is a comma-separated list mapping indices to values with : delimiter
// Values are applied on top of defaults so you only need to specify those that differ
// mls=0:1,2:5
export const MADLIB_SELECTIONS_PARAM = "mls";

// Value is index of the tab to jump to
export const TAB_PARAM = "tab";

// 'true' or 'false' will override the cookie to show or hide the onboarding flow
export const SHOW_ONBOARDING_PARAM = "onboard";

export const DEMOGRAPHIC_PARAM = "demo";
export const DATA_TYPE_1_PARAM = "dt1";
export const DATA_TYPE_2_PARAM = "dt2";

// Ensures backwards compatibility for external links to old VariableIds
export function swapOldParams(oldParam: string) {
  const swaps: Record<string, VariableId> = {
    deaths: "covid_deaths",
    cases: "covid_cases",
    hospitalizations: "covid_hospitalizations",
    vaccinations: "covid_vaccinations",
  };
  return swaps[oldParam] || oldParam;
}

// WORDPRESS CONFIG
export const NEWS_URL = "https://hetblog.dreamhosters.com/";
export const WP_API = "wp-json/wp/v2/"; // "?rest_route=/wp/v2/"
export const ALL_POSTS = "posts";
export const ALL_MEDIA = "media";
export const ALL_CATEGORIES = "categories";
export const ALL_AUTHORS = "authors";
export const ALL_PAGES = "pages"; // for dynamic copy
export const WP_EMBED_PARAM = "_embed";
export const WP_PER_PAGE_PARAM = "per_page=";
export const MAX_FETCH = 100;

// PAGE IDS FOR WORDPRESS DYNAMIC COPY
export const WIHE_PAGE_ID = 37; // hard coded id where dynamic copy is stored

// REACT QUERY
export const ARTICLES_KEY = "cached_wp_articles";
export const DYNAMIC_COPY_KEY = "cached_wp_dynamic_copy";
export const REACT_QUERY_OPTIONS = {
  cacheTime: Infinity, // never garbage collect, always default to cache
  staleTime: 1000 * 2, // treat cache data as fresh and dont refetch
};

export async function fetchNewsData() {
  return await axios.get(
    `${
      NEWS_URL + WP_API + ALL_POSTS
    }?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`
  );
}

export async function fetchCopyData() {
  return await axios.get(`${NEWS_URL + WP_API + ALL_PAGES}/${WIHE_PAGE_ID}`);
}

export function useUrlSearchParams() {
  return new URLSearchParams(useLocation().search);
}

export function LinkWithStickyParams(props: {
  to: string;
  target?: string;
  className?: string;
  children: React.ReactNode;
}) {
  let linkProps = { ...props };
  let params = useSearchParams();
  let newUrl = props.to;
  if (params[STICKY_VERSION_PARAM]) {
    // Note: doesn't handle urls that already have params on them.
    newUrl =
      newUrl + `?${STICKY_VERSION_PARAM}=${params[STICKY_VERSION_PARAM]}`;
  }
  linkProps.to = newUrl;

  return <Link {...linkProps}>{props.children}</Link>;
}

export function ReactRouterLinkButton(props: {
  url: string;
  className?: string;
  displayName?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Button
      href={props.url}
      className={props.className}
      aria-label={props.ariaLabel}
    >
      {props.displayName || props.children}
    </Button>
  );
}

export function useSearchParams() {
  // Note: URLSearchParams doesn't support IE, if we keep this code and we want
  // to support IE we'll need to change it.
  const params = new URLSearchParams(useLocation().search);
  return Object.fromEntries(params.entries());
}

export function linkToMadLib(
  madLibId: MadLibId,
  phraseSelections: PhraseSelections,
  absolute = false
) {
  const selectionOverrides = Object.keys(phraseSelections).map(
    (key) => key + ":" + phraseSelections[Number(key)]
  );

  const url = [
    EXPLORE_DATA_PAGE_LINK,
    "?",
    MADLIB_PHRASE_PARAM,
    "=",
    madLibId,
    "&",
    MADLIB_SELECTIONS_PARAM,
    "=",
    selectionOverrides.join(","),
  ].join("");
  return absolute ? window.location.host + url : url;
}

export function setParameter(
  paramName: string,
  paramValue: string | null = null
) {
  setParameters([{ name: paramName, value: paramValue }]);
}

export type ParamKeyValue = { name: string; value: string | null };

export function setParameters(paramMap: ParamKeyValue[]) {
  let searchParams = new URLSearchParams(window.location.search);

  paramMap.forEach((kv) => {
    let paramName = kv.name;
    let paramValue = kv.value;

    if (paramValue) {
      searchParams.set(paramName, paramValue);
    } else {
      searchParams.delete(paramName);
    }
  });

  let base =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname;

  window.history.pushState({}, "", base + "?" + searchParams.toString());
}

const defaultHandler = <T extends unknown>(inp: string | null): T => {
  return inp as unknown as T;
};

export function removeParamAndReturnValue<T1>(
  paramName: string,
  defaultValue: T1
) {
  setParameter(paramName, null);
  return defaultValue;
}

export function getParameter<T1>(
  paramName: string,
  defaultValue: T1,
  formatter: (x: any) => T1 = defaultHandler
): T1 {
  let searchParams = new URLSearchParams(window.location.search);
  try {
    return searchParams.has(paramName)
      ? formatter(searchParams.get(paramName))
      : defaultValue;
  } catch (err) {
    console.error(err);
    return removeParamAndReturnValue(paramName, defaultValue);
  }
}

let kvSeparator = ".";
let partsSeparator = "-";

export const parseMls = (param: string) => {
  let parts = param.split(partsSeparator);
  let selection: PhraseSelections = {};
  parts.forEach((part) => {
    let p = part.split(kvSeparator);
    selection[Number(p[0])] = p[1];
  });

  return selection;
};

export const stringifyMls = (selection: PhraseSelections): string => {
  let kvPair: Array<string> = [];

  Object.keys(selection).forEach((key: any) => {
    kvPair.push(key + kvSeparator + selection[key]);
  });

  return kvPair.join(partsSeparator);
};

export type PSEventHandler = () => void;

const psSubscriptions: any = {};
let psCount: number = 0;

export const psSubscribe = (
  handler: PSEventHandler,
  keyPrefix = "unk"
): { unsubscribe: () => void } => {
  const key = keyPrefix + "_" + psCount;
  getLogger().debugLog("Adding PSHandler: " + key);
  psSubscriptions[key] = handler;
  psCount++;
  return {
    unsubscribe: () => {
      psUnsubscribe(key);
    },
  };
};

export const psUnsubscribe = (k: string) => {
  getLogger().debugLog("Removing PSHandler: " + k);
  delete psSubscriptions[k];
};

window.onpopstate = () => {
  Object.keys(psSubscriptions).forEach((key) => {
    const handler = psSubscriptions[key];
    if (handler) {
      getLogger().debugLog("Firing PSHandler: " + key);
      handler();
    }
  });
};

/*
Dumps a string of HTML into a div (or string with optional boolean)
*/
export function getHtml(item: any, asString?: boolean) {
  // if div is needed
  if (!asString)
    return <div dangerouslySetInnerHTML={{ __html: item || "" }}></div>;

  // if only string is needed, create an HTML element and then extract the text
  const span = document.createElement("span");
  span.innerHTML = item;
  return span.textContent || span.innerText;
}
