import { descending, max } from "d3";
import { TrendsData, GroupData, GroupValues } from "./types";

const BAR_WIDTH = 100;

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

function getMaxNumberForDate(data: TrendsData, selectedDate: string | null) {
  const numbers = data.flatMap(([group, d]) =>
    d
      .filter(([date]) => date == selectedDate)
      .map(([date, number]) => Math.abs(number))
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

function getWidthPctShare(
  d: GroupValues,
  selectedDate: string | null,
  data: TrendsData
) {
  const width =
    (Math.abs(getAmountsByDate(d, selectedDate)) /
      (getMaxNumberForDate(data, selectedDate) || 1)) *
    (BAR_WIDTH / 4);
  return width;
}

function getWidthHundredK(
  d: GroupValues,
  selectedDate: string | null,
  data: TrendsData
) {
  const width =
    (getAmountsByDate(d, selectedDate) /
      (getMaxNumberForDate(data, selectedDate) || 1)) *
    (BAR_WIDTH / 2);
  return width;
}

function translateXPctShare(
  d: GroupValues,
  selectedDate: string | null,
  data: TrendsData
) {
  const translateX =
    getAmountsByDate(d, selectedDate) > 0
      ? BAR_WIDTH / 4
      : BAR_WIDTH / 4 +
        (getAmountsByDate(d, selectedDate) /
          (getMaxNumberForDate(data, selectedDate) || 1)) *
          (BAR_WIDTH / 4);

  return translateX;
}

export {
  filterDataByGroup,
  getAmountsByDate,
  sortDataDescending,
  getMaxNumberForDate,
  getDates,
  getAmounts,
  getWidthPctShare,
  getWidthHundredK,
  translateXPctShare,
};
