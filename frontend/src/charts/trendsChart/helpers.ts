import { descending, max } from "d3";
import { TrendsData, GroupData, GroupValues } from "./types";

// Filter out data for groups that are not selected
function filterDataByGroup(data: TrendsData, groups: string[]) {
  const filteredData = data && data.filter(([group]) => groups.includes(group));
  return filteredData;
}
function getAmountsByDate(d: GroupValues, selectedDate: string | null) {
  const [, delta] = d.find(([date]) => date == selectedDate) || [0, 0];
  return delta;
}

function sortDataDescending(d: TrendsData, selectedDate: string) {
  return (
    [...d].sort(([, aData]: GroupData, [group, bData]: GroupData) =>
      descending(
        getAmountsByDate(aData, selectedDate),
        getAmountsByDate(bData, selectedDate)
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

function getDates(data: TrendsData) {
  return data && data.length
    ? data.flatMap(
        ([_, d]) =>
          d && // @ts-ignore
          d.map(([date]: [string]) => date)
      )
    : [];
}

function getAmounts(data: TrendsData) {
  return data && data.length
    ? data.flatMap(([_, d]) =>
        d ? d.map(([_, amount]: [string, number]) => amount || 0) : [0]
      )
    : [0];
}

export {
  filterDataByGroup,
  getAmountsByDate,
  sortDataDescending,
  getMaxNumber,
  getDates,
  getAmounts,
};
