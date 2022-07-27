// Filter out data for groups that are not selected
function filterDataByGroup(data: any[], groups: string[]) {
  const filteredData = data && data.filter(([group]) => groups.includes(group));
  return filteredData;
}

export { filterDataByGroup };
