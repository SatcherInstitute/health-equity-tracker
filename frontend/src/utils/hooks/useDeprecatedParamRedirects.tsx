import { useHistory } from "react-router-dom";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableId,
} from "../../data/config/MetricConfig";
import { EXPLORE_DATA_PAGE_LINK } from "../internalRoutes";
import { MADLIB_SELECTIONS_PARAM, useSearchParams } from "../urlutils";

// Ensures backwards compatibility for external links to old VariableIds
// NOTE: these redirects will lose any incoming demographic, data type, and card hash settings

const dropdownIdSwaps: Record<string, VariableId> = {
  vaccinations: "covid_vaccinations",
  incarceration: "prison",
};

export default function useDeprecatedParamRedirects() {
  const history = useHistory();
  const params = useSearchParams();
  const mlsParam = params[MADLIB_SELECTIONS_PARAM];

  if (mlsParam) {
    // isolate the id from the param string
    const dropdownVarId1 = mlsParam.replace("1.", "").split("-")[0];

    // first check for specific deprecated ids and redirect
    if (dropdownIdSwaps[dropdownVarId1]) {
      const newMlsParam = mlsParam.replace(
        dropdownVarId1,
        dropdownIdSwaps[dropdownVarId1]
      );
      history.push(
        `${EXPLORE_DATA_PAGE_LINK}?${MADLIB_SELECTIONS_PARAM}=${newMlsParam}`
      );
    }

    // otherwise handle other malformed ids in param and redirect to helper box
    else if (
      !Object.keys(METRIC_CONFIG).includes(dropdownVarId1 as DropdownVarId)
    ) {
      history.push(EXPLORE_DATA_PAGE_LINK);
    }
  }

  // if there is no MLS param or the id is valid, continue as normal
  return params;
}
