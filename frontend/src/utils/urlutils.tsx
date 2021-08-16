import Button from "@material-ui/core/Button";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MadLibId, PhraseSelections } from "./MadLibs";

export const STICKY_VERSION_PARAM = "sv";

export const EXPLORE_DATA_PAGE_LINK = "/exploredata";
export const EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK =
  EXPLORE_DATA_PAGE_LINK + "#missingDataInfo";
export const DATA_CATALOG_PAGE_LINK = "/datacatalog";
export const ABOUT_US_PAGE_LINK = "/aboutus";
export const WHAT_IS_HEALTH_EQUITY_PAGE_LINK = "/whatishealthequity";
export const TERMS_OF_SERVICE_PAGE_LINK = "/termsofservice";

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
  className: string;
  displayName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button href={props.url} className={props.className}>
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
  return (inp as unknown) as T;
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

let kvSeperator = ".";
let partsSeperator = "-";

export const parseMls = (param: string) => {
  let parts = param.split(partsSeperator);
  let selection: PhraseSelections = {};
  parts.forEach((part) => {
    let p = part.split(kvSeperator);
    selection[Number(p[0])] = p[1];
  });

  return selection;
};

export const stringifyMls = (selection: PhraseSelections): string => {
  let kvPair: Array<string> = [];

  Object.keys(selection).forEach((key: any) => {
    kvPair.push(key + kvSeperator + selection[key]);
  });

  return kvPair.join(partsSeperator);
};

export type PSEventHandler = () => void;

const psSubscriptions: any = {};
let psCount: number = 0;

export const psSubscribe = (
  handler: PSEventHandler,
  keyPrefix = "unk"
): { unsubscribe: () => void } => {
  const key = keyPrefix + "_" + psCount;
  console.log("Adding PSHandler: " + key);
  psSubscriptions[key] = handler;
  psCount++;
  return {
    unsubscribe: () => {
      psUnsubscribe(key);
    },
  };
};

export const psUnsubscribe = (k: string) => {
  console.log("Removing PSHandler: " + k);
  delete psSubscriptions[k];
};

window.onpopstate = () => {
  Object.keys(psSubscriptions).forEach((key) => {
    const handler = psSubscriptions[key];
    if (handler) {
      console.log("Firing PSHandler: " + key);
      handler();
    }
  });
};
