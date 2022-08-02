import { useEffect, useState } from "react";
import { descending, max } from "d3";
import { TrendsData, GroupData, GroupValues } from "./types";

// Filter out data for groups that are not selected
function filterDataByGroup(data: TrendsData, groups: string[]) {
  const filteredData = data && data.filter(([group]) => groups.includes(group));
  return filteredData;
}
function getDeltaByDate(d: GroupValues, selectedDate: string) {
  const [, delta] = d.find(([date]) => date === selectedDate) || [0, 0];
  return delta;
}

function sortDataDescending(d: TrendsData, selectedDate: string) {
  return (
    d.sort(([, aData]: GroupData, [group, bData]: GroupData) =>
      descending(
        getDeltaByDate(aData, selectedDate),
        getDeltaByDate(bData, selectedDate)
      )
    ) || d
  );
}

function getMaxNumber(data: TrendsData) {
  const numbers = data.flatMap(([group, d]) =>
    d.map(([date, number]) => Math.abs(number))
  );
  return max(numbers);
}

export { filterDataByGroup, getDeltaByDate, sortDataDescending, getMaxNumber };
