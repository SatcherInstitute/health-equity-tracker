import React from "react";
import Select, { ActionTypes } from "react-select";
import { DataSourceMetadata } from "../../../data/utils/DatasetTypes";

const changeActions: Array<ActionTypes> = [
  "select-option",
  "remove-value",
  "pop-value",
  "clear",
];

interface SelectOption {
  value: string;
  label: string;
}

function propertyToSelectOption(property: string): SelectOption {
  return {
    value: property,
    label: property,
  };
}

function getPropertyToDatasetsMap(
  datasets: Record<string, DataSourceMetadata>,
  propertySelector: (metadata: DataSourceMetadata) => string
): Record<string, string[]> {
  const propertyToDatasetsMap: Record<string, string[]> = {};
  Object.keys(datasets).forEach((dataset_id) => {
    const property = propertySelector(datasets[dataset_id]);
    if (!propertyToDatasetsMap[property]) {
      propertyToDatasetsMap[property] = [];
    }
    propertyToDatasetsMap[property].push(dataset_id);
  });
  return propertyToDatasetsMap;
}

function updateFilters(
  propertyToDatasetsMap: Record<string, string[]>,
  onSelectionChange: (filtered: Array<string>) => void,
  selected: SelectOption[],
  action: ActionTypes
) {
  if (changeActions.includes(action)) {
    const filter =
      !selected || selected.length === 0
        ? []
        : selected.map((item) => propertyToDatasetsMap[item.value]).flat();
    onSelectionChange(filter);
  }
}

/**
 * @param props
 *     datasets: The metadata for all datasets
 *     onSelectionChange: function that gets called when the filter's selection
 *         changes. Gets passed a list of all datasets that this filter is
 *         including, or an empty array if this filter is not being used.
 *     propertySelector: function returns the metadata property to filter on.
 *     allOption: The value for selecting "all" values.
 *     placeholder: What to show when nothing is selected. Note that this state
 *         can only exist initially, before anything has been selected.
 */
export function SingleSelectDatasetFilter(props: {
  dataSources: Record<string, DataSourceMetadata>;
  onSelectionChange: (filtered: Array<string>) => void;
  propertySelector: (metadata: DataSourceMetadata) => string;
  placeholder: string;
  allOption: string;
}) {
  const propertyToDatasetsMap = getPropertyToDatasetsMap(
    props.dataSources,
    props.propertySelector
  );
  const options = [props.allOption]
    .concat(Object.keys(propertyToDatasetsMap))
    .sort()
    .map(propertyToSelectOption);

  return (
    <Select
      options={options}
      isSearchable={false}
      onChange={(value, metadata) => {
        const selected = value as SelectOption;
        const selectedOrAll: SelectOption[] =
          selected.value === props.allOption ? options : [selected];
        updateFilters(
          propertyToDatasetsMap,
          props.onSelectionChange,
          selectedOrAll,
          metadata.action
        );
      }}
      placeholder={props.placeholder}
    />
  );
}

/**
 * @param props
 *     datasets: The metadata for all datasets
 *     onSelectionChange: function that gets called when the filter's selection
 *         changes. Gets passed a list of all datasets that this filter is
 *         including, or an empty array if this filter is not being used.
 *     propertySelector: function returns the metadata property to filter on.
 *     placeholder: The text to use as a placeholder for this filter.
 *     defaultValues: The default display options, or null for no default
 *         values. Must be valid options or the filter won't work properly.
 */
export function MultiSelectDatasetFilter(props: {
  dataSources: Record<string, DataSourceMetadata>;
  onSelectionChange: (filtered: Array<string>) => void;
  propertySelector: (metadata: DataSourceMetadata) => string;
  placeholder: string;
  defaultValues: string[] | null;
}) {
  const propertyToDatasetsMap = getPropertyToDatasetsMap(
    props.dataSources,
    props.propertySelector
  );
  const options = Object.keys(propertyToDatasetsMap)
    .sort()
    .map(propertyToSelectOption);
  const defaultValues = props.defaultValues
    ? props.defaultValues.map(propertyToSelectOption)
    : null;
  return (
    <Select
      options={options}
      placeholder={props.placeholder}
      isMulti
      onChange={(value, metadata) => {
        updateFilters(
          propertyToDatasetsMap,
          props.onSelectionChange,
          value as SelectOption[],
          metadata.action
        );
      }}
      defaultValue={defaultValues}
    />
  );
}
